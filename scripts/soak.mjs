// BR-08.10 soak: runs the server in this process and appends its RSS to logs/soak-<start>.csv every 10 min.
// Usage: node scripts/soak.mjs --mock --rate 20   (args go straight to server/index.js)
// Page memory: read it from Chrome Task Manager / DevTools and fill test.md by hand.
import fs from 'node:fs';

const EVERY_MS = Number(process.env.SOAK_EVERY_MS || 600_000);
const t0 = Date.now();
fs.mkdirSync('logs', { recursive: true });
const file = `logs/soak-${new Date(t0).toISOString().slice(0, 16).replace(/[-:T]/g, '')}.csv`;
fs.writeFileSync(file, 'minute,rss_mb,heap_mb\n');
const sample = () => {
  const m = process.memoryUsage();
  fs.appendFileSync(file, `${Math.round((Date.now() - t0) / 60_000)},${(m.rss / 2 ** 20).toFixed(1)},${(m.heapUsed / 2 ** 20).toFixed(1)}\n`);
};
setInterval(sample, EVERY_MS).unref();
console.log(`Soak: ghi RSS vào ${file} mỗi ${EVERY_MS / 1000}s`);

await import('../server/index.js');
sample();
