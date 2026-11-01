import 'dotenv/config';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { startServer } from './server.js';
import { createLog } from './log.js';
import { createPipeline } from './pipeline.js';
import { startMock } from './adapters/mock.js';
import { startTiktok } from './adapters/tiktok.js';
import { mapTiktok } from './mapTiktok.js';
import { startTikfinity } from './adapters/tikfinity.js';
import { loadLists, saveLists, saveBlocked } from './lists.js';
import { createDedupe } from './dedupe.js';
import { Stage } from './stage.js';
import { createBowRules } from './bowRules.js';
import { createEffects } from './effects.js';
import { createCounters } from './counters.js';
import { createStats } from './stats.js';
import { startAdmin } from './admin.js';

const { values: args } = parseArgs({
  options: { mock: { type: 'boolean', default: false }, rate: { type: 'string', default: '5' } },
});
let currentUser = process.env.TIKTOK_USER?.trim().replace(/^@/, '');
if (!args.mock && !currentUser) {
  console.error('Thiếu TIKTOK_USER trong .env (hoặc chạy npm run demo)');
  process.exit(1);
}
const rate = Number(args.rate);
if (!(rate > 0)) {
  console.error(`--rate phải là số > 0 (nhận: ${args.rate})`);
  process.exit(1);
}

const stamp = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });
const log = createLog();
const lists = loadLists();
const blocked = new Set(JSON.parse(fs.readFileSync(new URL('./data/blocked.json', import.meta.url), 'utf8')));
const stage = new Stage({ max: Number(process.env.MAX_ACTORS || 150) });
const counters = createCounters({ lists });
const stats = createStats({ lists });
const pipeline = createPipeline({
  stage, lists, blocked, counters,
  dedupe: createDedupe(),
  rules: [createBowRules({ stage, lists, stats }), createEffects(), counters, stats],
});
const srv = await startServer({ getSnapshot: () => pipeline.snapshot() });
console.log(`[${stamp()}] Render + WS: http://127.0.0.1:${srv.port}`);

// Per-source state (BR-10.5); admin shows it.
const status = {};
const HISTORY_FILE = 'logs/history.json';
const SCENE_FILE = new URL('./data/scene.json', import.meta.url);

// Restore persistent history across restarts
try {
  if (fs.existsSync(HISTORY_FILE)) {
    const h = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    stats.importHistory?.(h);
  }
} catch {}

const saveHistory = () => {
  try {
    fs.mkdirSync('logs', { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(stats.exportHistory(), null, 2) + '\n');
  } catch {}
};

// BR-09.11: session stats to logs/stats-YYYYMMDD-HHmm.json on SIGINT or stream end.
const writeStats = () => {
  const d = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const file = `logs/stats-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.json`;
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync(file, JSON.stringify(stats.state(status, counters), null, 2) + '\n');
  saveHistory();
  console.log(`[${stamp()}] Thống kê: ${file}`);
  return file;
};

const listSessions = () => {
  try {
    if (!fs.existsSync('logs')) return [];
    return fs.readdirSync('logs')
      .filter(f => /^stats-\d{8}-\d{4}\.json$/.test(f))
      .sort()
      .reverse()
      .slice(0, 15)
      .map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(`logs/${f}`, 'utf8'));
          return {
            file: f,
            startedAt: data.startedAt,
            uptime: data.uptime,
            uniqueBowers: data.uniqueBowers ?? 0,
            bows: data.bows ?? 0,
            namo: data.namo ?? 0,
            diamonds: data.diamonds ?? 0,
            viewersPeak: data.viewersPeak ?? 0,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const masterPort = Number(process.env.MASTER_ADMIN_PORT || 8791);
const masterAuth = 'Basic ' + Buffer.from(`admin:${process.env.ADMIN_PASSWORD?.trim() || 'chuaonline123'}`).toString('base64');
const notifyMaster = payload => {
  fetch(`http://127.0.0.1:${masterPort}/api/ingest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: masterAuth },
    body: JSON.stringify({ ...payload, game: 'cung-chua-online' }),
  }).catch(() => {});
};

const ingest = e => {
  log.write(e);
  const msgs = pipeline.handle(e);
  srv.broadcast(msgs);
  if (e.kind === 'gift' && msgs.length) notifyMaster(e);
  if (e.kind === 'end') writeStats();
};
const ticker = setInterval(() => srv.broadcast(pipeline.tick()), 1000);

const onStatus = (src, label) => (s, err) => {
  status[src] = s;
  console.log(`[${stamp()}] ${label}: ${s}${err ? ` (${err.reason ?? err.message ?? err})` : ''}`);
};

const stops = [];
let tiktokAdapter = null;
const ENV_FILE = new URL('../.env', import.meta.url);

const updateEnvVar = (key, val) => {
  try {
    let content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) content = content.replace(re, `${key}=${val}`);
    else content = content.trimEnd() + `\n${key}=${val}\n`;
    fs.writeFileSync(ENV_FILE, content, 'utf8');
    process.env[key] = val;
  } catch {}
};

let TikTokLiveConnection = null;
const connectTiktokUser = async newUser => {
  const clean = String(newUser || '').trim().replace(/^@/, '');
  if (!clean) throw new Error('TIKTOK_USER không được để trống');
  currentUser = clean;
  updateEnvVar('TIKTOK_USER', clean);
  if (args.mock) return { user: currentUser, status: 'mock' };
  if (!TikTokLiveConnection) {
    ({ TikTokLiveConnection } = await import('tiktok-live-connector'));
  }
  tiktokAdapter?.stop();
  tiktokAdapter = startTiktok(currentUser, ingest, {
    signApiKey: process.env.EULER_KEY || undefined,
    Connection: TikTokLiveConnection,
    map: mapTiktok,
    onStatus: onStatus('tiktok', `tiktok @${currentUser}`),
    keepAlive: true,
    staleMs: 40_000,
  });
  return { user: currentUser, status: status.tiktok ?? 'connecting' };
};

if (args.mock) {
  console.log(`[${stamp()}] Nguồn: mock, ${rate} event/giây`);
  stops.push(startMock(ingest, { rate }));
} else {
  await connectTiktokUser(currentUser);
  stops.push(() => tiktokAdapter?.stop());
  // BR-10.1/10.6: TikFinity runs alongside the connector, both feed the same ingest + dedupe.
  const tfUrl = process.env.TIKFINITY_WS?.trim();
  if (tfUrl) {
    const tf = startTikfinity(tfUrl, ingest, { onStatus: onStatus('tikfinity', `tikfinity ${tfUrl}`) });
    stops.push(() => tf.stop());
  }
}

// BR-09.9: demo mock runs alongside the real source.
let demoStop = null;
let demoRate = null;
let demoCfg = { rate: 0.25, giftRatio: 0.12, prayerRatio: 0.70 };
const demo = {
  configure(opts = {}) {
    if (Number.isFinite(opts.rate) && opts.rate >= 0.01 && opts.rate <= 50) demoCfg.rate = opts.rate;
    if (Number.isFinite(opts.giftRatio) && opts.giftRatio >= 0 && opts.giftRatio <= 0.9) demoCfg.giftRatio = opts.giftRatio;
    if (Number.isFinite(opts.prayerRatio) && opts.prayerRatio >= 0.1 && opts.prayerRatio <= 0.95) demoCfg.prayerRatio = opts.prayerRatio;
  },
  start(r, opts = {}) {
    demo.configure({ rate: r, ...opts });
    demo.stop();
    demoStop = startMock(ingest, { rate: demoCfg.rate, giftRatio: demoCfg.giftRatio, prayerRatio: demoCfg.prayerRatio, jitter: true });
    demoRate = demoCfg.rate;
  },
  stop() {
    demoStop?.();
    demoStop = demoRate = null;
  },
  state: () => ({ on: demoStop !== null, rate: demoRate }),
  config: () => ({ on: demoStop !== null, ...demoCfg }),
};

const saveSceneConfig = () => {
  try {
    const sc = pipeline.snapshot().scene;
    fs.writeFileSync(SCENE_FILE, JSON.stringify({ scene: sc, demo: demo.config() }, null, 2) + '\n');
  } catch {}
};

// Load saved scene config on startup (never auto-start demo in live mode)
try {
  if (fs.existsSync(SCENE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(SCENE_FILE, 'utf8'));
    if (saved?.scene) pipeline.setScene(saved.scene);
  }
} catch {}

// Auto-save history every 20 seconds
const historyTicker = setInterval(saveHistory, 20_000);

// BR-09.1: no password, no admin; the render server keeps running.
let admin = null;
const password = process.env.ADMIN_PASSWORD?.trim();
if (!password) {
  console.warn(`[${stamp()}] Chưa đặt ADMIN_PASSWORD trong .env: không chạy admin`);
} else {
  try {
    admin = await startAdmin({
      password,
      ctx: {
        pipeline, stage, lists, blocked, stats, counters, status, demo, ingest,
        broadcast: m => srv.broadcast(m),
        saveLists: l => saveLists(l),
        saveBlocked: b => saveBlocked(b),
        saveSceneConfig,
        saveHistory,
        saveSessionSnapshot: writeStats,
        listSessions,
        getConfig: () => ({
          tiktokUser: currentUser || '',
          maxActors: Number(process.env.MAX_ACTORS || 150),
          tikfinityWs: process.env.TIKFINITY_WS || '',
          eulerKeySet: Boolean(process.env.EULER_KEY?.trim()),
        }),
        setTiktokUser: connectTiktokUser,
      },
    });
    console.log(`[${stamp()}] Admin: http://127.0.0.1:${admin.port} (user: admin)`);
  } catch (err) {
    console.warn(`[${stamp()}] Không chạy được admin: ${err.message}`);
  }
}

process.once('SIGINT', async () => {
  console.log(`[${stamp()}] Đang dừng...`);
  stops.forEach(f => f());
  demo.stop();
  writeStats();
  clearInterval(historyTicker);
  await admin?.close();
  clearInterval(ticker);
  await log.close();
  await srv.close();
  process.exit(0);
});
