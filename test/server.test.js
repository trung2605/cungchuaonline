import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import { startServer } from '../server/server.js';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const actor = { id: 'u1', name: 'Lan', tier: 0, slot: 0, skin: 0, bows: 0, joinedAt: 0, expiresAt: 60000 };
let srv;

before(async () => {
  const webRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'web-'));
  fs.writeFileSync(path.join(webRoot, 'index.html'), '<!doctype html>');
  srv = await startServer({
    port: 18787,
    webRoot,
    mounts: { '/vendor/three/': path.join(repo, 'node_modules/three') },
    getSnapshot: () => ({ t: 'snapshot', actors: [actor], counters: { namo: 0, viewers: 0 }, scene: { theme: 'night', sound: true } }),
  });
});
after(() => srv.close());

// http.get keeps the raw path (fetch would normalize '..' away).
const get = p => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port: srv.port, path: p }, res => { res.resume(); resolve(res); }).on('error', reject);
});
const connect = () => {
  const ws = new WebSocket(`ws://127.0.0.1:${srv.port}`);
  const queue = [];
  const waiters = [];
  ws.on('message', d => {
    const m = JSON.parse(d);
    waiters.length ? waiters.shift()(m) : queue.push(m);
  });
  ws.next = () => (queue.length ? Promise.resolve(queue.shift()) : new Promise(r => waiters.push(r)));
  return ws;
};

test('TC-01.1 new client gets snapshot first', async () => {
  const ws = connect();
  const m = await ws.next();
  assert.equal(m.t, 'snapshot');
  assert.equal(m.actors.length, 1);
  ws.close();
});

test('TC-01.2 broadcast reaches every client', async () => {
  const a = connect();
  const b = connect();
  await Promise.all([a.next(), b.next()]);
  srv.broadcast([{ t: 'banner', text: 'x', ms: 1 }]);
  for (const m of await Promise.all([a.next(), b.next()])) assert.deepEqual(m, { t: 'banner', text: 'x', ms: 1 });
  a.close();
  b.close();
});

test('TC-01.3 path traversal returns 404', async () => {
  for (const p of ['/../package.json', '/%2e%2e/package.json', '/vendor/three/../../package.json', '/vendor/three/%2e%2e%2f%2e%2e%2fpackage.json', '/%00']) {
    assert.equal((await get(p)).statusCode, 404, p);
  }
});

test('TC-01.4 MIME types', async () => {
  const html = await get('/index.html');
  assert.equal(html.statusCode, 200);
  assert.match(html.headers['content-type'], /^text\/html/);
  assert.equal((await get('/')).statusCode, 200);
  const js = await get('/vendor/three/build/three.module.js');
  assert.equal(js.statusCode, 200);
  assert.match(js.headers['content-type'], /^text\/javascript/);
});
