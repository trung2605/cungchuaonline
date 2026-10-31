import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotPosition, ALTAR } from '../../web/scene/layout.js';

const all = Array.from({ length: 150 }, (_, i) => slotPosition(i));

test('TC-07.1 slots distinct, >= 0.9 apart', () => {
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++)
      assert.ok(Math.hypot(all[i].x - all[j].x, all[i].z - all[j].z) >= 0.9, `${i} vs ${j}`);
});

test('TC-07.2 front rows closer to altar', () => {
  const front = all.slice(0, 20).map(p => p.z), general = all.slice(20).map(p => p.z);
  assert.ok(Math.max(...front) < Math.min(...general));
});

test('TC-07.3 nobody blocks the statue', () => {
  for (const p of all) assert.ok(p.z > ALTAR.z + 2 && Math.abs(p.x) <= 7);
});

test('TC-07.21 no slot on the carpet', () => {
  for (const p of all) assert.ok(Math.abs(p.x) >= 1.5);
});

test('TC-07.22 75 per side', () => {
  assert.equal(all.filter(p => p.x < 0).length, 75);
  assert.equal(all.filter(p => p.x > 0).length, 75);
});
