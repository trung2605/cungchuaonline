import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, matchesAny, isTrigger, cleanBubble, cleanName, detectIntent, normalizeVietnameseCommentForTts } from '../server/filter.js';
import { loadLists } from '../server/lists.js';
import { cleanCommentForTts } from '../web/scene/audio.js';

const lists = () => ({
  badwords: ['dm', 'vcl', 'đồ ngu'],
  triggers: ['nam mo', 'namo', 'a di da phat', 'adida', 'adidaphat', 'quan the am', 'mo phat'],
  intents: { 'binh an': 'Cầu Bình An', 'tai loc': 'Cầu Tài Lộc', 'suc khoe': 'Cầu Sức Khỏe' },
  couplets: [],
});

test('TC-03.1 fold strips marks and repeats', () => {
  assert.equal(fold('Nam Môôô  A Di Đà'), 'nam mo a di da');
});

test('TC-03.2 fold joins split single letters', () => {
  assert.equal(fold('v.c.l'), 'vcl');
  assert.equal(fold('n a m mo'), 'nam mo');
});

test('TC-03.3 fold drops invisible chars', () => {
  assert.equal(fold('na​m mo'), 'nam mo');
});

test('fold keepMarks keeps Vietnamese marks', () => {
  assert.equal(fold('Đồ  D.M', { keepMarks: true }), 'đồ dm');
  assert.ok(matchesAny('chúc các bạn', ['các']));
  assert.ok(!matchesAny('chúc các bạn', ['cac'], { keepMarks: true }));
});

test('TC-03.4 triggers', () => {
  const l = lists();
  for (const s of ['Nam mô A Di Đà Phật'.normalize('NFD'), 'NAMOOO', 'adida 🙏', 'n.a.m m.o']) assert.equal(isTrigger(s, l), true, s);
});

test('TC-03.5 non-triggers', () => {
  const l = lists();
  for (const s of ['xin chào', 'nam môn học']) assert.equal(isTrigger(s, l), false, s);
});

test('TC-03.6 badwords with dots', () => {
  const l = lists();
  assert.equal(cleanBubble('v.c.l luôn', l), null);
  assert.equal(cleanBubble('đồ dm', l), null);
});

test('TC-03.7 no false positive', () => {
  assert.equal(cleanBubble('ad mình ơi nam mô', lists()), 'ad mình ơi nam mô');
});

test('TC-03.8 url, phone, mention', () => {
  const l = lists();
  for (const s of ['vào abc.com', '0912 345 678', '@ai đó', 'https://x', 'hỏi @Đức']) assert.equal(cleanBubble(s, l), null, s);
});

test('TC-03.9 bubble cut to 40 code points', () => {
  assert.equal(cleanBubble('a'.repeat(60), lists()).length, 40);
  assert.equal(Array.from(cleanBubble('🙏'.repeat(50), lists())).length, 40);
});

test('TC-03.10 bubble keeps marks and emoji', () => {
  assert.equal(cleanBubble('Cầu  bình an 🙏', lists()), 'Cầu bình an 🙏');
  assert.equal(cleanBubble('  ​ ', lists()), null);
});

test('TC-03.11 name drops emoji, cut 16', () => {
  assert.equal(cleanName('🙏Minh Anh Nguyễn Thị Lan', lists()), 'Minh Anh Nguyễn');
});

test('TC-03.12 bad or empty name -> Phật tử', () => {
  assert.equal(cleanName('dm', lists()), 'Phật tử');
  assert.equal(cleanName('🙏🙏', lists()), 'Phật tử');
});

test('TC-03.13 name NFD -> NFC', () => {
  assert.equal(cleanName('Thảo'.normalize('NFD'), lists()), 'Thảo'.normalize('NFC'));
});

test('TC-03.14 lists edited at runtime', () => {
  const l = lists();
  assert.equal(cleanBubble('abc xyz', l), 'abc xyz');
  l.badwords.push('xyz');
  assert.equal(cleanBubble('abc xyz', l), null);
});

test('TC-03.16 perf: 2000 badwords, 10000 bubbles < 0.2 ms each', () => {
  const l = { ...lists(), badwords: Array.from({ length: 2000 }, (_, i) => `từ cấm ${i}`) };
  const t0 = performance.now();
  for (let i = 0; i < 10000; i++) cleanBubble(`Nam mô A Di Đà Phật con cầu bình an ${i}`, l);
  const avg = (performance.now() - t0) / 10000;
  assert.ok(avg < 0.2, `avg ${avg.toFixed(3)} ms`);
});

test('TC-03.17 detectIntent', () => {
  const l = lists();
  assert.equal(detectIntent('Cầu tài lộc nam mô', l), 'Cầu Tài Lộc');
  assert.equal(detectIntent('nam mô', l), null);
  assert.equal(detectIntent('binh an va suc khoe', l), 'Cầu Bình An');
});

test('TC-03.18 intent counts as trigger', () => {
  assert.equal(isTrigger('cầu sức khỏe cho mẹ', lists()), true);
});

test('TC-03.20 real badwords list does not block common phrases', () => {
  const l = loadLists();
  for (const s of ['Nam mô, cầu cho bố mẹ bình an', 'chuc cac ban buoi sang binh an', 'con đi ngủ đây', 'tuổi lớn rồi', 'sửa đi ad', 'Duy ơi', 'phở ngon'])
    assert.equal(cleanBubble(s, l), s.normalize('NFC'), s);
  for (const s of ['đồ cặc', 'dm', 'v.c.l', 'địt mẹ', 'clgt', 'mày điên à, đm!', 'v*c*l', 'đị.t mẹ', 'chơi tài xỉu không?', 'kubet uy tín', 'chùa lừa đảo', 'sư hổ mang'])
    assert.equal(cleanBubble(s, l), null, s);
});

test('TC-03.21 Vietnamese comment normalizer for TTS expands teencode & blocks sensitive words', () => {
  const l = loadLists();
  assert.equal(
    normalizeVietnameseCommentForTts('nam mo a di da phat cau binh an cho gd 🙏🙏', l),
    'Nam mô A Di Đà Phật cầu bình an cho gia đình'
  );
  assert.equal(
    cleanCommentForTts('Nam môôôô A Di Đà Phậttttt, chúc mn sk và hp ❤️'),
    'Nam mô A Di Đà Phật, chúc mọi người sức khỏe và hạnh phúc'
  );
  assert.equal(cleanCommentForTts('mày ngu vcl'), '');
  assert.equal(cleanCommentForTts('vào chơi tài xỉu kubet'), '');
  assert.equal(cleanCommentForTts('12345678'), '');
  assert.equal(cleanCommentForTts('🙏🙏🙏'), '');
});

test('cleanBubble max param (admin banner 60)', () => {
  assert.equal(cleanBubble('a'.repeat(80), lists(), 60).length, 60);
});
