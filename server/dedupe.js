// Content-based key; src is left out so the same event from two sources collides.
export function dedupeKey(e) {
  switch (e.kind) {
    case 'chat': return `chat|${e.uid}|${e.text}`;
    case 'gift': return `gift|${e.uid}|${e.giftId}:${e.repeat}`;
    case 'like': return `like|${e.uid}|${e.count}`;
    case 'join': return `join|${e.uid}`;
    default: return null;
  }
}

// seen(e) === true means drop it. A hit inside the window does not extend it,
// so a spammed line still counts once per window.
export function createDedupe({ windowMs = 5000, now = Date.now } = {}) {
  const keys = new Map(); // key -> first-seen ts, in insertion (= time) order

  return {
    seen(e) {
      const t = now();
      for (const [k, ts] of keys) {
        if (t - ts <= windowMs) break;
        keys.delete(k);
      }
      const k = dedupeKey(e);
      if (k === null) return false;
      if (keys.has(k)) return true;
      keys.set(k, t);
      return false;
    },
    size: () => keys.size,
  };
}
