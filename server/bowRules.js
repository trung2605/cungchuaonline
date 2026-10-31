import { isTrigger, detectIntent, cleanBubble, cleanName } from './filter.js';

export const giftTier = total => (total >= 1000 ? 2 : total >= 10 ? 1 : 0);

export function createBowRules({ stage, lists, now = Date.now, cooldownMs = 600_000 }) {
  const lastFree = new Map(); // uid -> ts of last free bow; gifts never touch it

  return {
    handle(e) {
      if (e.kind === 'gift') {
        const total = e.diamonds * e.repeat;
        return stage.enter(e.uid, cleanName(e.name, lists), giftTier(total), Math.min(e.repeat, 10), {
          addDiamonds: total,
          visit: true,
        });
      }
      if (e.kind !== 'chat') return [];

      const out = [];
      const t = now();
      const last = lastFree.get(e.uid);
      if (isTrigger(e.text, lists) && (last === undefined || t - last >= cooldownMs)) {
        lastFree.set(e.uid, t);
        out.push(...stage.enter(e.uid, cleanName(e.name, lists), 0, 1, { intent: detectIntent(e.text, lists) ?? undefined }));
      }
      const bubble = cleanBubble(e.text, lists);
      if (bubble) out.push(...stage.say(e.uid, bubble));
      return out;
    },
  };
}
