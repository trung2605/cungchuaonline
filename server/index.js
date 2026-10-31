import 'dotenv/config';
import { parseArgs } from 'node:util';
import { startServer } from './server.js';
import { createLog } from './log.js';
import { createPipeline } from './pipeline.js';
import { startMock } from './adapters/mock.js';
import { startTiktok } from './adapters/tiktok.js';

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
const pipeline = createPipeline();
const srv = await startServer({ getSnapshot: () => pipeline.snapshot() });
console.log(`[${stamp()}] Render + WS: http://127.0.0.1:${srv.port}`);

const ingest = e => {
  log.write(e);
  srv.broadcast(pipeline.handle(e));
};
const ticker = setInterval(() => srv.broadcast(pipeline.tick()), 1000);

let stop;
if (args.mock) {
  console.log(`[${stamp()}] Nguồn: mock, ${rate} event/giây`);
  stop = startMock(ingest, { rate });
} else {
  const { TikTokLiveConnection } = await import('tiktok-live-connector');
  const adapter = startTiktok(user, ingest, {
    signApiKey: process.env.EULER_KEY || undefined,
    Connection: TikTokLiveConnection,
    map: () => null, // FR-02 provides mapTiktok
    onStatus: (s, err) => console.log(`[${stamp()}] tiktok @${user}: ${s}${err ? ` (${err.reason ?? err.message ?? err})` : ''}`),
  });
  stop = () => adapter.stop();
}

process.once('SIGINT', async () => {
  console.log(`[${stamp()}] Đang dừng...`);
  stop();
  clearInterval(ticker);
  await log.close();
  await srv.close();
  process.exit(0);
});
