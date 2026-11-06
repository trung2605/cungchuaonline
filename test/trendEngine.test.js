import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TREND_PROJECTS,
  detectCommentFormat,
  createTrendEngine,
} from '../server/trendEngine.js';
import { startMasterAdmin } from '../AdminTong/server/masterAdmin.js';

test('TREND_PROJECTS defines all 10 interactive 3D websites with complete metadata', () => {
  assert.equal(TREND_PROJECTS.length, 10);
  const slugs = TREND_PROJECTS.map((p) => p.slug);
  assert.deepEqual(slugs, [
    'gieo-que',
    'duyen-so',
    'than-so',
    'linh-thu',
    'dai-chien',
    'giai-ma-ten',
    'con-so-may-man',
    'cay-tai-loc',
    'be-ca-zen',
    'phao-hoa-sky',
  ]);
  for (const proj of TREND_PROJECTS) {
    assert.ok(proj.name);
    assert.ok(proj.formatPrompt);
    assert.ok(proj.microGiftPrompt);
    assert.ok(Array.isArray(proj.sampleComments) && proj.sampleComments.length >= 2);
    assert.ok(proj.defaultCustomData?.ruleNote);
  }
});

test('detectCommentFormat classifies 10 viewer comment formats deterministically without AI', () => {
  assert.equal(detectCommentFormat('15/08/2001').format, 'birth_date');
  assert.equal(detectCommentFormat('Minh Anh + Hoàng Nam').format, 'couple_names');
  assert.equal(detectCommentFormat('2001').format, 'birth_year');
  assert.equal(detectCommentFormat('37 Nghệ An mãi đỉnh').format, 'province_code');
  assert.equal(detectCommentFormat('6868').format, 'lucky_digits');
  assert.equal(detectCommentFormat('Shop Thảo Vy buôn may bán đắt').format, 'business_wish');
  assert.equal(detectCommentFormat('Thi đỗ Đại học Bách Khoa').format, 'exam_career');
  assert.equal(detectCommentFormat('Thanh Long thức tỉnh').format, 'myth_pet');
  assert.equal(detectCommentFormat('Happy Birthday tuổi mới rực rỡ').format, 'celebration');
  assert.equal(detectCommentFormat('Nguyễn Bảo Ngọc').format, 'full_name');
});

test('createTrendEngine computes deterministic results for all 10 websites and upgrades on 1💎 micro-gift', () => {
  const engine = createTrendEngine();
  const mirrorEngine = createTrendEngine();

  for (const proj of TREND_PROJECTS) {
    const sample = proj.sampleComments[0];
    const r1 = engine.interact({
      projectId: proj.id,
      nickname: 'Minh Anh',
      text: sample,
      type: 'comment',
      diamondCount: 0,
    });
    const r2 = mirrorEngine.interact({
      projectId: proj.id,
      nickname: 'Minh Anh',
      text: sample,
      type: 'comment',
      diamondCount: 0,
    });

    assert.equal(r1.ok, true);
    assert.equal(r1.event.projectId, proj.slug);
    assert.equal(r1.event.trendId, proj.id);
    // Deterministic check: identical comment produces identical headline & metrics
    assert.equal(r1.event.result.headline, r2.event.result.headline);
    assert.deepEqual(r1.event.result.metrics, r2.event.result.metrics);

    // Micro-gift 1💎 Hoa Hồng upgrade check
    const rGift = engine.interact({
      projectId: proj.id,
      nickname: 'Minh Anh VIP',
      text: sample,
      type: 'gift',
      giftName: 'Hoa Hồng',
      diamondCount: 1,
    });
    assert.equal(rGift.event.isMicroGift, true);
    assert.equal(rGift.event.result.badge, proj.defaultCustomData.microGiftTitle);
    assert.ok(rGift.event.result.score > r1.event.result.score);
  }

  const insights = engine.getInsightReport();
  assert.equal(insights.totalEvents, 20);
  assert.equal(insights.totalComments, 10);
  assert.equal(insights.totalMicroGifts, 10);
  assert.ok(insights.formatBreakdown.length > 0);
  assert.ok(insights.topKeywords.length > 0);
});

test('createTrendEngine allows customizing data tables & formulas per website at runtime', () => {
  const engine = createTrendEngine();
  const updated = engine.setCustomData('gieo-que', {
    ruleNote: 'Công thức Can Chi Custom 2026',
    bonusBlessing: 'Lộc vàng ngập tràn cả năm!',
    microGiftTitle: 'SIÊU QUẺ KIM CƯƠNG 1💎',
  });
  assert.equal(updated.ok, true);

  const out = engine.interact({
    projectId: 'gieo-que',
    nickname: 'Bảo Ngọc',
    text: '1999',
    type: 'gift',
    giftName: 'Hoa Hồng',
    diamondCount: 1,
  });
  assert.equal(out.event.result.badge, 'SIÊU QUẺ KIM CƯƠNG 1💎');
  assert.ok(out.event.result.detailText.includes('Lộc vàng ngập tràn cả năm!'));
});

test('Master Admin serves /trends pages and /api/trends/* endpoints cleanly', async () => {
  const mockDb = {
    summary: () => ({ gifts: [], workLogs: [], giftCatalog: [], mongo: { connected: false } }),
    recordGift: (g) => g,
    recordEvent: (e) => e,
    addWorkLog: (w) => w,
    resetAllData: async () => {},
  };

  const srv = await startMasterAdmin({
    port: 0,
    host: '127.0.0.1',
    password: 'testpassword',
    db: mockDb,
    gameAdmins: {},
  });

  try {
    const base = `http://127.0.0.1:${srv.port}`;

    // 1. Public 3D Trend Website HTML & JS/CSS require no Basic Auth
    const pageRes = await fetch(`${base}/trends/duyen-so`);
    assert.equal(pageRes.status, 200);
    const html = await pageRes.text();
    assert.ok(html.includes('Hệ Sinh Thái 10 Web 3D Bắt Trend TikTok'));

    const cssRes = await fetch(`${base}/trends/trends.css`);
    assert.equal(cssRes.status, 200);

    const jsRes = await fetch(`${base}/trends/trendsApp.js`);
    assert.equal(jsRes.status, 200);

    // 2. Public API /api/trends/state & /api/trends/interact
    const stateRes = await fetch(`${base}/api/trends/state?project=duyen-so`);
    assert.equal(stateRes.status, 200);
    const stateData = await stateRes.json();
    assert.equal(stateData.projects.length, 10);

    const interactRes = await fetch(`${base}/api/trends/interact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId: 'duyen-so',
        nickname: 'Tuấn Kiệt',
        text: 'Tuấn + Linh',
        type: 'gift',
        giftName: 'Hoa Hồng',
        diamondCount: 1,
      }),
    });
    assert.equal(interactRes.status, 200);
    const interactData = await interactRes.json();
    assert.equal(interactData.ok, true);
    assert.equal(interactData.event.format, 'couple_names');
    assert.equal(interactData.event.isMicroGift, true);

    // 3. Poll endpoint returns new event
    const pollRes = await fetch(`${base}/api/trends/poll?since=0&project=duyen-so`);
    assert.equal(pollRes.status, 200);
    const pollData = await pollRes.json();
    assert.equal(pollData.ok, true);
    assert.equal(pollData.events.length, 1);
  } finally {
    await srv.close();
  }
});
