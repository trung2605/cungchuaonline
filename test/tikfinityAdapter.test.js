import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { startTikfinity } from '../server/adapters/tikfinity.js';

const setup = () => {
  const sockets = [];
  const calls = [];
  const status = [];
  const got = [];
  class FakeWS extends EventEmitter {
    constructor(url) {
      super();
      this.url = url;
      sockets.push(this);
    }
    close() {
      this.emit('close');
    }
  }
  const a = startTikfinity('ws://x', e => got.push(e), {
    WebSocketImpl: FakeWS,
    onStatus: s => status.push(s),
    schedule: (fn, ms) => calls.push({ fn, ms }),
  });
  return { a, sockets, calls, status, got };
};
const msg = o => Buffer.from(JSON.stringify(o));

test('TC-10.3 close -> retry scheduled after 5000 ms', () => {
  const { sockets, calls } = setup();
  sockets[0].emit('error', new Error('ECONNREFUSED'));
  sockets[0].emit('close');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ms, 5000);
  calls[0].fn();
  assert.equal(sockets.length, 2);
});

test('TC-10.4 status: connected, disconnected, connected; retries stay quiet', () => {
  const { sockets, calls, status } = setup();
  sockets[0].emit('open');
  sockets[0].emit('close');
  calls[0].fn();
  sockets[1].emit('close'); // app still off
  calls[1].fn();
  sockets[2].emit('open');
  assert.deepEqual(status, ['connecting', 'connected', 'disconnected', 'connected']);
});

test('messages are mapped and ingested; bad JSON ignored', () => {
  const { sockets, got } = setup();
  sockets[0].emit('message', Buffer.from('not json'));
  sockets[0].emit('message', msg({ event: 'chat', data: { uniqueId: 'u1', nickname: 'Lan', comment: 'hi' } }));
  assert.equal(got.length, 1);
  assert.equal(got[0].src, 'tikfinity');
});

test('BR-10.7 end stops reconnecting', () => {
  const { sockets, calls, status } = setup();
  sockets[0].emit('message', msg({ event: 'streamEnd', data: {} }));
  sockets[0].emit('close');
  assert.equal(calls.length, 0);
  assert.equal(status.at(-1), 'ended');
});

test('stop() closes without retry', () => {
  const { a, calls } = setup();
  a.stop();
  assert.equal(calls.length, 0);
});
