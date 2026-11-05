import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { cleanBubble } from '../../server/filter.js';
import { BIOMES } from './raceStage.js';

const PAGE = new URL('../admin/index.html', import.meta.url);
const BODY_MAX = 64 * 1024;

class HttpError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}
const bad = msg => new HttpError(400, msg);

const send = (res, code, body) =>
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }).end(JSON.stringify(body));

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

export async function startRaceAdmin({ port = 8790, host = '127.0.0.1', password, ctx }) {
  const { stage, rules, lists, blocked, status, broadcast, demo, ingest } = ctx;
  let okHosts = new Set();

  // ============================================================================
  // SMART AUTO-DEMO BALANCER ALGORITHM (Tự Động Cân Bằng Người Dùng Thật & Mẫu)
  // Checks active real walkers vs. target threshold; turns ON demo proportionally
  // when real users are too few, and automatically turns OFF demo when enough!
  // ============================================================================
  let autoBalanceTimer = null;
  const autoBalanceState = {
    enabled: Boolean(ctx.initialAutoBalance?.enabled ?? false),
    targetRealUsers: Math.max(1, Math.min(100, Number(ctx.initialAutoBalance?.targetRealUsers) || 8)),
    maxDemoRate: Math.max(0.02, Math.min(10, Number(ctx.initialAutoBalance?.maxDemoRate) || 0.25)),
    giftRatio: Math.max(0, Math.min(0.85, Number(ctx.initialAutoBalance?.giftRatio ?? 0.14))),
    lastAction: 'Chờ kiểm tra',
    lastCheckedAt: null,
  };

  function isRealStageRunner(r) {
    if (!r) return false;
    const id = String(r.id || '');
    if (id.startsWith('bot_') || id.startsWith('seed_') || id.startsWith('ceremony_') || id.startsWith('sample_')) {
      return false;
    }
    return Boolean(r.src && r.src !== 'mock' && r.src !== 'seed');
  }

  function evaluateAutoBalance(applyToDemo = false) {
    const runnersList = stage.snapshot() || [];
    let realActive = 0;
    let demoActive = 0;
    for (const r of runnersList) {
      if (isRealStageRunner(r)) realActive++;
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
      recommendedRate = Math.max(0.04, Math.round(autoBalanceState.maxDemoRate * deficitRatio * 100) / 100);
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
          demo.configure?.({ rate: recommendedRate, giftRatio: autoBalanceState.giftRatio });
          demo.start(recommendedRate, { giftRatio: autoBalanceState.giftRatio });
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
    const msgs = stage.purgeMockRunners?.() ?? [];
    rules.clearLogs?.();
    if (msgs.length) broadcast(msgs);
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
      if (Number.isFinite(g) && g >= 0 && g <= 0.85) autoBalanceState.giftRatio = g;
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
        err ? send(res, 500, { error: 'thiếu CuocDuaKyThu/admin/index.html' })
          : res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html)),

    'GET /api/state': () => ({
      stats: rules.statsState(status),
      recent: rules.recent().map(r => ({ ...r, blocked: blocked.has(r.uid) })),
      runners: stage.snapshot(),
      biomes: BIOMES,
      forcedBiome: stage.forcedBiome,
      scene: ctx.getScene(),
      stayConfig: stage.getStayConfig?.() ?? { stayMinutes: 5 },
      rewardConfig: stage.getRewardConfig?.() ?? { distanceMultiplier: 1, speedMultiplier: 1, boostDurationMultiplier: 1, chestTargetOverride: 0, turboEveryLikes: 500, preset: 'standard' },
      giftChest: stage.getGiftChest?.() ?? { level: 1, currentDiamonds: 0, targetDiamonds: 25, remaining: 25, pct: 0 },
      autoBalance: evaluateAutoBalance(false),
      demo: demo.state(),
      demoConfig: demo.config(),
      config: ctx.getConfig(),
    }),

    'POST /api/tiktok-user': async req => {
      const { user } = await readJson(req);
      const clean = typeof user === 'string' ? user.trim().replace(/^@/, '') : '';
      if (!clean || clean.length > 64 || !/^[a-zA-Z0-9._]+$/.test(clean)) {
        throw bad('tên kênh TikTok không hợp lệ');
      }
      const res = await ctx.setTiktokUser?.(clean);
      return { ok: true, ...(res || { user: clean }) };
    },

    'POST /api/biome': async req => {
      const { biome } = await readJson(req);
      const msgs = stage.setBiome(biome);
      broadcast(msgs);
      return { ok: true, biome: stage.currentBiome(), forcedBiome: stage.forcedBiome };
    },

    'POST /api/scene': async req => {
      const { sound, readComments, stayMinutes, bgmVocal, bgmVocalVolume } = await readJson(req);
      if (sound !== undefined && typeof sound !== 'boolean') throw bad('sound phải là boolean');
      if (readComments !== undefined && typeof readComments !== 'boolean') throw bad('readComments phải là boolean');
      if (bgmVocal !== undefined && typeof bgmVocal !== 'boolean') throw bad('bgmVocal phải là boolean');
      if (bgmVocalVolume !== undefined) {
        const v = Number(bgmVocalVolume);
        if (!Number.isFinite(v) || v < 0 || v > 0.5) throw bad('bgmVocalVolume phải từ 0 đến 0.5');
      }
      if (stayMinutes !== undefined) {
        const mins = Number(stayMinutes);
        if (!Number.isFinite(mins) || mins < 0.1 || mins > 180) throw bad('stayMinutes phải từ 0.1 đến 180 phút');
        stage.setStayMinutes?.(mins);
      }
      const scene = ctx.setScene({
        ...(sound !== undefined && { sound }),
        ...(readComments !== undefined && { readComments }),
        ...(bgmVocal !== undefined && { bgmVocal }),
        ...(bgmVocalVolume !== undefined && { bgmVocalVolume: Number(bgmVocalVolume) }),
      });
      broadcast([{ t: 'scene', scene }]);
      await ctx.saveSceneConfig?.({
        scene,
        ...(stayMinutes !== undefined ? { stayMinutes: Number(stayMinutes) } : {}),
      });
      return { scene, stayConfig: stage.getStayConfig?.() };
    },

    'POST /api/stay-time': async req => {
      const { stayMinutes } = await readJson(req);
      const mins = Number(stayMinutes);
      if (!Number.isFinite(mins) || mins < 0.1 || mins > 180) throw bad('Thời gian ở lại phải từ 0.1 đến 180 phút');
      const stayConfig = stage.setStayMinutes?.(mins);
      await ctx.saveSceneConfig?.({ stayMinutes: mins });
      return { ok: true, stayConfig };
    },

    'POST /api/demo': async req => {
      const { on, rate = 3, giftRatio = 0.14 } = await readJson(req);
      if (typeof on !== 'boolean') throw bad('on phải là boolean');
      stopAutoBalanceLoop();
      autoBalanceState.enabled = false;
      if (on) {
        demo.start(rate, { giftRatio });
      } else {
        demo.stop();
        purgeMockFromStage();
      }
      await ctx.saveSceneConfig?.({ autoBalance: { ...autoBalanceState }, demo: demo.state() });
      return { demo: demo.state(), demoConfig: demo.config(), autoBalance: evaluateAutoBalance(false) };
    },

    'POST /api/auto-balance': async req => {
      const body = await readJson(req);
      const autoBalance = configureAutoBalance(body);
      await ctx.saveSceneConfig?.({ autoBalance: { ...autoBalanceState }, demo: demo.state() });
      return { ok: true, autoBalance, demo: demo.state(), demoConfig: demo.config() };
    },

    'POST /api/banner': async req => {
      const { text } = await readJson(req);
      if (typeof text !== 'string') throw bad('thiếu text');
      const clean = cleanBubble(text, lists, 75);
      if (!clean) throw bad('text rỗng hoặc bị bộ lọc loại');
      broadcast([{ t: 'banner', text: clean, ms: 5000 }]);
      return { ok: true };
    },

    'POST /api/test-event': async req => {
      const body = await readJson(req);
      const action = body.action || 'join';
      const rawName = (typeof body.name === 'string' && body.name.trim()) ? body.name.trim().slice(0, 24) : 'Lê Trí Trung';
      const uid = body.uid || `racer_test_${rawName.toLowerCase().replace(/\s+/g, '_')}`;
      const ts = Date.now();

      if (action === 'turbo') {
        broadcast(stage.triggerGlobalTurbo(10_000));
        return { ok: true };
      }
      const src = body.src || 'mock';
      if (action === 'gift1') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift5') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5487, giftName: 'Finger Heart', diamonds: 5, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift10') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5901, giftName: 'Rosa', diamonds: 10, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift30' || action === 'gift300' || action === 'gift1000') {
        ingest({ kind: 'gift', src, uid, name: rawName, giftId: 5879, giftName: 'Doughnut', diamonds: 30, repeat: Number(body.repeat) || 1, ts });
      } else {
        // Test join + greeting: remove existing first if they want to test fresh welcome greeting
        if (action === 'join' && stage.has(uid)) broadcast(stage.remove(uid));
        const text = typeof body.text === 'string' && body.text.trim() ? body.text.trim() : 'Cùng đi bộ xuyên Việt khám phá 63 tỉnh thành!';
        ingest({ kind: 'chat', src, uid, name: rawName, text, ts });
      }
      return { ok: true };
    },

    'POST /api/kick': async req => {
      const { uid } = await readJson(req);
      if (typeof uid !== 'string' || !uid) throw bad('uid không hợp lệ');
      broadcast(stage.remove(uid));
      return { ok: true };
    },

    'POST /api/reward-config': async req => {
      const body = await readJson(req);
      const rewardConfig = stage.setRewardConfig?.(body) ?? body;
      return { ok: true, rewardConfig, giftChest: stage.getGiftChest?.() };
    },

    'POST /api/chest/unlock': async req => {
      const body = await readJson(req);
      const res = stage.forceUnlockChest?.(body.donorName || 'Admin Lễ Hội') ?? { unlocked: false, msgs: [] };
      if (res.msgs?.length) broadcast(res.msgs);
      return { ok: true, ...res };
    },

    'POST /api/reset-all': async () => {
      demo.stop?.();
      const leaveMsgs = stage.clearAll?.() ?? [];
      rules.resetAll?.();
      broadcast([
        ...leaveMsgs,
        { t: 'counter', key: 'likes', value: 0 },
        { t: 'counter', key: 'viewers', value: 0 },
        { t: 'worldTick', worldDistanceM: 0, biome: stage.currentBiome(), board: [], runners: [] },
      ]);
      return { ok: true };
    },

    'POST /api/fx-emotion': async req => {
      const body = await readJson(req);
      const preset = body.preset || 'custom';
      const msgs = [];

      const presets = {
        rainbow_turbo: {
          turbo: true,
          bubble: 'Bão Cầu Vồng x2.2! Tăng tốc tối đa! ⚡🌈',
          banner: '⚡🌈 SIÊU BÃO CẦU VỒNG KÍCH HOẠT! Toàn bộ tay đua tăng tốc x2.2!',
          fxKind: 'turbo',
          speedMult: 2.4,
        },
        mass_cheer: {
          turbo: false,
          bubble: 'Quyết tâm bứt phá về đích! 🏆🔥',
          banner: '🔥 ĐOÀN ĐUA ĐỒNG LOẠT BỨT TỐC! Ai sẽ vươn lên dẫn đầu?',
          fxKind: 'spark',
          speedMult: 2.0,
        },
        rocket_storm: {
          turbo: false,
          bubble: 'Kích hoạt Tên Lửa Tia Chớp! 🚀⚡',
          banner: '🚀 CƠN MƯA TÊN LỬA TIA CHỚP! Cả đoàn đua phóng vọt qua kỳ quan!',
          fxKind: 'jet',
          speedMult: 3.2,
        },
        cosmic_warp: {
          turbo: true,
          bubble: 'Du hành Ngân Hà Siêu Quang! 🌌✨',
          banner: '🌌 BƯỚC NHẢY RỒNG VÀNG 3D! Tốc độ ánh sáng kích hoạt!',
          fxKind: 'warp',
          speedMult: 4.5,
        },
        lantern_festival: {
          turbo: false,
          bubble: 'Lễ Hội Thiên Đăng Hội An rực sáng! 🏮✨',
          banner: '🏮✨ LỄ HỘI THIÊN ĐĂNG 3D! Hàng chục đèn trời rực sáng trên bầu trời Việt Nam!',
          fxKind: 'lantern',
          speedMult: 2.2,
        },
        fireworks: {
          turbo: true,
          bubble: 'Đại Lễ Pháo Hoa Tự Hào Việt Nam! 🎆🇻🇳',
          banner: '🎆🇻🇳 ĐẠI LỄ PHÁO HOA 3D XUYÊN VIỆT! Pháo hoa rực sáng bầu trời kèm bão tăng tốc!',
          fxKind: 'fireworks',
          speedMult: 3.0,
        },
      };

      const cfg = presets[preset] || {
        turbo: Boolean(body.turbo),
        bubble: body.bubble ? cleanBubble(String(body.bubble), lists, 48) : '',
        banner: body.banner ? cleanBubble(String(body.banner), lists, 75) : '',
        fxKind: body.fxKind || 'spark',
        speedMult: Number(body.speedMult) || 2.0,
      };

      if (cfg.bubble && stage.runners.size === 0) {
        const r1 = stage.joinOrBoost('ceremony_racer_1', 'Tay Đua Tiên Phong', 1, { addDistanceM: 50 });
        const r2 = stage.joinOrBoost('ceremony_racer_2', 'Khám Phá Thế Giới', 1, { addDistanceM: 40 });
        msgs.push(...r1.msgs, ...r2.msgs);
      }

      if (cfg.turbo) {
        msgs.push(...stage.triggerGlobalTurbo(10_000));
      }
      if (cfg.bubble || cfg.fxKind) {
        msgs.push(...(stage.triggerEmotionAll?.(cfg.bubble, {
          boostMs: 8000,
          speedMult: cfg.speedMult,
          fxKind: cfg.fxKind,
        }) ?? []));
      }
      if (cfg.banner && !cfg.turbo) {
        msgs.push({ t: 'banner', text: cfg.banner, ms: 5000 });
      }
      broadcast(msgs);
      return { ok: true, count: msgs.length };
    },
  };

  const server = http.createServer(async (req, res) => {
    if (!okHosts.has(req.headers.host)) return send(res, 403, { error: 'host không hợp lệ' });
    if (!authorized(req.headers.authorization, password)) {
      return res.writeHead(401, { 'www-authenticate': 'Basic realm="cuocduakythu-admin", charset="UTF-8"' }).end();
    }
    const path = req.url.split('?')[0];
    const route = routes[`${req.method} ${path}`];
    if (!route) return send(res, 404, { error: 'không có route' });
    try {
      const out = await route(req, res);
      if (out !== undefined) send(res, 200, out);
    } catch (err) {
      if (!(err instanceof HttpError)) console.error('[race-admin]', err);
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
      if (autoBalanceState.enabled) {
        evaluateAutoBalance(true);
      } else if (!demo.state().on) {
        const hasMock = (stage.snapshot() || []).some(r => !isRealStageRunner(r));
        if (hasMock) purgeMockFromStage();
      }
    },
    syncExternalState: ({ autoBalanceEnabled, demoOn, demoRate, demoGiftRatio } = {}) => {
      if (autoBalanceEnabled !== undefined && Boolean(autoBalanceEnabled) !== autoBalanceState.enabled) {
        autoBalanceState.enabled = Boolean(autoBalanceEnabled);
        if (autoBalanceState.enabled) {
          startAutoBalanceLoop();
        } else {
          stopAutoBalanceLoop();
          if (!demoOn) {
            demo.stop?.();
            purgeMockFromStage();
          }
        }
      }
      if (!autoBalanceState.enabled && demoOn !== undefined) {
        if (demoOn) {
          if (!demo.state().on) {
            demo.start(Number(demoRate) || 0.15, { giftRatio: Number(demoGiftRatio) || 0.15 });
          }
        } else {
          if (demo.state().on) demo.stop?.();
          const hasMock = (stage.snapshot() || []).some(r => !isRealStageRunner(r));
          if (hasMock) purgeMockFromStage();
        }
      }
    },
    getAutoBalance: () => evaluateAutoBalance(false),
    close: () => {
      stopAutoBalanceLoop();
      return new Promise(r => server.close(() => r()));
    },
  };
}
