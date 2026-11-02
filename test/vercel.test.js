import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vercelHandler, { closeUnifiedRuntime } from '../api/index.js';

let server, base;

before(async () => {
  server = http.createServer((req, res) => vercelHandler(req, res));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await closeUnifiedRuntime();
  await new Promise(r => server.close(r));
});

test('TC-VERCEL-01: Unified Vercel handler serves Admin (/), Cúng Chùa 3D (/chua/), Đi Bộ Xuyên Việt 3D (/dua/) and /vendor/*', async () => {
  const rAdmin = await fetch(`${base}/`);
  assert.equal(rAdmin.status, 200);
  const htmlAdmin = await rAdmin.text();
  assert.ok(htmlAdmin.includes('Live TikTok Studio'));

  const rChua = await fetch(`${base}/chua/`);
  assert.equal(rChua.status, 200);
  const htmlChua = await rChua.text();
  assert.ok(htmlChua.includes('Chùa Online'));

  const rDua = await fetch(`${base}/dua/`);
  assert.equal(rDua.status, 200);
  const htmlDua = await rDua.text();
  assert.ok(htmlDua.includes('Hành Trình Đi Bộ Xuyên Việt 3D'));

  const rVendor = await fetch(`${base}/vendor/gsap/index.js`);
  assert.equal(rVendor.status, 200);
});

test('TC-VERCEL-02: Unified Vercel handler serves /api/state, /api/chua/poll, /api/dua/poll and /api/game-action', async () => {
  const stRes = await fetch(`${base}/api/state`);
  assert.equal(stRes.status, 200);
  const st = await stRes.json();
  assert.equal(st.games['cung-chua-online'].online, true);
  assert.equal(st.games['cuoc-dua-ky-thu'].online, true);
  assert.ok(st.games['cung-chua-online'].data.autoBalance);
  assert.ok(st.games['cuoc-dua-ky-thu'].data.autoBalance);

  const pollChua0 = await (await fetch(`${base}/api/chua/poll?since=0`)).json();
  assert.equal(pollChua0.snapshot.t, 'snapshot');
  assert.ok(Array.isArray(pollChua0.snapshot.actors));

  const pollDua0 = await (await fetch(`${base}/api/dua/poll?since=0`)).json();
  assert.equal(pollDua0.snapshot.t, 'snapshot');
  assert.ok(Array.isArray(pollDua0.snapshot.runners));

  const actRes = await fetch(`${base}/api/game-action`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      game: 'all',
      method: 'POST',
      endpoint: '/api/test-event',
      payload: { action: 'gift1', name: 'VercelTester' },
    }),
  });
  assert.equal(actRes.status, 200);

  const pollChua1 = await (await fetch(`${base}/api/chua/poll?since=${pollChua0.seq}`)).json();
  assert.ok(pollChua1.messages.length > 0);
});

test('TC-VERCEL-03: Turning off Auto-Balance or Demo immediately stops demo, purges mock runners/actors, and stays off across ticks', async () => {
  // 1. Enable Auto-Balance on both games -> should start demo
  await fetch(`${base}/api/game-action`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      game: 'all',
      method: 'POST',
      endpoint: '/api/auto-balance',
      payload: { enabled: true },
    }),
  });
  // Spawn a mock test runner
  await fetch(`${base}/api/game-action`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      game: 'cuoc-dua-ky-thu',
      method: 'POST',
      endpoint: '/api/test-event',
      payload: { action: 'join', name: 'MockBot1', src: 'mock' },
    }),
  });

  const stOn = await (await fetch(`${base}/api/state`)).json();
  assert.equal(stOn.games['cuoc-dua-ky-thu'].data.autoBalance.enabled, true);
  assert.equal(stOn.games['cuoc-dua-ky-thu'].data.demo.on, true);
  assert.ok(stOn.games['cuoc-dua-ky-thu'].data.runners.length >= 1);

  // 2. Turn OFF Auto-Balance -> must stop demo AND purge all mock runners immediately
  await fetch(`${base}/api/game-action`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      game: 'all',
      method: 'POST',
      endpoint: '/api/auto-balance',
      payload: { enabled: false },
    }),
  });

  // Wait > 1000ms and poll to trigger stepSimulationsIfNeeded()
  await new Promise(r => setTimeout(r, 1100));
  await fetch(`${base}/api/dua/poll?since=0`);

  const stOff = await (await fetch(`${base}/api/state`)).json();
  assert.equal(stOff.games['cuoc-dua-ky-thu'].data.autoBalance.enabled, false);
  assert.equal(stOff.games['cuoc-dua-ky-thu'].data.demo.on, false);
  assert.equal(stOff.games['cuoc-dua-ky-thu'].data.runners.filter(r => r.src === 'mock').length, 0);
  assert.equal(stOff.games['cung-chua-online'].data.autoBalance.enabled, false);
  assert.equal(stOff.games['cung-chua-online'].data.demo.on, false);
  assert.equal(stOff.games['cung-chua-online'].data.actors.filter(a => a.src === 'mock').length, 0);
});
