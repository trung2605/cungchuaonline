import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { startMock } from '../server/adapters/mock.js';

test('TC-01.7 rate=5 over 10s gives 50 events', t => {
  mock.timers.enable({ apis: ['setInterval', 'Date'] });
  t.after(() => mock.timers.reset());
  let n = 0;
  const stop = startMock(() => n++, { rate: 5 });
  mock.timers.tick(10000);
  stop();
  mock.timers.tick(10000);
  assert.equal(n, 50);
});

test('TC-01.8 mock events are valid', t => {
  mock.timers.enable({ apis: ['setInterval', 'Date'] });
  t.after(() => mock.timers.reset());
  const events = [];
  const stop = startMock(e => events.push(e), { rate: 500 });
  mock.timers.tick(1000);
  stop();
  assert.equal(events.length, 500);
  for (const e of events) {
    assert.equal(e.src, 'mock');
    assert.equal(typeof e.ts, 'number');
    assert.ok(['chat', 'like', 'gift', 'join'].includes(e.kind), e.kind);
    assert.match(e.uid, /^mock\d+$/);
    if (e.kind === 'gift') {
      assert.ok(e.diamonds > 0);
      assert.ok(e.repeat >= 1);
    }
  }
});
