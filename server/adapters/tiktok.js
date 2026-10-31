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
}) {
  let n = 0;
  let conn = null;
  let timer = null;
  let stopped = false;
  let ended = false;

  const retry = () => {
    if (stopped || ended || timer) return;
    timer = schedule(() => {
      timer = null;
      open();
    }, backoffMs(n++, rand));
  };

  const open = () => {
    if (stopped || ended) return;
    // A fresh instance per attempt: the library doesn't promise connect() works twice.
    const c = (conn = new Connection(user, { signApiKey, enableExtendedGiftInfo: true }));
    const live = () => c === conn && !stopped;

    for (const name of EVENTS) {
      c.on(name, data => {
        if (!live()) return;
        const e = map(name, data);
        if (!e) return;
        if (e.kind === 'end' && !ended) {
          ended = true;
          onStatus('ended');
        }
        ingest(e);
      });
    }
    c.on('connected', () => {
      if (!live()) return;
      n = 0;
      onStatus('connected');
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
      clearTimeout(timer);
      timer = null;
      if (conn) Promise.resolve().then(() => conn.disconnect()).catch(() => {});
    },
  };
}
