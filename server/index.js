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
const user = process.env.TIKTOK_USER?.trim().replace(/^@/, '');
if (!args.mock && !user) {
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

// BR-09.11: session stats to logs/stats-YYYYMMDD-HHmm.json on SIGINT or stream end.
const writeStats = () => {
  const d = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const file = `logs/stats-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.json`;
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync(file, JSON.stringify(stats.state(status, counters), null, 2) + '\n');
  console.log(`[${stamp()}] Thống kê: ${file}`);
};

const ingest = e => {
  log.write(e);
  srv.broadcast(pipeline.handle(e));
  if (e.kind === 'end') writeStats();
};
const ticker = setInterval(() => srv.broadcast(pipeline.tick()), 1000);

const onStatus = (src, label) => (s, err) => {
  status[src] = s;
  console.log(`[${stamp()}] ${label}: ${s}${err ? ` (${err.reason ?? err.message ?? err})` : ''}`);
};

const stops = [];
if (args.mock) {
  console.log(`[${stamp()}] Nguồn: mock, ${rate} event/giây`);
  stops.push(startMock(ingest, { rate }));
} else {
  const { TikTokLiveConnection } = await import('tiktok-live-connector');
  const adapter = startTiktok(user, ingest, {
    signApiKey: process.env.EULER_KEY || undefined,
    Connection: TikTokLiveConnection,
    map: mapTiktok,
    onStatus: onStatus('tiktok', `tiktok @${user}`),
  });
  stops.push(() => adapter.stop());
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
const demo = {
  start(r) {
    demo.stop();
    demoStop = startMock(ingest, { rate: r });
    demoRate = r;
  },
  stop() {
    demoStop?.();
    demoStop = demoRate = null;
  },
  state: () => ({ on: demoStop !== null, rate: demoRate }),
};

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
        pipeline, stage, lists, blocked, stats, counters, status, demo,
        broadcast: m => srv.broadcast(m),
        saveLists: l => saveLists(l),
        saveBlocked: b => saveBlocked(b),
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
  await admin?.close();
  clearInterval(ticker);
  await log.close();
  await srv.close();
  process.exit(0);
});
