import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage } from '../server/stage.js';

const setup = opts => {
  const clock = { t: 0 };
  return [new Stage({ now: () => clock.t, ...opts }), clock];
};

test('TC-04.1 first enter', () => {
  const [s] = setup();
  const [m] = s.enter('a', 'A', 0, 1);
  assert.equal(m.t, 'spawn');
  assert.deepEqual({ id: m.actor.id, tier: m.actor.tier, bows: m.actor.bows, slot: m.actor.slot }, { id: 'a', tier: 0, bows: 1, slot: 20 });
  assert.equal(m.actor.expiresAt, 60_000);
});

test('TC-04.2 one actor per uid, bows capped at 50', () => {
  const [s] = setup();
  for (let i = 0; i < 101; i++) s.enter('a', 'A', 0, 1);
  assert.equal(s.snapshot().length, 1);
  assert.equal(s.snapshot()[0].bows, 50);
});

test('TC-04.3 TTL by tier', () => {
  const [s, c] = setup();
  s.enter('a', 'A', 0, 1);
  s.enter('b', 'B', 1, 1);
  c.t = 61_000;
  assert.deepEqual(s.tick(), [{ t: 'leave', id: 'a' }]);
  assert.ok(s.has('b'));
});

test('TC-04.4 re-enter extends TTL', () => {
  const [s, c] = setup();
  s.enter('a', 'A', 1, 1);
  c.t = 100_000;
  s.enter('a', 'A', 1, 1);
  c.t = 200_000;
  assert.deepEqual(s.tick(), []);
});

test('TC-04.5 skin stable per uid', () => {
  const [s1] = setup();
  const [s2] = setup();
  assert.equal(s1.enter('u42', 'X', 0, 1)[0].actor.skin, s2.enter('u42', 'Y', 0, 1)[0].actor.skin);
});

test('TC-04.6 tier 2 sits in front row', () => {
  const [s] = setup();
  assert.ok(s.enter('b', 'B', 2, 1)[0].actor.slot < 20);
});

test('TC-04.7 evicts lowest tier, earliest joined', () => {
  const [s, c] = setup({ max: 23, front: 20 });
  s.enter('d', 'D', 2, 1);
  for (const id of ['o1', 'o2', 'o3']) { c.t++; s.enter(id, id, 0, 1); }
  c.t++;
  const out = s.enter('new', 'N', 0, 1);
  assert.deepEqual(out[0], { t: 'leave', id: 'o1' });
  assert.equal(out[1].t, 'spawn');
  assert.ok(s.has('d'));
});

test('TC-04.8 nobody evictable -> rejected silently', () => {
  const [s] = setup({ max: 22, front: 20 });
  s.enter('p', 'P', 1, 1);
  s.enter('q', 'Q', 1, 1);
  assert.deepEqual(s.enter('x', 'X', 0, 1), []);
  assert.equal(s.has('x'), false);
});

test('TC-04.9 promote to front row on tier 2', () => {
  const [s] = setup();
  s.enter('a', 'A', 0, 1);
  const out = s.enter('a', 'A', 2, 1);
  assert.equal(out[0].t, 'move');
  assert.ok(out[0].slot < 20);
  assert.equal(out[1].t, 'bow');
  assert.equal(s.snapshot()[0].slot, out[0].slot);
});

test('TC-04.23 diamonds kept across re-enter', () => {
  const [s, c] = setup();
  s.enter('a', 'A', 0, 3, { addDiamonds: 3 });
  c.t = 61_000;
  s.tick();
  const out = s.enter('a', 'A', 1, 1, { addDiamonds: 30 });
  assert.equal(out[0].actor.diamonds, 33);
  assert.deepEqual(out[1], { t: 'badge', id: 'a', diamonds: 33 });
});

test('TC-09.1 remove', () => {
  const [s] = setup();
  s.enter('a', 'A', 0, 1);
  assert.deepEqual(s.remove('a'), [{ t: 'leave', id: 'a' }]);
  assert.equal(s.has('a'), false);
  assert.deepEqual(s.remove('x'), []);
});
