import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mapTikfinity } from '../server/mapTikfinity.js';
import { mapTiktok } from '../server/mapTiktok.js';

const fx = name => JSON.parse(fs.readFileSync(new URL(`./fixtures/tikfinity/${name}.json`, import.meta.url), 'utf8'));
const user = { id: '7001', displayId: 'u1', nickname: 'Lan' };

test('TC-10.1 chat matches connector mapping except src', () => {
  const e = mapTikfinity(fx('chat'), 1);
  assert.deepEqual(e, { ...mapTiktok('chat', { user, content: 'nam mo' }, 1), src: 'tikfinity' });
});

test('TC-10.2 combo gift: null until repeatEnd, then gift with repeat + group', () => {
  const m = fx('gift');
  assert.equal(mapTikfinity({ ...m, data: { ...m.data, repeatEnd: false } }, 1), null);
  const connector = mapTiktok('gift', {
    user, giftId: '5655', repeatCount: 7, repeatEnd: 1, groupId: 'g1',
    gift: { id: 5655, name: 'Rose', diamondCount: 1, type: 1 },
  }, 1);
  assert.deepEqual(mapTikfinity(m, 1), { ...connector, src: 'tikfinity' });
});

test('like, member, roomUser map from flat fields', () => {
  assert.equal(mapTikfinity(fx('like'), 1).count, 15);
  assert.equal(mapTikfinity(fx('member'), 1).kind, 'join');
  assert.equal(mapTikfinity(fx('roomUser'), 1).count, 42);
});

test('nested connector-shaped data passes through', () => {
  assert.equal(mapTikfinity({ event: 'chat', data: { user, content: 'x' } }, 1).uid, 'u1');
});

test('junk -> null', () => {
  assert.equal(mapTikfinity({}), null);
  assert.equal(mapTikfinity({ event: 'follow', data: {} }), null);
});
