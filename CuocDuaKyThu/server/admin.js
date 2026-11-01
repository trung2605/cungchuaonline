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
      const { sound } = await readJson(req);
      if (sound !== undefined && typeof sound !== 'boolean') throw bad('sound phải là boolean');
      const scene = ctx.setScene({ ...(sound !== undefined && { sound }) });
      broadcast([{ t: 'scene', scene }]);
      return { scene };
    },

    'POST /api/demo': async req => {
      const { on, rate = 3, giftRatio = 0.14 } = await readJson(req);
      if (typeof on !== 'boolean') throw bad('on phải là boolean');
      if (on) demo.start(rate, { giftRatio });
      else demo.stop();
      return { demo: demo.state(), demoConfig: demo.config() };
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
      if (action === 'gift1') {
        ingest({ kind: 'gift', src: 'tiktok', uid, name: rawName, giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: Number(body.repeat) || 3, ts });
      } else if (action === 'gift30') {
        ingest({ kind: 'gift', src: 'tiktok', uid, name: rawName, giftId: 5879, giftName: 'Doughnut', diamonds: 30, repeat: Number(body.repeat) || 1, ts });
      } else if (action === 'gift300') {
        ingest({ kind: 'gift', src: 'tiktok', uid, name: rawName, giftId: 6012, giftName: 'Garland', diamonds: 299, repeat: 1, ts });
      } else if (action === 'gift1000') {
        ingest({ kind: 'gift', src: 'tiktok', uid, name: rawName, giftId: 11046, giftName: 'Galaxy', diamonds: 1000, repeat: 1, ts });
      } else {
        // Test join + greeting: remove existing first if they want to test fresh welcome greeting
        if (action === 'join' && stage.has(uid)) broadcast(stage.remove(uid));
        const text = typeof body.text === 'string' && body.text.trim() ? body.text.trim() : 'Tham gia cuộc đua khám phá thế giới!';
        ingest({ kind: 'chat', src: 'tiktok', uid, name: rawName, text, ts });
      }
      return { ok: true };
    },

    'POST /api/kick': async req => {
      const { uid } = await readJson(req);
      if (typeof uid !== 'string' || !uid) throw bad('uid không hợp lệ');
      broadcast(stage.remove(uid));
      return { ok: true };
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
    close: () => new Promise(r => server.close(() => r())),
  };
}
