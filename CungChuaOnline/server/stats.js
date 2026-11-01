import { fold, isTrigger, detectIntent, cleanBubble, cleanName } from './filter.js';
import { giftOffering } from './bowRules.js';

const TOP = 10;
const PRAYER_KEYS_MAX = 5000;
const LOG_MAX = 250;

// Session stats (BR-09.6) + recent users (BR-09.4) + persistent gift/event history.
// Rule in the pipeline (returns []), placed after counters;
// bowRules feeds noteBow/noteFiltered. src:'mock' never counts toward money, prayers or viewers (BR-09.9).
export function createStats({ lists, now = Date.now, recentMax = 200 }) {
  const startedAt = now();
  const bowers = new Set();
  let bows = 0;
  let filtered = 0;
  let diamonds = 0;
  let viewersPeak = 0;
  let viewersCurrent = 0;
  const prayers = new Map(); // fold -> { text, count }
  const donors = new Map(); // uid -> { uid, name, diamonds }
  const recent = new Map(); // uid -> RecentUser, oldest first

  // Demo tracking & detailed chronological logs
  const demoBowers = new Set();
  let demoBows = 0;
  let demoGifts = 0;
  let demoDiamonds = 0;
  let demoEvents = 0;
  const giftLog = []; // newest first, capped at LOG_MAX
  const eventLog = []; // newest first, capped at LOG_MAX

  const pushLog = (arr, item) => {
    arr.unshift(item);
    if (arr.length > LOG_MAX) arr.length = LOG_MAX;
  };

  const touch = (e, patch) => {
    const r = { ...recent.get(e.uid), uid: e.uid, name: cleanName(e.name ?? '', lists), src: e.src ?? 'tiktok', ts: e.ts ?? now(), ...patch };
    recent.delete(e.uid);
    recent.set(e.uid, r);
    if (recent.size > recentMax) recent.delete(recent.keys().next().value);
  };

  const top = (m, key) => [...m.values()].sort((a, b) => b[key] - a[key]).slice(0, TOP);

  return {
    handle(e) {
      const real = e.src !== 'mock';
      if (!real) demoEvents++;
      const ts = e.ts ?? now();
      const name = cleanName(e.name ?? '', lists);
      switch (e.kind) {
        case 'chat': {
          const text = cleanBubble(e.text, lists);
          const triggered = Boolean(text && isTrigger(e.text, lists));
          const intent = triggered ? (detectIntent(e.text, lists) ?? 'Cầu Bình An') : null;
          touch(e, { text, raw: e.text, lastKind: 'chat', intent: intent ?? recent.get(e.uid)?.intent });
          pushLog(eventLog, {
            ts, kind: triggered ? 'prayer' : 'chat', src: e.src ?? 'tiktok',
            uid: e.uid, name, text: text ?? '(bị lọc)', raw: e.text, intent,
          });
          if (real && triggered) {
            const k = fold(text);
            const p = prayers.get(k) ?? { text, count: 0 };
            p.count++;
            prayers.set(k, p);
            if (prayers.size > PRAYER_KEYS_MAX) {
              const low = [...prayers].sort((a, b) => a[1].count - b[1].count).slice(0, PRAYER_KEYS_MAX / 2);
              for (const [key] of low) prayers.delete(key);
            }
          }
          break;
        }
        case 'gift': {
          const repeat = e.repeat || 1;
          const total = (e.diamonds || 1) * repeat;
          const offering = giftOffering(e.giftName, total);
          touch(e, { lastKind: 'gift', lastGift: `${e.giftName} ×${repeat} (${total}💎)` });
          const gEntry = {
            ts, src: e.src ?? 'tiktok', uid: e.uid, name,
            giftName: e.giftName || 'Gift', diamonds: e.diamonds || 1,
            repeat, total, offering,
          };
          pushLog(giftLog, gEntry);
          pushLog(eventLog, {
            ts, kind: 'gift', src: e.src ?? 'tiktok', uid: e.uid, name,
            text: `${offering} (${e.giftName} ×${repeat})`, diamonds: total, offering,
          });
          if (!real) {
            demoGifts += repeat;
            demoDiamonds += total;
            break;
          }
          diamonds += total;
          const d = donors.get(e.uid) ?? { uid: e.uid, name: '', diamonds: 0, gifts: 0, lastGift: '', lastTs: ts };
          d.name = name;
          d.diamonds += total;
          d.gifts = (d.gifts || 0) + repeat;
          d.lastGift = `${e.giftName} ×${repeat}`;
          d.lastTs = ts;
          donors.set(e.uid, d);
          break;
        }
        case 'join':
          touch(e, { lastKind: 'join' });
          pushLog(eventLog, {
            ts, kind: 'join', src: e.src ?? 'tiktok', uid: e.uid, name, text: 'Vào chánh điện',
          });
          break;
        case 'viewers':
          if (real) {
            viewersCurrent = e.count;
            viewersPeak = Math.max(viewersPeak, e.count);
          }
          break;
      }
      return [];
    },
    noteBow(uid, n) {
      bowers.add(uid);
      bows += n;
    },
    noteMockBow(uid, n) {
      demoBowers.add(uid);
      demoBows += n;
    },
    noteFiltered() {
      filtered++;
    },
    clearLogs() {
      giftLog.length = 0;
      eventLog.length = 0;
      demoBowers.clear();
      demoBows = 0;
      demoGifts = 0;
      demoDiamonds = 0;
      demoEvents = 0;
    },
    resetAll() {
      bowers.clear();
      bows = 0;
      filtered = 0;
      diamonds = 0;
      viewersPeak = 0;
      viewersCurrent = 0;
      prayers.clear();
      donors.clear();
      recent.clear();
      giftLog.length = 0;
      eventLog.length = 0;
      demoBowers.clear();
      demoBows = 0;
      demoGifts = 0;
      demoDiamonds = 0;
      demoEvents = 0;
    },
    exportHistory() {
      return {
        savedAt: now(),
        bowers: [...bowers],
        bows,
        filtered,
        diamonds,
        viewersPeak,
        prayers: [...prayers.entries()],
        donors: [...donors.entries()],
        giftLog: giftLog.slice(0, 150),
        eventLog: eventLog.slice(0, 150),
      };
    },
    importHistory(h) {
      if (!h || typeof h !== 'object') return;
      if (Array.isArray(h.bowers)) h.bowers.forEach(u => bowers.add(u));
      if (Number.isFinite(h.bows)) bows += h.bows;
      if (Number.isFinite(h.filtered)) filtered += h.filtered;
      if (Number.isFinite(h.diamonds)) diamonds += h.diamonds;
      if (Number.isFinite(h.viewersPeak)) viewersPeak = Math.max(viewersPeak, h.viewersPeak);
      if (Array.isArray(h.prayers)) {
        for (const [k, v] of h.prayers) if (k && v?.text) prayers.set(k, v);
      }
      if (Array.isArray(h.donors)) {
        for (const [k, v] of h.donors) if (k && v?.uid) donors.set(k, v);
      }
      if (Array.isArray(h.giftLog)) {
        giftLog.push(...h.giftLog);
        if (giftLog.length > LOG_MAX) giftLog.length = LOG_MAX;
      }
      if (Array.isArray(h.eventLog)) {
        eventLog.push(...h.eventLog);
        if (eventLog.length > LOG_MAX) eventLog.length = LOG_MAX;
      }
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
        topDonors: top(donors, 'diamonds').map(d => ({ uid: d.uid, name: d.name, diamonds: d.diamonds })),
        diamonds,
        diamondsPerHour: uptime > 0 ? Math.round((diamonds * 3_600_000) / uptime) : 0,
        filtered,
        viewersPeak,
        viewersCurrent,
        sources: { tiktok: sources.tiktok ?? 'off', tikfinity: sources.tikfinity ?? 'off' },
        demoStats: {
          uniqueBowers: demoBowers.size,
          bows: demoBows,
          gifts: demoGifts,
          diamonds: demoDiamonds,
          events: demoEvents,
        },
        giftLog: giftLog.slice(0, 100),
        eventLog: eventLog.slice(0, 120),
      };
    },
    // Newest first.
    recent: () => [...recent.values()].reverse(),
  };
}
