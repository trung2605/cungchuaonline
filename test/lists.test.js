import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadLists, saveLists } from '../server/lists.js';

test('TC-03.15 saveLists writes atomically, loadLists reads back', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lists-'));
  const l = { badwords: ['dm'], triggers: ['nam mo'], intents: { 'binh an': 'Cầu Bình An' }, couplets: [['a', 'b']] };
  await saveLists(l, dir);
  await saveLists(l, dir); // overwrite existing files
  assert.deepEqual(fs.readdirSync(dir).sort(), ['badwords.json', 'couplets.json', 'intents.json', 'triggers.json']);
  assert.deepEqual(loadLists(dir), l);
  fs.rmSync(dir, { recursive: true });
});

test('TC-03.19 default lists: 7 intents, 5 couplets', () => {
  const l = loadLists();
  assert.equal(Object.keys(l.intents).length, 7);
  assert.equal(l.couplets.length, 5);
  for (const pair of l.couplets) for (const s of pair) assert.ok(Array.from(s).length <= 26, s);
  assert.ok(l.badwords.length > 100);
  assert.ok(l.triggers.includes('nam mo'));
});
