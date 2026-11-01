import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage } from '../server/stage.js';
import { createDedupe } from '../server/dedupe.js';
import { createBowRules } from '../server/bowRules.js';
import { createCounters } from '../server/counters.js';
import { createStats } from '../server/stats.js';
import { createPipeline } from '../server/pipeline.js';
import { loadLists } from '../server/lists.js';

// test.md "Kịch bản mẫu" (TC-09.3..09.6)
const run = () => {
  const clock = { t: 0 };
  const now = () => clock.t;
  const lists = loadLists();
  const stage = new Stage({ now });
  const stats = createStats({ lists, now });
  const counters = createCounters({ lists, now });
  const p = createPipeline({
    stage, lists, counters, dedupe: createDedupe({ now }),
    rules: [createBowRules({ stage, lists, stats, now }), counters, stats],
  });
  const at = (s, e) => { clock.t = s * 1000; p.handle({ src: 'tiktok', ts: clock.t, ...e }); };
  const gift = (uid, giftName, diamonds, repeat, src = 'tiktok') => ({ kind: 'gift', src, uid, name: uid, giftId: 1, giftName, diamonds, repeat });
  at(0, { kind: 'chat', uid: 'u1', name: 'U1', text: 'Nam mô cầu bình an' });
  at(1, { kind: 'chat', uid: 'u2', name: 'U2', text: 'nam mo cầu bình an' });
  at(2, { kind: 'chat', uid: 'u3', name: 'U3', text: 'nam mô dm' });
  at(3, gift('u1', 'Rose', 1, 3));
  at(4, gift('u4', 'Galaxy', 1000, 1));
  at(5, { kind: 'viewers', count: 120 });
  at(5.5, { kind: 'viewers', count: 90 });
  at(6, gift('mock7', 'Galaxy', 1000, 1, 'mock'));
  clock.t = 3_600_000;
  return { s: stats.state({ tiktok: 'connected' }, counters), stats };
};

test('TC-09.3 bowers and bows', () => {
  const { s } = run();
  assert.equal(s.uniqueBowers, 4);
  assert.equal(s.bows, 7);
  assert.equal(s.namo, 3);
});

test('TC-09.4 top prayers fold-equal, first original shown', () => {
  assert.deepEqual(run().s.topPrayers[0], { text: 'Nam mô cầu bình an', count: 2 });
});

test('TC-09.5 money ignores mock', () => {
  const { s } = run();
  assert.equal(s.diamonds, 1003);
  assert.equal(s.diamondsPerHour, 1003);
  assert.equal(s.topDonors[0].uid, 'u4');
  assert.equal(s.topDonors.length, 2);
});

test('TC-09.6 viewers peak, filtered, sources', () => {
  const { s } = run();
  assert.equal(s.viewersPeak, 120);
  assert.equal(s.filtered, 1);
  assert.deepEqual(s.sources, { tiktok: 'connected', tikfinity: 'off' });
});

test('recent: newest first, raw kept, capped', () => {
  const { stats } = run();
  const r = stats.recent();
  assert.deepEqual(r.map(x => x.uid), ['mock7', 'u4', 'u1', 'u3', 'u2']);
  assert.equal(r.find(x => x.uid === 'u3').text, null);
  assert.equal(r.find(x => x.uid === 'u3').raw, 'nam mô dm');
  assert.equal(r.find(x => x.uid === 'u1').text, 'Nam mô cầu bình an'); // gift keeps last chat
  const small = createStats({ lists: loadLists(), recentMax: 2 });
  for (const uid of ['a', 'b', 'c']) small.handle({ kind: 'join', uid, name: uid });
  assert.deepEqual(small.recent().map(x => x.uid), ['c', 'b']);
});

test('exportHistory, importHistory, clearLogs, and demoStats', () => {
  const { stats } = run();
  const exported = stats.exportHistory();
  assert.equal(exported.diamonds, 1003);
  assert.ok(exported.giftLog.length > 0);
  const fresh = createStats({ lists: loadLists() });
  fresh.importHistory(exported);
  const st = fresh.state();
  assert.equal(st.diamonds, 1003);
  assert.equal(st.uniqueBowers, 4);
  fresh.clearLogs();
  assert.equal(fresh.state().giftLog.length, 0);
  assert.equal(fresh.state().eventLog.length, 0);
});
