import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { createTrendEngine } from '../../server/trendEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGE = new URL('../index.html', import.meta.url);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const ROOT_DIR = path.resolve(__dirname, '../..');
const TRENDS_WEB_DIR = path.resolve(ROOT_DIR, 'web/trends');
const VENDOR_MOUNTS = [
  ['/vendor/three/', path.resolve(ROOT_DIR, 'node_modules/three')],
  ['/vendor/three-vrm/', path.resolve(ROOT_DIR, 'node_modules/@pixiv/three-vrm')],
  ['/vendor/gsap/', path.resolve(ROOT_DIR, 'node_modules/gsap')],
  ['/vendor/canvas-confetti/', path.resolve(ROOT_DIR, 'node_modules/canvas-confetti')],
  ['/vendor/simplex-noise/', path.resolve(ROOT_DIR, 'node_modules/simplex-noise')],
  ['/vendor/font/', path.resolve(ROOT_DIR, 'node_modules/@fontsource/be-vietnam-pro')],
];
const BODY_MAX = 128 * 1024;

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
    if (size > BODY_MAX) throw new HttpError(413, 'body quá lớn');
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

export async function startMasterAdmin({
  port = 8791,
  host = '127.0.0.1',
  password,
  db,
  updateEnvVar,
  gameAdmins = {
    'cung-chua-online': 'http://127.0.0.1:8788',
    'cuoc-dua-ky-thu': 'http://127.0.0.1:8790',
  },
}) {
  let okHosts = new Set();
  const authHeader = 'Basic ' + Buffer.from(`admin:${password}`).toString('base64');
  const trendEngine = createTrendEngine();

  async function callSubAdmin(gameKey, method, path, body) {
    const base = gameAdmins[gameKey];
    if (!base) throw bad(`Không tìm thấy game: ${gameKey}`);
    const r = await fetch(`${base}${path}`, {
      method,
      headers: {
        authorization: authHeader,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new HttpError(r.status, data.error || r.statusText);
    return data;
  }

  async function fetchGamesLiveState() {
    const out = {};
    await Promise.all(
      Object.entries(gameAdmins).map(async ([key, base]) => {
        try {
          const r = await fetch(`${base}/api/state`, {
            headers: { authorization: authHeader },
            signal: AbortSignal.timeout(1500),
          });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          out[key] = { online: true, data };
        } catch (err) {
          out[key] = { online: false, error: err.message };
        }
      })
    );
    return out;
  }

  const routes = {
    'GET /': (req, res) =>
      fs.readFile(PAGE, (err, html) =>
        err ? send(res, 500, { error: 'thiếu AdminTong/index.html' })
          : res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html)),

    'GET /api/state': async () => {
      const games = await fetchGamesLiveState();
      return {
        games,
        db: db.summary(),
        trends: trendEngine.getSnapshot(),
        config: {
          tiktokUser: process.env.TIKTOK_USER || '',
          mongoDbName: process.env.MONGODB_DB || 'live_tiktok',
        },
      };
    },

    // Internal/External ingest endpoint for sub-games to push gifts & events into Master DB
    'POST /api/ingest': async req => {
      const body = await readJson(req);
      if (body.kind === 'gift') {
        const doc = db.recordGift(body);
        trendEngine.interact({
          nickname: body.nickname || body.userId || 'Khách TikTok',
          text: body.text || body.giftName || '',
          type: 'gift',
          giftName: body.giftName || 'Hoa Hồng',
          diamondCount: Number(body.diamonds ?? body.diamondCount ?? 1),
        });
        return { ok: true, gift: doc };
      }
      const doc = db.recordEvent(body);
      if (body.text || body.type === 'comment') {
        trendEngine.interact({
          nickname: body.nickname || body.userId || 'Khách TikTok',
          text: body.text || '',
          type: 'comment',
          diamondCount: 0,
        });
      }
      return { ok: true, event: doc };
    },

    // 10 Interactive 3D Websites & Deterministic Comment Algorithm Endpoints
    'GET /api/trends/state': async req => {
      const u = new URL(req.url, 'http://localhost');
      const project = u.searchParams.get('project') || 'gieo-que';
      return trendEngine.getSnapshot(project);
    },

    'GET /api/trends/poll': async req => {
      const u = new URL(req.url, 'http://localhost');
      const since = Number(u.searchParams.get('since') || 0);
      const project = u.searchParams.get('project') || 'gieo-que';
      return trendEngine.pollSince(since, project);
    },

    'POST /api/trends/interact': async req => {
      const body = await readJson(req);
      const out = trendEngine.interact(body);
      if (out.event?.isMicroGift) {
        db.addWorkLog({
          category: 'trends_3d',
          game: out.event.projectId,
          title: `[10 Web 3D Trend] ${out.event.nickname} tương tác + tặng ${out.event.giftName || 'Hoa Hồng'} (${out.event.diamondCount}💎)`,
          detail: `${out.event.formatLabel}: "${out.event.rawText}" -> ${out.event.result?.badge}`,
        });
      }
      return out;
    },

    'POST /api/trends/custom-data': async req => {
      const body = await readJson(req);
      if (!body.projectId) throw bad('Thiếu projectId');
      const out = trendEngine.setCustomData(body.projectId, body.patch || {});
      db.addWorkLog({
        category: 'trends_3d',
        game: body.projectId,
        title: `Cập nhật kho dữ liệu & công thức thuật toán cho Web 3D #${body.projectId}`,
        detail: JSON.stringify(body.patch || {}).slice(0, 180),
      });
      return out;
    },

    'POST /api/trends/reset': async () => {
      const out = trendEngine.resetAll();
      db.addWorkLog({
        category: 'trends_3d',
        game: 'all',
        title: 'Làm mới bộ đếm & bảng xếp hạng của 10 Website 3D Trend',
        detail: '',
      });
      return out;
    },

    // Switch TikTok account across ALL games simultaneously
    'POST /api/tiktok-user': async req => {
      const { user } = await readJson(req);
      const clean = typeof user === 'string' ? user.trim().replace(/^@/, '') : '';
      if (!clean || clean.length > 64 || !/^[a-zA-Z0-9._]+$/.test(clean)) {
        throw bad('Tên kênh TikTok không hợp lệ (chỉ gồm chữ, số, dấu chấm hoặc gạch dưới)');
      }
      updateEnvVar?.('TIKTOK_USER', clean);
      const results = {};
      await Promise.all(
        Object.keys(gameAdmins).map(async k => {
          try {
            results[k] = await callSubAdmin(k, 'POST', '/api/tiktok-user', { user: clean });
          } catch (err) {
            results[k] = { ok: false, error: err.message };
          }
        })
      );
      db.addWorkLog({
        category: 'tiktok',
        game: 'all',
        title: `Đổi tài khoản TikTok LIVE toàn hệ thống sang @${clean}`,
        detail: `Cập nhật .env và đồng bộ sang Cúng Chùa Online & Cuộc Đua Kỳ Thú`,
      });
      return { ok: true, user: clean, results };
    },

    // Configure & connect MongoDB URI at runtime
    'POST /api/mongodb': async req => {
      const { uri, dbName = 'live_tiktok' } = await readJson(req);
      const inputUri = typeof uri === 'string' ? uri.trim() : '';
      const cleanUri = inputUri || (process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '');
      const cleanDb = typeof dbName === 'string' && dbName.trim() ? dbName.trim() : 'live_tiktok';
      if (inputUri) updateEnvVar?.('MONGODB_URI', cleanUri);
      updateEnvVar?.('MONGODB_DB', cleanDb);
      const status = await db.connectMongo(cleanUri, cleanDb);
      db.addWorkLog({
        category: 'database',
        game: 'all',
        title: cleanUri ? `Cập nhật kết nối MongoDB (${cleanDb})` : 'Ngắt kết nối MongoDB (chuyển về lưu trữ JSON cục bộ)',
        detail: status.connected
          ? `Đã kết nối MongoDB thành công và đồng bộ toàn bộ dữ liệu lịch sử.`
          : (status.error ? `Lỗi kết nối: ${status.error}` : 'Đang sử dụng file logs/master-db.json'),
      });
      return { ok: true, mongo: status };
    },

    // Trigger remote action on one or all games (demo, test-event, banner, biome, scene, lists, block, kick)
    'POST /api/game-action': async req => {
      const { game = 'all', method = 'POST', endpoint = '/api/test-event', payload } = await readJson(req);
      const targets = game === 'all' ? Object.keys(gameAdmins) : [game];
      const httpMethod = ['POST', 'PUT', 'DELETE', 'GET'].includes(String(method).toUpperCase())
        ? String(method).toUpperCase()
        : 'POST';
      const results = {};
      await Promise.all(
        targets.map(async k => {
          try {
            results[k] = await callSubAdmin(k, httpMethod, endpoint, httpMethod === 'DELETE' ? undefined : (payload ?? {}));
          } catch (err) {
            results[k] = { ok: false, error: err.message };
          }
        })
      );
      if (endpoint === '/api/stay-time' && Number.isFinite(Number(payload?.stayMinutes))) {
        const mins = Math.max(0.1, Math.min(180, Number(payload.stayMinutes)));
        const rtPatch = {};
        if (targets.includes('cung-chua-online')) rtPatch.chuaStayMinutes = mins;
        if (targets.includes('cuoc-dua-ky-thu')) rtPatch.duaStayMinutes = mins;
        if (Object.keys(rtPatch).length) await db.updateRuntimeSettings?.(rtPatch);
      }
      db.addWorkLog({
        category: 'control',
        game,
        title: `Điều khiển trò chơi (${game}) -> ${httpMethod} ${endpoint}`,
        detail: payload ? JSON.stringify(payload).slice(0, 180) : '',
      });
      return { ok: true, results };
    },

    // Trigger live FX & Emotions across one or all games
    'POST /api/fx-emotion': async req => {
      const body = await readJson(req);
      const game = body.game || 'all';
      const targets = game === 'all' ? Object.keys(gameAdmins) : [game];
      const results = {};
      await Promise.all(
        targets.map(async k => {
          try {
            results[k] = await callSubAdmin(k, 'POST', '/api/fx-emotion', body);
          } catch (err) {
            results[k] = { ok: false, error: err.message };
          }
        })
      );
      db.addWorkLog({
        category: 'fx_emotion',
        game,
        title: `Kích hoạt Hiệu ứng & Emotion Livestream (${body.preset || 'custom'})`,
        detail: `Mục tiêu: ${game} · Bong bóng: ${body.bubble || '(mặc định)'}`,
      });
      return { ok: true, results };
    },

    // Clean & reset all data to 0 across MongoDB, local files, and all games
    'POST /api/system/reset-all': async () => {
      const results = {};
      await Promise.all(
        Object.keys(gameAdmins).map(async k => {
          try {
            results[k] = await callSubAdmin(k, 'POST', '/api/reset-all', {});
          } catch (err) {
            results[k] = { ok: false, error: err.message };
          }
        })
      );
      await db.resetAllData?.();
      trendEngine.resetAll();
      db.addWorkLog({
        category: 'database',
        game: 'all',
        title: 'Làm sạch toàn bộ dữ liệu hệ thống & MongoDB về 0 (Clean Database)',
        detail: 'Sẵn sàng ghi nhận dữ liệu mới từ phiên phát sóng trực tiếp (LIVE).',
      });
      return { ok: true, results, db: db.summary() };
    },

    // Upsert an item in the Global Gift Catalog
    'POST /api/gift-catalog': async req => {
      const body = await readJson(req);
      const item = db.upsertGiftCatalogItem(body);
      db.addWorkLog({
        category: 'gift_catalog',
        game: 'all',
        title: `Cập nhật cấu hình quà TikTok: ${item.giftVi} (${item.giftName} - ${item.diamonds}💎)`,
        detail: `Chùa: ${item.chuaReward} | Đua: ${item.duaReward}`,
      });
      return { ok: true, item, giftCatalog: db.summary().giftCatalog };
    },

    'DELETE /api/gift-catalog/:id': async (req, res, id) => {
      const removed = db.deleteGiftCatalogItem(id);
      if (removed) {
        db.addWorkLog({
          category: 'gift_catalog',
          game: 'all',
          title: `Xóa quà tặng ID #${id} khỏi danh mục`,
          detail: '',
        });
      }
      return { ok: true, removed, giftCatalog: db.summary().giftCatalog };
    },

    // Add a manual work/milestone log entry
    'POST /api/work-log': async req => {
      const { title, detail = '', category = 'note', game = 'all' } = await readJson(req);
      if (!title || typeof title !== 'string' || !title.trim()) throw bad('Thiếu tiêu đề công việc (title)');
      const entry = db.addWorkLog({ category, game, title, detail });
      return { ok: true, entry };
    },

    'POST /api/gifts/clear': async () => {
      await db.resetAllData?.();
      db.addWorkLog({
        category: 'admin',
        game: 'all',
        title: 'Xóa lịch sử nhật ký quà tặng tạm thời',
        detail: 'Làm mới danh sách quà tặng trong phiên',
      });
      return { ok: true };
    },
  };

  const CHUA_ASSETS_DIR = path.resolve(__dirname, '../../web/assets');
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
  };

  const server = http.createServer(async (req, res) => {
    if (!okHosts.has(req.headers.host)) return send(res, 403, { error: 'host không hợp lệ' });
    const urlPath = req.url.split('?')[0];
    const isPublicTrendRoute =
      urlPath === '/trends' ||
      urlPath.startsWith('/trends/') ||
      urlPath.startsWith('/vendor/') ||
      urlPath.startsWith('/api/trends/');

    if (!isPublicTrendRoute && !authorized(req.headers.authorization, password)) {
      return res.writeHead(401, { 'www-authenticate': 'Basic realm="live-tiktok-master-admin", charset="UTF-8"' }).end();
    }

    if (req.method === 'GET' && urlPath.startsWith('/vendor/')) {
      for (const [prefix, dir] of VENDOR_MOUNTS) {
        if (urlPath.startsWith(prefix)) {
          const rel = urlPath.slice(prefix.length);
          const safeTarget = path.resolve(dir, rel);
          if (safeTarget.startsWith(dir) && fs.existsSync(safeTarget) && fs.statSync(safeTarget).isFile()) {
            const ext = path.extname(safeTarget).toLowerCase();
            return fs.readFile(safeTarget, (err, buf) => {
              if (err) return send(res, 404, { error: 'not found' });
              res.writeHead(200, {
                'content-type': MIME[ext] || 'application/octet-stream',
                'cache-control': 'public, max-age=31536000, immutable',
              }).end(buf);
            });
          }
        }
      }
      return send(res, 404, { error: 'not found' });
    }

    if (req.method === 'GET' && (urlPath === '/trends' || urlPath.startsWith('/trends/'))) {
      const rel = urlPath.replace(/^\/trends\/?/, '');
      if (rel === 'trends.css' || rel === 'trendsApp.js') {
        const assetFile = path.resolve(TRENDS_WEB_DIR, rel);
        if (assetFile.startsWith(TRENDS_WEB_DIR) && fs.existsSync(assetFile)) {
          const ext = path.extname(assetFile).toLowerCase();
          return fs.readFile(assetFile, (err, buf) => {
            if (err) return send(res, 404, { error: 'not found' });
            res.writeHead(200, {
              'content-type': MIME[ext] || 'application/octet-stream',
              'cache-control': 'no-store',
            }).end(buf);
          });
        }
      }
      const indexHtml = path.resolve(TRENDS_WEB_DIR, 'index.html');
      return fs.readFile(indexHtml, (err, buf) => {
        if (err) return send(res, 500, { error: 'thiếu web/trends/index.html' });
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(buf);
      });
    }

    if (req.method === 'GET' && urlPath.startsWith('/assets/')) {
      const rel = urlPath.slice('/assets/'.length);
      const safePublic = path.resolve(PUBLIC_DIR, rel);
      const safeChua = path.resolve(CHUA_ASSETS_DIR, rel);
      const targetFile =
        safePublic.startsWith(PUBLIC_DIR) && fs.existsSync(safePublic)
          ? safePublic
          : safeChua.startsWith(CHUA_ASSETS_DIR) && fs.existsSync(safeChua)
            ? safeChua
            : null;
      if (!targetFile) return send(res, 404, { error: 'not found' });
      return fs.readFile(targetFile, (err, buf) => {
        if (err) return send(res, 404, { error: 'not found' });
        const ext = path.extname(targetFile).toLowerCase();
        res.writeHead(200, {
          'content-type': MIME[ext] || 'application/octet-stream',
          'cache-control': ext === '.mp3' || ext === '.wav' ? 'public, max-age=86400' : 'no-store',
        }).end(buf);
      });
    }

    const m = /^\/api\/gift-catalog\/(\d+)$/.exec(urlPath);
    const route = routes[`${req.method} ${m ? '/api/gift-catalog/:id' : urlPath}`];
    if (!route) return send(res, 404, { error: 'không có route' });
    try {
      const out = await route(req, res, m?.[1]);
      if (out !== undefined) send(res, 200, out);
    } catch (err) {
      if (!(err instanceof HttpError)) console.error('[master-admin]', err);
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
