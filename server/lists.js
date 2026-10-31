import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIR = fileURLToPath(new URL('./data', import.meta.url));
const NAMES = ['badwords', 'triggers', 'intents', 'couplets'];

export function loadLists(dir = DEFAULT_DIR) {
  return Object.fromEntries(NAMES.map(n => [n, JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), 'utf8'))]));
}

// Each file is written to .tmp then renamed, so a crash never leaves a half-written list.
export async function saveLists(lists, dir = DEFAULT_DIR) {
  await fs.promises.mkdir(dir, { recursive: true });
  for (const n of NAMES) {
    const file = path.join(dir, `${n}.json`);
    await fs.promises.writeFile(`${file}.tmp`, JSON.stringify(lists[n], null, 2) + '\n');
    await fs.promises.rename(`${file}.tmp`, file);
  }
}
