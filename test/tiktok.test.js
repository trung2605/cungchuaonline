import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { backoffMs, startTiktok } from '../server/adapters/tiktok.js';

function harness(map = () => null) {
  const conns = [];
  class FakeConn extends EventEmitter {
    constructor(user, opts) {
      super();
      this.user = user;
      this.opts = opts;
      this.isConnected = true;
      conns.push(this);
    }
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
  }
  const delays = [];
  const pending = [];
  const schedule = (fn, ms) => { delays.push(ms); pending.push(fn); };
  const ingested = [];
  const adapter = startTiktok('chua', e => ingested.push(e), { Connection: FakeConn, map, schedule, rand: () => 0 });
  const last = () => conns.at(-1);
  // Drop the connection, then let the scheduled reconnect run.
  const drop = () => { last().emit('disconnected', { code: 1006 }); pending.shift()?.(); };
  return { conns, delays, ingested, adapter, last, drop };
}

test('TC-01.9 backoff formula', () => {
  assert.deepEqual([0, 1, 5, 10].map(n => backoffMs(n, () => 0)), [2000, 4000, 60000, 60000]);
  assert.equal(backoffMs(0, () => 0.9999), 2999);
});

test('TC-01.10 backoff grows on repeated disconnects', () => {
  const h = harness();
  h.drop(); h.drop(); h.drop();
  assert.deepEqual(h.delays, [2000, 4000, 8000]);
  assert.equal(h.conns.length, 4, 'new Connection per attempt');
});

test('TC-01.11 counter resets after a successful connect', () => {
  const h = harness();
  h.drop();
  h.last().emit('connected', {});
  h.drop();
  assert.deepEqual(h.delays, [2000, 2000]);
});

test('TC-01.12 no reconnect after end', () => {
  const h = harness((name, data) => (name === 'streamEnd' ? { kind: 'end', src: 'tiktok', ts: 1 } : null));
  h.last().emit('streamEnd', { action: 3 });
  h.last().emit('disconnected', { code: 1000 });
  assert.deepEqual(h.delays, []);
  assert.deepEqual(h.ingested, [{ kind: 'end', src: 'tiktok', ts: 1 }]);
});

test('ignores premature streamEnd before connected so offline room keeps retrying', () => {
  const h = harness((name, data) => (name === 'streamEnd' ? { kind: 'end', src: 'tiktok', ts: 1 } : null));
  h.last().isConnected = false;
  h.last().emit('streamEnd', { action: 3 });
  h.drop();
  assert.deepEqual(h.ingested, []);
  assert.deepEqual(h.delays, [2000]);
});

test('maps events and ignores null; stop() cancels reconnect', () => {
  const h = harness((name, data) => (name === 'chat' ? { kind: 'chat', text: data.content } : null));
  h.last().emit('chat', { content: 'Nam mô' });
  h.last().emit('like', { count: 3 });
  assert.deepEqual(h.ingested, [{ kind: 'chat', text: 'Nam mô' }]);
  h.adapter.stop();
  h.last().emit('disconnected', { code: 1006 });
  assert.deepEqual(h.delays, []);
});
