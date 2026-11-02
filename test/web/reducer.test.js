import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, applyMsg, stepWorld } from '../../web/scene/reducer.js';
import { ALTAR } from '../../web/scene/layout.js';

const actor = (id, slot) => ({ id, name: id, tier: 0, slot, skin: 0, bows: 1, intent: 'Cầu Bình An', diamonds: 0 });
const snapshot = actors => ({
  t: 'snapshot', actors, counters: { namo: 5, viewers: 9 }, scene: { theme: 'night', sound: true }, board: [], couplets: [],
});

test('TC-07.8 snapshot resets then adds idle actors', () => {
  const w = createWorld();
  applyMsg(w, { t: 'spawn', actor: actor('old', 25) }, 0);
  const cmds = applyMsg(w, snapshot([actor('a', 20), actor('b', 21), actor('c', 22)]), 0);
  assert.equal(cmds[0].op, 'reset');
  assert.deepEqual(cmds.filter(c => c.op === 'add').map(c => [c.actor.id, c.idle]), [['a', true], ['b', true], ['c', true]]);
  assert.deepEqual([...w.actors.keys()], ['a', 'b', 'c']);
  assert.ok(cmds.some(c => c.op === 'hud' && c.msg.key === 'namo' && c.msg.value === 5));
});

test('TC-07.9 fx for a missing actor lands on the altar', () => {
  const [c] = applyMsg(createWorld(), { t: 'fx', kind: 'lamp', at: 'khongco', power: 1 }, 0);
  assert.deepEqual(c, { op: 'fx', kind: 'lamp', power: 1, id: null, pos: { x: ALTAR.x, z: ALTAR.z } });
});

test('TC-07.10 at most 12 bubbles, oldest hidden', () => {
  const w = createWorld();
  for (let i = 0; i < 13; i++) applyMsg(w, { t: 'spawn', actor: actor('u' + i, 20 + i) }, 0);
  let last;
  for (let i = 0; i < 13; i++) last = applyMsg(w, { t: 'say', id: 'u' + i, text: 'x', ms: 6000 }, i);
  assert.deepEqual(last.find(c => c.op === 'unsay'), { op: 'unsay', id: 'u0' });
});

test('leave removes the actor once it reaches the door', () => {
  const w = createWorld();
  applyMsg(w, snapshot([actor('a', 20)]), 0);
  applyMsg(w, { t: 'leave', id: 'a' }, 0);
  assert.deepEqual(stepWorld(w, 2100).removed, ['a']);
  assert.equal(w.actors.size, 0);
});

test('spawn on an already-occupied slot evicts the stale occupant and caps client actors at 60', () => {
  const w = createWorld();
  applyMsg(w, { t: 'spawn', actor: actor('stale_u', 25) }, 0);
  const cmds = applyMsg(w, { t: 'spawn', actor: actor('fresh_u', 25) }, 10);
  assert.ok(cmds.some(c => c.op === 'remove' && c.id === 'stale_u'));
  assert.equal(w.actors.has('stale_u'), false);
  assert.equal(w.actors.has('fresh_u'), true);

  for (let i = 0; i < 75; i++) {
    applyMsg(w, { t: 'spawn', actor: actor('bot_' + i, 30 + i) }, 20 + i);
  }
  assert.ok(w.actors.size <= 60);
});
