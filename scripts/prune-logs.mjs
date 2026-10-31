// BR-08.7: delete files in logs/ older than 30 days. run.cmd calls this on every start.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DAY = 86_400_000;

export function pruneLogs(dir = 'logs', { days = 30, now = Date.now() } = {}) {
  if (!fs.existsSync(dir)) return [];
  const removed = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const st = fs.statSync(file);
    if (st.isFile() && now - st.mtimeMs > days * DAY) {
      fs.unlinkSync(file);
      removed.push(name);
    }
  }
  return removed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const removed = pruneLogs();
  if (removed.length) console.log(`Đã xóa ${removed.length} file log cũ: ${removed.join(', ')}`);
}
