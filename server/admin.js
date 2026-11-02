import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fold, cleanBubble } from './filter.js';

const PAGE = new URL('../admin/index.html', import.meta.url);
const BODY_MAX = 64 * 1024;
const THEMES = ['day', 'night', 'ram'];
// BR-08 / BR-09.8: "tặng" + one of these is never shown on screen.
const GIFT_BAIT = ['de duoc', 'duoc lay', 'phu ho', 'giai han'];

class HttpError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}
const bad = msg => new HttpError(400, msg);

const send = (res, code, body) =>
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }).end(JSON.stringify(body));

// Pad both sides so timingSafeEqual never throws on length mismatch.
function authorized(header, password) {
  const m = /^Basic (.+)$/.exec(header ?? '');
  if (!m) return false;
  const [user, ...rest] = Buffer.from(m[1], 'base64').toString('utf8').split(':');
  const a = Buffer.from(rest.join(':'));
  const b = Buffer.from(password);
  const len = Math.max(a.length, b.length);
  const eq = crypto.timingSafeEqual(Buffer.concat([a, Buffer.alloc(len - a.length)]), Buffer.concat([b, Buffer.alloc(len - b.length)]));
  return user === 'admin' && a.length === b.length && eq;
}

async function readJson(req) {
  // application/json forces a CORS preflight, so other sites can't post with the browser's cached Basic creds.
  if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) throw new HttpError(415, 'cần content-type application/json');
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > BODY_MAX) throw new HttpError(413, 'body quá 64 KB');
    chunks.push(c);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw bad('body không phải JSON');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw bad('body phải là object');
  return body;
}

const words = (v, opts) => {
  if (!Array.isArray(v) || v.some(w => typeof w !== 'string')) throw bad('danh sách phải là mảng chuỗi');
  return [...new Set(v.map(w => fold(w, opts)).filter(Boolean))];
};

// BR-09.5, BR-09.12. Validates everything before touching `lists`, so a 400 changes nothing.
function nextLists(body, lists) {
  const next = {};
  if (body.badwords !== undefined) next.badwords = words(body.badwords, { keepMarks: true });
  if (body.triggers !== undefined) next.triggers = words(body.triggers);
  if (body.intents !== undefined) {
    if (!body.intents || typeof body.intents !== 'object' || Array.isArray(body.intents)) throw bad('intents phải là object');
    next.intents = {};
    for (const [k, label] of Object.entries(body.intents)) {
      const key = fold(k);
      const l = typeof label === 'string' ? label.trim() : '';
      if (!l || Array.from(l).length > 20) throw bad(`nhãn của "${k}" phải dài 1–20 ký tự`);
      if (key) next.intents[key] = l;
    }
  }
  if (body.couplets !== undefined) {
    if (!Array.isArray(body.couplets)) throw bad('couplets phải là mảng');
    const check = { ...lists, ...next };
    next.couplets = body.couplets.map(pair => {
      if (!Array.isArray(pair) || pair.length !== 2) throw bad('mỗi câu đối phải là cặp [trái, phải]');
      return pair.map(side => {
        const s = typeof side === 'string' ? side.trim() : '';
        if (!s || Array.from(s).length > 24) throw bad(`vế "${s}" phải dài 1–24 ký tự`);
        const c = cleanBubble(s, check, 24);
        if (!c) throw bad(`vế "${s}" bị bộ lọc loại`);
        return c;
      });
    });
  }
  return next;
}

// ctx: { pipeline, stage, lists, blocked, stats, counters, status, broadcast, saveLists, saveBlocked, demo }
export async function startAdmin({ port = 8788, host = '127.0.0.1', password, ctx }) {
  const { pipeline, stage, lists, blocked, stats, counters, status, broadcast, demo } = ctx;
  let okHosts = new Set();

  const FX_PRESETS = {
    bell_halo: {
      fx: [{ t: 'fx', kind: 'bell', power: 10 }, { t: 'fx', kind: 'halo', power: 10 }],
      bubble: 'Nam Mô A Di Đà Phật 🙏',
      banner: '🔔 Đại Hồng Chung Ngân Vang · Hào Quang Chiếu Rọi Toàn Chánh Điện 🙏',
      bows: 3,
    },
    lotus_rain: {
      fx: [{ t: 'fx', kind: 'lotus', power: 10 }],
      bubble: 'Hoan Hỷ Công Đức · Tâm Thanh Tịnh 🪷',
      banner: '🌸 Mưa Hoa Sen Từ Bi Rơi Khắp Chánh Điện · Phước Báu Vô Lượng 🙏',
      bows: 2,
    },
    sacred_lamps: {
      fx: [{ t: 'fx', kind: 'lamp', power: 10 }],
      bubble: 'Cầu Bình An · Trí Tuệ Sáng Suốt 🏮',
      banner: '🏮 Thắp Sáng Đại Hoa Đăng Cầu Quốc Thái Dân An · Gia Đạo Hạnh Phúc ✨',
      bows: 2,
    },
    incense_cloud: {
      fx: [{ t: 'fx', kind: 'smoke', power: 10 }],
      bubble: 'Thành Tâm Dâng Hương Cầu Nguyện 🙏',
      banner: '🕯️ Khói Trầm Hương Quyện Tỏa · Lời Cầu Nguyện Thấu Chín Tầng Mây',
      bows: 2,
    },
    golden_rain: {
      fx: [{ t: 'fx', kind: 'golden_rain', power: 10 }],
      bubble: 'Phước Lộc Viên Mãn · Cát Tường Như Ý ✨',
      banner: '✨ Mưa Cam Lồ Hoàng Kim Rơi Khắp Chánh Điện · Vạn Sự Cát Tường 🙏',
      bows: 2,
    },
    dharma_wheel: {
      fx: [{ t: 'fx', kind: 'dharma_wheel', power: 10 }],
      bubble: 'Pháp Luân Thường Chuyển · Tâm Sáng Như Gương ☸️',
      banner: '☸️ Pháp Luân Thường Chuyển · Hào Quang Liên Hoa Xoay Giữa Chánh Điện 🙏',
      bows: 3,
    },
    lantern_festival: {
      fx: [{ t: 'fx', kind: 'lantern_festival', power: 10 }],
      bubble: 'Vạn Hoa Đăng Cầu Phúc · Quốc Thái Dân An 🏮',
      banner: '🏮 Lễ Hội Vạn Hoa Đăng Bay Lên Trời Đêm · Cầu Nguyện Bình An ✨',
      bows: 2,
    },
    buddha_aura: {
      fx: [{ t: 'fx', kind: 'buddha_aura', power: 10 }],
      bubble: 'Phật Quang Phổ Chiếu · Gia Đạo An Khang 🌟',
      banner: '🌟 Phật Quang Phổ Chiếu · Cột Sáng Thiên Thượng Rọi Khắp Bảo Điện 🙏',
      bows: 3,
    },
    peach_blossom: {
      fx: [{ t: 'fx', kind: 'peach_blossom', power: 10 }],
      bubble: 'Hoa Khai Phú Quý · Xuân Phúc Trường Tồn 🌸',
      banner: '🌸 Mưa Hoa Đào & Hoa Mai Hoàng Kim · Khai Xuân Phú Quý An Khang ✨',
      bows: 2,
    },
    emotion_namo: {
      fx: [{ t: 'fx', kind: 'bell', power: 6 }],
      bubble: 'Nam Mô A Di Đà Phật 🙏',
      banner: '🙏 Toàn Thể Phật Tử Đồng Thanh Niệm Nam Mô A Di Đà Phật!',
      bows: 3,
    },
    emotion_peace: {
      fx: [{ t: 'fx', kind: 'lotus', power: 7 }],
      bubble: 'Cầu Gia Đạo Bình An · Sức Khỏe Dồi Dào 🪷',
      banner: '🪷 Đại Chúng Đồng Tâm Cầu Nguyện Bình An & Sức Khỏe!',
      bows: 2,
    },
    emotion_wealth: {
      fx: [{ t: 'fx', kind: 'golden_rain', power: 8 }],
      bubble: 'Cầu Tài Lộc Hanh Thông · Vạn Sự Như Ý ✨',
      banner: '✨ Đại Chúng Đồng Tâm Cầu Tài Lộc Hanh Thông · Công Thành Danh Toại!',
      bows: 2,
    },
    emotion_joy: {
      fx: [{ t: 'fx', kind: 'peach_blossom', power: 8 }],
      bubble: 'Tâm An Vạn Sự An · Hoan Hỷ Công Đức 🌸',
      banner: '🌸 Hoan Hỷ Công Đức · Tâm An Vạn Sự An!',
      bows: 1,
    },
  };

  const RANDOM_PRESET_KEYS = Object.keys(FX_PRESETS);
  let lastRandomPreset = '';

  function executeFxEmotion(body = {}) {
    let preset = body.preset || 'custom';
    if (preset === 'random') {
      const candidates = RANDOM_PRESET_KEYS.filter(k => k !== lastRandomPreset);
      preset = candidates[Math.floor(Math.random() * candidates.length)] || 'lotus_rain';
      lastRandomPreset = preset;
    }
    const power = Math.max(1, Math.min(10, Number(body.power) || 8));
    const withEmotion = body.withEmotion !== false;
    const msgs = [];

    const cfg = FX_PRESETS[preset] || {
      fx: body.fxKind ? [{ t: 'fx', kind: body.fxKind, power }] : [{ t: 'fx', kind: 'lotus', power }],
      bubble: body.bubble ? cleanBubble(String(body.bubble), lists, 40) : '',
      banner: body.banner ? cleanBubble(String(body.banner), lists, 60) : '',
      bows: Number(body.bows ?? 2),
    };

    if (withEmotion && cfg.bubble && stage.actors.size === 0) {
      msgs.push(...stage.enter('ceremony_1', 'Phật Tử Thiện Tâm', 1, 2, { intent: 'Cầu Bình An' }));
      msgs.push(...stage.enter('ceremony_2', 'Phật Tử An Nhiên', 1, 2, { intent: 'Cầu Tài Lộc' }));
    }

    if (cfg.fx?.length) msgs.push(...cfg.fx);
    if (withEmotion && (cfg.bubble || cfg.bows > 0)) {
      msgs.push(...(stage.triggerEmotionAll?.(cfg.bubble, { bows: cfg.bows, ms: 6000 }) ?? []));
    }
    if (cfg.banner) {
      msgs.push({ t: 'banner', text: cfg.banner, ms: 5000 });
    }
    broadcast(msgs);
    return { ok: true, preset, count: msgs.length };
  }

  // Automatic Random FX Scheduler (configurable interval in seconds from Admin)
  let autoFxTimer = null;
  const autoFxState = {
    on: false,
    intervalSec: Number(ctx.initialAutoFx?.intervalSec) || 30,
    withEmotion: ctx.initialAutoFx?.withEmotion !== false,
    lastPreset: '',
    lastTriggeredAt: null,
  };

  function stopAutoFx() {
    if (autoFxTimer) {
      clearTimeout(autoFxTimer);
      autoFxTimer = null;
    }
    autoFxState.on = false;
  }

  function scheduleNextAutoFx() {
    if (!autoFxState.on) return;
    const baseMs = Math.max(5, Math.min(600, autoFxState.intervalSec)) * 1000;
    // Add slight +/-15% natural jitter so effects feel organic in live stream
    const delayMs = Math.round(baseMs * (0.85 + Math.random() * 0.3));
    autoFxTimer = setTimeout(() => {
      if (!autoFxState.on) return;
      const res = executeFxEmotion({ preset: 'random', withEmotion: autoFxState.withEmotion });
      autoFxState.lastPreset = res.preset;
      autoFxState.lastTriggeredAt = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      scheduleNextAutoFx();
    }, delayMs);
  }

  function configureAutoFx({ on, intervalSec, withEmotion } = {}) {
    if (intervalSec !== undefined) {
      const sec = Number(intervalSec);
      if (!Number.isFinite(sec) || sec < 5 || sec > 600) throw bad('Chu kỳ random hiệu ứng phải từ 5 đến 600 giây');
      autoFxState.intervalSec = Math.round(sec);
    }
    if (withEmotion !== undefined) {
      autoFxState.withEmotion = Boolean(withEmotion);
    }
    if (on !== undefined) {
      stopAutoFx();
      if (on) {
        autoFxState.on = true;
        // Fire one immediately so the admin sees instant feedback, then schedule loop
        const res = executeFxEmotion({ preset: 'random', withEmotion: autoFxState.withEmotion });
        autoFxState.lastPreset = res.preset;
        autoFxState.lastTriggeredAt = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        scheduleNextAutoFx();
      }
    }
    return { ...autoFxState };
  }

  // ============================================================================
  // SMART AUTO-DEMO BALANCER ALGORITHM (Tự Động Cân Bằng Người Dùng Thật & Mẫu)
  // Checks active real users vs. target threshold; turns ON demo proportionally
  // when real users are too few, and automatically turns OFF demo when enough!
  // ============================================================================
  let autoBalanceTimer = null;
  const autoBalanceState = {
    enabled: Boolean(ctx.initialAutoBalance?.enabled ?? false),
    targetRealUsers: Math.max(1, Math.min(100, Number(ctx.initialAutoBalance?.targetRealUsers) || 8)),
    maxDemoRate: Math.max(0.02, Math.min(10, Number(ctx.initialAutoBalance?.maxDemoRate) || 0.20)),
    giftRatio: Math.max(0, Math.min(0.85, Number(ctx.initialAutoBalance?.giftRatio ?? 0.12))),
    prayerRatio: Math.max(0.1, Math.min(0.95, Number(ctx.initialAutoBalance?.prayerRatio ?? 0.70))),
    lastAction: 'Chờ kiểm tra',
    lastCheckedAt: null,
  };

  function isRealStageActor(a) {
    if (!a) return false;
    const id = String(a.id || '');
    if (id.startsWith('bot_') || id.startsWith('seed_') || id.startsWith('ceremony_') || id.startsWith('sample_')) {
      return false;
    }
    return Boolean(a.src && a.src !== 'mock' && a.src !== 'seed');
  }

  function evaluateAutoBalance(applyToDemo = false) {
    const actorsList = stage.snapshot() || [];
    let realActive = 0;
    let demoActive = 0;
    for (const a of actorsList) {
      if (isRealStageActor(a)) realActive++;
      else demoActive++;
    }
    const totalActive = realActive + demoActive;
    const target = Math.max(1, autoBalanceState.targetRealUsers);
    const deficit = Math.max(0, target - realActive);
    const realCoveragePct = Math.min(100, Math.round((realActive / target) * 100));
    const effectiveTotal = realActive + Math.min(deficit, demoActive);
    const balanceIndex = Math.min(100, Math.round((effectiveTotal / target) * 100));

    let recommendedDemoOn = false;
    let recommendedRate = 0;
    let statusCode = 'optimal_real';
    let statusLabel = `Đủ người thật (${realActive}/${target}) — Tự động TẮT chạy mẫu`;

    if (realActive < target) {
      const deficitRatio = deficit / target;
      recommendedDemoOn = true;
      recommendedRate = Math.max(0.03, Math.round(autoBalanceState.maxDemoRate * deficitRatio * 100) / 100);
      statusCode = realActive === 0 ? 'full_assist' : 'partial_assist';
      statusLabel =
        realActive === 0
          ? `Vắng người thật (0/${target}) — Tự động BẬT mẫu (${recommendedRate}/s)`
          : `Thiếu người thật (${realActive}/${target}) — Tự động bù mẫu (${recommendedRate}/s)`;
    }

    if (applyToDemo && autoBalanceState.enabled) {
      autoBalanceState.lastCheckedAt = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      const curDemo = demo.state();
      if (!recommendedDemoOn) {
        if (curDemo.on) {
          demo.stop();
          autoBalanceState.lastAction = `Đã TẮT mẫu vì đủ ${realActive}/${target} người thật`;
        } else {
          autoBalanceState.lastAction = `Giữ TẮT mẫu (${realActive}/${target} người thật)`;
        }
      } else {
        const curRate = Number(curDemo.rate) || 0;
        if (!curDemo.on || Math.abs(curRate - recommendedRate) >= 0.03) {
          if (demo.configure) {
            demo.configure({
              rate: recommendedRate,
              giftRatio: autoBalanceState.giftRatio,
              prayerRatio: autoBalanceState.prayerRatio,
            });
          }
          demo.start(recommendedRate, {
            giftRatio: autoBalanceState.giftRatio,
            prayerRatio: autoBalanceState.prayerRatio,
          });
          autoBalanceState.lastAction = `Đã BẬT mẫu ${recommendedRate}/s (Thiếu ${deficit} người thật)`;
        } else {
          autoBalanceState.lastAction = `Đang bù mẫu ${curRate}/s (${realActive}/${target} người thật)`;
        }
      }
    }

    return {
      enabled: autoBalanceState.enabled,
      targetRealUsers: target,
      maxDemoRate: autoBalanceState.maxDemoRate,
      giftRatio: autoBalanceState.giftRatio,
      prayerRatio: autoBalanceState.prayerRatio,
      realActive,
      demoActive,
      totalActive,
      deficit,
      realCoveragePct,
      balanceIndex,
      recommendedDemoOn,
      recommendedRate,
      statusCode,
      statusLabel,
      lastAction: autoBalanceState.lastAction,
      lastCheckedAt: autoBalanceState.lastCheckedAt,
    };
  }

  function startAutoBalanceLoop() {
    if (autoBalanceTimer) clearInterval(autoBalanceTimer);
    if (!autoBalanceState.enabled) return;
    evaluateAutoBalance(true);
    autoBalanceTimer = setInterval(() => {
      if (autoBalanceState.enabled) evaluateAutoBalance(true);
    }, 3000);
  }

  function stopAutoBalanceLoop() {
    if (autoBalanceTimer) {
      clearInterval(autoBalanceTimer);
      autoBalanceTimer = null;
    }
  }

  function purgeMockFromStage() {
    const leaveMsgs = stage.purgeMockActors?.() ?? [];
    stats.clearLogs?.();
    if (leaveMsgs.length) {
      broadcast([...leaveMsgs, { t: 'demoPurged' }, pipeline.snapshot()]);
    } else {
      broadcast([{ t: 'demoPurged' }]);
    }
  }

  if (autoBalanceState.enabled) {
    startAutoBalanceLoop();
  }

  function configureAutoBalance(body = {}) {
    if (body.targetRealUsers !== undefined) {
      const t = Number(body.targetRealUsers);
      if (!Number.isFinite(t) || t < 1 || t > 150) throw bad('Ngưỡng người thật mục tiêu phải từ 1 đến 150');
      autoBalanceState.targetRealUsers = Math.round(t);
    }
    if (body.maxDemoRate !== undefined) {
      const r = Number(body.maxDemoRate);
      if (!Number.isFinite(r) || r < 0.01 || r > 50) throw bad('Tốc độ mẫu tối đa phải từ 0.01 đến 50');
      autoBalanceState.maxDemoRate = Math.round(r * 100) / 100;
    }
    if (body.giftRatio !== undefined) {
      const g = Number(body.giftRatio);
      if (Number.isFinite(g) && g >= 0 && g <= 0.9) autoBalanceState.giftRatio = g;
    }
    if (body.prayerRatio !== undefined) {
      const p = Number(body.prayerRatio);
      if (Number.isFinite(p) && p >= 0.1 && p <= 0.95) autoBalanceState.prayerRatio = p;
    }
    if (body.enabled !== undefined) {
      autoBalanceState.enabled = Boolean(body.enabled);
      if (autoBalanceState.enabled) {
        startAutoBalanceLoop();
      } else {
        stopAutoBalanceLoop();
        demo.stop?.();
        purgeMockFromStage();
        autoBalanceState.lastAction = 'Đã TẮT Auto-Balance & dọn sạch nhân vật mẫu';
      }
    } else if (autoBalanceState.enabled) {
      evaluateAutoBalance(true);
    }
    return evaluateAutoBalance(false);
  }

  const routes = {
    'GET /': (req, res) =>
      fs.readFile(PAGE, (err, html) =>
        err ? send(res, 500, { error: 'thiếu admin/index.html' })
          : res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html)),

    'GET /api/state': () => ({
      stats: stats.state(status, counters),
      recent: stats.recent().map(r => ({ ...r, blocked: blocked.has(r.uid) })),
      blocked: [...blocked],
      lists,
      scene: pipeline.snapshot().scene,
      stayConfig: stage.getStayConfig?.() ?? { stayMinutes: 5 },
      autoFx: { ...autoFxState },
      autoBalance: evaluateAutoBalance(false),
      demo: demo.state(),
      demoConfig: demo.config?.() ?? { on: demo.state().on, rate: demo.state().rate ?? 3, giftRatio: 0.08, prayerRatio: 0.65 },
      actors: stage.snapshot(),
      pastSessions: ctx.listSessions?.() ?? [],
      config: ctx.getConfig?.() ?? { tiktokUser: process.env.TIKTOK_USER || '' },
    }),

    'POST /api/tiktok-user': async req => {
      const { user } = await readJson(req);
      const clean = typeof user === 'string' ? user.trim().replace(/^@/, '') : '';
      if (!clean || clean.length > 64 || !/^[a-zA-Z0-9._]+$/.test(clean)) {
        throw bad('tên kênh TikTok không hợp lệ (chỉ gồm chữ, số, dấu chấm hoặc gạch dưới)');
      }
      const res = await ctx.setTiktokUser?.(clean);
      return { ok: true, ...(res || { user: clean }) };
    },

    'POST /api/block': async req => {
      const { uid } = await readJson(req);
      if (typeof uid !== 'string' || !uid || uid.length > 128) throw bad('uid không hợp lệ');
      blocked.add(uid);
      await ctx.saveBlocked(blocked);
      broadcast(stage.remove(uid));
      return { ok: true };
    },

    'DELETE /api/block/:uid': async (req, res, uid) => {
      blocked.delete(uid);
      await ctx.saveBlocked(blocked);
      return { ok: true };
    },

    'PUT /api/lists': async req => {
      const next = nextLists(await readJson(req), lists);
      const coupletsChanged = next.couplets && JSON.stringify(next.couplets) !== JSON.stringify(lists.couplets);
      Object.assign(lists, next);
      await ctx.saveLists(lists);
      if (coupletsChanged) broadcast([{ t: 'couplets', pairs: lists.couplets }]);
      return { lists };
    },

    'POST /api/scene': async req => {
      const { theme, sound, readComments, stayMinutes, bgmTrack, bgmVocal, bgmVocalVolume } = await readJson(req);
      if (theme !== undefined && !THEMES.includes(theme)) throw bad(`theme phải là ${THEMES.join('/')}`);
      if (sound !== undefined && typeof sound !== 'boolean') throw bad('sound phải là boolean');
      if (readComments !== undefined && typeof readComments !== 'boolean') throw bad('readComments phải là boolean');
      if (bgmTrack !== undefined && (typeof bgmTrack !== 'string' || !bgmTrack.trim())) throw bad('bgmTrack không hợp lệ');
      if (bgmVocal !== undefined && typeof bgmVocal !== 'boolean') throw bad('bgmVocal phải là boolean');
      if (bgmVocalVolume !== undefined) {
        const v = Number(bgmVocalVolume);
        if (!Number.isFinite(v) || v < 0 || v > 0.5) throw bad('bgmVocalVolume phải từ 0 đến 0.5');
      }
      if (stayMinutes !== undefined) {
        const mins = Number(stayMinutes);
        if (!Number.isFinite(mins) || mins < 0.5 || mins > 180) throw bad('stayMinutes phải từ 0.5 đến 180 phút');
        stage.setStayMinutes?.(mins);
      }
      const msgs = pipeline.setScene({
        ...(theme && { theme }),
        ...(sound !== undefined && { sound }),
        ...(readComments !== undefined && { readComments }),
        ...(bgmTrack !== undefined && { bgmTrack: bgmTrack.trim(), bgmSeq: Date.now() }),
        ...(bgmVocal !== undefined && { bgmVocal }),
        ...(bgmVocalVolume !== undefined && { bgmVocalVolume: Number(bgmVocalVolume) }),
      });
      broadcast(msgs);
      await ctx.saveSceneConfig?.();
      return { scene: msgs[0].scene, stayConfig: stage.getStayConfig?.() };
    },

    'POST /api/stay-time': async req => {
      const { stayMinutes } = await readJson(req);
      const mins = Number(stayMinutes);
      if (!Number.isFinite(mins) || mins < 0.5 || mins > 180) throw bad('Thời gian ở lại phải từ 0.5 đến 180 phút');
      const stayConfig = stage.setStayMinutes?.(mins);
      await ctx.saveSceneConfig?.();
      return { ok: true, stayConfig };
    },

    'POST /api/banner': async req => {
      const { text } = await readJson(req);
      if (typeof text !== 'string') throw bad('thiếu text');
      const f = fold(text);
      if (f.includes('tang') && GIFT_BAIT.some(p => f.includes(p))) throw bad('không được dùng câu "tặng … để được …"');
      const clean = cleanBubble(text, lists, 60);
      if (!clean) throw bad('text rỗng hoặc bị bộ lọc loại (từ cấm, link, số điện thoại, @)');
      broadcast([{ t: 'banner', text: clean, ms: 5000 }]);
      return { ok: true };
    },

    'POST /api/demo': async req => {
      const { on, rate = 0.25, giftRatio, prayerRatio } = await readJson(req);
      if (typeof on !== 'boolean') throw bad('on phải là boolean');
      if (!(Number.isFinite(rate) && rate >= 0.01 && rate <= 50)) throw bad('rate phải từ 0.01 đến 50');
      // Manual demo toggle pauses auto-balance unless explicitly re-enabled
      stopAutoBalanceLoop();
      autoBalanceState.enabled = false;
      if (demo.configure) demo.configure({ rate, giftRatio, prayerRatio });
      if (on) {
        demo.start(rate, { giftRatio, prayerRatio });
      } else {
        demo.stop();
        purgeMockFromStage();
      }
      await ctx.saveSceneConfig?.({ autoBalance: { ...autoBalanceState }, demo: demo.state() });
      return { demo: demo.state(), demoConfig: demo.config?.(), autoBalance: evaluateAutoBalance(false) };
    },

    'POST /api/auto-balance': async req => {
      const body = await readJson(req);
      const autoBalance = configureAutoBalance(body);
      await ctx.saveSceneConfig?.({ autoBalance: { ...autoBalanceState }, demo: demo.state() });
      return { ok: true, autoBalance, demo: demo.state(), demoConfig: demo.config?.() };
    },

    'POST /api/test-event': async req => {
      const body = await readJson(req);
      const action = body.action || 'prayer';
      const rawName = (typeof body.name === 'string' && body.name.trim()) ? body.name.trim().slice(0, 24) : 'Phật Tử Thiện Tâm';
      const uid = `admin_test_${Date.now().toString(36)}`;
      const ts = Date.now();
      if (action === 'bell') {
        broadcast([{ t: 'fx', kind: 'bell', power: 5 }, { t: 'banner', text: '🔔 Đại Hồng Chung Ngân Vang Cầu Quốc Thái Dân An 🙏', ms: 5000 }]);
        return { ok: true };
      }
      if (action === 'lotus') {
        broadcast([{ t: 'fx', kind: 'lotus', power: 10 }, { t: 'banner', text: '🌸 Mưa Hoa Sen Cát Tường Rơi Toàn Chánh Điện 🙏', ms: 5000 }]);
        return { ok: true };
      }
      const ingest = ctx.ingest || (e => broadcast(pipeline.handle(e)));
      const src = body.src || 'mock';
      if (action === 'gift1') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift5') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5487, giftName: 'Finger Heart', diamonds: 5, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift10') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5901, giftName: 'Rosa', diamonds: 10, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift20' || action === 'gift1000') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5658, giftName: 'Perfume', diamonds: 20, repeat: Number(body.repeat) || 1, ts });
      } else {
        const prayerText = typeof body.text === 'string' && body.text.trim() ? body.text.trim() : 'Nam mô A Di Đà Phật cầu bình an tài lộc';
        ingest({ kind: 'chat', src, uid, name: rawName, text: prayerText, ts });
      }
      await ctx.saveHistory?.();
      return { ok: true };
    },

    'POST /api/history/save': async () => {
      const file = await ctx.saveSessionSnapshot?.();
      await ctx.saveHistory?.();
      return { ok: true, file };
    },

    'POST /api/history/clear': async () => {
      stats.clearLogs?.();
      await ctx.saveHistory?.();
      return { ok: true };
    },

    'POST /api/reset-all': async () => {
      demo.stop?.();
      stopAutoFx();
      const leaveMsgs = stage.clearAll?.() ?? [];
      const counterMsgs = counters?.reset?.() ?? [];
      stats.resetAll?.();
      await ctx.saveHistory?.();
      await ctx.saveSceneConfig?.();
      broadcast([...leaveMsgs, ...counterMsgs, pipeline.snapshot()]);
      return { ok: true };
    },

    'POST /api/fx-emotion': async req => {
      const body = await readJson(req);
      return executeFxEmotion(body);
    },

    'POST /api/auto-fx': async req => {
      const body = await readJson(req);
      const autoFx = configureAutoFx(body);
      await ctx.saveSceneConfig?.();
      return { ok: true, autoFx };
    },

    'POST /api/kick': async req => {
      const { uid } = await readJson(req);
      if (typeof uid !== 'string' || !uid) throw bad('uid không hợp lệ');
      broadcast(stage.remove(uid));
      return { ok: true };
    },
  };

  const server = http.createServer(async (req, res) => {
    // Host check blocks DNS rebinding; auth covers every route including the page.
    if (!okHosts.has(req.headers.host)) return send(res, 403, { error: 'host không hợp lệ' });
    if (!authorized(req.headers.authorization, password)) {
      return res.writeHead(401, { 'www-authenticate': 'Basic realm="cungchua-admin", charset="UTF-8"' }).end();
    }
    const path = req.url.split('?')[0];
    const m = /^\/api\/block\/(.+)$/.exec(path);
    let uid;
    try {
      uid = m && decodeURIComponent(m[1]);
    } catch {
      return send(res, 400, { error: 'uid không hợp lệ' });
    }
    const route = routes[`${req.method} ${m ? '/api/block/:uid' : path}`];
    if (!route) return send(res, 404, { error: 'không có route' });
    try {
      const out = await route(req, res, uid);
      if (out !== undefined) send(res, 200, out);
    } catch (err) {
      if (!(err instanceof HttpError)) console.error('[admin]', err);
      send(res, err.code ?? 500, { error: err instanceof HttpError ? err.message : 'lỗi server' });
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const real = server.address().port;
  okHosts = new Set([`127.0.0.1:${real}`, `localhost:${real}`]);

  return {
    port: real,
    stepAutoBalance: () => {
      if (autoBalanceState.enabled) evaluateAutoBalance(true);
    },
    getAutoBalance: () => evaluateAutoBalance(false),
    close: () => {
      stopAutoFx();
      stopAutoBalanceLoop();
      return new Promise(r => server.close(() => r()));
    },
  };
}
