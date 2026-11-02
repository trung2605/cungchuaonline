import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer } from 'ws';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
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

const notFound = res => res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');

// Map a raw request URL to a file inside one of the roots, or null.
function resolveFile(url, roots) {
  let p;
  try {
    p = decodeURIComponent(url.split('?')[0]);
  } catch {
    return null;
  }
  if (p.includes('\0') || p.split(/[\\/]/).includes('..')) return null;
  for (const [prefix, root] of roots) {
    if (!p.startsWith(prefix)) continue;
    let rel = p.slice(prefix.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const full = path.normalize(path.join(root, rel));
    return full.startsWith(root + path.sep) ? full : null;
  }
  return null;
}

export async function startServer({
  port = 8787,
  host = '0.0.0.0',
  webRoot = 'web',
  mounts = {
    '/vendor/three/': 'node_modules/three/',
    '/vendor/three-vrm/': 'node_modules/@pixiv/three-vrm/',
    '/vendor/font/': 'node_modules/@fontsource/be-vietnam-pro/',
    '/vendor/gsap/': 'node_modules/gsap/',
    '/vendor/canvas-confetti/': 'node_modules/canvas-confetti/',
    '/vendor/simplex-noise/': 'node_modules/simplex-noise/',
  },
  getSnapshot,
  onClientMsg,
}) {
  // Longest prefix first so mounts win over '/'.
  const roots = [...Object.entries(mounts), ['/', webRoot]]
    .map(([prefix, dir]) => [prefix, path.resolve(dir)])
    .sort((a, b) => b[0].length - a[0].length);

  const ttsCache = new Map();

  const server = http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return notFound(res);
    if (req.url.startsWith('/tts?')) {
      try {
        const u = new URL(req.url, 'http://localhost');
        const q = (u.searchParams.get('q') || '').trim().slice(0, 200);
        if (!q) return notFound(res);
        let buf = ttsCache.get(q);
        if (!buf) {
          const r = await fetch(`https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(q)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (!r.ok) return notFound(res);
          buf = Buffer.from(await r.arrayBuffer());
          if (ttsCache.size >= 120) ttsCache.delete(ttsCache.keys().next().value);
          ttsCache.set(q, buf);
        }
        res.writeHead(200, {
          'content-type': 'audio/mpeg',
          'content-length': buf.length,
          'cache-control': 'public, max-age=3600',
        });
        return req.method === 'HEAD' ? res.end() : res.end(buf);
      } catch {
        return notFound(res);
      }
    }
    const file = resolveFile(req.url, roots);
    if (!file) return notFound(res);
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) return notFound(res);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        'content-length': st.size,
        'cache-control': 'no-store, no-cache, must-revalidate',
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
    });
  });

  const wss = new WebSocketServer({ server });
  // Sent synchronously on connection, so it always precedes any broadcast.
  wss.on('connection', ws => {
    ws.send(JSON.stringify(getSnapshot()));
    ws.on('message', raw => {
      try {
        const msg = JSON.parse(String(raw));
        onClientMsg?.(msg, ws);
      } catch {}
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return {
    port: server.address().port,
    broadcast(msgs) {
      for (const m of msgs) {
        const s = JSON.stringify(m);
        for (const c of wss.clients) if (c.readyState === 1) c.send(s);
      }
    },
    close() {
      for (const c of wss.clients) c.terminate();
      wss.close();
      return new Promise(r => server.close(() => r()));
    },
  };
}
