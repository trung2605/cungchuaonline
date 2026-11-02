import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startAdmin } from '../server/admin.js';
import { Stage } from '../server/stage.js';
import { createDedupe } from '../server/dedupe.js';
import { createBowRules } from '../server/bowRules.js';
import { createStats } from '../server/stats.js';
import { createPipeline } from '../server/pipeline.js';

const lists = { badwords: ['dm'], triggers: ['nam mo'], intents: {}, couplets: [['A', 'B']] };
const blocked = new Set();
const stage = new Stage();
const stats = createStats({ lists });
const pipeline = createPipeline({ stage, lists, blocked, dedupe: createDedupe(), rules: [createBowRules({ stage, lists, stats }), stats] });
const sent = [];
const saved = { lists: null, blocked: null };
let demoRate = null;
let admin, base;
const basic = pw => 'Basic ' + Buffer.from(`admin:${pw}`).toString('base64');
const AUTH = basic('s3cret');

before(async () => {
  admin = await startAdmin({
    port: 0,
    password: 's3cret',
    ctx: {
      pipeline, stage, lists, blocked, stats, counters: null, status: {},
      broadcast: m => sent.push(...m),
      saveLists: async l => { saved.lists = structuredClone(l); },
      saveBlocked: async b => { saved.blocked = [...b]; },
      demo: { start: r => { demoRate = r; }, stop: () => { demoRate = null; }, state: () => ({ on: demoRate !== null, rate: demoRate }) },
      autoBalance: {
        state: () => ({ enabled: true, targetRealUsers: 8, maxDemoRate: 0.22, realActive: stage.snapshot().filter(a => a.src !== 'mock').length, demoActive: 0, balanceScore: 100 }),
        configure: cfg => ({ enabled: Boolean(cfg.enabled ?? true), targetRealUsers: Number(cfg.targetRealUsers || 8), maxDemoRate: Number(cfg.maxDemoRate || 0.22) }),
      },
    },
  });
  base = `http://127.0.0.1:${admin.port}`;
});
after(() => admin.close());

const call = (method, path, body, headers = {}) => fetch(base + path, {
  method,
  headers: { authorization: AUTH, ...(body !== undefined && { 'content-type': 'application/json' }), ...headers },
  body: body === undefined || typeof body === 'string' ? body : JSON.stringify(body),
});
const chat = (uid, text) => ({ kind: 'chat', src: 'tiktok', uid, name: uid, text, ts: Math.random() });

test('TC-09.7 auth: none 401, wrong 401, right 200', async () => {
  assert.equal((await fetch(base + '/api/state')).status, 401);
  assert.equal((await call('GET', '/api/state', undefined, { authorization: basic('nope') })).status, 401);
  assert.equal((await call('GET', '/api/state')).status, 200);
  assert.equal((await call('GET', '/')).status, 200);
});

test('TC-09.8 block live actor: leave broadcast, saved, later chat ignored', async () => {
  pipeline.handle(chat('a', 'nam mô'));
  assert.ok(stage.has('a'));
  sent.length = 0;
  assert.equal((await call('POST', '/api/block', { uid: 'a' })).status, 200);
  assert.deepEqual(sent, [{ t: 'leave', id: 'a' }]);
  assert.deepEqual(saved.blocked, ['a']);
  assert.deepEqual(pipeline.handle(chat('a', 'nam mô nữa')), []);
  const st = await (await call('GET', '/api/state')).json();
  assert.deepEqual(st.blocked, ['a']);
  assert.equal(st.recent.find(r => r.uid === 'a').blocked, true);
});

test('TC-09.9 unblock', async () => {
  assert.equal((await call('DELETE', '/api/block/a')).status, 200);
  assert.deepEqual(saved.blocked, []);
});

test('TC-09.10 lists folded, trimmed, deduped; AC-09.3 applies at once', async () => {
  const r = await call('PUT', '/api/lists', { badwords: ['dm', 'XYZ ', 'xyz', ''] });
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).lists.badwords, ['dm', 'xyz']);
  assert.deepEqual(saved.lists.badwords, ['dm', 'xyz']);
  const out = pipeline.handle(chat('b', 'nam mô xyz'));
  assert.ok(out.some(m => m.t === 'spawn'));
  assert.ok(!out.some(m => m.t === 'say'));
});

test('AC-09.4 removed trigger stops bowing', async () => {
  await call('PUT', '/api/lists', { triggers: ['a di da phat'] });
  assert.deepEqual(pipeline.handle(chat('c', 'nam mô')).filter(m => m.t === 'spawn'), []);
  await call('PUT', '/api/lists', { triggers: ['nam mo'] });
});

test('TC-09.11 scene: valid broadcasts, invalid 400', async () => {
  sent.length = 0;
  assert.equal((await call('POST', '/api/scene', { theme: 'day' })).status, 200);
  assert.deepEqual(sent, [{ t: 'scene', scene: { theme: 'day', sound: true } }]);
  assert.equal((await call('POST', '/api/scene', { theme: 'abc' })).status, 400);
  assert.equal((await call('POST', '/api/scene', { sound: 'yes' })).status, 400);
  assert.equal((await call('POST', '/api/scene', { bgmTrack: '' })).status, 400);
  assert.equal((await (await call('GET', '/api/state')).json()).scene.theme, 'day');
  sent.length = 0;
  const rMusic = await call('POST', '/api/scene', { bgmTrack: 'buddha_vinahouse_remix' });
  assert.equal(rMusic.status, 200);
  assert.equal(sent[0].t, 'scene');
  assert.equal(sent[0].scene.bgmTrack, 'buddha_vinahouse_remix');
  assert.equal(typeof sent[0].scene.bgmSeq, 'number');
});

test('TC-09.12 banner gift-bait 400', async () => {
  assert.equal((await call('POST', '/api/banner', { text: 'Tặng hoa để được phù hộ' })).status, 400);
});

test('TC-09.13 banner ok', async () => {
  sent.length = 0;
  assert.equal((await call('POST', '/api/banner', { text: 'Chúc cả nhà bình an' })).status, 200);
  assert.deepEqual(sent, [{ t: 'banner', text: 'Chúc cả nhà bình an', ms: 5000 }]);
  assert.equal((await call('POST', '/api/banner', { text: 'đồ dm' })).status, 400);
});

test('TC-09.14 bad JSON 400, > 64 KB 413, wrong content-type 415', async () => {
  assert.equal((await call('POST', '/api/banner', '{nope')).status, 400);
  assert.equal((await call('POST', '/api/banner', JSON.stringify({ text: 'x'.repeat(70_000) }))).status, 413);
  assert.equal((await call('POST', '/api/banner', 'text=hi', { 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
});

test('TC-09.19 couplets: saved + broadcast; side > 24 chars 400', async () => {
  sent.length = 0;
  assert.equal((await call('PUT', '/api/lists', { couplets: [['Tâm an', 'Đời an']] })).status, 200);
  assert.deepEqual(sent, [{ t: 'couplets', pairs: [['Tâm an', 'Đời an']] }]);
  assert.equal((await call('PUT', '/api/lists', { couplets: [['x'.repeat(30), 'y']] })).status, 400);
  assert.deepEqual(lists.couplets, [['Tâm an', 'Đời an']]);
});

test('BR-09.12 intents: keys folded, label ≤ 20', async () => {
  const r = await call('PUT', '/api/lists', { intents: { 'Cầu Tài': 'Cầu Tài Lộc' } });
  assert.deepEqual((await r.json()).lists.intents, { 'cau tai': 'Cầu Tài Lộc' });
  assert.equal((await call('PUT', '/api/lists', { intents: { x: 'y'.repeat(21) } })).status, 400);
});

test('BR-09.9 demo on/off, rate 1..50', async () => {
  assert.deepEqual((await (await call('POST', '/api/demo', { on: true, rate: 5 })).json()).demo, { on: true, rate: 5 });
  assert.equal((await call('POST', '/api/demo', { on: true, rate: 99 })).status, 400);
  assert.deepEqual((await (await call('POST', '/api/demo', { on: false })).json()).demo, { on: false, rate: null });
});

test('foreign Host header 403 (DNS rebinding)', async () => {
  const code = await new Promise((resolve, reject) =>
    http.get({ host: '127.0.0.1', port: admin.port, path: '/api/state', headers: { host: 'evil.com', authorization: AUTH } }, res => {
      res.resume();
      resolve(res.statusCode);
    }).on('error', reject));
  assert.equal(code, 403);
});

test('POST /api/test-event, /api/kick, /api/history/clear, /api/tiktok-user', async () => {
  assert.equal((await call('POST', '/api/test-event', { action: 'prayer', name: 'TestUser', text: 'Nam mô A Di Đà Phật' })).status, 200);
  const st1 = await (await call('GET', '/api/state')).json();
  assert.ok(st1.actors.length > 0);
  const uid = st1.actors[0].id;
  assert.equal((await call('POST', '/api/kick', { uid })).status, 200);
  assert.equal((await call('POST', '/api/history/clear', {})).status, 200);
  assert.equal((await call('POST', '/api/tiktok-user', { user: '@adidaphat20266' })).status, 200);
  assert.equal((await call('POST', '/api/tiktok-user', { user: 'bad user!' })).status, 400);
});

test('POST /api/auto-balance and /api/scene bgmVocal controls', async () => {
  const abRes = await call('POST', '/api/auto-balance', { enabled: true, targetRealUsers: 12, maxDemoRate: 0.35 });
  assert.equal(abRes.status, 200);
  const abJson = await abRes.json();
  assert.equal(abJson.autoBalance.enabled, true);
  assert.equal(abJson.autoBalance.targetRealUsers, 12);
  assert.equal(abJson.autoBalance.maxDemoRate, 0.35);

  sent.length = 0;
  const scRes = await call('POST', '/api/scene', { bgmVocal: true, bgmVocalVolume: 0.18 });
  assert.equal(scRes.status, 200);
  const scJson = await scRes.json();
  assert.equal(scJson.scene.bgmVocal, true);
  assert.equal(scJson.scene.bgmVocalVolume, 0.18);
});
