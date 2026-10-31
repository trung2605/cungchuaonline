import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pruneLogs } from '../scripts/prune-logs.mjs';

test('TC-08.1 only logs older than 30 days are deleted', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prune-'));
  const now = Date.now(), day = 86_400_000;
  for (const [name, age] of [['old.jsonl', 31], ['new.jsonl', 29]]) {
    const f = path.join(dir, name);
    fs.writeFileSync(f, '');
    const t = new Date(now - age * day);
    fs.utimesSync(f, t, t);
  }
  assert.deepEqual(pruneLogs(dir, { now }), ['old.jsonl']);
  assert.deepEqual(fs.readdirSync(dir), ['new.jsonl']);
  fs.rmSync(dir, { recursive: true });
});

test('missing logs dir is fine', () => {
  assert.deepEqual(pruneLogs(path.join(os.tmpdir(), 'no-such-logs-dir')), []);
});
