import WebSocket from 'ws';
import { mapTikfinity } from '../mapTikfinity.js';

// Connects to the local TikFinity WS, retries every retryMs (localhost: no backoff, BR-10.4)
// until stop() or a mapped {kind:'end'}. onStatus fires only on state changes, so a closed
// app logs 'disconnected' once instead of every retry.
export function startTikfinity(url, ingest, {
  WebSocketImpl = WebSocket,
  map = mapTikfinity,
  onStatus = () => {},
  schedule = setTimeout,
  retryMs = 5000,
} = {}) {
  let ws = null;
  let timer = null;
  let stopped = false;
  let ended = false;
  let last = null;
  const report = s => s !== last && onStatus((last = s));

  const open = () => {
    timer = null;
    if (stopped || ended) return;
    const s = (ws = new WebSocketImpl(url));
    const live = () => s === ws && !stopped;
    if (last === null) report('connecting');

    s.on('open', () => live() && report('connected'));
    s.on('message', buf => {
      if (!live()) return;
      let e;
      try {
        e = map(JSON.parse(buf));
      } catch {
        return;
      }
      if (!e) return;
      if (e.kind === 'end' && !ended) {
        ended = true;
        report('ended');
      }
      ingest(e);
    });
    // Listener required: an unhandled 'error' would crash the process. 'close' follows it.
    s.on('error', () => {});
    s.on('close', () => {
      if (!live() || ended) return;
      report('disconnected');
      timer = schedule(open, retryMs);
    });
  };

  open();
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      ws?.close();
    },
  };
}
