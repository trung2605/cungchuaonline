import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLog } from '../server/log.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'log-'));

test('TC-01.5 writes one JSON line per event', async () => {
  const dir = tmp();
  const log = createLog({ dir, now: () => new Date(2026, 9, 31, 12) });
  for (let i = 0; i < 3; i++) log.write({ kind: 'chat', src: 'mock', uid: `u${i}`, name: 'A', text: 'hi', ts: i });
  await log.close();
  const lines = fs.readFileSync(path.join(dir, 'events-20261031.jsonl'), 'utf8').trim().split('\n');
  assert.equal(lines.length, 3);
  assert.deepEqual(lines.map(l => JSON.parse(l).uid), ['u0', 'u1', 'u2']);
});

test('TC-01.6 rotates file at midnight', async () => {
  const dir = tmp();
  let t = new Date(2026, 9, 31, 23, 59, 59);
  const log = createLog({ dir, now: () => t });
  log.write({ kind: 'end', src: 'mock', ts: 1 });
  t = new Date(2026, 10, 1, 0, 0, 1);
  log.write({ kind: 'end', src: 'mock', ts: 2 });
  await log.close();
  assert.deepEqual(fs.readdirSync(dir).sort(), ['events-20261031.jsonl', 'events-20261101.jsonl']);
});
