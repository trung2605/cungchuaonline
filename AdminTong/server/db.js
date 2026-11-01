// Hybrid Database Layer (MongoDB + Local JSON Persistence) for Live TikTok Master Admin (AdminTong)
// Automatically uses MONGODB_URI from .env when provided, while keeping local backup in logs/master-db.json
// and syncing seamlessly into MongoDB as soon as MONGODB_URI is connected.

import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { MongoClient } from 'mongodb';

// Ensure SRV queries (_mongodb._tcp.*) resolve reliably on Windows / ISP routers
try {
  const currentServers = dns.getServers();
  const preferred = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
  const merged = [...new Set([...preferred, ...currentServers])];
  dns.setServers(merged);
} catch {}

export const DEFAULT_GIFT_CATALOG = [
  { giftId: 5655, giftName: 'Rose', giftVi: 'Hoa Hồng', diamonds: 1, tier: 1, chuaReward: 'Dâng 3 nén hương · Tiếng khánh & Đọc tên', duaReward: 'Đôi Cánh Năng Lượng · Tốc độ ×1.8 (+80m)' },
  { giftId: 5269, giftName: 'TikTok', giftVi: 'TikTok', diamonds: 1, tier: 1, chuaReward: 'Dâng hương trầm · Tiếng khánh & Đọc tên', duaReward: 'Đôi Cánh Năng Lượng · Tốc độ ×1.8 (+80m)' },
  { giftId: 5901, giftName: 'Lotus', giftVi: 'Hoa Sen', diamonds: 2, tier: 1, chuaReward: 'Dâng đóa hoa sen · Tiếng khánh & Đọc tên', duaReward: 'Đôi Cánh Năng Lượng · Tốc độ ×1.8 (+80m)' },
  { giftId: 5487, giftName: 'Finger Heart', giftVi: 'Tim Tay', diamonds: 5, tier: 1, chuaReward: 'Dâng đèn hoa đăng · Tiếng khánh & Đọc tên', duaReward: 'Đôi Cánh Năng Lượng · Tốc độ ×1.8 (+80m)' },
  { giftId: 5658, giftName: 'Perfume', giftVi: 'Nước Hoa', diamonds: 20, tier: 2, chuaReward: 'Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa', duaReward: 'Ván Trượt Hoàng Kim · Tốc độ ×2.8 (+350m)' },
  { giftId: 5879, giftName: 'Doughnut', giftVi: 'Bánh Vòng', diamonds: 30, tier: 2, chuaReward: 'Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa', duaReward: 'Ván Trượt Hoàng Kim · Tốc độ ×2.8 (+350m)' },
  { giftId: 5659, giftName: 'Paper Crane', giftVi: 'Hạc Giấy', diamonds: 99, tier: 2, chuaReward: 'Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa', duaReward: 'Ván Trượt Hoàng Kim · Tốc độ ×2.8 (+350m)' },
  { giftId: 6012, giftName: 'Garland', giftVi: 'Vòng Hoa', diamonds: 299, tier: 3, chuaReward: 'Áo tràng Vàng · Đại hoa đăng & Chuông chùa', duaReward: 'Tên Lửa Tia Chớp · Tốc độ ×4.2 (+1.500m)' },
  { giftId: 6104, giftName: 'Money Gun', giftVi: 'Pháo Lộc Vàng', diamonds: 500, tier: 3, chuaReward: 'Áo tràng Vàng · Đại hoa đăng & Chuông chùa', duaReward: 'Tên Lửa Tia Chớp · Tốc độ ×4.2 (+1.500m)' },
  { giftId: 6201, giftName: 'Swan', giftVi: 'Thiên Nga', diamonds: 699, tier: 3, chuaReward: 'Áo tràng Vàng · Đại hoa đăng & Chuông chùa', duaReward: 'Tên Lửa Tia Chớp · Tốc độ ×4.2 (+1.500m)' },
  { giftId: 11046, giftName: 'Galaxy', giftVi: 'Dải Ngân Hà', diamonds: 1000, tier: 4, chuaReward: 'Áo tràng Hoàng Kim · Quỳ hàng đầu · Hào quang & Đại hồng chung', duaReward: 'Siêu Phi Thuyền Ngân Hà · Dẫn đầu ×6.5 (+10.000m)' },
  { giftId: 12001, giftName: 'Whale Diving', giftVi: 'Cá Voi', diamonds: 2150, tier: 4, chuaReward: 'Áo tràng Hoàng Kim · Quỳ hàng đầu · Hào quang & Đại hồng chung', duaReward: 'Siêu Phi Thuyền Ngân Hà · Dẫn đầu ×6.5 (+10.000m)' },
  { giftId: 15002, giftName: 'Lion', giftVi: 'Sư Tử Vàng', diamonds: 29999, tier: 4, chuaReward: 'Áo tràng Hoàng Kim · Quỳ hàng đầu · Hào quang & Đại hồng chung', duaReward: 'Siêu Phi Thuyền Ngân Hà · Dẫn đầu ×6.5 (+10.000m)' },
  { giftId: 19999, giftName: 'TikTok Universe', giftVi: 'Vũ Trụ TikTok', diamonds: 44999, tier: 4, chuaReward: 'Áo tràng Hoàng Kim · Quỳ hàng đầu · Hào quang & Đại hồng chung', duaReward: 'Siêu Phi Thuyền Ngân Hà · Dẫn đầu ×6.5 (+10.000m)' },
];

export const INITIAL_WORK_LOGS = [
  {
    id: 'work_1',
    ts: Date.now() - 3600_000 * 3,
    time: new Date(Date.now() - 3600_000 * 3).toLocaleString('vi-VN', { hour12: false }),
    category: 'system',
    game: 'all',
    title: 'Khắc phục kết nối TikTok LIVE & Chuyển kênh trực tiếp (@adidaphat20266)',
    detail: 'Bỏ qua sự kiện streamEnd giả khi kênh chưa handshake, hỗ trợ đổi tài khoản TikTok trực tiếp trên Admin không cần khởi động lại server.',
  },
  {
    id: 'work_2',
    ts: Date.now() - 3600_000 * 2,
    time: new Date(Date.now() - 3600_000 * 2).toLocaleString('vi-VN', { hour12: false }),
    category: 'ui_ux',
    game: 'cung-chua-online',
    title: 'Cải thiện UI/UX Cúng Chùa Online & Đồng bộ quà tặng TikTok',
    detail: 'Căn chỉnh Safe Zone tránh vùng Daily Ranking của TikTok LIVE Studio (top: 238px), nâng cấp Áo tràng Vàng (10-999💎) & Áo tràng Hoàng Kim (1000+💎), đồng bộ 14+ loại quà TikTok Việt Nam.',
  },
  {
    id: 'work_3',
    ts: Date.now() - 3600_000,
    time: new Date(Date.now() - 3600_000).toLocaleString('vi-VN', { hour12: false }),
    category: 'new_game',
    game: 'cuoc-dua-ky-thu',
    title: 'Xây dựng Game 3D mới: Cuộc Đua Kỳ Thú (Chạy Vô Hạn Khám Phá Thế Giới)',
    detail: 'Tạo đường đua 3D xuyên qua 6 kỳ quan thế giới (Việt Nam, Nhật Bản, Ai Cập, Pháp, Mỹ, Ngân Hà), lời chào AI "Chào user [tên] đã tham gia cuộc đua cùng chúng tôi" và 4 cấp trang bị tăng tốc (Đôi Cánh, Ván Trượt Vàng, Tên Lửa, Phi Thuyền).',
  },
  {
    id: 'work_4',
    ts: Date.now(),
    time: new Date().toLocaleString('vi-VN', { hour12: false }),
    category: 'master_admin',
    game: 'all',
    title: 'Xây dựng Admin Tổng (AdminTong) & Tích hợp Cơ sở dữ liệu MongoDB',
    detail: 'Quản lý tập trung toàn bộ các trò chơi, quản lý danh mục & lịch sử quà tặng livestream, lưu vết lịch sử công việc và đồng bộ tự động với MongoDB qua biến môi trường MONGODB_URI.',
  },
];

export function createDatabase({
  storeFile = 'logs/master-db.json',
  mongoUri = process.env.MONGODB_URI || '',
  mongoDbName = process.env.MONGODB_DB || 'live_tiktok',
  now = Date.now,
} = {}) {
  const state = {
    gifts: [], // newest first, capped at 2000 locally
    events: [], // newest first, capped at 1000 locally
    workLogs: [...INITIAL_WORK_LOGS],
    giftCatalog: DEFAULT_GIFT_CATALOG.map(g => ({ ...g })),
  };

  let client = null;
  let db = null;
  let mongoStatus = {
    connected: false,
    uriConfigured: Boolean(mongoUri && mongoUri.trim()),
    maskedUri: maskUri(mongoUri),
    dbName: mongoDbName,
    lastSyncAt: null,
    error: null,
  };

  function normalizeMongoUri(u = '') {
    const s = String(u || '').trim();
    if (!s) return '';
    // If password contains unescaped '@' (e.g. mongodb+srv://user:p@ss@cluster...), encode the inner '@'
    const m = s.match(/^(mongodb(?:\+srv)?:\/\/)([^/:]+):(.+)@([^@]+)$/);
    if (m && m[3].includes('@')) {
      return `${m[1]}${m[2]}:${m[3].replace(/@/g, '%40')}@${m[4]}`;
    }
    return s;
  }

  function maskUri(u = '') {
    const s = normalizeMongoUri(u);
    if (!s) return '';
    return s.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  }

  // Load local JSON store if present
  try {
    if (storeFile && fs.existsSync(storeFile)) {
      const raw = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
      if (Array.isArray(raw.gifts)) state.gifts = raw.gifts.slice(0, 2000);
      if (Array.isArray(raw.events)) state.events = raw.events.slice(0, 1000);
      if (Array.isArray(raw.workLogs) && raw.workLogs.length) state.workLogs = raw.workLogs.slice(0, 500);
      if (Array.isArray(raw.giftCatalog) && raw.giftCatalog.length) state.giftCatalog = raw.giftCatalog;
    }
  } catch {}

  function saveLocal() {
    if (!storeFile) return;
    try {
      const dir = path.dirname(storeFile);
      if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(storeFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
    } catch {}
  }

  async function connectMongo(newUri = mongoUri, newDbName = mongoDbName) {
    mongoUri = normalizeMongoUri(newUri);
    mongoDbName = String(newDbName || 'live_tiktok').trim() || 'live_tiktok';
    mongoStatus.uriConfigured = Boolean(mongoUri);
    mongoStatus.maskedUri = maskUri(mongoUri);
    mongoStatus.dbName = mongoDbName;

    if (client) {
      try { await client.close(); } catch {}
      client = null;
      db = null;
    }

    if (!mongoUri) {
      mongoStatus.connected = false;
      mongoStatus.error = null;
      return mongoStatus;
    }

    try {
      client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
      await client.connect();
      db = client.db(mongoDbName);
      await db.command({ ping: 1 });
      mongoStatus.connected = true;
      mongoStatus.error = null;
      mongoStatus.lastSyncAt = new Date(now()).toISOString();

      // Sync existing local records to MongoDB
      await syncToMongo();
      return mongoStatus;
    } catch (err) {
      mongoStatus.connected = false;
      mongoStatus.error = err.message || String(err);
      return mongoStatus;
    }
  }

  async function syncToMongo() {
    if (!db) return false;
    try {
      const tasks = [];
      if (state.giftCatalog.length) {
        const ops = state.giftCatalog.map(item => ({
          updateOne: { filter: { giftId: item.giftId }, update: { $set: item }, upsert: true },
        }));
        tasks.push(db.collection('gift_catalog').bulkWrite(ops, { ordered: false }));
      }
      if (state.workLogs.length) {
        const ops = state.workLogs.slice(0, 200).map(item => ({
          updateOne: { filter: { id: item.id }, update: { $set: item }, upsert: true },
        }));
        tasks.push(db.collection('work_logs').bulkWrite(ops, { ordered: false }));
      }
      if (state.gifts.length) {
        const ops = state.gifts.slice(0, 300).map(g => ({
          updateOne: { filter: { id: g.id }, update: { $set: g }, upsert: true },
        }));
        tasks.push(db.collection('gifts').bulkWrite(ops, { ordered: false }));
      }
      await Promise.all(tasks);
      mongoStatus.lastSyncAt = new Date(now()).toISOString();
      return true;
    } catch (err) {
      mongoStatus.error = err.message;
      return false;
    }
  }

  function recordGift(entry) {
    const t = entry.ts || now();
    const repeat = Math.max(1, Number(entry.repeat) || 1);
    const diamonds = Math.max(1, Number(entry.diamonds) || 1);
    const totalDiamonds = entry.totalDiamonds || diamonds * repeat;
    const catItem = state.giftCatalog.find(
      c => c.giftName.toLowerCase() === String(entry.giftName || '').toLowerCase() || c.giftId === entry.giftId
    );
    const giftVi = entry.giftVi || catItem?.giftVi || entry.giftName || 'Quà tặng';
    const game = entry.game || 'cung-chua-online';
    const reward = entry.reward || (game === 'cuoc-dua-ky-thu'
      ? (catItem?.duaReward || 'Tăng tốc đường đua')
      : (catItem?.chuaReward || 'Dâng lễ chánh điện'));

    const doc = {
      id: entry.id || `gift_${t}_${Math.random().toString(36).slice(2, 8)}`,
      ts: t,
      time: new Date(t).toLocaleString('vi-VN', { hour12: false }),
      game,
      gameLabel: game === 'cuoc-dua-ky-thu' ? 'Cuộc Đua Kỳ Thú 3D' : 'Cúng Chùa Online 3D',
      src: entry.src || 'tiktok',
      uid: entry.uid || 'anon',
      name: entry.name || 'Người xem',
      giftId: entry.giftId || catItem?.giftId || 0,
      giftName: entry.giftName || 'Gift',
      giftVi,
      diamonds,
      repeat,
      totalDiamonds,
      reward,
    };

    state.gifts.unshift(doc);
    if (state.gifts.length > 2000) state.gifts.length = 2000;
    saveLocal();

    if (db) {
      db.collection('gifts').updateOne({ id: doc.id }, { $set: doc }, { upsert: true }).catch(() => {});
    }
    return doc;
  }

  function recordEvent(entry) {
    const t = entry.ts || now();
    const doc = {
      id: entry.id || `ev_${t}_${Math.random().toString(36).slice(2, 8)}`,
      ts: t,
      time: new Date(t).toLocaleString('vi-VN', { hour12: false }),
      game: entry.game || 'cung-chua-online',
      src: entry.src || 'tiktok',
      kind: entry.kind || 'chat',
      uid: entry.uid || 'anon',
      name: entry.name || 'Người xem',
      detail: entry.detail || '',
    };
    state.events.unshift(doc);
    if (state.events.length > 1000) state.events.length = 1000;
    if (db) {
      db.collection('events').insertOne({ ...doc }).catch(() => {});
    }
    return doc;
  }

  function addWorkLog({ category = 'admin', game = 'all', title, detail = '' }) {
    const t = now();
    const doc = {
      id: `work_${t}_${Math.random().toString(36).slice(2, 7)}`,
      ts: t,
      time: new Date(t).toLocaleString('vi-VN', { hour12: false }),
      category,
      game,
      title: String(title || '').trim(),
      detail: String(detail || '').trim(),
    };
    state.workLogs.unshift(doc);
    if (state.workLogs.length > 500) state.workLogs.length = 500;
    saveLocal();
    if (db) {
      db.collection('work_logs').updateOne({ id: doc.id }, { $set: doc }, { upsert: true }).catch(() => {});
    }
    return doc;
  }

  function upsertGiftCatalogItem(item) {
    const giftId = Number(item.giftId) || Date.now() % 100000;
    const giftName = String(item.giftName || '').trim();
    if (!giftName) throw new Error('Thiếu tên quà (giftName)');
    const giftVi = String(item.giftVi || giftName).trim();
    const diamonds = Math.max(1, Number(item.diamonds) || 1);
    const tier = diamonds >= 1000 ? 4 : diamonds >= 100 ? 3 : diamonds >= 10 ? 2 : 1;
    const chuaReward = String(item.chuaReward || 'Dâng lễ chánh điện').trim();
    const duaReward = String(item.duaReward || 'Tăng tốc đường đua').trim();

    const entry = { giftId, giftName, giftVi, diamonds, tier, chuaReward, duaReward };
    const idx = state.giftCatalog.findIndex(
      x => x.giftId === giftId || x.giftName.toLowerCase() === giftName.toLowerCase()
    );
    if (idx !== -1) state.giftCatalog[idx] = entry;
    else state.giftCatalog.push(entry);

    state.giftCatalog.sort((a, b) => a.diamonds - b.diamonds);
    saveLocal();
    if (db) {
      db.collection('gift_catalog').updateOne({ giftId: entry.giftId }, { $set: entry }, { upsert: true }).catch(() => {});
    }
    return entry;
  }

  function deleteGiftCatalogItem(giftId) {
    const idNum = Number(giftId);
    const before = state.giftCatalog.length;
    state.giftCatalog = state.giftCatalog.filter(x => x.giftId !== idNum);
    saveLocal();
    if (db) {
      db.collection('gift_catalog').deleteOne({ giftId: idNum }).catch(() => {});
    }
    return state.giftCatalog.length < before;
  }

  function summary() {
    let realGiftsCount = 0;
    let realDiamonds = 0;
    let mockGiftsCount = 0;
    let mockDiamonds = 0;
    let chuaDiamonds = 0;
    let duaDiamonds = 0;
    const donorMap = new Map(); // uid -> { uid, name, realDiamonds, totalDiamonds, giftCount, lastGift }

    for (const g of state.gifts) {
      const isMock = g.src === 'mock';
      if (isMock) {
        mockGiftsCount += g.repeat;
        mockDiamonds += g.totalDiamonds;
      } else {
        realGiftsCount += g.repeat;
        realDiamonds += g.totalDiamonds;
      }
      if (g.game === 'cuoc-dua-ky-thu') duaDiamonds += g.totalDiamonds;
      else chuaDiamonds += g.totalDiamonds;

      const d = donorMap.get(g.uid) || { uid: g.uid, name: g.name, realDiamonds: 0, totalDiamonds: 0, giftCount: 0, lastGift: g.giftVi };
      d.name = g.name || d.name;
      d.totalDiamonds += g.totalDiamonds;
      if (!isMock) d.realDiamonds += g.totalDiamonds;
      d.giftCount += g.repeat;
      donorMap.set(g.uid, d);
    }

    const topDonors = [...donorMap.values()]
      .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
      .slice(0, 15);

    return {
      mongo: { ...mongoStatus },
      totals: {
        totalGiftRecords: state.gifts.length,
        realGiftsCount,
        realDiamonds,
        mockGiftsCount,
        mockDiamonds,
        chuaDiamonds,
        duaDiamonds,
        workLogsCount: state.workLogs.length,
        catalogCount: state.giftCatalog.length,
      },
      topDonors,
      recentGifts: state.gifts.slice(0, 100),
      recentEvents: state.events.slice(0, 60),
      workLogs: state.workLogs.slice(0, 100),
      giftCatalog: state.giftCatalog,
    };
  }

  function clearGiftHistory() {
    state.gifts.length = 0;
    state.events.length = 0;
    saveLocal();
    if (db) {
      db.collection('gifts').deleteMany({}).catch(() => {});
      db.collection('events').deleteMany({}).catch(() => {});
    }
  }

  return {
    connectMongo,
    syncToMongo,
    recordGift,
    recordEvent,
    addWorkLog,
    upsertGiftCatalogItem,
    deleteGiftCatalogItem,
    clearGiftHistory,
    summary,
    saveLocal,
    close: async () => {
      saveLocal();
      if (client) {
        try { await client.close(); } catch {}
        client = null;
        db = null;
      }
    },
  };
}
