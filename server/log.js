import fs from 'node:fs';
import path from 'node:path';

const pad = n => String(n).padStart(2, '0');
const day = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

// Append-only JSONL, one file per local day: logs/events-YYYYMMDD.jsonl
export function createLog({ dir = 'logs', now = () => new Date() } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  let cur = null;
  let stream = null;
  const closing = [];
  const end = s => closing.push(new Promise(r => s.end(r)));

  return {
    write(e) {
      const d = day(now());
      if (d !== cur) {
        if (stream) end(stream);
        cur = d;
        stream = fs.createWriteStream(path.join(dir, `events-${d}.jsonl`), { flags: 'a' });
      }
      stream.write(JSON.stringify(e) + '\n');
    },
    async close() {
      if (stream) end(stream);
      stream = null;
      cur = null;
      await Promise.all(closing);
    },
  };
}
