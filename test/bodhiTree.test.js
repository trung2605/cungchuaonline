import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage } from '../server/stage.js';
import { createPipeline } from '../server/pipeline.js';
import { createBowRules } from '../server/bowRules.js';
import { startAdmin } from '../server/admin.js';
import { createStats } from '../server/stats.js';
import { createDedupe } from '../server/dedupe.js';
import { formatContextualTempleSpeech } from '../web/scene/audio.js';

test('TC-BT.1 Stage adds wish and limits to max 50 FIFO', () => {
  const stage = new Stage();
  assert.deepEqual(stage.getWishes(), []);

  const [msg] = stage.addWish({ uid: 'u1', name: 'Minh Tuấn', wish: 'Cầu Gia Đạo Bình An', tier: 0 });
  assert.equal(msg.t, 'wish_ribbon');
  assert.equal(msg.wish.name, 'Minh Tuấn');
  assert.equal(msg.wish.wish, 'Cầu Gia Đạo Bình An');
  assert.equal(stage.getWishes().length, 1);

  // Add 55 wishes, should cap at 50
  for (let i = 2; i <= 55; i++) {
    stage.addWish({ uid: `u${i}`, name: `User ${i}`, wish: `Lời ước ${i}` });
  }
  const wishes = stage.getWishes();
  assert.equal(wishes.length, 50);
  assert.equal(wishes[0].name, 'User 6'); // u1..u5 dropped FIFO
  assert.equal(wishes[49].name, 'User 55');
});

test('TC-BT.2 Stage clearWishes resets list and broadcasts clear', () => {
  const stage = new Stage();
  stage.addWish({ uid: 'u1', name: 'Tâm An', wish: 'Cầu Tài Lộc' });
  assert.equal(stage.getWishes().length, 1);

  const msgs = stage.clearWishes();
  assert.deepEqual(msgs, [{ t: 'clear_wishes' }]);
  assert.equal(stage.getWishes().length, 0);
});

test('TC-BT.3 Pipeline snapshot includes wishes and rewardConfig', () => {
  const stage = new Stage();
  stage.addWish({ uid: 'u1', name: 'Thanh Tâm', wish: 'Cầu Sức Khỏe', tier: 1 });
  stage.setRewardConfig({ bowMultiplier: 2, preset: 'golden_hour' });
  const pipeline = createPipeline({ stage, dedupe: { seen: () => false } });
  const snap = pipeline.snapshot();
  assert.equal(snap.t, 'snapshot');
  assert.ok(Array.isArray(snap.wishes));
  assert.equal(snap.wishes.length, 1);
  assert.equal(snap.wishes[0].name, 'Thanh Tâm');
  assert.ok(snap.rewardConfig);
  assert.equal(snap.rewardConfig.bowMultiplier, 2);
});

test('TC-BT.4 BowRules emits wish_ribbon on gift and prayer', () => {
  const stage = new Stage();
  const lists = {
    triggers: ['nam mo a di da phat', 'nam mo'],
    intents: { 'binh an': 'Cầu Bình An', 'tai loc': 'Cầu Tài Lộc' },
  };
  const rules = createBowRules({ stage, lists, allowAllRealChat: true, emitWishRibbons: true });

  // Gift event generates wish ribbon on Bodhi tree
  const giftMsgs = rules.handle({
    kind: 'gift',
    uid: 'u_donor',
    name: 'Phật Tử Thiện',
    giftName: 'Hoa Sen',
    diamonds: 5,
    repeat: 1,
    src: 'tiktok',
  });
  const ribbonMsg = giftMsgs.find(m => m.t === 'wish_ribbon');
  assert.ok(ribbonMsg, 'gift should generate wish_ribbon');
  assert.equal(ribbonMsg.wish.name, 'Phật Tử Thiện');
  assert.ok(stage.getWishes().some(w => w.uid === 'u_donor'));
});

test('TC-BT.5 Admin HTTP API POST /api/bodhi/wish and /api/bodhi/clear broadcast 3D ribbon events', async () => {
  const lists = { badwords: ['dm'], triggers: ['nam mo'], intents: {}, couplets: [['A', 'B']] };
  const blocked = new Set();
  const stage = new Stage();
  const stats = createStats({ lists });
  const pipeline = createPipeline({
    stage,
    lists,
    blocked,
    dedupe: createDedupe(),
    rules: [createBowRules({ stage, lists, stats, emitWishRibbons: true }), stats],
  });
  const sent = [];
  const admin = await startAdmin({
    port: 0,
    password: 'pw',
    ctx: {
      pipeline,
      stage,
      lists,
      blocked,
      stats,
      counters: null,
      status: {},
      broadcast: m => sent.push(...m),
      saveLists: async () => {},
      saveBlocked: async () => {},
      demo: { start: () => {}, stop: () => {}, state: () => ({ on: false, rate: null }) },
    },
  });
  const auth = 'Basic ' + Buffer.from('admin:pw').toString('base64');
  const base = `http://127.0.0.1:${admin.port}`;
  try {
    const rWish = await fetch(`${base}/api/bodhi/wish`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Thiện Tâm', wish: 'Cầu Vạn Sự Cát Tường', ribbonColor: 'gold', diamonds: 20 }),
    });
    assert.equal(rWish.status, 200);
    const jWish = await rWish.json();
    assert.equal(jWish.ok, true);
    assert.equal(jWish.wish.name, 'Thiện Tâm');
    assert.equal(jWish.wish.ribbonColor, 'gold');
    assert.ok(sent.some(m => m.t === 'wish_ribbon' && m.wish.name === 'Thiện Tâm'));

    const rState = await fetch(`${base}/api/state`, { headers: { authorization: auth } });
    const jState = await rState.json();
    assert.equal(jState.wishes.length, 1);
    assert.equal(jState.wishes[0].name, 'Thiện Tâm');

    const rClear = await fetch(`${base}/api/bodhi/clear`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(rClear.status, 200);
    assert.ok(sent.some(m => m.t === 'clear_wishes'));
    assert.equal(stage.getWishes().length, 0);

    const rReward = await fetch(`${base}/api/reward-config`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ bowMultiplier: 3, tier1MinDiamonds: 3, tier2MinDiamonds: 10, preset: 'climax' }),
    });
    assert.equal(rReward.status, 200);
    const jReward = await rReward.json();
    assert.equal(jReward.ok, true);
    assert.equal(jReward.rewardConfig.bowMultiplier, 3);
    assert.equal(jReward.rewardConfig.tier1MinDiamonds, 3);
    assert.equal(jReward.rewardConfig.tier2MinDiamonds, 10);
  } finally {
    admin.close();
  }
});

test('TC-BT.6 Contextual & humanized Temple speech engine adapts to join/gift/comment transitions', () => {
  // 1. First join from idle
  const join1 = formatContextualTempleSpeech(
    { kind: 'join', uid: 'u1', name: 'Minh Tâm', intentText: 'cầu gia đạo bình an' },
    { lastKind: 'none', lastUid: '' },
  );
  assert.ok(join1.includes('Minh Tâm'), 'join1 should include user name');
  assert.ok(join1.includes('cầu gia đạo bình an'), 'join1 should include intent');

  // 2. Join right after another join -> uses conversational bridge
  const join2 = formatContextualTempleSpeech(
    { kind: 'join', uid: 'u2', name: 'Hoàng Yến', intentText: 'cầu tài lộc' },
    { lastKind: 'join', lastUid: 'u1' },
  );
  assert.ok(join2.includes('Hoàng Yến'));
  assert.notEqual(join1, join2);

  // 3. Coalesced group join (2-3 users arriving together)
  const groupJoin = formatContextualTempleSpeech(
    { kind: 'join', uid: 'u3', groupNames: ['An Nhiên', 'Thanh Tùng', 'Bảo Ngọc'], intentText: 'cầu sức khỏe' },
    { lastKind: 'join', lastUid: 'u2' },
  );
  assert.ok(groupJoin.includes('An Nhiên, Thanh Tùng và Bảo Ngọc'));

  // 4. Same user gifts right after joining -> natural continuation bridge
  const giftSameAfterJoin = formatContextualTempleSpeech(
    { kind: 'gift', uid: 'u1', name: 'Minh Tâm', giftName: 'Hoa Sen', totalDiamonds: 5, tier: 1 },
    { lastKind: 'join', lastUid: 'u1' },
  );
  assert.ok(/Vừa mới bước vào chánh điện|Vừa đặt chân tới chiếu lễ/.test(giftSameAfterJoin));
  assert.ok(giftSameAfterJoin.includes('Minh Tâm'));

  // 5. Different user gifts while welcoming -> warm interruption bridge
  const giftOtherAfterJoin = formatContextualTempleSpeech(
    { kind: 'gift', uid: 'u9', name: 'Đại Thí Chủ Long', giftName: 'Nước Hoa', totalDiamonds: 20, tier: 2 },
    { lastKind: 'join', lastUid: 'u1' },
  );
  assert.ok(giftOtherAfterJoin.includes('Đại Thí Chủ Long'));
  assert.ok(/đại hồng chung|pháp phục hoàng kim|phát tâm công đức/i.test(giftOtherAfterJoin));
});
