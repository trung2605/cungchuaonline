import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEffects } from '../server/effects.js';
import { Stage } from '../server/stage.js';
import { createDedupe } from '../server/dedupe.js';
import { createBowRules } from '../server/bowRules.js';
import { createPipeline } from '../server/pipeline.js';

const setup = () => {
  const clock = { t: 0 };
  return { clock, fx: createEffects({ now: () => clock.t }) };
};
const gift = (uid, diamonds, repeat) => ({ kind: 'gift', src: 'mock', uid, name: uid, giftId: 1, giftName: 'g', diamonds, repeat, ts: 0 });
const like = (count = 1, uid = 'l') => ({ kind: 'like', src: 'mock', uid, name: uid, count, ts: 0 });

test('TC-05.1 tier 0 gift -> flower or smoke (Rose/TikTok)', () => {
  assert.deepEqual(setup().fx.handle(gift('a', 1, 3)), [{ t: 'fx', kind: 'flower', at: 'a', power: 3 }]);
  assert.deepEqual(setup().fx.handle({ ...gift('a', 1, 3), giftName: 'Rose' }), [{ t: 'fx', kind: 'smoke', at: 'a', power: 3 }]);
  assert.deepEqual(setup().fx.handle({ ...gift('a', 1, 2), giftName: 'TikTok' }), [{ t: 'fx', kind: 'smoke', at: 'a', power: 2 }]);
});

test('TC-05.2 tier 1 gift -> lamp, power capped 10', () => {
  assert.deepEqual(setup().fx.handle(gift('a', 30, 15)), [{ t: 'fx', kind: 'lamp', at: 'a', power: 10 }]);
});

test('TC-05.3 tier 2 gift -> bell + halo', () => {
  assert.deepEqual(setup().fx.handle(gift('a', 1000, 1)).map(m => [m.kind, m.at]), [['bell', 'a'], ['halo', 'a']]);
});

test('TC-05.4/05.5 likes batched per 500 ms', () => {
  const { clock, fx } = setup();
  const out = [];
  for (let i = 0; i < 10; i++) { clock.t = i * 30; out.push(...fx.handle(like())); }
  assert.deepEqual(out, [{ t: 'fx', kind: 'smoke', power: 1 }]);
  clock.t = 600;
  assert.deepEqual(fx.handle(like()), [{ t: 'fx', kind: 'smoke', power: 10 }]);
  for (let i = 0; i < 30; i++) fx.handle(like());
  clock.t = 1200;
  assert.equal(fx.handle(like())[0].power, 20);
});

test('TC-05.6 crossing 1000 -> one lotus', () => {
  const { clock, fx } = setup();
  fx.handle(like(990));
  clock.t = 100;
  assert.deepEqual(fx.handle(like(20)), [{ t: 'fx', kind: 'lotus', power: 10 }]);
  assert.equal(fx.totalLikes(), 1010);
  clock.t = 200;
  assert.equal(fx.handle(like(2000)).filter(m => m.kind === 'lotus').length, 1);
});

const pipeline = () => {
  const lists = { badwords: [], triggers: ['nam mo'], intents: {}, couplets: [] };
  const stage = new Stage();
  return createPipeline({ stage, lists, dedupe: createDedupe(), rules: [createBowRules({ stage, lists }), createEffects()] });
};

test('TC-05.7 like spawns nobody', () => {
  assert.ok(!pipeline().handle(like()).some(m => m.t === 'spawn'));
});

test('TC-05.8 spawn before fx', () => {
  const kinds = pipeline().handle(gift('n', 1, 3)).map(m => m.t);
  assert.ok(kinds.indexOf('spawn') < kinds.indexOf('fx'));
});
