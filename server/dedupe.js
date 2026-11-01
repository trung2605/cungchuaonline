// Content-based key; src is left out so the same event from two sources collides.
export function dedupeKey(e) {
  switch (e.kind) {
    case 'chat': return `chat|${e.uid}|${e.text}`;
    case 'gift': return `gift|${e.uid}|${e.giftId}:${e.repeat}:${e.group ?? ''}`;
    case 'like': return `like|${e.uid}|${e.count}`;
    case 'join': return `join|${e.uid}`;
    default: return null;
  }
}

// seen(e) === true means drop it. A hit inside the window does not extend it,
// so a spammed line still counts once per window.
// Gifts use a 10 s window (R-10.1) and soft-match when one source omits groupId.
export function createDedupe({ windowMs = 5000, giftWindowMs = 10_000, now = Date.now } = {}) {
  const keys = new Map(); // key -> { ts, win }

  return {
    seen(e) {
      const t = now();
      for (const [k, entry] of keys) {
        if (t - entry.ts <= entry.win) continue;
        keys.delete(k);
      }
      const k = dedupeKey(e);
      if (k === null) return false;
      if (keys.has(k)) return true;

      if (e.kind === 'gift') {
        const base = `gift|${e.uid}|${e.giftId}:${e.repeat}:`;
        const g = e.group ?? '';
        if (!g) {
          // Incoming gift has no groupId: collide if any recent gift has the same uid+giftId+repeat
          for (const existingKey of keys.keys()) {
            if (existingKey.startsWith(base)) return true;
          }
        } else if (keys.has(base)) {
          // Incoming gift has a groupId, but a groupId-less event from the other source just arrived
          keys.delete(base);
          keys.set(k, { ts: t, win: giftWindowMs });
          return true;
        }
        keys.set(k, { ts: t, win: giftWindowMs });
        return false;
      }

      keys.set(k, { ts: t, win: windowMs });
      return false;
    },
    size: () => keys.size,
  };
}
