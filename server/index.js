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
import { loadLists } from './lists.js';
import { createDedupe } from './dedupe.js';
import { Stage } from './stage.js';
import { createBowRules } from './bowRules.js';
import { createEffects } from './effects.js';
import { createCounters } from './counters.js';

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
const pipeline = createPipeline({
  stage, lists, blocked, counters,
  dedupe: createDedupe(),
  rules: [createBowRules({ stage, lists }), createEffects(), counters],
});
const srv = await startServer({ getSnapshot: () => pipeline.snapshot() });
console.log(`[${stamp()}] Render + WS: http://127.0.0.1:${srv.port}`);

const ingest = e => {
  log.write(e);
  srv.broadcast(pipeline.handle(e));
};
const ticker = setInterval(() => srv.broadcast(pipeline.tick()), 1000);

// Per-source state (BR-10.5); FR-09 admin reads it.
const status = {};
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

process.once('SIGINT', async () => {
  console.log(`[${stamp()}] Đang dừng...`);
  stops.forEach(f => f());
  clearInterval(ticker);
  await log.close();
  await srv.close();
  process.exit(0);
});
