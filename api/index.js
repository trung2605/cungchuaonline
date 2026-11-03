import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cúng Chùa Online 3D modules
import { createPipeline } from '../server/pipeline.js';
import { startMock } from '../server/adapters/mock.js';
import { startTiktok } from '../server/adapters/tiktok.js';
import { mapTiktok } from '../server/mapTiktok.js';
import { loadLists, saveLists, saveBlocked } from '../server/lists.js';
import { createDedupe } from '../server/dedupe.js';
import { Stage } from '../server/stage.js';
import { createBowRules } from '../server/bowRules.js';
import { createEffects } from '../server/effects.js';
import { createCounters } from '../server/counters.js';
import { createStats } from '../server/stats.js';
import { startAdmin } from '../server/admin.js';

// Hành Trình Đi Bộ Xuyên Việt 3D modules
import { RaceStage } from '../CuocDuaKyThu/server/raceStage.js';
import { createRaceRules } from '../CuocDuaKyThu/server/raceRules.js';
import { startRaceAdmin } from '../CuocDuaKyThu/server/admin.js';
import { startMockRace } from '../CuocDuaKyThu/server/mockRace.js';

// Admin Tổng Master Database & Controller
import { createDatabase } from '../AdminTong/server/db.js';
import { startMasterAdmin } from '../AdminTong/server/masterAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CHUA_WEB_DIR = path.join(ROOT_DIR, 'web');
const DUA_WEB_DIR = path.join(ROOT_DIR, 'CuocDuaKyThu/web');
const ADMIN_PUBLIC_DIR = path.join(ROOT_DIR, 'AdminTong/public');
const ADMIN_HTML_FILE = path.join(ROOT_DIR, 'AdminTong/index.html');

const VENDOR_MOUNTS = [
  ['/vendor/three/', path.join(ROOT_DIR, 'node_modules/three')],
  ['/vendor/three-vrm/', path.join(ROOT_DIR, 'node_modules/@pixiv/three-vrm')],
  ['/vendor/font/', path.join(ROOT_DIR, 'node_modules/@fontsource/be-vietnam-pro')],
  ['/vendor/gsap/', path.join(ROOT_DIR, 'node_modules/gsap')],
  ['/vendor/canvas-confetti/', path.join(ROOT_DIR, 'node_modules/canvas-confetti')],
  ['/vendor/simplex-noise/', path.join(ROOT_DIR, 'node_modules/simplex-noise')],
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.ktx2': 'image/ktx2',
  '.hdr': 'image/vnd.radiance',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

const ttsCache = new Map();

function splitTtsClauses(text, maxLen = 155) {
  if (text.length <= maxLen) return [text];
  const parts = text.split(/(?<=[,.;!?])\s+/);
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (!cur) cur = p;
    else if ((cur + ' ' + p).length <= maxLen) cur += ' ' + p;
    else {
      out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out.flatMap(seg => {
    if (seg.length <= maxLen) return [seg];
    const words = seg.split(/\s+/);
    const chunks = [];
    let wCur = '';
    for (const w of words) {
      if (!wCur) wCur = w;
      else if ((wCur + ' ' + w).length <= maxLen) wCur += ' ' + w;
      else {
        chunks.push(wCur);
        wCur = w;
      }
    }
    if (wCur) chunks.push(wCur);
    return chunks;
  });
}

async function handleTtsRequest(req, res) {
  try {
    const u = new URL(req.url, 'http://localhost');
    const q = (u.searchParams.get('q') || '').trim().slice(0, 320);
    if (!q) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    let buf = ttsCache.get(q);
    if (!buf) {
      const clauses = splitTtsClauses(q, 155);
      const bufs = await Promise.all(
        clauses.map(async c => {
          const r = await fetch(
            `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(c)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (!r.ok) throw new Error('tts chunk failed');
          return Buffer.from(await r.arrayBuffer());
        })
      );
      buf = Buffer.concat(bufs);
      if (ttsCache.size >= 400) ttsCache.delete(ttsCache.keys().next().value);
      ttsCache.set(q, buf);
    }
    res.writeHead(200, {
      'content-type': 'audio/mpeg',
      'content-length': buf.length,
      'cache-control': 'public, max-age=86400',
    });
    return req.method === 'HEAD' ? res.end() : res.end(buf);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}

function serveStaticFile(req, res, baseDir, relPath, cacheControl = 'public, max-age=300') {
  const cleanRel = (relPath || '').replace(/^[/\\]+/, '');
  const target = cleanRel === '' || cleanRel.endsWith('/') ? path.join(cleanRel, 'index.html') : cleanRel;
  const full = path.normalize(path.join(baseDir, target));
  if (!full.startsWith(baseDir)) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('Forbidden');
    return true;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return false;
  const ext = path.extname(full).toLowerCase();
  const buf = fs.readFileSync(full);
  res.writeHead(200, {
    'content-type': MIME[ext] || 'application/octet-stream',
    'content-length': buf.length,
    'cache-control': ext === '.html' ? 'no-store, no-cache, must-revalidate' : cacheControl,
  });
  if (req.method === 'HEAD') res.end();
  else res.end(buf);
  return true;
}

// ============================================================================
// UNIFIED CLOUD RUNTIME SINGLETON (Boots Cúng Chùa + Đi Bộ Xuyên Việt + Admin Tổng)
// ============================================================================
let runtimePromise = null;

function createEventRingBuffer(maxEvents = 250) {
  let seq = Date.now() * 1000;
  const events = [];
  return {
    pushBatch(msgs) {
      if (!Array.isArray(msgs) || !msgs.length) return seq;
      const now = Date.now();
      for (const msg of msgs) {
        if (!msg || msg.t === 'snapshot') continue;
        seq = Math.max(seq + 1, now * 1000);
        const eid = msg._eid || `${seq}_${Math.random().toString(36).slice(2, 7)}`;
        events.push({ seq, ts: now, msg: { ...msg, _eid: eid } });
      }
      if (events.length > maxEvents) {
        events.splice(0, events.length - maxEvents);
      }
      return seq;
    },
    pollSince(sinceSeq = 0) {
      const s = Number(sinceSeq) || 0;
      if (s <= 0) return { seq, messages: [] };
      const cutoff = Date.now() - 12_000;
      const messages = events.filter(e => e.seq > s && e.ts >= cutoff).map(e => e.msg);
      return { seq, messages };
    },
    currentSeq() {
      return seq;
    },
  };
}

async function initUnifiedRuntime() {
  const password = process.env.ADMIN_PASSWORD?.trim() || 'chuaonline123';
  const authHeader = 'Basic ' + Buffer.from(`admin:${password}`).toString('base64');
  const tmpDir = os.tmpdir();

  // 1. Initialize Master Database (MongoDB Atlas + /tmp JSON fallback)
  const db = createDatabase({
    storeFile: path.join(tmpDir, 'live-tiktok-master-db.json'),
    mongoUri: process.env.MONGODB_URI || '',
    mongoDbName: process.env.MONGODB_DB || 'live_tiktok',
  });
  if (process.env.MONGODB_URI?.trim()) {
    try {
      await db.connectMongo(process.env.MONGODB_URI, process.env.MONGODB_DB || 'live_tiktok');
    } catch {}
  }

  // 2. Initialize Game 1: Cúng Chùa Online 3D Engine
  const chuaEventBuf = createEventRingBuffer(300);
  const lists = loadLists();
  const blockedFile = path.join(ROOT_DIR, 'server/data/blocked.json');
  const blocked = new Set(fs.existsSync(blockedFile) ? JSON.parse(fs.readFileSync(blockedFile, 'utf8')) : []);
  const chuaStage = new Stage({
    max: Number(process.env.MAX_ACTORS || 150),
    stayMinutes: Number(savedRt.chuaStayMinutes || process.env.STAY_MINUTES || 5),
  });
  const chuaCounters = createCounters({ lists, boardSize: 12 });
  const chuaStats = createStats({ lists });
  const chuaPipeline = createPipeline({
    stage: chuaStage,
    lists,
    blocked,
    counters: chuaCounters,
    dedupe: createDedupe(),
    rules: [createBowRules({ stage: chuaStage, lists, stats: chuaStats, allowAllRealChat: true }), createEffects(), chuaCounters, chuaStats],
  });

  const broadcastChua = msgs => {
    chuaEventBuf.pushBatch(msgs);
  };

  const ingestChua = raw => {
    for (const e of Array.isArray(raw) ? raw : [raw]) {
      if (!e) continue;
      const msgs = chuaPipeline.handle(e);
      if (msgs.length) broadcastChua(msgs);
      if (e.kind === 'gift') {
        const diamonds = Number(e.diamonds) || 1;
        const repeat = Number(e.repeat) || 1;
        const total = diamonds * repeat;
        const reward =
          total >= 20
            ? 'Áo tràng Hoàng Kim · Thắp đại hoa đăng, Hào quang & Đại hồng chung'
            : total >= 10
              ? 'Khoác Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa'
              : total >= 2
                ? 'Dâng hoa sen & Đèn hoa đăng · Chuông gia trì & Đọc tên'
                : 'Dâng 3 nén hương trầm · Tiếng khánh & Đọc tên cầu an';
        db.recordGift({
          game: 'cung-chua-online',
          uid: e.uid,
          name: e.name,
          giftId: e.giftId || 0,
          giftName: e.giftName || 'Gift',
          diamonds,
          repeat,
          reward,
          src: e.src || 'tiktok',
        });
      }
    }
  };

  let stopChuaDemo = null;
  let chuaDemoCfg = { rate: null, giftRatio: 0.14, prayerRatio: 0.72 };
  const chuaDemo = {
    configure(opts = {}) {
      if (Number.isFinite(opts.rate) && opts.rate >= 0.01 && opts.rate <= 50) chuaDemoCfg.rate = opts.rate;
      if (Number.isFinite(opts.giftRatio) && opts.giftRatio >= 0 && opts.giftRatio <= 0.9) chuaDemoCfg.giftRatio = opts.giftRatio;
      if (Number.isFinite(opts.prayerRatio) && opts.prayerRatio >= 0.1 && opts.prayerRatio <= 0.95) chuaDemoCfg.prayerRatio = opts.prayerRatio;
    },
    start(r, opts = {}) {
      stopChuaDemo?.();
      chuaDemoCfg = {
        rate: r,
        giftRatio: opts.giftRatio ?? chuaDemoCfg.giftRatio,
        prayerRatio: opts.prayerRatio ?? chuaDemoCfg.prayerRatio,
      };
      stopChuaDemo = startMock(ingestChua, {
        rate: r,
        giftRatio: chuaDemoCfg.giftRatio,
        prayerRatio: chuaDemoCfg.prayerRatio,
        jitter: true,
      });
    },
    stop() {
      stopChuaDemo?.();
      stopChuaDemo = null;
      chuaDemoCfg.rate = null;
    },
    state: () => ({
      on: stopChuaDemo !== null,
      rate: chuaDemoCfg.rate,
      giftRatio: chuaDemoCfg.giftRatio,
      prayerRatio: chuaDemoCfg.prayerRatio,
    }),
    config: () => ({ on: stopChuaDemo !== null, ...chuaDemoCfg }),
  };

  let currentTiktokUser = (process.env.TIKTOK_USER || 'adidaphat20266').trim().replace(/^@/, '');
  const chuaStatus = { tiktok: 'off', tikfinity: 'off', tiktokUser: currentTiktokUser };
  const duaStatus = { tiktok: 'off', tikfinity: 'off', tiktokUser: currentTiktokUser };
  let tiktokAdapter = null;
  let TikTokLiveConnection = null;

  async function connectTiktokChannel(user) {
    const clean = String(user || '').trim().replace(/^@/, '');
    currentTiktokUser = clean;
    chuaStatus.tiktokUser = clean;
    duaStatus.tiktokUser = clean;
    tiktokAdapter?.stop?.();
    tiktokAdapter = null;
    if (!clean) return { user: clean, status: 'off' };
    try {
      if (!TikTokLiveConnection) {
        ({ TikTokLiveConnection } = await import('tiktok-live-connector'));
      }
      tiktokAdapter = startTiktok(
        clean,
        e => {
          ingestChua(e);
          ingestDua(e);
        },
        {
          signApiKey: process.env.EULER_KEY || undefined,
          Connection: TikTokLiveConnection,
          map: mapTiktok,
          onStatus: s => {
            chuaStatus.tiktok = s;
            duaStatus.tiktok = s;
            chuaStats.setSource?.('tiktok', s);
          },
          keepAlive: true,
          staleMs: 40_000,
        }
      );
    } catch {}
    return { user: clean, status: chuaStatus.tiktok || 'connecting' };
  }

  // 3. Initialize Game 2: Hành Trình Đi Bộ Xuyên Việt 3D Engine
  const duaEventBuf = createEventRingBuffer(300);
  const duaStage = new RaceStage({
    max: Number(process.env.RACE_MAX_RUNNERS || 120),
    baseSpeedMps: 1.35,
    stayMinutes: Number(savedRt.duaStayMinutes || process.env.STAY_MINUTES || 5),
  });
  const duaRules = createRaceRules({ stage: duaStage, lists, status: duaStatus });
  const duaDedupe = createDedupe();
  let duaScene = { sound: true, readComments: true, bgmVocal: true, bgmVocalVolume: 0.15 };

  const getDuaSnapshot = () => ({
    t: 'snapshot',
    runners: duaStage.snapshot(),
    biome: duaStage.currentBiome(),
    worldDistanceM: Math.round(duaStage.worldDistanceM),
    board: duaStage.board(12),
    giftChest: duaStage.getGiftChest(),
    scene: duaScene,
    stats: duaRules.statsState(duaStatus),
  });

  const broadcastDua = msgs => {
    duaEventBuf.pushBatch(msgs);
  };

  const ingestDua = raw => {
    for (const e of Array.isArray(raw) ? raw : [raw]) {
      if (!e) continue;
      if (duaDedupe.seen(e)) continue;
      const msgs = duaRules.handle(e);
      if (msgs.length) broadcastDua(msgs);
      if (e.kind === 'gift') {
        const diamonds = Number(e.diamonds) || 1;
        const repeat = Number(e.repeat) || 1;
        const total = diamonds * repeat;
        const reward =
          total >= 20
            ? 'Rồng Vàng 3D · Tốc độ ×4.8 (+1.500m)'
            : total >= 10
              ? 'Xe Cub Phượt · Tốc độ ×2.8 (+350m)'
              : total >= 2
                ? 'Cánh Vàng Hoa Sen · Tốc độ ×2.4 (+220m)'
                : 'Cánh Chim Lạc · Tốc độ ×1.8 (+80m)';
        db.recordGift({
          game: 'cuoc-dua-ky-thu',
          uid: e.uid,
          name: e.name,
          giftId: e.giftId || 0,
          giftName: e.giftName || 'Gift',
          diamonds,
          repeat,
          reward,
          src: e.src || 'tiktok',
        });
      }
    }
  };

  let stopDuaDemo = null;
  let duaDemoCfg = { rate: null, giftRatio: 0.16 };
  const duaDemo = {
    configure(opts = {}) {
      if (Number.isFinite(opts.rate) && opts.rate >= 0.01 && opts.rate <= 50) duaDemoCfg.rate = opts.rate;
      if (Number.isFinite(opts.giftRatio) && opts.giftRatio >= 0 && opts.giftRatio <= 0.85) duaDemoCfg.giftRatio = opts.giftRatio;
    },
    start(r, opts = {}) {
      stopDuaDemo?.();
      duaDemoCfg = { rate: r, giftRatio: opts.giftRatio ?? duaDemoCfg.giftRatio };
      stopDuaDemo = startMockRace(ingestDua, { rate: r, giftRatio: duaDemoCfg.giftRatio, jitter: true });
    },
    stop() {
      stopDuaDemo?.();
      stopDuaDemo = null;
      duaDemoCfg.rate = null;
    },
    state: () => ({ on: stopDuaDemo !== null, rate: duaDemoCfg.rate, giftRatio: duaDemoCfg.giftRatio }),
    config: () => ({ on: stopDuaDemo !== null, ...duaDemoCfg }),
  };

  const savedRt = db.getRuntimeSettings?.() || {
    chuaAutoBalanceEnabled: false,
    chuaDemoOn: false,
    duaAutoBalanceEnabled: false,
    duaDemoOn: false,
  };

  // Connect TikTok LIVE in background if configured on Vercel
  if (currentTiktokUser && process.env.VERCEL === '1') {
    connectTiktokChannel(currentTiktokUser).catch(() => {});
  }

  // 4. Start internal Admin HTTP Loopback Servers on ephemeral ports (127.0.0.1:0)
  const chuaAdmin = await startAdmin({
    port: 0,
    host: '127.0.0.1',
    password,
    ctx: {
      pipeline: chuaPipeline,
      stage: chuaStage,
      lists,
      blocked,
      stats: chuaStats,
      counters: chuaCounters,
      status: chuaStatus,
      ingest: ingestChua,
      broadcast: broadcastChua,
      saveLists: async l => {
        try { await saveLists(l, path.join(tmpDir, 'chua-lists')); } catch {}
      },
      saveBlocked: async b => {
        try { await saveBlocked(b, path.join(tmpDir, 'chua-lists')); } catch {}
      },
      saveSceneConfig: async patch => {
        if (patch?.autoBalance || patch?.demo || patch?.scene || Number.isFinite(patch?.stayMinutes)) {
          await db.updateRuntimeSettings?.({
            ...(patch.autoBalance ? { chuaAutoBalanceEnabled: Boolean(patch.autoBalance.enabled) } : {}),
            ...(patch.demo
              ? {
                  chuaDemoOn: Boolean(patch.demo.on),
                  ...(Number.isFinite(patch.demo.rate) ? { chuaDemoRate: Number(patch.demo.rate) } : {}),
                  ...(Number.isFinite(patch.demo.giftRatio) ? { chuaDemoGiftRatio: Number(patch.demo.giftRatio) } : {}),
                }
              : {}),
            ...(Number.isFinite(patch.stayMinutes) ? { chuaStayMinutes: Number(patch.stayMinutes) } : {}),
            ...(patch.scene
              ? {
                  ...(patch.scene.bgmTrack ? { chuaBgmTrack: String(patch.scene.bgmTrack) } : {}),
                  ...(Number.isFinite(patch.scene.bgmSeq) ? { chuaBgmSeq: Number(patch.scene.bgmSeq) } : {}),
                  ...(patch.scene.bgmVocal !== undefined ? { chuaBgmVocal: Boolean(patch.scene.bgmVocal) } : {}),
                  ...(Number.isFinite(patch.scene.bgmVocalVolume) ? { chuaBgmVocalVolume: Number(patch.scene.bgmVocalVolume) } : {}),
                }
              : {}),
          });
        }
      },
      demo: chuaDemo,
      initialAutoBalance: {
        enabled: Boolean(savedRt.chuaAutoBalanceEnabled),
        targetRealUsers: 8,
        maxDemoRate: 0.20,
        giftRatio: 0.12,
        prayerRatio: 0.70,
      },
      setTiktokUser: user => connectTiktokChannel(user),
    },
  });

  const duaAdmin = await startRaceAdmin({
    port: 0,
    host: '127.0.0.1',
    password,
    ctx: {
      stage: duaStage,
      rules: duaRules,
      lists,
      blocked,
      status: duaStatus,
      demo: duaDemo,
      initialAutoBalance: {
        enabled: Boolean(savedRt.duaAutoBalanceEnabled),
        targetRealUsers: 8,
        maxDemoRate: 0.22,
        giftRatio: 0.16,
      },
      ingest: ingestDua,
      broadcast: broadcastDua,
      saveSceneConfig: async patch => {
        if (patch?.autoBalance || patch?.demo || patch?.scene || Number.isFinite(patch?.stayMinutes)) {
          await db.updateRuntimeSettings?.({
            ...(patch.autoBalance ? { duaAutoBalanceEnabled: Boolean(patch.autoBalance.enabled) } : {}),
            ...(patch.demo
              ? {
                  duaDemoOn: Boolean(patch.demo.on),
                  ...(Number.isFinite(patch.demo.rate) ? { duaDemoRate: Number(patch.demo.rate) } : {}),
                  ...(Number.isFinite(patch.demo.giftRatio) ? { duaDemoGiftRatio: Number(patch.demo.giftRatio) } : {}),
                }
              : {}),
            ...(Number.isFinite(patch.stayMinutes) ? { duaStayMinutes: Number(patch.stayMinutes) } : {}),
            ...(patch.scene
              ? {
                  ...(patch.scene.bgmVocal !== undefined ? { duaBgmVocal: Boolean(patch.scene.bgmVocal) } : {}),
                  ...(Number.isFinite(patch.scene.bgmVocalVolume) ? { duaBgmVocalVolume: Number(patch.scene.bgmVocalVolume) } : {}),
                }
              : {}),
          });
        }
      },
      getScene: () => duaScene,
      setScene: s => (duaScene = { ...duaScene, ...s }),
      getConfig: () => ({
        tiktokUser: currentTiktokUser || '',
        maxActors: Number(process.env.RACE_MAX_RUNNERS || 120),
        tikfinityWs: process.env.TIKFINITY_WS || '',
      }),
      setTiktokUser: user => connectTiktokChannel(user),
    },
  });

  // Periodic background tick (runs while instance is warm)
  let lastTickAt = Date.now();
  function stepSimulationsIfNeeded() {
    const now = Date.now();
    if (now - lastTickAt >= 900) {
      lastTickAt = now;
      const chuaMsgs = chuaPipeline.tick(now);
      if (chuaMsgs.length) broadcastChua(chuaMsgs);
      const duaMsgs = duaStage.tick(now).filter(m => m && m.t !== 'worldTick');
      if (duaMsgs.length) broadcastDua(duaMsgs);
      chuaAdmin.stepAutoBalance?.();
      duaAdmin.stepAutoBalance?.();
    }
  }

  async function syncAndStep() {
    try {
      const rtSettings = await db.pullRuntimeSettingsFromMongo?.();
      if (rtSettings) {
        chuaAdmin.syncExternalState?.({
          autoBalanceEnabled: Boolean(rtSettings.chuaAutoBalanceEnabled),
          demoOn: Boolean(rtSettings.chuaDemoOn),
          demoRate: rtSettings.chuaDemoRate,
          demoGiftRatio: rtSettings.chuaDemoGiftRatio,
        });
        if (
          Number.isFinite(rtSettings.chuaStayMinutes) &&
          Number(rtSettings.chuaStayMinutes) > 0 &&
          Number(rtSettings.chuaStayMinutes) !== Number(chuaStage.getStayConfig?.()?.stayMinutes)
        ) {
          chuaStage.setStayMinutes(Number(rtSettings.chuaStayMinutes));
          const expiredMsgs = chuaStage.tick(Date.now());
          if (expiredMsgs.length) broadcastChua(expiredMsgs);
        }
        const curChuaScene = chuaPipeline.snapshot?.()?.scene || {};
        if (
          (rtSettings.chuaBgmTrack && rtSettings.chuaBgmSeq && rtSettings.chuaBgmSeq !== curChuaScene.bgmSeq) ||
          (rtSettings.chuaBgmVocal !== undefined && Boolean(rtSettings.chuaBgmVocal) !== Boolean(curChuaScene.bgmVocal)) ||
          (Number.isFinite(rtSettings.chuaBgmVocalVolume) && Number(rtSettings.chuaBgmVocalVolume) !== Number(curChuaScene.bgmVocalVolume))
        ) {
          const msgs = chuaPipeline.setScene({
            ...(rtSettings.chuaBgmTrack ? { bgmTrack: rtSettings.chuaBgmTrack } : {}),
            ...(rtSettings.chuaBgmSeq ? { bgmSeq: rtSettings.chuaBgmSeq } : {}),
            ...(rtSettings.chuaBgmVocal !== undefined ? { bgmVocal: Boolean(rtSettings.chuaBgmVocal) } : {}),
            ...(Number.isFinite(rtSettings.chuaBgmVocalVolume) ? { bgmVocalVolume: Number(rtSettings.chuaBgmVocalVolume) } : {}),
          });
          broadcastChua(msgs);
        }
        duaAdmin.syncExternalState?.({
          autoBalanceEnabled: Boolean(rtSettings.duaAutoBalanceEnabled),
          demoOn: Boolean(rtSettings.duaDemoOn),
          demoRate: rtSettings.duaDemoRate,
          demoGiftRatio: rtSettings.duaDemoGiftRatio,
        });
        if (
          Number.isFinite(rtSettings.duaStayMinutes) &&
          Number(rtSettings.duaStayMinutes) > 0 &&
          Number(rtSettings.duaStayMinutes) !== Number(duaStage.getStayConfig?.()?.stayMinutes)
        ) {
          duaStage.setStayMinutes(Number(rtSettings.duaStayMinutes));
        }
        if (
          (rtSettings.duaBgmVocal !== undefined && Boolean(rtSettings.duaBgmVocal) !== Boolean(duaScene.bgmVocal)) ||
          (Number.isFinite(rtSettings.duaBgmVocalVolume) && Number(rtSettings.duaBgmVocalVolume) !== Number(duaScene.bgmVocalVolume))
        ) {
          duaScene = {
            ...duaScene,
            ...(rtSettings.duaBgmVocal !== undefined ? { bgmVocal: Boolean(rtSettings.duaBgmVocal) } : {}),
            ...(Number.isFinite(rtSettings.duaBgmVocalVolume) ? { bgmVocalVolume: Number(rtSettings.duaBgmVocalVolume) } : {}),
          };
          broadcastDua([{ t: 'scene', scene: duaScene }]);
        }
      }
    } catch {}
    stepSimulationsIfNeeded();
  }

  const bgInterval = setInterval(stepSimulationsIfNeeded, 1000);
  bgInterval.unref?.();

  const masterAdmin = await startMasterAdmin({
    port: 0,
    host: '127.0.0.1',
    password,
    db,
    updateEnvVar: (key, val) => {
      process.env[key] = val;
    },
    gameAdmins: {
      'cung-chua-online': `http://127.0.0.1:${chuaAdmin.port}`,
      'cuoc-dua-ky-thu': `http://127.0.0.1:${duaAdmin.port}`,
    },
  });

  return {
    authHeader,
    masterPort: masterAdmin.port,
    chuaPipeline,
    chuaEventBuf,
    duaStage,
    getDuaSnapshot,
    duaEventBuf,
    stepSimulationsIfNeeded,
    syncAndStep,
    async close() {
      chuaDemo.stop();
      duaDemo.stop();
      tiktokAdapter?.stop?.();
      clearInterval(bgInterval);
      await Promise.all([
        masterAdmin.close().catch(() => {}),
        chuaAdmin.close().catch(() => {}),
        duaAdmin.close().catch(() => {}),
        db.close().catch(() => {}),
      ]);
    },
  };
}

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = initUnifiedRuntime();
  }
  return runtimePromise;
}

export async function closeUnifiedRuntime() {
  if (!runtimePromise) return;
  const rt = await runtimePromise;
  runtimePromise = null;
  await rt.close();
}

// ============================================================================
// VERCEL SERVERLESS ENTRYPOINT HANDLER
// ============================================================================
export default async function handler(req, res) {
  const rt = await getRuntime();
  await rt.syncAndStep();

  const rawUrl = req.url || '/';
  const [urlPath, queryString] = rawUrl.split('?');
  const qs = queryString ? `?${queryString}` : '';

  // 1. TTS Audio Stream (/tts, /chua/tts, /dua/tts)
  if (urlPath === '/tts' || urlPath === '/chua/tts' || urlPath === '/dua/tts') {
    return handleTtsRequest(req, res);
  }

  // 2. Real-time Cloud Poll Endpoints for 3D Screens (/api/chua/poll & /api/dua/poll)
  if (req.method === 'GET' && urlPath === '/api/chua/poll') {
    const u = new URL(rawUrl, 'http://localhost');
    const since = Number(u.searchParams.get('since') || 0);
    if (since <= 0) {
      return res
        .writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        .end(JSON.stringify({ seq: rt.chuaEventBuf.currentSeq(), snapshot: rt.chuaPipeline.snapshot(), messages: [] }));
    }
    const delta = rt.chuaEventBuf.pollSince(since);
    return res
      .writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      .end(JSON.stringify(delta));
  }

  if (req.method === 'GET' && urlPath === '/api/dua/poll') {
    const u = new URL(rawUrl, 'http://localhost');
    const since = Number(u.searchParams.get('since') || 0);
    if (since <= 0) {
      return res
        .writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        .end(JSON.stringify({ seq: rt.duaEventBuf.currentSeq(), snapshot: rt.getDuaSnapshot(), messages: [] }));
    }
    const delta = rt.duaEventBuf.pollSince(since);
    // Always append latest worldTick so odometer, biome & runner positions stay smoothly synced
    const tickMsgs = rt.duaStage.tick(Date.now());
    return res
      .writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      .end(JSON.stringify({ seq: delta.seq, messages: [...delta.messages, ...tickMsgs] }));
  }

  // 3. Shared Vendor 3D Libraries (/vendor/*)
  for (const [prefix, dir] of VENDOR_MOUNTS) {
    if (urlPath.startsWith(prefix)) {
      const rel = urlPath.slice(prefix.length);
      if (serveStaticFile(req, res, dir, rel, 'public, max-age=31536000, immutable')) return;
    }
  }

  // 4. Admin Assets (/assets/css/*, /assets/js/*) & 3D Skybox/Model Assets (/assets/*)
  if (urlPath.startsWith('/assets/css/') || urlPath.startsWith('/assets/js/')) {
    const rel = urlPath.slice('/assets/'.length);
    if (serveStaticFile(req, res, ADMIN_PUBLIC_DIR, rel, 'no-store')) return;
  }
  if (urlPath.startsWith('/assets/')) {
    const rel = urlPath.slice('/assets/'.length);
    if (serveStaticFile(req, res, path.join(DUA_WEB_DIR, 'assets'), rel, 'public, max-age=86400')) return;
    if (serveStaticFile(req, res, path.join(CHUA_WEB_DIR, 'assets'), rel, 'public, max-age=86400')) return;
    if (serveStaticFile(req, res, ADMIN_PUBLIC_DIR, rel, 'no-store')) return;
  }

  // 5. Cúng Chùa Online 3D Screen (/chua and /chua/*)
  if (urlPath === '/chua') {
    res.writeHead(308, { location: `/chua/${qs}` }).end();
    return;
  }
  if (urlPath.startsWith('/chua/')) {
    const rel = urlPath.slice('/chua/'.length);
    if (serveStaticFile(req, res, CHUA_WEB_DIR, rel)) return;
  }

  // 6. Hành Trình Đi Bộ Xuyên Việt 3D Screen (/dua and /dua/*)
  if (urlPath === '/dua' || urlPath === '/xuyen-viet') {
    res.writeHead(308, { location: `/dua/${qs}` }).end();
    return;
  }
  if (urlPath.startsWith('/dua/')) {
    const rel = urlPath.slice('/dua/'.length);
    if (serveStaticFile(req, res, DUA_WEB_DIR, rel)) return;
  }

  // 7. Admin Tổng Master UI (/ and /admin)
  if (req.method === 'GET' && (urlPath === '/' || urlPath === '/admin' || urlPath === '/admin/')) {
    const html = fs.readFileSync(ADMIN_HTML_FILE, 'utf8');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html);
    return;
  }

  // 8. Proxy all /api/* requests to Master Admin Server
  if (urlPath.startsWith('/api/')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const bodyBuf = chunks.length ? Buffer.concat(chunks) : undefined;

    const proxyRes = await fetch(`http://127.0.0.1:${rt.masterPort}${rawUrl}`, {
      method: req.method,
      headers: {
        host: `127.0.0.1:${rt.masterPort}`,
        authorization: rt.authHeader,
        ...(req.headers['content-type'] ? { 'content-type': req.headers['content-type'] } : {}),
      },
      body: bodyBuf && req.method !== 'GET' && req.method !== 'HEAD' ? bodyBuf : undefined,
    });

    const respText = await proxyRes.text();
    res.writeHead(proxyRes.status, {
      'content-type': proxyRes.headers.get('content-type') || 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    }).end(respText);
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
}
