import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage } from '../server/stage.js';
import { createDedupe } from '../server/dedupe.js';
import { createBowRules } from '../server/bowRules.js';
import { createPipeline } from '../server/pipeline.js';

const lists = { badwords: [], triggers: ['nam mo'], intents: {}, couplets: [['a', 'b']] };

const setup = () => {
  const clock = { t: 0 };
  const now = () => clock.t;
  const stage = new Stage({ now });
  const p = createPipeline({
    stage, lists, blocked: new Set(['bad']),
    dedupe: createDedupe({ now }),
    rules: [createBowRules({ stage, lists, now })],
  });
  return { clock, p };
};
const chat = (uid, text) => ({ kind: 'chat', src: 'mock', uid, name: uid, text, ts: 0 });

test('TC-04.17 blocked uid', () => {
  assert.deepEqual(setup().p.handle(chat('bad', 'nam mô')), []);
});

test('TC-04.18 dedupe in pipeline', () => {
  const { clock, p } = setup();
  assert.equal(p.handle(chat('a', 'nam mô'))[0].t, 'spawn');
  clock.t = 4000;
  assert.deepEqual(p.handle(chat('a', 'nam mô')), []);
});

test('TC-04.19 snapshot', () => {
  const { p } = setup();
  p.handle(chat('a', 'nam mô'));
  p.handle(chat('b', 'nam mô'));
  const s = p.snapshot();
  assert.equal(s.t, 'snapshot');
  assert.equal(s.actors.length, 2);
  assert.deepEqual(s.counters, { namo: 0, viewers: 0 });
  assert.deepEqual(s.scene, { theme: 'night', sound: true });
  assert.deepEqual(s.couplets, [['a', 'b']]);
});
