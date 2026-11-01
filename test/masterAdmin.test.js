import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../AdminTong/server/db.js';
import { startMasterAdmin } from '../AdminTong/server/masterAdmin.js';

test('TC-MASTER-01: Database records gifts, aggregates top donors, manages catalog & work logs', () => {
  const db = createDatabase({ storeFile: '', mongoUri: '' });

  // Record real & mock gifts across both games
  db.recordGift({
    game: 'cung-chua-online',
    src: 'tiktok',
    uid: 'u_trung',
    name: 'Lê Trí Trung',
    giftId: 5879,
    giftName: 'Doughnut',
    diamonds: 30,
    repeat: 2,
  });
  db.recordGift({
    game: 'cuoc-dua-ky-thu',
    src: 'tiktok',
    uid: 'u_trung',
    name: 'Lê Trí Trung',
    giftId: 11046,
    giftName: 'Galaxy',
    diamonds: 1000,
    repeat: 1,
  });
  db.recordGift({
    game: 'cuoc-dua-ky-thu',
    src: 'mock',
    uid: 'mock_1',
    name: 'Nguyễn An',
    giftId: 5655,
    giftName: 'Rose',
    diamonds: 1,
    repeat: 5,
  });

  const sum = db.summary();
  assert.equal(sum.totals.realDiamonds, 1060);
  assert.equal(sum.totals.mockDiamonds, 5);
  assert.equal(sum.totals.chuaDiamonds, 60);
  assert.equal(sum.totals.duaDiamonds, 1005);
  assert.equal(sum.topDonors[0].name, 'Lê Trí Trung');
  assert.equal(sum.topDonors[0].totalDiamonds, 1060);

  // Upsert & delete custom gift in catalog
  const added = db.upsertGiftCatalogItem({
    giftId: 88888,
    giftName: 'Golden Dragon',
    giftVi: 'Rồng Vàng Hộ Mệnh',
    diamonds: 5000,
    chuaReward: 'Đại Hồng Chung & Hào Quang Rồng',
    duaReward: 'Cưỡi Rồng Vàng Tốc Độ ×8.0',
  });
  assert.equal(added.tier, 4);
  assert.ok(db.summary().giftCatalog.some(x => x.giftId === 88888));
  assert.ok(db.deleteGiftCatalogItem(88888));
  assert.ok(!db.summary().giftCatalog.some(x => x.giftId === 88888));

  // Add work log
  const log = db.addWorkLog({
    category: 'feature',
    game: 'all',
    title: 'Kiểm thử Admin Tổng',
    detail: 'Đầy đủ tính năng quản lý đa game và quà tặng',
  });
  assert.equal(log.title, 'Kiểm thử Admin Tổng');
  assert.equal(db.summary().workLogs[0].title, 'Kiểm thử Admin Tổng');
});

test('TC-MASTER-02: Master Admin HTTP API (state, ingest, gift-catalog, work-log, tiktok-user, mongodb)', async () => {
  const db = createDatabase({ storeFile: '', mongoUri: '' });
  const envVars = {};
  const master = await startMasterAdmin({
    port: 0,
    password: 'secret',
    db,
    updateEnvVar: (k, v) => { envVars[k] = v; },
    gameAdmins: {},
  });

  const base = `http://127.0.0.1:${master.port}`;
  const auth = 'Basic ' + Buffer.from('admin:secret').toString('base64');

  // Unauthenticated -> 401
  assert.equal((await fetch(`${base}/api/state`)).status, 401);

  // Ingest gift from sub-game
  const rIngest = await fetch(`${base}/api/ingest`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({
      kind: 'gift',
      game: 'cuoc-dua-ky-thu',
      src: 'tiktok',
      uid: 'u99',
      name: 'Phạm Hoàng',
      giftId: 5655,
      giftName: 'Rose',
      diamonds: 1,
      repeat: 10,
    }),
  });
  assert.equal(rIngest.status, 200);
  const ingData = await rIngest.json();
  assert.equal(ingData.gift.totalDiamonds, 10);
  assert.equal(ingData.gift.giftVi, 'Hoa Hồng');

  // Add catalog gift
  const rCat = await fetch(`${base}/api/gift-catalog`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({
      giftId: 77777,
      giftName: 'Sports Car',
      giftVi: 'Siêu Xe Đua',
      diamonds: 3000,
      chuaReward: 'Đại Công Đức',
      duaReward: 'Siêu Xe ×7.0',
    }),
  });
  assert.equal(rCat.status, 200);

  // Add work log
  const rWork = await fetch(`${base}/api/work-log`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({
      category: 'note',
      game: 'all',
      title: 'Đã kiểm tra hệ thống',
      detail: 'Hoạt động ổn định',
    }),
  });
  assert.equal(rWork.status, 200);

  // Switch TikTok account globally
  const rTk = await fetch(`${base}/api/tiktok-user`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({ user: '@adidaphat20266' }),
  });
  assert.equal(rTk.status, 200);
  assert.equal(envVars.TIKTOK_USER, 'adidaphat20266');

  // Configure empty MongoDB URI (fallback to local JSON cleanly)
  const rMongo = await fetch(`${base}/api/mongodb`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({ uri: '', dbName: 'live_tiktok' }),
  });
  assert.equal(rMongo.status, 200);
  const mData = await rMongo.json();
  assert.equal(mData.mongo.connected, false);

  // Check state
  const rState = await fetch(`${base}/api/state`, { headers: { authorization: auth } });
  const state = await rState.json();
  assert.equal(state.db.totals.realDiamonds, 10);
  assert.ok(state.db.giftCatalog.some(c => c.giftId === 77777));

  await master.close();
  await db.close();
});
