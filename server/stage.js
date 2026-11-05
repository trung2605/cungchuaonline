export const TTL = { 0: 60_000, 1: 120_000, 2: 300_000 };
export const DEFAULT_INTENT = 'Cầu Bình An';
const MAX_BOWS = 50;

// FNV-1a 32-bit, so a returning uid keeps its skin.
function skinOf(uid) {
  let h = 0x811c9dc5;
  for (let i = 0; i < uid.length; i++) h = Math.imul(h ^ uid.charCodeAt(i), 0x01000193);
  return (h >>> 0) % 4;
}

export class Stage {
  constructor({ max = 150, front = 20, now = Date.now, stayMinutes = 0 } = {}) {
    Object.assign(this, { max, front, now });
    this.actors = new Map(); // uid -> Actor
    this.occupied = new Array(max).fill(null);
    this.diamondsByUid = new Map(); // survives leave/re-enter for the whole session
    this.wishes = [];
    this.stayMinutes = 0;
    this.ttlMap = { ...TTL };
    this.rewardConfig = {
      bowMultiplier: 1,
      tier1MinDiamonds: 10,
      tier2MinDiamonds: 1000,
      wishRibbonOnChat: true,
      wishRibbonGoldMinDiamonds: 20,
      preset: 'standard',
    };
    if (stayMinutes > 0) this.setStayMinutes(stayMinutes);
  }

  setRewardConfig(patch = {}) {
    const presetMap = {
      standard: { bowMultiplier: 1, tier1MinDiamonds: 5, tier2MinDiamonds: 20, wishRibbonGoldMinDiamonds: 20 },
      golden_hour: { bowMultiplier: 2, tier1MinDiamonds: 2, tier2MinDiamonds: 10, wishRibbonGoldMinDiamonds: 10 },
      festival: { bowMultiplier: 3, tier1MinDiamonds: 2, tier2MinDiamonds: 10, wishRibbonGoldMinDiamonds: 5 },
      mega: { bowMultiplier: 5, tier1MinDiamonds: 1, tier2MinDiamonds: 5, wishRibbonGoldMinDiamonds: 2 },
    };
    if (patch.preset && presetMap[patch.preset]) {
      Object.assign(this.rewardConfig, presetMap[patch.preset], { preset: patch.preset });
    }
    if (patch.bowMultiplier !== undefined) {
      this.rewardConfig.bowMultiplier = Math.max(1, Math.min(10, Math.round(Number(patch.bowMultiplier) || 1)));
    }
    if (patch.tier1MinDiamonds !== undefined) {
      this.rewardConfig.tier1MinDiamonds = Math.max(1, Math.min(500, Math.round(Number(patch.tier1MinDiamonds) || 5)));
    }
    if (patch.tier2MinDiamonds !== undefined) {
      this.rewardConfig.tier2MinDiamonds = Math.max(
        this.rewardConfig.tier1MinDiamonds,
        Math.min(5000, Math.round(Number(patch.tier2MinDiamonds) || 20))
      );
    }
    if (patch.wishRibbonOnChat !== undefined) {
      this.rewardConfig.wishRibbonOnChat = Boolean(patch.wishRibbonOnChat);
    }
    if (patch.wishRibbonGoldMinDiamonds !== undefined) {
      this.rewardConfig.wishRibbonGoldMinDiamonds = Math.max(1, Math.min(500, Math.round(Number(patch.wishRibbonGoldMinDiamonds) || 20)));
    }
    return this.getRewardConfig();
  }

  getRewardConfig() {
    return { ...this.rewardConfig };
  }

  setStayMinutes(mins) {
    const m = Math.max(0.1, Math.min(180, Number(mins) || 5));
    this.stayMinutes = m;
    const baseMs = Math.round(m * 60_000);
    this.ttlMap = {
      0: baseMs,
      1: baseMs * 2,
      2: baseMs * 5,
    };
    const t = this.now();
    for (const a of this.actors.values()) {
      const tierMs = this.ttlMap[a.tier || 0] || baseMs;
      a.expiresAt = (a.joinedAt || t) + tierMs;
    }
    return this.getStayConfig();
  }

  getStayConfig() {
    const baseMinutes = Math.round((this.ttlMap[0] / 60_000) * 10) / 10;
    return {
      stayMinutes: baseMinutes,
      ttlSec: {
        0: Math.round(this.ttlMap[0] / 1000),
        1: Math.round(this.ttlMap[1] / 1000),
        2: Math.round(this.ttlMap[2] / 1000),
      },
    };
  }

  #free(from, to) {
    for (let s = from; s < to; s++) if (this.occupied[s] === null) return s;
    return -1;
  }

  #remove(uid) {
    this.occupied[this.actors.get(uid).slot] = null;
    this.actors.delete(uid);
    return { t: 'leave', id: uid };
  }

  enter(uid, name, tier, addBows, { intent, addDiamonds = 0, visit = false, src } = {}) {
    const t = this.now();
    const diamonds = (this.diamondsByUid.get(uid) ?? 0) + addDiamonds;
    if (addDiamonds) this.diamondsByUid.set(uid, diamonds);
    const badge = addDiamonds ? [{ t: 'badge', id: uid, diamonds }] : [];

    const a = this.actors.get(uid);
    if (a) {
      const out = [];
      a.tier = Math.max(a.tier, tier);
      a.bows = Math.min(MAX_BOWS, a.bows + addBows);
      a.expiresAt = Math.max(a.expiresAt, t + this.ttlMap[a.tier]);
      a.intent = intent ?? a.intent;
      a.diamonds = diamonds;
      if (src) a.src = src;
      if (a.tier === 2 && a.slot >= this.front) {
        const s = this.#free(0, this.front);
        if (s !== -1) {
          this.occupied[a.slot] = null;
          this.occupied[(a.slot = s)] = uid;
          out.push({ t: 'move', id: uid, slot: s });
        }
      }
      out.push({ t: 'bow', id: uid, times: addBows, ...(visit && { visit: true }) });
      return [...out, ...badge];
    }

    // Tier 2 may sit anywhere (front row first); others only behind the front row.
    const from = tier === 2 ? 0 : this.front;
    let slot = tier === 2 ? this.#free(0, this.front) : -1;
    if (slot === -1) slot = this.#free(this.front, this.max);
    const out = [];
    const isReal = Boolean(src && src !== 'mock');
    if (slot === -1) {
      // Prioritize real users over mock bots:
      // 1. Real users evict mock bots first (even higher-tier mock bots in non-front slots).
      // 2. Mock bots can never evict real users.
      let victim = null;
      if (isReal) {
        for (const v of this.actors.values()) {
          if (v.slot < from || v.src !== 'mock') continue;
          if (!victim || v.tier < victim.tier || (v.tier === victim.tier && v.joinedAt < victim.joinedAt)) victim = v;
        }
      }
      if (!victim) {
        for (const v of this.actors.values()) {
          if (v.slot < from || v.tier > tier) continue;
          if (!isReal && v.src && v.src !== 'mock') continue;
          if (!victim || v.tier < victim.tier || (v.tier === victim.tier && v.joinedAt < victim.joinedAt)) victim = v;
        }
      }
      if (!victim) return [];
      slot = victim.slot;
      out.push(this.#remove(victim.id));
    }

    const actor = {
      id: uid, name, tier, slot, skin: skinOf(uid), bows: Math.min(MAX_BOWS, addBows),
      joinedAt: t, expiresAt: t + this.ttlMap[tier], intent: intent ?? DEFAULT_INTENT, diamonds,
      ...(src && { src }),
    };
    this.actors.set(uid, actor);
    this.occupied[slot] = uid;
    out.push({ t: 'spawn', actor: { ...actor } });
    return [...out, ...badge];
  }

  say(uid, text, ms = 6000) {
    return this.actors.has(uid) ? [{ t: 'say', id: uid, text, ms }] : [];
  }

  tick() {
    const t = this.now();
    return [...this.actors.values()].filter(a => a.expiresAt <= t).map(a => this.#remove(a.id));
  }

  // Admin block (BR-09.2): drop the actor now instead of waiting for TTL.
  remove(uid) {
    return this.actors.has(uid) ? [this.#remove(uid)] : [];
  }

  isMockActor(a, uid = '') {
    const id = String(uid || a?.id || '');
    if (id.startsWith('bot_') || id.startsWith('seed_') || id.startsWith('ceremony_') || id.startsWith('sample_')) {
      return true;
    }
    return a?.src === 'mock' || a?.src === 'seed';
  }

  purgeMockActors() {
    const out = [];
    for (const [uid, a] of [...this.actors.entries()]) {
      if (this.isMockActor(a, uid)) {
        out.push(this.#remove(uid));
        this.diamondsByUid.delete(uid);
      }
    }
    return out;
  }

  clearAll() {
    const out = [];
    for (const uid of [...this.actors.keys()]) {
      out.push(this.#remove(uid));
    }
    this.occupied.fill(null);
    this.diamondsByUid.clear();
    return out;
  }

  triggerEmotionAll(text, { bows = 2, ms = 6000 } = {}) {
    const out = [];
    const t = this.now();
    for (const a of this.actors.values()) {
      a.expiresAt = Math.max(a.expiresAt, t + 60_000);
      if (bows > 0) {
        a.bows = Math.min(MAX_BOWS, a.bows + bows);
        out.push({ t: 'bow', id: a.id, times: bows });
      }
      if (text) {
        out.push({ t: 'say', id: a.id, text, ms });
      }
    }
    return out;
  }

  has(uid) {
    return this.actors.has(uid);
  }

  snapshot() {
    return [...this.actors.values()].map(a => ({ ...a }));
  }

  addWish({ uid = '', name = '', wish = '', tier = 0, diamonds = 0, ribbonColor = null } = {}) {
    const cleanUid = String(uid || '').trim();
    const cleanNameStr = String(name || 'Phật Tử').trim();
    const cleanWishStr = String(wish || 'Cầu Bình An').trim();
    const cleanTier = Number(tier) || 0;
    const cleanDiamonds = Number(diamonds) || 0;
    const goldMin = this.rewardConfig?.wishRibbonGoldMinDiamonds ?? 20;
    const color = ribbonColor || (cleanDiamonds >= goldMin ? 'gold' : cleanDiamonds >= 2 ? 'rose' : 'red');
    const item = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uid: cleanUid,
      name: cleanNameStr,
      wish: cleanWishStr,
      tier: cleanTier,
      diamonds: cleanDiamonds,
      ribbonColor: color,
      ts: this.now(),
    };
    this.wishes.push(item);
    if (this.wishes.length > 50) {
      this.wishes.splice(0, this.wishes.length - 50);
    }
    return [{ t: 'wish_ribbon', wish: item }];
  }

  getWishes() {
    return this.wishes.map(w => ({ ...w }));
  }

  clearWishes() {
    this.wishes = [];
    return [{ t: 'clear_wishes' }];
  }
}
