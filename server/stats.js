import { fold, isTrigger, cleanBubble, cleanName } from './filter.js';

const TOP = 10;
const PRAYER_KEYS_MAX = 5000;

// Session stats (BR-09.6) + recent users (BR-09.4). Rule in the pipeline (returns []), placed after counters;
// bowRules feeds noteBow/noteFiltered. src:'mock' never counts toward money, prayers or viewers (BR-09.9).
export function createStats({ lists, now = Date.now, recentMax = 200 }) {
  const startedAt = now();
  const bowers = new Set();
  let bows = 0;
  let filtered = 0;
  let diamonds = 0;
  let viewersPeak = 0;
  const prayers = new Map(); // fold -> { text, count }
  const donors = new Map(); // uid -> { uid, name, diamonds }
  const recent = new Map(); // uid -> RecentUser, oldest first

  const touch = (e, patch) => {
    const r = { ...recent.get(e.uid), uid: e.uid, name: cleanName(e.name ?? '', lists), ts: e.ts ?? now(), ...patch };
    recent.delete(e.uid);
    recent.set(e.uid, r);
    if (recent.size > recentMax) recent.delete(recent.keys().next().value);
  };

  const top = (m, key) => [...m.values()].sort((a, b) => b[key] - a[key]).slice(0, TOP);

  return {
    handle(e) {
      const real = e.src !== 'mock';
      switch (e.kind) {
        case 'chat': {
          const text = cleanBubble(e.text, lists);
          touch(e, { text, raw: e.text });
          if (real && text && isTrigger(e.text, lists)) {
            const k = fold(text);
            const p = prayers.get(k) ?? { text, count: 0 };
            p.count++;
            prayers.set(k, p);
            // ponytail: cắt Map theo count khi > 5000 khóa; đủ dùng cho một phiên
            if (prayers.size > PRAYER_KEYS_MAX) {
              const low = [...prayers].sort((a, b) => a[1].count - b[1].count).slice(0, PRAYER_KEYS_MAX / 2);
              for (const [key] of low) prayers.delete(key);
            }
          }
          break;
        }
        case 'gift': {
          touch(e, {});
          if (!real) break;
          const total = e.diamonds * e.repeat;
          diamonds += total;
          const d = donors.get(e.uid) ?? { uid: e.uid, name: '', diamonds: 0 };
          d.name = cleanName(e.name ?? '', lists);
          d.diamonds += total;
          donors.set(e.uid, d);
          break;
        }
        case 'join':
          touch(e, {});
          break;
        case 'viewers':
          if (real) viewersPeak = Math.max(viewersPeak, e.count);
          break;
      }
      return [];
    },
    noteBow(uid, n) {
      bowers.add(uid);
      bows += n;
    },
    noteFiltered() {
      filtered++;
    },
    state(sources = {}, counters = null) {
      const uptime = now() - startedAt;
      return {
        startedAt,
        uptime,
        uniqueBowers: bowers.size,
        bows,
        namo: counters?.state().namo ?? 0,
        topPrayers: top(prayers, 'count').map(({ text, count }) => ({ text, count })),
        topDonors: top(donors, 'diamonds').map(d => ({ ...d })),
        diamonds,
        diamondsPerHour: uptime > 0 ? Math.round((diamonds * 3_600_000) / uptime) : 0,
        filtered,
        viewersPeak,
        sources: { tiktok: sources.tiktok ?? 'off', tikfinity: sources.tikfinity ?? 'off' },
      };
    },
    // Newest first.
    recent: () => [...recent.values()].reverse(),
  };
}
