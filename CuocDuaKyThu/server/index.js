import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { startServer } from '../../server/server.js';
import { startTiktok } from '../../server/adapters/tiktok.js';
import { mapTiktok } from '../../server/mapTiktok.js';
import { startTikfinity } from '../../server/adapters/tikfinity.js';
import { loadLists } from '../../server/lists.js';
import { createDedupe } from '../../server/dedupe.js';
import { RaceStage } from './raceStage.js';
import { createRaceRules } from './raceRules.js';
import { startMockRace } from './mockRace.js';
import { startRaceAdmin } from './admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const WEB_DIR = path.resolve(__dirname, '../web');

const { values: args } = parseArgs({
  options: {
    mock: { type: 'boolean', default: false },
    rate: { type: 'string', default: '2.5' },
    port: { type: 'string', default: '8789' },
    adminPort: { type: 'string', default: '8790' },
  },
});

let currentUser = process.env.TIKTOK_USER?.trim().replace(/^@/, '');
const rate = Math.max(0.5, Number(args.rate) || 2.5);
const renderPort = Number(args.port) || 8789;
const adminPort = Number(args.adminPort) || 8790;

const stamp = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });
const lists = loadLists();
const blocked = new Set();
const dedupe = createDedupe();
const stage = new RaceStage({ max: Number(process.env.MAX_ACTORS || 120) });
const rules = createRaceRules({ stage, lists });

let scene = { sound: true };

const getSnapshot = () => ({
  t: 'snapshot',
  runners: stage.snapshot(),
  biome: stage.currentBiome(),
  worldDistanceM: Math.round(stage.worldDistanceM),
  board: stage.board(8),
  scene,
  stats: rules.statsState(status),
});

const srv = await startServer({
  port: renderPort,
  webRoot: WEB_DIR,
  mounts: {
    '/vendor/three/': path.join(ROOT_DIR, 'node_modules/three/'),
    '/vendor/three-vrm/': path.join(ROOT_DIR, 'node_modules/@pixiv/three-vrm/'),
    '/vendor/font/': path.join(ROOT_DIR, 'node_modules/@fontsource/be-vietnam-pro/'),
  },
  getSnapshot,
});
console.log(`[${stamp()}] [Cuộc Đua Kỳ Thú] Render 3D + WS: http://127.0.0.1:${srv.port}`);

const masterPort = Number(process.env.MASTER_ADMIN_PORT || 8791);
const masterAuth = 'Basic ' + Buffer.from(`admin:${process.env.ADMIN_PASSWORD?.trim() || 'chuaonline123'}`).toString('base64');
const notifyMaster = payload => {
  fetch(`http://127.0.0.1:${masterPort}/api/ingest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: masterAuth },
    body: JSON.stringify({ ...payload, game: 'cuoc-dua-ky-thu' }),
  }).catch(() => {});
};

const status = {};
const ingest = e => {
  if (e.uid !== undefined && blocked.has(e.uid)) return;
  if (dedupe.seen(e)) return;
  const msgs = rules.handle(e);
  if (msgs.length) {
    srv.broadcast(msgs);
    if (e.kind === 'gift') notifyMaster(e);
  }
};

const ticker = setInterval(() => {
  const msgs = stage.tick();
  if (msgs.length) srv.broadcast(msgs);
}, 1000);

const onStatus = (src, label) => (s, err) => {
  status[src] = s;
  console.log(`[${stamp()}] [Cuộc Đua Kỳ Thú] ${label}: ${s}${err ? ` (${err.reason ?? err.message ?? err})` : ''}`);
};

const stops = [];
let tiktokAdapter = null;
const ENV_FILE = path.join(ROOT_DIR, '.env');

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
  console.log(`[${stamp()}] [Cuộc Đua Kỳ Thú] Nguồn: mock, ${rate} event/giây`);
  stops.push(startMockRace(ingest, { rate }));
} else if (currentUser) {
  await connectTiktokUser(currentUser);
  stops.push(() => tiktokAdapter?.stop());
  const tfUrl = process.env.TIKFINITY_WS?.trim();
  if (tfUrl) {
    const tf = startTikfinity(tfUrl, ingest, { onStatus: onStatus('tikfinity', `tikfinity ${tfUrl}`) });
    stops.push(() => tf.stop());
  }
}

let demoStop = null;
let demoRate = null;
let demoCfg = { rate: 0.25, giftRatio: 0.14 };
const demo = {
  configure(opts = {}) {
    if (Number.isFinite(opts.rate) && opts.rate >= 0.01 && opts.rate <= 50) demoCfg.rate = opts.rate;
    if (Number.isFinite(opts.giftRatio) && opts.giftRatio >= 0 && opts.giftRatio <= 0.85) demoCfg.giftRatio = opts.giftRatio;
  },
  start(r = demoCfg.rate, opts = {}) {
    demo.configure({ rate: r, ...opts });
    demo.stop();
    demoStop = startMockRace(ingest, { rate: demoCfg.rate, giftRatio: demoCfg.giftRatio, jitter: true });
    demoRate = demoCfg.rate;
  },
  stop() {
    demoStop?.();
    demoStop = demoRate = null;
  },
  state: () => ({ on: demoStop !== null, rate: demoRate }),
  config: () => ({ on: demoStop !== null, ...demoCfg }),
};

// Demo Mode stays off by default so live stream starts clean at 0; Admin can toggle Demo ON anytime.

let admin = null;
const password = process.env.ADMIN_PASSWORD?.trim();
if (password) {
  try {
    admin = await startRaceAdmin({
      port: adminPort,
      password,
      ctx: {
        stage,
        rules,
        lists,
        blocked,
        status,
        demo,
        ingest,
        broadcast: m => srv.broadcast(m),
        getScene: () => scene,
        setScene: s => (scene = { ...scene, ...s }),
        getConfig: () => ({
          tiktokUser: currentUser || '',
          maxActors: Number(process.env.MAX_ACTORS || 120),
          tikfinityWs: process.env.TIKFINITY_WS || '',
        }),
        setTiktokUser: connectTiktokUser,
      },
    });
    console.log(`[${stamp()}] [Cuộc Đua Kỳ Thú] Admin: http://127.0.0.1:${admin.port} (user: admin)`);
  } catch (err) {
    console.warn(`[${stamp()}] [Cuộc Đua Kỳ Thú] Không chạy được admin: ${err.message}`);
  }
}

process.once('SIGINT', async () => {
  stops.forEach(f => f());
  demo.stop();
  clearInterval(ticker);
  await admin?.close();
  await srv.close();
  process.exit(0);
});
