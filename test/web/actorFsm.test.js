import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltarQueue, createActorState, step, addBows, leave, move } from '../../web/scene/actorFsm.js';
import { slotPosition } from '../../web/scene/layout.js';

const actor = (id, slot = 30, bows = 1) => ({ id, slot, bows });
const phases = (st, q, times) => times.map(t => step(st, t, q).phase);

test('TC-07.24 full lifecycle: enter, altar 1.6 s, toSeat, kneel, idle', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a', 30, 2), { now: 0, queue: q });
  assert.deepEqual(phases(st, q, [100, 2600, 4000, 4200, 5700, 6200]), ['enter', 'altar', 'altar', 'toSeat', 'kneel', 'idle']);
  const p = step(st, 6200, q).pos, seat = slotPosition(30);
  assert.deepEqual(p, { x: seat.x, z: seat.z });
  assert.deepEqual(q.spots, [null, null, null]);
});

test('TC-07.23 3 altar spots, FIFO queue', () => {
  const q = new AltarQueue();
  const sts = ['a', 'b', 'c', 'd', 'e'].map((id, i) => createActorState(actor(id, 30 + i), { now: 0, queue: q }));
  assert.deepEqual(sts.map(s => s.phase), ['enter', 'enter', 'enter', 'queue', 'queue']);
  sts.forEach(s => step(s, 2600, q));
  // a..c finish their bow at 3300; e is stepped before d but d is first in line.
  for (const s of [sts[0], sts[4], sts[3], sts[1], sts[2]]) step(s, 3400, q);
  assert.deepEqual([sts[3].phase, sts[4].phase], ['enter', 'queue']);
  step(sts[4], 3400, q);
  assert.equal(sts[4].phase, 'enter');
  assert.notEqual(sts[3].spot, sts[4].spot);
});

test('TC-07.23b only the head of the line takes a freed spot', () => {
  const q = new AltarQueue(1);
  const [a, b, c] = ['a', 'b', 'c'].map(id => createActorState(actor(id), { now: 0, queue: q }));
  step(a, 2600, q);
  step(a, 3400, q);
  step(c, 3400, q);
  step(b, 3400, q);
  assert.deepEqual([b.phase, c.phase], ['enter', 'queue']);
});

test('TC-07.25 gift visit: standUp, enter, altar, back to idle', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a'), { idle: true, now: 0, queue: q });
  addBows(st, 1, 0, { visit: true });
  assert.deepEqual(phases(st, q, [100, 600, 3100, 3900, 5400, 5900]), ['standUp', 'enter', 'altar', 'toSeat', 'kneel', 'idle']);
});

test('TC-07.5 bows at seat when idle', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a'), { idle: true, now: 0, queue: q });
  addBows(st, 2, 0);
  assert.deepEqual(phases(st, q, [100, 1500, 1700]), ['bow', 'bow', 'idle']);
});

test('TC-07.6 leave from any phase', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a'), { now: 0, queue: q });
  leave(st, 100, q);
  assert.deepEqual(phases(st, q, [200, 2200]), ['leave', 'done']);
  assert.deepEqual(q.spots, [null, null, null]);
});

test('TC-07.7 snapshot actor starts idle at its seat', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a', 42), { idle: true, now: 0, queue: q });
  const p = step(st, 0, q), seat = slotPosition(42);
  assert.equal(p.phase, 'idle');
  assert.deepEqual(p.pos, { x: seat.x, z: seat.z });
});

test('TC-07.20 move to front row', () => {
  const q = new AltarQueue();
  const st = createActorState(actor('a', 40), { idle: true, now: 0, queue: q });
  move(st, 3, 0);
  const from = slotPosition(40), to = slotPosition(3);
  const mid = step(st, 1250, q);
  assert.equal(mid.phase, 'move');
  assert.ok(mid.pos.z < from.z && mid.pos.z > to.z);
  const end = step(st, 2000, q);
  assert.equal(end.phase, 'kneel');
  assert.deepEqual(end.pos, { x: to.x, z: to.z });
});
