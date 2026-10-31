import { isTrigger, detectIntent, cleanBubble, cleanName } from './filter.js';

export const giftTier = total => (total >= 1000 ? 2 : total >= 10 ? 1 : 0);

export function createBowRules({ stage, lists, stats = null, now = Date.now, cooldownMs = 600_000 }) {
  const lastFree = new Map(); // uid -> ts of last free bow; gifts never touch it

  return {
    handle(e) {
      // Mock events never reach session stats (BR-09.9, test.md scenario).
      const st = e.src === 'mock' ? null : stats;
      const granted = (n, msgs) => {
        if (msgs.length) st?.noteBow(e.uid, n);
        return msgs;
      };
      if (e.kind === 'gift') {
        const total = e.diamonds * e.repeat;
        const n = Math.min(e.repeat, 10);
        return granted(n, stage.enter(e.uid, cleanName(e.name, lists), giftTier(total), n, {
          addDiamonds: total,
          visit: true,
        }));
      }
      if (e.kind !== 'chat') return [];

      const out = [];
      const t = now();
      const last = lastFree.get(e.uid);
      if (isTrigger(e.text, lists) && (last === undefined || t - last >= cooldownMs)) {
        lastFree.set(e.uid, t);
        out.push(...granted(1, stage.enter(e.uid, cleanName(e.name, lists), 0, 1, { intent: detectIntent(e.text, lists) ?? undefined })));
      }
      const bubble = cleanBubble(e.text, lists);
      if (bubble) out.push(...stage.say(e.uid, bubble));
      else st?.noteFiltered();
      return out;
    },
  };
}
