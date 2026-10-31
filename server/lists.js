import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIR = fileURLToPath(new URL('./data', import.meta.url));
const NAMES = ['badwords', 'triggers', 'intents', 'couplets'];

export function loadLists(dir = DEFAULT_DIR) {
  return Object.fromEntries(NAMES.map(n => [n, JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), 'utf8'))]));
}

// Written to .tmp then renamed, so a crash never leaves a half-written file.
async function writeAtomic(file, value) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n');
  await fs.promises.rename(`${file}.tmp`, file);
}

export async function saveLists(lists, dir = DEFAULT_DIR) {
  for (const n of NAMES) await writeAtomic(path.join(dir, `${n}.json`), lists[n]);
}

export const saveBlocked = (blocked, dir = DEFAULT_DIR) => writeAtomic(path.join(dir, 'blocked.json'), [...blocked]);
