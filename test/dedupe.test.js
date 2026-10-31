import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDedupe, dedupeKey } from '../server/dedupe.js';

const clock = () => {
  let t = 0;
  return { now: () => t, set: v => { t = v; } };
};
const chat = { kind: 'chat', src: 'tiktok', uid: 'u1', name: 'Lan', text: 'nam mo', ts: 0 };

test('dedupeKey shapes', () => {
  assert.equal(dedupeKey(chat), 'chat|u1|nam mo');
  assert.equal(dedupeKey({ kind: 'gift', uid: 'u1', giftId: 5655, repeat: 7, group: 'g9' }), 'gift|u1|5655:7:g9');
  assert.equal(dedupeKey({ kind: 'gift', uid: 'u1', giftId: 5655, repeat: 7 }), 'gift|u1|5655:7:');
  assert.equal(dedupeKey({ kind: 'like', uid: 'u1', count: 3 }), 'like|u1|3');
  assert.equal(dedupeKey({ kind: 'join', uid: 'u1' }), 'join|u1');
  assert.equal(dedupeKey({ kind: 'viewers', count: 1 }), null);
  assert.equal(dedupeKey({ kind: 'end' }), null);
});

test('TC-02.8 duplicate inside window', () => {
  const c = clock();
  const d = createDedupe({ now: c.now });
  assert.equal(d.seen(chat), false);
  c.set(4000);
  assert.equal(d.seen(chat), true);
});

test('TC-02.9 outside window', () => {
  const c = clock();
  const d = createDedupe({ now: c.now });
  assert.equal(d.seen(chat), false);
  c.set(5001);
  assert.equal(d.seen(chat), false);
});

test('TC-02.10 same gift from another source is a duplicate', () => {
  const c = clock();
  const d = createDedupe({ now: c.now });
  const g = { kind: 'gift', src: 'tiktok', uid: 'u1', name: 'Lan', giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: 7, group: 'g1', ts: 0 };
  assert.equal(d.seen(g), false);
  c.set(300);
  assert.equal(d.seen({ ...g, src: 'tikfinity' }), true);
});

test('TC-02.11 viewers never deduped', () => {
  const d = createDedupe({ now: () => 0 });
  const v = { kind: 'viewers', src: 'tiktok', count: 10, ts: 0 };
  assert.equal(d.seen(v), false);
  assert.equal(d.seen(v), false);
});

test('TC-02.12 expired keys are pruned', () => {
  const c = clock();
  const d = createDedupe({ now: c.now });
  for (let i = 0; i < 10000; i++) d.seen({ ...chat, uid: `u${i}` });
  assert.equal(d.size(), 10000);
  c.set(6000);
  d.seen(chat);
  assert.ok(d.size() <= 1, `size ${d.size()}`);
});

test('TC-02.13 same gift twice with different groupId is kept', () => {
  const c = clock();
  const d = createDedupe({ now: c.now });
  const g = { kind: 'gift', src: 'tiktok', uid: 'u1', name: 'Lan', giftId: 11046, giftName: 'Galaxy', diamonds: 1000, repeat: 1, group: 'g1', ts: 0 };
  assert.equal(d.seen(g), false);
  c.set(1000);
  assert.equal(d.seen({ ...g, group: 'g2' }), false);
  assert.equal(d.seen({ ...g, group: 'g2' }), true);
});
