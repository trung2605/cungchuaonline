import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapTiktok } from '../server/mapTiktok.js';

// Fixtures use tiktok-live-connector@2.5.0 (proto v3) field names, see FR-02 plan.
const user = { id: '7001', displayId: 'u1', nickname: 'Lan' };
const gift = (o = {}) => ({ user, giftId: '5655', repeatCount: 1, repeatEnd: 0, gift: { id: 5655, name: 'Rose', diamondCount: 1, type: 1 }, ...o });

test('TC-02.1 chat', () => {
  assert.deepEqual(mapTiktok('chat', { user, content: 'nam mo' }, 1),
    { kind: 'chat', src: 'tiktok', uid: 'u1', name: 'Lan', text: 'nam mo', ts: 1 });
});

test('TC-02.2 empty nickname falls back to handle', () => {
  assert.equal(mapTiktok('chat', { user: { ...user, nickname: '' }, content: 'x' }, 1).name, 'u1');
});

test('TC-02.3 combo in progress -> null', () => {
  assert.equal(mapTiktok('gift', gift({ repeatCount: 3, repeatEnd: 0 }), 1), null);
});

test('TC-02.4 combo end', () => {
  assert.deepEqual(mapTiktok('gift', gift({ repeatCount: 7, repeatEnd: 1, groupId: 'g1' }), 1),
    { kind: 'gift', src: 'tiktok', uid: 'u1', name: 'Lan', giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: 7, group: 'g1', ts: 1 });
});

test('TC-02.5 non-combo gift maps immediately', () => {
  const e = mapTiktok('gift', gift({ giftId: '11046', repeatCount: 0, gift: { id: 11046, name: 'Galaxy', diamondCount: 1000, type: 2 } }), 1);
  assert.equal(e.repeat, 1);
  assert.equal(e.diamonds, 1000);
  assert.equal(e.giftId, 11046);
  assert.equal(e.group, '');
});

test('TC-02.6 member, roomUser, streamEnd, like', () => {
  assert.deepEqual(mapTiktok('member', { user, action: 1 }, 1), { kind: 'join', src: 'tiktok', uid: 'u1', name: 'Lan', ts: 1 });
  assert.deepEqual(mapTiktok('roomUser', { total: '123', totalUser: '900' }, 1), { kind: 'viewers', src: 'tiktok', count: 123, ts: 1 });
  assert.deepEqual(mapTiktok('streamEnd', { action: 3 }, 1), { kind: 'end', src: 'tiktok', ts: 1 });
  assert.equal(mapTiktok('like', { user, count: 15, total: '999' }, 1).count, 15);
  assert.equal(mapTiktok('like', { user, count: 0 }, 1).count, 1);
});

test('TC-02.7 unknown event -> null', () => {
  assert.equal(mapTiktok('emote', {}, 1), null);
});
