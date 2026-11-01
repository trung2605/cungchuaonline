import { giftTier, giftOffering } from './bowRules.js';

const GIFT_FX = [['flower'], ['lamp'], ['bell', 'halo']];

export function createEffects({ now = Date.now, smokeMs = 500, lotusEvery = 1000 } = {}) {
  let pendingLikes = 0;
  let total = 0;
  let lastSmoke = -Infinity;

  return {
    handle(e) {
      if (e.kind === 'gift') {
        const power = Math.min(e.repeat, 10);
        const totalDiamonds = e.diamonds * e.repeat;
        const tier = giftTier(totalDiamonds);
        if (tier === 0) {
          const kind = giftOffering(e.giftName, totalDiamonds) === 'dâng hương' ? 'smoke' : 'flower';
          return [{ t: 'fx', kind, at: e.uid, power }];
        }
        return GIFT_FX[tier].map(kind => ({ t: 'fx', kind, at: e.uid, power }));
      }
      if (e.kind !== 'like') return [];

      const out = [];
      const prev = total;
      total += e.count;
      pendingLikes += e.count;
      // No timer: a batch left pending with no later like is dropped (decorative only).
      const t = now();
      if (t - lastSmoke >= smokeMs) {
        out.push({ t: 'fx', kind: 'smoke', power: Math.min(pendingLikes, 20) });
        pendingLikes = 0;
        lastSmoke = t;
      }
      if (Math.floor(total / lotusEvery) > Math.floor(prev / lotusEvery)) out.push({ t: 'fx', kind: 'lotus', power: 10 });
      return out;
    },
    totalLikes: () => total,
  };
}
