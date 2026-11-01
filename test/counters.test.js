import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCounters } from '../server/counters.js';
import { Stage } from '../server/stage.js';
import { createDedupe } from '../server/dedupe.js';
import { createPipeline } from '../server/pipeline.js';

const lists = { badwords: ['dm'], triggers: ['nam mo'], intents: {}, couplets: [] };
const setup = opts => {
  const clock = { t: 0 };
  return { clock, c: createCounters({ lists, now: () => clock.t, ...opts }) };
};
const chat = (uid, text) => ({ kind: 'chat', src: 'mock', uid, name: uid, text, ts: 0 });
const join = (uid, name = uid) => ({ kind: 'join', src: 'mock', uid, name, ts: 0 });
const gift = (uid, diamonds, repeat = 1, giftName = 'Rose') => ({ kind: 'gift', src: 'mock', uid, name: uid, giftId: 1, giftName, diamonds, repeat, ts: 0 });
const banners = out => out.filter(m => m.t === 'banner');

test('TC-06.1 namo counts regardless of cooldown', () => {
  const { clock, c } = setup();
  const out = [...c.handle(chat('u1', 'nam mô')), ...c.handle(chat('u2', 'nam mô'))];
  clock.t = 30_000;
  out.push(...c.handle(chat('u1', 'nam mô')));
  assert.equal(c.state().namo, 3);
  assert.deepEqual(out.map(m => m.value), [1, 2, 3]);
});

test('TC-06.2 non-trigger chat', () => {
  assert.deepEqual(setup().c.handle(chat('u', 'xin chào')), []);
});

test('TC-06.3 join banner throttled', () => {
  const { clock, c } = setup();
  const out = [];
  for (const t of [0, 200, 400, 700, 900]) { clock.t = t; out.push(...c.handle(join('u' + t))); }
  assert.deepEqual(out, [{ t: 'banner', text: 'u0 vừa vào chùa', ms: 3000 }]);
});

test('TC-06.4 big gift banner has priority', () => {
  const { clock, c } = setup();
  assert.deepEqual(banners(c.handle(gift('g', 1000, 1, 'Galaxy'))), [{ t: 'banner', text: 'Cảm ơn g đã phát tâm công đức (Galaxy) 🙏', ms: 5000 }]);
  clock.t = 2500;
  assert.deepEqual(c.handle(join('a')), []);
  clock.t = 5100;
  assert.equal(c.handle(join('b')).length, 1);
});

test('TC-06.5 namo milestone banner', () => {
  const { c } = setup({ namoEvery: 2 });
  c.handle(chat('a', 'nam mô'));
  assert.deepEqual(banners(c.handle(chat('b', 'nam mô'))), [{ t: 'banner', text: 'Cả chùa đã niệm 2 lần 🙏', ms: 4000 }]);
});

test('TC-06.5b milestone text at 1000', () => {
  const { c } = setup();
  let out = [];
  for (let i = 0; i < 1000; i++) out = c.handle(chat('u' + i, 'nam mô'));
  assert.equal(banners(out)[0].text, 'Cả chùa đã niệm 1000 lần 🙏');
});

test('TC-06.6 viewers', () => {
  const { c } = setup();
  assert.deepEqual(c.handle({ kind: 'viewers', src: 'mock', count: 3500, ts: 0 }), [{ t: 'counter', key: 'viewers', value: 3500 }]);
  assert.deepEqual(c.state(), { namo: 0, viewers: 3500 });
});

test('TC-06.8 banner name cleaned', () => {
  assert.equal(setup().c.handle(join('x', '🙏dm'))[0].text, 'Phật tử vừa vào chùa');
});

test('TC-06.9 donor card', () => {
  const [d] = setup().c.handle(gift('a', 1, 3));
  assert.deepEqual(d, { t: 'donor', uid: 'a', name: 'a', giftName: 'Rose', repeat: 3, diamonds: 3, offering: 'dâng hương' });
});

test('TC-06.10 board throttled to 2 s, flushed on tick', () => {
  const { clock, c } = setup();
  const boards = [];
  for (const t of [0, 300, 600]) { clock.t = t; boards.push(...c.handle(gift('u' + t, t + 1)).filter(m => m.t === 'board')); }
  assert.equal(boards.length, 1);
  clock.t = 1000;
  assert.deepEqual(c.tick(), []);
  clock.t = 2100;
  const [m] = c.tick();
  assert.deepEqual(m.top.map(r => r.diamonds), [601, 301, 1]);
  assert.deepEqual(c.tick(), []);
});

test('TC-06.11 top 8, desc, ties by who reached first', () => {
  const { clock, c } = setup();
  const amounts = [5, 50, 7, 50, 3, 90, 1, 2, 60, 8, 4, 6];
  amounts.forEach((d, i) => { clock.t = i; c.handle(gift('u' + i, d)); });
  const top = c.board();
  assert.equal(top.length, 8);
  assert.deepEqual(top.map(r => r.name), ['u5', 'u8', 'u1', 'u3', 'u9', 'u2', 'u11', 'u0']);
});

test('TC-06.7 snapshot counters', () => {
  const stage = new Stage();
  const counters = createCounters({ lists });
  const p = createPipeline({ stage, lists, dedupe: createDedupe(), rules: [counters], counters });
  p.handle(chat('a', 'nam mô'));
  p.handle(chat('b', 'nam mô'));
  assert.equal(p.snapshot().counters.namo, 2);
});
