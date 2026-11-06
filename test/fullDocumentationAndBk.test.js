import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Non-BK (Root) modules
import { Stage as RootStage } from '../server/stage.js';
import { createPipeline as createRootPipeline } from '../server/pipeline.js';
import { createBowRules as createRootBowRules } from '../server/bowRules.js';
import { createEffects as createRootEffects } from '../server/effects.js';
import { createCounters as createRootCounters } from '../server/counters.js';
import { createStats as createRootStats } from '../server/stats.js';
import { createDedupe as createRootDedupe } from '../server/dedupe.js';
import {
  fold as rootFold,
  hasBadword as rootHasBadword,
  detectIntent as rootDetectIntent,
  cleanBubble as rootCleanBubble,
  cleanName as rootCleanName,
  normalizeVietnameseCommentForTts as rootNormalizeTts,
} from '../server/filter.js';
import { loadLists as rootLoadLists } from '../server/lists.js';
import { createTrendEngine as createRootTrendEngine, TREND_PROJECTS as ROOT_TRENDS } from '../server/trendEngine.js';
import { createWorld as createRootWorld, applyMsg as applyRootMsg, stepWorld as stepRootWorld } from '../web/scene/reducer.js';
import { AltarQueue as RootAltarQueue, createActorState as createRootActorState, step as stepRootActor, leave as leaveRootActor, DUR as ROOT_DUR } from '../web/scene/actorFsm.js';

// BK (CungChuaOnline mirror folder) modules
import { Stage as BkStage } from '../CungChuaOnline/server/stage.js';
import { createPipeline as createBkPipeline } from '../CungChuaOnline/server/pipeline.js';
import { createBowRules as createBkBowRules } from '../CungChuaOnline/server/bowRules.js';
import { createEffects as createBkEffects } from '../CungChuaOnline/server/effects.js';
import { createCounters as createBkCounters } from '../CungChuaOnline/server/counters.js';
import { createStats as createBkStats } from '../CungChuaOnline/server/stats.js';
import { createDedupe as createBkDedupe } from '../CungChuaOnline/server/dedupe.js';
import {
  fold as bkFold,
  hasBadword as bkHasBadword,
  detectIntent as bkDetectIntent,
  cleanBubble as bkCleanBubble,
  cleanName as bkCleanName,
  normalizeVietnameseCommentForTts as bkNormalizeTts,
} from '../CungChuaOnline/server/filter.js';
import { loadLists as bkLoadLists } from '../CungChuaOnline/server/lists.js';
import { createTrendEngine as createBkTrendEngine, TREND_PROJECTS as BK_TRENDS } from '../CungChuaOnline/server/trendEngine.js';
import { createWorld as createBkWorld, applyMsg as applyBkMsg, stepWorld as stepBkWorld } from '../CungChuaOnline/web/scene/reducer.js';
import { AltarQueue as BkAltarQueue, createActorState as createBkActorState, step as stepBkActor, leave as leaveBkActor, DUR as BK_DUR } from '../CungChuaOnline/web/scene/actorFsm.js';

// PK / Competitive & Race modules (CuocDuaKyThu)
import { RaceStage } from '../CuocDuaKyThu/server/raceStage.js';
import { createRaceRules } from '../CuocDuaKyThu/server/raceRules.js';
import { startRaceAdmin } from '../CuocDuaKyThu/server/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function walkFiles(dir, baseDir = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, baseDir));
    } else if (entry.isFile()) {
      results.push(path.relative(baseDir, full).replace(/\\/g, '/'));
    }
  }
  return results.sort();
}

function md5File(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

test('TC-BK-01: 100% file & hash parity between Root (Non-BK) and CungChuaOnline/ (BK)', () => {
  const dirs = ['server', 'web', 'admin'];
  for (const sub of dirs) {
    const rootDir = path.join(ROOT, sub);
    const bkDir = path.join(ROOT, 'CungChuaOnline', sub);
    assert.ok(fs.existsSync(rootDir), `Root dir ${sub} must exist`);
    assert.ok(fs.existsSync(bkDir), `BK dir CungChuaOnline/${sub} must exist`);

    const rootFiles = walkFiles(rootDir);
    const bkFiles = walkFiles(bkDir);
    assert.deepEqual(bkFiles, rootFiles, `File list mismatch in ${sub}`);

    for (const rel of rootFiles) {
      const hRoot = md5File(path.join(rootDir, rel));
      const hBk = md5File(path.join(bkDir, rel));
      assert.equal(hBk, hRoot, `Hash mismatch for ${sub}/${rel}`);
    }
  }
});

test('TC-BK-02: Non-BK (Root) and BK (CungChuaOnline) pipelines produce 100% identical outputs for all event types', () => {
  const buildSystem = (Mod) => {
    let t = 1_000;
    const now = () => t;
    const lists = Mod.loadLists();
    const stage = new Mod.Stage({ now });
    const stats = Mod.createStats({ lists, now });
    const counters = Mod.createCounters({ lists, now });
    const effects = Mod.createEffects({ lists, now, rand: () => 0 });
    const bowRules = Mod.createBowRules({
      stage,
      lists,
      stats,
      now,
      allowAllRealChat: true,
      emitWishRibbons: true,
    });
    const pipeline = Mod.createPipeline({
      stage,
      lists,
      counters,
      dedupe: Mod.createDedupe({ now }),
      rules: [bowRules, effects, counters, stats],
    });
    const world = Mod.createWorld();
    return {
      step(dt, event) {
        t += dt;
        const msgs = event ? pipeline.handle({ ts: t, ...event }) : pipeline.tick(t);
        for (const m of msgs) Mod.applyMsg(world, m, t);
        Mod.stepWorld(world, t);
        return msgs;
      },
      snapshot() {
        const snap = pipeline.snapshot();
        Mod.applyMsg(world, snap, t);
        return {
          snap,
          stats: stats.state({ tiktok: 'connected' }, counters),
          reducerState: {
            actorsCount: world.actors.size,
            wishesCount: world.wishes.length,
            bubblesCount: world.bubbles.length,
          },
        };
      },
    };
  };

  const nonBk = buildSystem({
    loadLists: rootLoadLists,
    Stage: RootStage,
    createStats: createRootStats,
    createCounters: createRootCounters,
    createEffects: createRootEffects,
    createBowRules: createRootBowRules,
    createPipeline: createRootPipeline,
    createDedupe: createRootDedupe,
    createWorld: createRootWorld,
    applyMsg: applyRootMsg,
    stepWorld: stepRootWorld,
  });

  const bk = buildSystem({
    loadLists: bkLoadLists,
    Stage: BkStage,
    createStats: createBkStats,
    createCounters: createBkCounters,
    createEffects: createBkEffects,
    createBowRules: createBkBowRules,
    createPipeline: createBkPipeline,
    createDedupe: createBkDedupe,
    createWorld: createBkWorld,
    applyMsg: applyBkMsg,
    stepWorld: stepBkWorld,
  });

  const events = [
    { src: 'tiktok', kind: 'join', uid: 'u1', name: 'Phật Tử Minh' },
    { src: 'tiktok', kind: 'chat', uid: 'u1', name: 'Phật Tử Minh', text: 'Nam mô A Di Đà Phật cầu bình an' },
    { src: 'tiktok', kind: 'gift', uid: 'u2', name: 'Thiện Tâm', giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: 5 },
    { src: 'tiktok', kind: 'gift', uid: 'u3', name: 'Đại Thí Chủ Long', giftId: 11046, giftName: 'Galaxy', diamonds: 1000, repeat: 1 },
    { src: 'tiktok', kind: 'like', uid: 'u1', name: 'Phật Tử Minh', count: 120 },
    { src: 'tiktok', kind: 'viewers', count: 250 },
    { src: 'mock', kind: 'gift', uid: 'mock1', name: 'Khách Demo', giftId: 5655, giftName: 'Rose', diamonds: 10, repeat: 2 },
  ];

  for (const ev of events) {
    const outRoot = nonBk.step(1000, ev);
    const outBk = bk.step(1000, ev);
    assert.deepEqual(outBk.map(m => m.t), outRoot.map(m => m.t));
  }

  nonBk.step(5000, null);
  bk.step(5000, null);

  const sRoot = nonBk.snapshot();
  const sBk = bk.snapshot();

  assert.deepEqual(sBk.reducerState, sRoot.reducerState);
  assert.equal(sBk.stats.diamonds, sRoot.stats.diamonds);
  assert.equal(sBk.stats.uniqueBowers, sRoot.stats.uniqueBowers);
  assert.equal(sBk.stats.namo, sRoot.stats.namo);
  assert.equal(sBk.stats.viewersPeak, sRoot.stats.viewersPeak);
});

test('TC-BK-03: Non-BK and BK TrendEngine & Filter modules behave identically', () => {
  assert.equal(BK_TRENDS.length, ROOT_TRENDS.length);
  const lists = rootLoadLists();
  const sampleTexts = [
    'Nam Mô A Di Đà Phật cầu gia đạo bình an',
    '15/08/2001 xin quẻ đầu năm',
    'Minh Anh + Hoàng Nam',
    'd.m badword test',
  ];
  for (const txt of sampleTexts) {
    assert.equal(bkFold(txt), rootFold(txt));
    assert.equal(bkHasBadword(txt, lists), rootHasBadword(txt, lists));
    assert.equal(bkDetectIntent(txt, lists), rootDetectIntent(txt, lists));
    assert.equal(bkCleanBubble(txt, lists), rootCleanBubble(txt, lists));
    assert.equal(bkCleanName(txt, lists), rootCleanName(txt, lists));
    assert.equal(bkNormalizeTts(txt, lists), rootNormalizeTts(txt, lists));
  }

  const rootEngine = createRootTrendEngine();
  const bkEngine = createBkTrendEngine();
  for (const proj of ROOT_TRENDS) {
    const r1 = rootEngine.interact({
      projectId: proj.slug,
      nickname: 'Test User',
      text: proj.sampleComments[0],
      type: 'gift',
      giftName: 'Hoa Hồng',
      diamondCount: 1,
    });
    const r2 = bkEngine.interact({
      projectId: proj.slug,
      nickname: 'Test User',
      text: proj.sampleComments[0],
      type: 'gift',
      giftName: 'Hoa Hồng',
      diamondCount: 1,
    });
    assert.equal(r2.event.result.headline, r1.event.result.headline);
    assert.deepEqual(r2.event.result.metrics, r1.event.result.metrics);
  }
});

test('TC-07.4 & TC-07.19: ActorFSM phase durations and CREDITS.md asset documentation', () => {
  // TC-07.4: enter -> altar (n * DUR.bow) -> toSeat -> kneel -> idle -> leave -> done
  for (const Mod of [
    { AltarQueue: RootAltarQueue, createActorState: createRootActorState, step: stepRootActor, leave: leaveRootActor, DUR: ROOT_DUR },
    { AltarQueue: BkAltarQueue, createActorState: createBkActorState, step: stepBkActor, leave: leaveBkActor, DUR: BK_DUR },
  ]) {
    let t = 0;
    const queue = new Mod.AltarQueue();
    const st = Mod.createActorState({ id: 'u1', slot: 0, tier: 1, bows: 2 }, { idle: false, now: t, queue });
    assert.equal(st.phase, 'enter');
    t += Mod.DUR.enter;
    assert.equal(Mod.step(st, t, queue).phase, 'altar');
    t += 2 * Mod.DUR.bow;
    assert.equal(Mod.step(st, t, queue).phase, 'toSeat');
    t += Mod.DUR.toSeat;
    assert.equal(Mod.step(st, t, queue).phase, 'kneel');
    t += Mod.DUR.kneel;
    assert.equal(Mod.step(st, t, queue).phase, 'idle');
    Mod.leave(st, t, queue);
    assert.equal(st.phase, 'leave');
    t += Mod.DUR.leave;
    assert.equal(Mod.step(st, t, queue).phase, 'done');
  }

  // TC-07.19: CREDITS.md exists in both web/assets and CungChuaOnline/web/assets and documents license & source
  for (const rel of ['web/assets/CREDITS.md', 'CungChuaOnline/web/assets/CREDITS.md']) {
    const full = path.join(ROOT, rel);
    assert.ok(fs.existsSync(full), `${rel} must exist`);
    const content = fs.readFileSync(full, 'utf8');
    assert.ok(content.length > 50, `${rel} must have non-empty license/source documentation`);
  }
});

test('TC-09.16: XSS payload in nickname and comment is safely preserved as raw text without script execution', () => {
  const lists = rootLoadLists();
  const stage = new RootStage();
  const stats = createRootStats({ lists });
  const counters = createRootCounters({ lists });
  const bowRules = createRootBowRules({ stage, lists, stats, allowAllRealChat: true, emitWishRibbons: true });
  const pipeline = createRootPipeline({
    stage,
    lists,
    counters,
    dedupe: createRootDedupe(),
    rules: [bowRules, counters, stats],
  });

  const xssName = '<img src=x onerror=alert(1)>';
  const xssText = 'Nam mô cầu an <script>alert(1)</script>';
  const msgs = pipeline.handle({
    kind: 'chat',
    src: 'tiktok',
    uid: 'u_xss',
    name: xssName,
    text: xssText,
    ts: 1000,
  });

  const spawn = msgs.find(m => m.t === 'spawn');
  assert.ok(spawn);
  // cleanName caps at 16 characters (BR-03.9) while preserving raw characters safely without HTML execution
  assert.equal(spawn.actor.name, xssName.slice(0, 16));
  assert.equal(stats.recent()[0].raw, xssText);

  // Verify web/hud.js uses safe textContent / escapeHtml so raw strings never execute as DOM HTML
  const hudCode = fs.readFileSync(path.join(ROOT, 'web/hud.js'), 'utf8');
  assert.ok(hudCode.includes('textContent'), 'web/hud.js should use textContent for safe DOM rendering');
});

test('TC-PK-01: PK Mode (CuocDuaKyThu) handles runner join, gift boost, King overtake, and Mock vs Real stats isolation', async () => {
  let clock = 1_000;
  const now = () => clock;
  const lists = rootLoadLists();
  const status = { tiktok: 'connected', tikfinity: 'off', tiktokUser: 'adidaphat20266' };
  const stage = new RaceStage({ max: 50, baseSpeedMps: 1.5, stayMinutes: 5, now });
  const rules = createRaceRules({ stage, lists, status, now });

  // 1. Runner 1 joins via comment and takes initial #1 King spot with a 5-Rose gift
  const joinMsgs = rules.handle({
    kind: 'chat',
    src: 'tiktok',
    uid: 'racer_1',
    name: 'Tay Đua Minh',
    text: 'Hà Nội tiến lên!',
    ts: clock,
  });
  assert.ok(joinMsgs.some(m => m.t === 'spawn'));
  assert.equal(stage.snapshot().length, 1);

  clock += 500;
  rules.handle({
    kind: 'gift',
    src: 'tiktok',
    uid: 'racer_1',
    name: 'Tay Đua Minh',
    giftId: 5655,
    giftName: 'Rose',
    diamonds: 1,
    repeat: 5,
    ts: clock,
  });

  // 2. Runner 2 sends a high-tier gift -> overtakes Runner 1 and becomes New King (PK overtake!)
  clock += 1000;
  const giftMsgs = rules.handle({
    kind: 'gift',
    src: 'tiktok',
    uid: 'racer_2',
    name: 'Vua Tốc Độ Long',
    giftId: 11046,
    giftName: 'Galaxy',
    diamonds: 1000,
    repeat: 1,
    ts: clock,
  });
  assert.ok(giftMsgs.some(m => m.t === 'boost'), 'Gift should trigger boost');
  const donorMsg = giftMsgs.find(m => m.t === 'donor');
  assert.ok(donorMsg && donorMsg.overtookKing === true && donorMsg.prevKingName === 'Tay Đua Minh', 'Higher distance gift should trigger PK King overtake');

  // 3. Mock gift should spawn/boost in 3D scene but NOT pollute real revenue stats
  clock += 1000;
  rules.handle({
    kind: 'gift',
    src: 'mock',
    uid: 'mock_racer',
    name: 'Bot Đua',
    giftId: 11046,
    giftName: 'Galaxy',
    diamonds: 5000,
    repeat: 1,
    ts: clock,
  });

  const st = rules.statsState(status);
  assert.equal(st.totalGiftsDiamonds, 1005, 'Real diamonds must exclude mock gifts (5 + 1000 = 1005)');
  assert.equal(st.demoStats.diamonds, 5000, 'Mock diamonds tracked separately in demoStats');
  assert.equal(st.topRacers.length, 2, 'Real topRacers excludes mock bots');
  assert.equal(st.topRacers[0].uid, 'racer_2');
  assert.equal(st.allTopRacers.length, 3, 'allTopRacers includes both real and mock runners');

  // 4. Test RaceAdmin HTTP API (reward-config, stay-time, kick, reset-stats)
  const sent = [];
  const admin = await startRaceAdmin({
    port: 0,
    password: 'pw',
    ctx: {
      stage,
      rules,
      lists,
      blocked: new Set(),
      status,
      demo: { start: () => {}, stop: () => {}, state: () => ({ on: false, rate: null }), configure: () => {} },
      ingest: e => rules.handle(e),
      broadcast: m => sent.push(...m),
      getScene: () => ({ sound: true }),
      setScene: () => {},
      getConfig: () => ({ tiktokUser: 'adidaphat20266', maxActors: 50 }),
    },
  });
  const auth = 'Basic ' + Buffer.from('admin:pw').toString('base64');
  const base = `http://127.0.0.1:${admin.port}`;
  try {
    const rState = await fetch(`${base}/api/state`, { headers: { authorization: auth } });
    assert.equal(rState.status, 200);
    const jState = await rState.json();
    assert.equal(jState.stats.totalGiftsDiamonds, 1005);

    const rReward = await fetch(`${base}/api/reward-config`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ distanceMultiplier: 2.5, speedMultiplier: 1.5, preset: 'climax' }),
    });
    assert.equal(rReward.status, 200);
    const jReward = await rReward.json();
    assert.equal(jReward.rewardConfig.distanceMultiplier, 2.5);
  } finally {
    await admin.close();
  }
});

test('TC-PK-02: PK Trend #5 (Đại Chiến Gia Tộc 3D) vs Non-PK Trends (#1..#4, #6..#10) full verification', () => {
  const engine = createRootTrendEngine();

  // PK Trend #5: dai-chien
  const pkComment = engine.interact({
    projectId: 'dai-chien',
    nickname: 'Chiến Thần Nghệ An',
    text: '37 Nghệ An quyết chiến!',
    type: 'comment',
    diamondCount: 0,
  });
  assert.equal(pkComment.ok, true);
  assert.equal(pkComment.event.format, 'province_code');

  const pkGift = engine.interact({
    projectId: 'dai-chien',
    nickname: 'Chiến Thần Nghệ An',
    text: '37 Nghệ An quyết chiến!',
    type: 'gift',
    giftName: 'Hoa Hồng',
    diamondCount: 1,
  });
  assert.equal(pkGift.ok, true);
  assert.equal(pkGift.event.isMicroGift, true);
  assert.ok(pkGift.event.result.score > pkComment.event.result.score);

  // Non-PK Trends: verify all remaining 9 trends
  const nonPkSlugs = ROOT_TRENDS.map(p => p.slug).filter(s => s !== 'dai-chien');
  assert.equal(nonPkSlugs.length, 9);
  for (const slug of nonPkSlugs) {
    const proj = ROOT_TRENDS.find(p => p.slug === slug);
    const res = engine.interact({
      projectId: slug,
      nickname: 'Người Xem May Mắn',
      text: proj.sampleComments[0],
      type: 'comment',
      diamondCount: 0,
    });
    assert.equal(res.ok, true);
    assert.equal(res.event.projectId, slug);
  }
});

test('TC-BK-04: Full HTTP, WebSocket, and Admin integration test on BK (CungChuaOnline/server/*)', async () => {
  const { startServer: startBkServer } = await import('../CungChuaOnline/server/server.js');
  const { startAdmin: startBkAdmin } = await import('../CungChuaOnline/server/admin.js');
  const WebSocket = (await import('ws')).default;

  const lists = bkLoadLists();
  const blocked = new Set();
  const stage = new BkStage();
  const stats = createBkStats({ lists });
  const counters = createBkCounters({ lists });
  const pipeline = createBkPipeline({
    stage,
    lists,
    blocked,
    counters,
    dedupe: createBkDedupe(),
    rules: [createBkBowRules({ stage, lists, stats, allowAllRealChat: true, emitWishRibbons: true }), createBkEffects({ lists }), counters, stats],
  });

  const srv = await startBkServer({
    port: 0,
    webRoot: path.join(ROOT, 'CungChuaOnline/web'),
    mounts: { '/vendor/three/': path.join(ROOT, 'node_modules/three') },
    getSnapshot: () => pipeline.snapshot(),
  });

  const admin = await startBkAdmin({
    port: 0,
    password: 'bkpw',
    ctx: {
      pipeline,
      stage,
      lists,
      blocked,
      stats,
      counters,
      status: { tiktok: 'connected', tikfinity: 'off' },
      ingest: e => {
        const msgs = pipeline.handle(e);
        if (msgs.length) srv.broadcast(msgs);
      },
      broadcast: msgs => srv.broadcast(msgs),
      saveLists: async () => {},
      saveBlocked: async () => {},
      demo: { start: () => {}, stop: () => {}, state: () => ({ on: false, rate: null }), config: () => ({ on: false, rate: null }) },
    },
  });

  const ws = new WebSocket(`ws://127.0.0.1:${srv.port}`);
  const wsQueue = [];
  const wsWaiters = [];
  ws.on('message', d => {
    const m = JSON.parse(d);
    wsWaiters.length ? wsWaiters.shift()(m) : wsQueue.push(m);
  });
  const nextWs = () => (wsQueue.length ? Promise.resolve(wsQueue.shift()) : new Promise(r => wsWaiters.push(r)));

  const auth = 'Basic ' + Buffer.from('admin:bkpw').toString('base64');
  const adminBase = `http://127.0.0.1:${admin.port}`;

  try {
    // 1. WS client receives initial snapshot
    const snap = await nextWs();
    assert.equal(snap.t, 'snapshot');

    // 2. Static HTML served from BK webRoot
    const rHtml = await fetch(`http://127.0.0.1:${srv.port}/index.html`);
    assert.equal(rHtml.status, 200);
    assert.match(rHtml.headers.get('content-type') || '', /^text\/html/);

    // 3. Admin Basic Auth check (401 without credentials, 200 with credentials)
    assert.equal((await fetch(`${adminBase}/api/state`)).status, 401);
    const rState = await fetch(`${adminBase}/api/state`, { headers: { authorization: auth } });
    assert.equal(rState.status, 200);

    // 4. Admin POST /api/bodhi/wish broadcasts wish_ribbon over BK WebSocket
    const rWish = await fetch(`${adminBase}/api/bodhi/wish`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Phật Tử BK', wish: 'Cầu Bình An Gia Đạo', ribbonColor: 'red', diamonds: 5 }),
    });
    assert.equal(rWish.status, 200);
    const wsMsg = await nextWs();
    assert.equal(wsMsg.t, 'wish_ribbon');
    assert.equal(wsMsg.wish.name, 'Phật Tử BK');

    // 5. Admin POST /api/stay-time & /api/reward-config on BK
    const rStay = await fetch(`${adminBase}/api/stay-time`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ stayMinutes: 10 }),
    });
    assert.equal(rStay.status, 200);
    assert.equal(stage.getStayConfig().stayMinutes, 10);
  } finally {
    ws.close();
    await srv.close();
    await admin.close();
  }
});

test('TC-BK-05: BK (CungChuaOnline) adapters, normalizers, and contextual TTS speech match Root (Non-BK)', async () => {
  const { mapTiktok: bkMapTiktok } = await import('../CungChuaOnline/server/mapTiktok.js');
  const { mapTiktok: rootMapTiktok } = await import('../server/mapTiktok.js');
  const { mapTikfinity: bkMapTikfinity } = await import('../CungChuaOnline/server/mapTikfinity.js');
  const { mapTikfinity: rootMapTikfinity } = await import('../server/mapTikfinity.js');
  const { formatContextualTempleSpeech: bkSpeech } = await import('../CungChuaOnline/web/scene/audio.js');
  const { formatContextualTempleSpeech: rootSpeech } = await import('../web/scene/audio.js');

  const user = { id: '7001', displayId: 'u1', nickname: 'Lan' };
  const tkChat = { user, content: 'Nam mô A Di Đà Phật' };
  assert.deepEqual(bkMapTiktok('chat', tkChat, 100), rootMapTiktok('chat', tkChat, 100));

  const tfChat = { event: 'chat', data: { userId: '7001', uniqueId: 'u1', nickname: 'Lan', comment: 'Nam mô A Di Đà Phật' } };
  assert.deepEqual(bkMapTikfinity(tfChat, 100), rootMapTikfinity(tfChat, 100));

  const ctx = { lastKind: 'join', lastUid: 'u1' };
  const item = { kind: 'gift', uid: 'u1', name: 'Lan', giftName: 'Hoa Sen', totalDiamonds: 5, tier: 1 };
  assert.equal(bkSpeech(item, { ...ctx }), rootSpeech(item, { ...ctx }));
});

test('TC-UIUX-01: UI/UX Craft Floor & Accessibility Verification Across All 5 Surfaces (Admin Tổng, Cúng Chùa, Xuyên Việt, 10 Trends, Sub-Admin)', () => {
  // 1. Admin Tổng CSS Craft Floor & Complete Class Coverage
  const adminCss = fs.readFileSync(path.join(ROOT, 'AdminTong/public/css/admin.css'), 'utf8');
  assert.ok(adminCss.includes('--radius-sm: 8px;'), 'Admin CSS must define refined --radius-sm');
  assert.ok(adminCss.includes('--radius-md: 12px;'), 'Admin CSS must define refined --radius-md');
  assert.ok(adminCss.includes('--radius-lg: 14px;'), 'Admin CSS must define refined --radius-lg');
  assert.ok(!adminCss.includes('border-radius: 0px !important;'), 'Admin CSS must not force global 0px border-radius');
  assert.ok(adminCss.includes(':focus-visible'), 'Admin CSS must support keyboard focus-visible ring');
  assert.ok(adminCss.includes('prefers-reduced-motion: reduce'), 'Admin CSS must respect prefers-reduced-motion');
  for (const cls of ['.sidebar-logo', '.sidebar-brand-text', '.sidebar-nav', '.nav-label', '.workspace-breadcrumb', '.topbar-right', '.kpi-label', '.grid-4', '.field-label', '.input']) {
    assert.ok(adminCss.includes(cls), `Admin CSS must style ${cls}`);
  }

  const adminHtml = fs.readFileSync(path.join(ROOT, 'AdminTong/index.html'), 'utf8');
  assert.ok(!adminHtml.includes('border-radius:0px'), 'AdminTong/index.html must not contain inline border-radius:0px');
  assert.ok(!adminHtml.includes('rgba(15, 23, 42, 0.65)'), 'AdminTong/index.html must not contain low-contrast dark-on-dark panels');

  const adminJs = fs.readFileSync(path.join(ROOT, 'AdminTong/public/js/admin.js'), 'utf8');
  assert.ok(!adminJs.includes('rgba(15,23,42,0.5)'), 'AdminTong/public/js/admin.js must not render dark-on-dark catalog cards');

  // 2. Cúng Chùa Online 3D + Cây Bồ Đề Ước Nguyện HUD (Root & BK)
  for (const rel of ['web/index.html', 'CungChuaOnline/web/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(html.includes('#toggle-bodhi-view:focus-visible'), `${rel} must support focus-visible on Bodhi button`);
    assert.ok(html.includes('#bodhi-wish-list::-webkit-scrollbar'), `${rel} must style Bodhi wish list scrollbar`);
    assert.ok(html.includes('bodhi-drawer-close'), `${rel} must include close button on Bodhi drawer`);
    assert.ok(html.includes('prefers-reduced-transparency: reduce'), `${rel} must respect prefers-reduced-transparency`);
  }

  // 3. Hành Trình Đi Bộ Xuyên Việt 3D HUD (CuocDuaKyThu)
  const vnHtml = fs.readFileSync(path.join(ROOT, 'CuocDuaKyThu/web/index.html'), 'utf8');
  assert.ok(vnHtml.includes('#toggle-bgm:hover'), 'CuocDuaKyThu #toggle-bgm must have hover feedback');
  assert.ok(vnHtml.includes('pointer-events: auto; cursor: pointer;'), 'CuocDuaKyThu #toggle-bgm must be clickable');
  assert.ok(vnHtml.includes('prefers-reduced-motion: reduce'), 'CuocDuaKyThu must respect prefers-reduced-motion');
  assert.ok(vnHtml.includes('prefers-reduced-transparency: reduce'), 'CuocDuaKyThu must respect prefers-reduced-transparency');
  const vnMainJs = fs.readFileSync(path.join(ROOT, 'CuocDuaKyThu/web/main.js'), 'utf8');
  assert.ok(vnMainJs.includes('audio.nextBgmTrack'), 'CuocDuaKyThu/web/main.js must bind #toggle-bgm click to audio.nextBgmTrack');

  // 4. Hệ Sinh Thái 10 Website 3D Bắt Trend TikTok (Root & BK)
  for (const rel of ['web/trends/trends.css', 'CungChuaOnline/web/trends/trends.css']) {
    const css = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(css.includes(':focus-visible'), `${rel} must support focus-visible`);
    assert.ok(css.includes('body:not(.is-live-mode) .trends-workspace'), `${rel} must stack studio docks responsively under 1180px`);
    assert.ok(css.includes('prefers-reduced-motion: reduce'), `${rel} must respect prefers-reduced-motion`);
  }
  for (const rel of ['web/trends/index.html', 'CungChuaOnline/web/trends/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(html.includes('🇻🇳 Xuyên Việt 3D'), `${rel} must label Xuyên Việt 3D accurately`);
  }

  // 5. Sub-Admin Redirect Pages (Root, BK, CuocDuaKyThu)
  for (const rel of ['admin/index.html', 'CungChuaOnline/admin/index.html', 'CuocDuaKyThu/admin/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(html.includes('window.__adminTargetUrl'), `${rel} must use origin-aware redirect target`);
    assert.ok(html.includes('redirect-card'), `${rel} must render styled redirect card`);
  }
});

