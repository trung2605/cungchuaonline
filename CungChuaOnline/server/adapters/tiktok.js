// Webcast event names in tiktok-live-connector@2.5.0 (see FR-02 plan, "Ghi chú version").
const EVENTS = ['chat', 'like', 'gift', 'member', 'roomUser', 'streamEnd'];

export const backoffMs = (n, rand = Math.random) => Math.min(60000, 2000 * 2 ** n) + Math.floor(rand() * 1000);

// Connects to `user`'s LIVE, maps each raw event via map(name, data) -> NormEvent | null,
// reconnects with backoff until stop() or a mapped {kind:'end'}.
export function startTiktok(user, ingest, {
  signApiKey,
  Connection,
  map,
  onStatus = () => {},
  schedule = setTimeout,
  rand = Math.random,
  keepAlive = false,
  staleMs = 0,
}) {
  let n = 0;
  let conn = null;
  let timer = null;
  let staleTimer = null;
  let stopped = false;
  let ended = false;
  const comboTimers = new Map();

  const clearStale = () => {
    if (staleTimer) {
      clearTimeout(staleTimer);
      staleTimer = null;
    }
  };

  const armStaleWatchdog = c => {
    if (!staleMs || stopped) return;
    clearStale();
    staleTimer = setTimeout(() => {
      if (c !== conn || stopped) return;
      onStatus('reconnecting (refreshing roomId)');
      Promise.resolve().then(() => c.disconnect()).catch(() => {});
      retry();
    }, staleMs);
  };

  const retry = () => {
    if (stopped || ended || timer) return;
    clearStale();
    timer = schedule(() => {
      timer = null;
      open();
    }, backoffMs(n++, rand));
  };

  const open = () => {
    if (stopped || ended) return;
    // A fresh instance per attempt: the library doesn't promise connect() works twice.
    // Disable fetchRoomInfoOnConnect & enableExtendedGiftInfo so free-tier Euler signing works without a Business plan.
    const c = (conn = new Connection(user, {
      signApiKey,
      enableExtendedGiftInfo: false,
      fetchRoomInfoOnConnect: false,
    }));
    const live = () => c === conn && !stopped;

    for (const name of EVENTS) {
      c.on(name, data => {
        if (!live()) return;
        // If streamEnd fires before WebSocket handshake completes (e.g. cached stale room end),
        // ignore it so retry() keeps polling until the streamer goes live.
        if (name === 'streamEnd' && !c.isConnected) {
          if (keepAlive) {
            Promise.resolve().then(() => c.disconnect()).catch(() => {});
            retry();
          }
          return;
        }
        if (name !== 'streamEnd') armStaleWatchdog(c);

        // Safety net for combo gifts (e.g., Quick-Send Rose x1 on TikTok mobile where TikTok
        // may emit repeatCount=1, repeatEnd=0 without a trailing repeatEnd=1 packet).
        if (name === 'gift' && data) {
          const uid = data.user?.displayId || data.user?.uniqueId || data.user?.id || '';
          const gKey = `${uid}:${data.giftId || data.gift?.id || 0}:${data.groupId || ''}`;
          const prev = comboTimers.get(gKey);
          if (prev) {
            clearTimeout(prev);
            comboTimers.delete(gKey);
          }
          const mapped = map(name, data);
          if (!mapped && keepAlive) {
            const tId = setTimeout(() => {
              comboTimers.delete(gKey);
              if (!live()) return;
              const fallbackEvt = map('gift', { ...data, repeatEnd: 1 });
              if (fallbackEvt) ingest(fallbackEvt);
            }, 3200);
            comboTimers.set(gKey, tId);
            return;
          }
          if (mapped) ingest(mapped);
          return;
        }

        const e = map(name, data);
        if (!e) return;
        if (e.kind === 'end') {
          if (keepAlive) {
            onStatus('ended (waiting for next live)');
            ingest(e);
            Promise.resolve().then(() => c.disconnect()).catch(() => {});
            retry();
            return;
          }
          if (!ended) {
            ended = true;
            onStatus('ended');
          }
        }
        ingest(e);
      });
    }
    c.on('connected', () => {
      if (!live()) return;
      n = 0;
      onStatus('connected');
      armStaleWatchdog(c);
    });
    c.on('disconnected', info => {
      if (!live()) return;
      onStatus('disconnected', info);
      retry();
    });
    // Listener required: an unhandled 'error' would crash the process.
    c.on('error', err => {
      if (live()) console.warn('[tiktok] error:', err?.message ?? err?.info ?? err);
    });

    onStatus('connecting');
    Promise.resolve()
      .then(() => c.connect())
      .catch(err => {
        if (!live()) return;
        onStatus('disconnected', err);
        retry();
      });
  };

  open();
  return {
    stop() {
      stopped = true;
      clearStale();
      for (const t of comboTimers.values()) clearTimeout(t);
      comboTimers.clear();
      clearTimeout(timer);
      timer = null;
      if (conn) Promise.resolve().then(() => conn.disconnect()).catch(() => {});
    },
  };
}
