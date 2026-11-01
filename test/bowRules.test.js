import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage } from '../server/stage.js';
import { giftTier, giftOffering, createBowRules } from '../server/bowRules.js';
import { cleanTtsName, formatTtsThanks } from '../web/scene/audio.js';

const lists = {
  badwords: ['dm'],
  triggers: ['nam mo', 'namo', 'a di da phat'],
  intents: { 'binh an': 'Cầu Bình An', 'tai loc': 'Cầu Tài Lộc' },
  couplets: [],
};

const setup = () => {
  const clock = { t: 0 };
  const now = () => clock.t;
  const stage = new Stage({ now });
  return { clock, stage, rules: createBowRules({ stage, lists, now }) };
};
const chat = (uid, text) => ({ kind: 'chat', src: 'mock', uid, name: uid.toUpperCase(), text, ts: 0 });
const gift = (uid, diamonds, repeat) => ({ kind: 'gift', src: 'mock', uid, name: uid, giftId: 1, giftName: 'g', diamonds, repeat, ts: 0 });
const kinds = out => out.map(m => m.t);

test('TC-04.10 giftTier', () => {
  assert.deepEqual([9, 10, 999, 1000].map(giftTier), [0, 1, 1, 2]);
});

test('TC-04.11 free bow', () => {
  const { rules } = setup();
  const out = rules.handle(chat('a', 'nam mô'));
  assert.deepEqual(kinds(out), ['spawn', 'say']);
  assert.equal(out[0].actor.tier, 0);
  assert.equal(out[0].actor.bows, 1);
});

test('TC-04.12 cooldown with actor present: say only', () => {
  const { clock, stage, rules } = setup();
  rules.handle(chat('a', 'nam mô'));
  const exp = stage.snapshot()[0].expiresAt;
  clock.t = 30_000;
  assert.deepEqual(kinds(rules.handle(chat('a', 'nam mô'))), ['say']);
  assert.equal(stage.snapshot()[0].expiresAt, exp);
});

test('TC-04.13 cooldown without actor: nothing', () => {
  const { clock, stage, rules } = setup();
  rules.handle(chat('a', 'nam mô'));
  clock.t = 61_000;
  stage.tick();
  clock.t = 300_000;
  assert.deepEqual(rules.handle(chat('a', 'nam mô')), []);
});

test('TC-04.14 after 10 minutes: free bow again', () => {
  const { clock, stage, rules } = setup();
  rules.handle(chat('a', 'nam mô'));
  clock.t = 61_000;
  stage.tick();
  clock.t = 600_000;
  assert.equal(rules.handle(chat('a', 'nam mô'))[0].t, 'spawn');
});

test('TC-04.15 gift ignores cooldown', () => {
  const { clock, rules } = setup();
  rules.handle(chat('a', 'nam mô'));
  clock.t = 1000;
  const out = rules.handle(gift('a', 1, 3));
  assert.deepEqual(out[0], { t: 'bow', id: 'a', times: 3, visit: true });
});

test('TC-04.16 big gift front row; bad bubble hidden', () => {
  const { rules } = setup();
  const g = rules.handle(gift('c', 1000, 1))[0];
  assert.equal(g.actor.tier, 2);
  assert.ok(g.actor.slot < 20);
  assert.equal(g.actor.expiresAt, 300_000);
  assert.deepEqual(kinds(rules.handle(chat('n', 'nam mô dm'))), ['spawn']);
});

test('TC-04.21 intent from chat', () => {
  const { rules } = setup();
  assert.equal(rules.handle(chat('a', 'cầu tài lộc'))[0].actor.intent, 'Cầu Tài Lộc');
});

test('TC-04.22 gift newcomer gets default intent', () => {
  const { rules } = setup();
  assert.equal(rules.handle(gift('g', 1, 1))[0].actor.intent, 'Cầu Bình An');
});

test('TC-04.24 gift to seated actor: bow visit then badge', () => {
  const { rules } = setup();
  rules.handle(chat('a', 'nam mô'));
  assert.deepEqual(rules.handle(gift('a', 1, 1)), [
    { t: 'bow', id: 'a', times: 1, visit: true },
    { t: 'badge', id: 'a', diamonds: 1 },
  ]);
});

test('TC-04.25 giftOffering & TTS formatting with combo count and name cleaning', () => {
  assert.equal(giftOffering('Rose', 1), 'dâng hương');
  assert.equal(giftOffering('TikTok', 5), 'dâng hương');
  assert.equal(giftOffering('Hoa hồng', 3), 'dâng hương');
  assert.equal(giftOffering('Lotus', 2), 'dâng hoa');
  assert.equal(giftOffering('Finger Heart', 5), 'dâng đèn hoa đăng');
  assert.equal(giftOffering('Doughnut', 30), 'dâng đèn hoa đăng');
  assert.equal(giftOffering('Galaxy', 1000), 'phát tâm công đức');

  assert.equal(cleanTtsName('user839201928'), 'Phật tử');
  assert.equal(cleanTtsName('Lê_Trí.Trung_1992'), 'Lê Trí Trung');
  assert.equal(formatTtsThanks({ name: 'Lê Trí Trung', offering: 'dâng hương', repeat: 1 }), 'Cảm ơn Lê Trí Trung đã dâng hương');
  assert.equal(formatTtsThanks({ name: 'Lê Trí Trung', offering: 'dâng hương', repeat: 5 }), 'Cảm ơn Lê Trí Trung đã dâng 5 nén hương');
  assert.equal(formatTtsThanks({ name: 'Lan_9999', offering: 'dâng hoa', repeat: 3 }), 'Cảm ơn Lan đã dâng 3 đóa hoa sen');
  assert.equal(formatTtsThanks({ name: 'Minh', offering: 'dâng đèn hoa đăng', repeat: 2 }), 'Cảm ơn Minh đã dâng 2 ngọn đèn hoa đăng');
  assert.equal(formatTtsThanks({ name: 'user1234567', offering: 'phát tâm công đức', repeat: 1 }), 'Cảm ơn Phật tử đã phát tâm công đức');
});
