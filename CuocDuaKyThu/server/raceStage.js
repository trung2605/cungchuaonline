// RaceStage: manages 3D runners on the endless world exploration track,
// their speed multipliers, boost tiers, accumulated distance, and current world biome.

export const BIOMES = [
  { id: 'vietnam', name: 'Vịnh Hạ Long & Phố Cổ Việt Nam 🇻🇳', sub: 'Kỳ quan thiên nhiên & đèn lồng rực rỡ', lengthM: 600 },
  { id: 'japan', name: 'Núi Phú Sĩ & Cổng Torii Nhật Bản 🇯🇵', sub: 'Mùa hoa anh đào dưới chân núi tuyết', lengthM: 600 },
  { id: 'egypt', name: 'Kim Tự Tháp Giza Ai Cập 🇪🇬', sub: 'Hành trình xuyên sa mạc vàng cổ đại', lengthM: 600 },
  { id: 'france', name: 'Tháp Eiffel Paris Pháp 🇫🇷', sub: 'Kinh đô ánh sáng bên dòng sông Seine', lengthM: 600 },
  { id: 'usa', name: 'Tượng Nữ Thần Tự Do & Cầu Cổng Vàng 🇺🇸', sub: 'Đại lộ nhịp sống hiện đại rực sáng', lengthM: 600 },
  { id: 'cosmos', name: 'Cung Đường Ngân Hà Vũ Trụ 🌌', sub: 'Đường đua cầu vồng xuyên qua các vì sao', lengthM: 600 },
];

// Gift tier mapping for Cuộc Đua Kỳ Thú:
// Tier 0: Free join / comment / like (Runner, 1.0x speed, TTL 90s)
// Tier 1: 1-9 💎 (Energy Wings, 1.8x speed for 10s, +80m/gift, TTL 150s)
// Tier 2: 10-99 💎 (Golden Hoverboard, 2.8x speed for 18s, +350m/gift, TTL 240s)
// Tier 3: 100-999 💎 (Lightning Jet, 4.2x speed for 28s, +1500m/gift, TTL 360s)
// Tier 4: 1000+ 💎 (Cosmic Warp Champion, 6.5x speed for 45s, +10000m/gift, TTL 600s)
export const RACE_TTL = { 0: 300_000, 1: 600_000, 2: 900_000, 3: 1_500_000, 4: 2_700_000 };
export const BOOST_SPEED = { 0: 1.0, 1: 1.8, 2: 2.8, 3: 4.2, 4: 6.5 };
export const BOOST_MS = { 0: 0, 1: 10_000, 2: 18_000, 3: 28_000, 4: 45_000 };
export const BONUS_DIST = { 0: 0, 1: 80, 2: 350, 3: 1500, 4: 10_000 };

export function raceGiftTier(totalDiamonds) {
  if (totalDiamonds >= 1000) return 4;
  if (totalDiamonds >= 100) return 3;
  if (totalDiamonds >= 10) return 2;
  if (totalDiamonds >= 1) return 1;
  return 0;
}

export const TIER_MOUNT_LABEL = {
  0: 'Chạy bộ khám phá',
  1: 'Đôi Cánh Năng Lượng',
  2: 'Ván Trượt Hoàng Kim',
  3: 'Tên Lửa Tia Chớp',
  4: 'Siêu Phi Thuyền Ngân Hà',
};

function skinOf(uid) {
  let h = 0x811c9dc5;
  for (let i = 0; i < uid.length; i++) h = Math.imul(h ^ uid.charCodeAt(i), 0x01000193);
  return (h >>> 0) % 4;
}

function laneOf(uid, occupiedCount) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  // 7 lanes across the road width (-3.6 to +3.6)
  return ((h + occupiedCount) % 7) - 3;
}

export class RaceStage {
  constructor({ max = 120, now = Date.now, baseSpeedMps = 14, stayMinutes = 5 } = {}) {
    Object.assign(this, { max, now, baseSpeedMps });
    this.runners = new Map(); // uid -> Runner
    this.statsByUid = new Map(); // uid -> { name, distanceM, diamonds, tier, src, updatedAt }
    this.worldDistanceM = 0;
    this.realWorldDistanceM = 0;
    this.biomeIdx = 0;
    this.forcedBiome = null; // null = auto cycle
    this.globalTurboUntil = 0;
    this.lastTickAt = now();
    this.stayMinutes = 5;
    this.ttlMap = { ...RACE_TTL };
    if (stayMinutes > 0) this.setStayMinutes(stayMinutes);
  }

  setStayMinutes(mins) {
    const m = Math.max(0.5, Math.min(180, Number(mins) || 5));
    this.stayMinutes = m;
    const baseMs = Math.round(m * 60_000);
    this.ttlMap = {
      0: baseMs,
      1: Math.round(baseMs * 2),
      2: Math.round(baseMs * 3),
      3: Math.round(baseMs * 5),
      4: Math.round(baseMs * 8),
    };
    const t = this.now();
    for (const r of this.runners.values()) {
      const targetExp = (r.joinedAt || t) + this.ttlMap[r.tier || 0];
      r.expiresAt = Math.max(r.expiresAt, t + baseMs, targetExp);
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
        3: Math.round(this.ttlMap[3] / 1000),
        4: Math.round(this.ttlMap[4] / 1000),
      },
    };
  }

  currentBiome() {
    if (this.forcedBiome) {
      return BIOMES.find(b => b.id === this.forcedBiome) || BIOMES[0];
    }
    return BIOMES[this.biomeIdx % BIOMES.length];
  }

  setBiome(biomeId) {
    if (biomeId === 'auto' || !biomeId) {
      this.forcedBiome = null;
    } else {
      const idx = BIOMES.findIndex(b => b.id === biomeId);
      if (idx !== -1) {
        this.biomeIdx = idx;
        this.forcedBiome = biomeId;
      }
    }
    const b = this.currentBiome();
    return [
      { t: 'biome', biome: b, worldDistanceM: Math.round(this.worldDistanceM) },
      { t: 'banner', text: `🌍 Khám phá điểm đến: ${b.name}`, ms: 4500 },
    ];
  }

  joinOrBoost(uid, name, giftTierLevel = 0, { addDiamonds = 0, addDistanceM = 0, boostMs = 0, cheer = '', src = 'tiktok' } = {}) {
    const t = this.now();
    const prev = this.statsByUid.get(uid) || { name, distanceM: 0, diamonds: 0, tier: 0, src, updatedAt: t };
    const diamonds = prev.diamonds + addDiamonds;
    const distanceM = prev.distanceM + addDistanceM;
    const bestTier = Math.max(prev.tier, giftTierLevel, raceGiftTier(diamonds));
    const finalSrc = src === 'mock' && prev.src && prev.src !== 'mock' ? prev.src : (src || prev.src || 'tiktok');

    this.statsByUid.set(uid, { name, distanceM, diamonds, tier: bestTier, src: finalSrc, updatedAt: t });

    const existing = this.runners.get(uid);
    const out = [];
    let isNewJoin = false;

    if (existing) {
      existing.name = name;
      existing.src = finalSrc;
      existing.tier = Math.max(existing.tier, bestTier);
      existing.diamonds = diamonds;
      existing.distanceM = distanceM;
      existing.expiresAt = Math.max(existing.expiresAt, t + this.ttlMap[existing.tier]);
      if (cheer) existing.cheer = cheer;
      if (giftTierLevel > 0 || boostMs > 0) {
        const bTier = Math.max(giftTierLevel, existing.boostTier || 1);
        existing.boostTier = bTier;
        existing.boostUntil = Math.max(existing.boostUntil, t) + (boostMs || BOOST_MS[bTier] || 8000);
        existing.speedMult = BOOST_SPEED[bTier] || 1.8;
      }
      out.push({
        t: 'boost',
        id: uid,
        runner: { ...existing },
        giftTier: giftTierLevel,
        addDiamonds,
        addDistanceM,
      });
      return { msgs: out, isNewJoin: false, runner: existing };
    }

    // Evict oldest lowest-tier runner if full (prioritize evicting mock bots for real users)
    const isReal = finalSrc !== 'mock';
    if (this.runners.size >= this.max) {
      let victim = null;
      if (isReal) {
        for (const r of this.runners.values()) {
          if (r.src !== 'mock') continue;
          if (!victim || r.tier < victim.tier || (r.tier === victim.tier && r.joinedAt < victim.joinedAt)) {
            victim = r;
          }
        }
      }
      if (!victim) {
        for (const r of this.runners.values()) {
          if (r.tier > bestTier) continue;
          if (!isReal && r.src !== 'mock') continue;
          if (!victim || r.tier < victim.tier || (r.tier === victim.tier && r.joinedAt < victim.joinedAt)) {
            victim = r;
          }
        }
      }
      if (victim) {
        this.runners.delete(victim.id);
        out.push({ t: 'leave', id: victim.id });
      } else {
        return { msgs: [], isNewJoin: false, runner: null };
      }
    }

    isNewJoin = true;
    const boostUntil = giftTierLevel > 0 ? t + (boostMs || BOOST_MS[giftTierLevel]) : (boostMs > 0 ? t + boostMs : 0);
    const speedMult = giftTierLevel > 0 ? BOOST_SPEED[giftTierLevel] : (boostMs > 0 ? 1.35 : 1.0);
    const runner = {
      id: uid,
      name,
      src: finalSrc,
      skin: skinOf(uid),
      lane: laneOf(uid, this.runners.size),
      tier: bestTier,
      boostTier: giftTierLevel,
      boostUntil,
      speedMult,
      distanceM,
      diamonds,
      cheer: cheer || 'Quyết tâm về đích!',
      joinedAt: t,
      expiresAt: t + this.ttlMap[bestTier],
    };
    this.runners.set(uid, runner);

    const welcomeText = `Chào mừng ${name} vừa vào chùa lễ Phật và khởi hành vãn cảnh`;
    out.push(
      { t: 'spawn', runner: { ...runner } },
      { t: 'welcome', id: uid, name, text: welcomeText, tier: bestTier, src: finalSrc, ...(giftTierLevel > 0 && { fromGift: true }) },
    );

    if (giftTierLevel > 0) {
      out.push({
        t: 'boost',
        id: uid,
        runner: { ...runner },
        giftTier: giftTierLevel,
        addDiamonds,
        addDistanceM,
      });
    }

    return { msgs: out, isNewJoin: true, runner };
  }

  triggerGlobalTurbo(durationMs = 8000) {
    const t = this.now();
    this.globalTurboUntil = Math.max(this.globalTurboUntil, t) + durationMs;
    for (const r of this.runners.values()) {
      r.boostUntil = Math.max(r.boostUntil, t + durationMs);
      r.speedMult = Math.max(r.speedMult, 2.2);
    }
    return [
      { t: 'fx', kind: 'turbo', power: 10 },
      { t: 'banner', text: '⚡ BÃO TIM TIKTOK! Toàn bộ tay đua được tăng tốc Cầu Vồng x2.2!', ms: 4500 },
    ];
  }

  say(uid, text, ms = 6000) {
    const r = this.runners.get(uid);
    if (!r) return [];
    r.cheer = text;
    return [{ t: 'say', id: uid, text, ms }];
  }

  tick() {
    const t = this.now();
    const dt = Math.max(0.05, Math.min(2.0, (t - this.lastTickAt) / 1000));
    this.lastTickAt = t;

    const out = [];
    const globalTurbo = t < this.globalTurboUntil;
    const prevCycle = Math.floor(this.worldDistanceM / 600);
    const activeCount = this.runners.size;
    const realActiveCount = [...this.runners.values()].filter(r => r.src !== 'mock').length;
    if (activeCount > 0) {
      const worldStep = (this.baseSpeedMps + Math.min(12, activeCount * 0.25)) * (globalTurbo ? 1.6 : 1.0) * dt;
      this.worldDistanceM += worldStep;
    }
    if (realActiveCount > 0) {
      const realStep = (this.baseSpeedMps + Math.min(12, realActiveCount * 0.25)) * (globalTurbo ? 1.6 : 1.0) * dt;
      this.realWorldDistanceM += realStep;
    }

    const newCycle = Math.floor(this.worldDistanceM / 600);
    if (!this.forcedBiome && newCycle > prevCycle) {
      this.biomeIdx = newCycle % BIOMES.length;
      const b = this.currentBiome();
      out.push(
        { t: 'biome', biome: b, worldDistanceM: Math.round(this.worldDistanceM) },
        { t: 'banner', text: `🌍 Đoàn đua tiến vào: ${b.name}`, ms: 5000 },
      );
    }

    for (const r of [...this.runners.values()]) {
      if (r.expiresAt <= t) {
        this.runners.delete(r.id);
        out.push({ t: 'leave', id: r.id });
        continue;
      }
      if (r.boostUntil > 0 && t >= r.boostUntil) {
        r.boostUntil = 0;
        r.boostTier = 0;
        // Higher permanent tier keeps a base speed advantage
        r.speedMult = r.tier >= 4 ? 1.65 : r.tier === 3 ? 1.4 : r.tier === 2 ? 1.25 : r.tier === 1 ? 1.12 : 1.0;
      }
      const stepM = this.baseSpeedMps * r.speedMult * (globalTurbo ? 1.35 : 1.0) * dt;
      r.distanceM = Math.round((r.distanceM + stepM) * 10) / 10;
      const st = this.statsByUid.get(r.id);
      if (st) st.distanceM = r.distanceM;
    }

    out.push({
      t: 'worldTick',
      worldDistanceM: Math.round(this.worldDistanceM),
      biome: this.currentBiome(),
      board: this.board(),
      runners: [...this.runners.values()].map(r => ({
        id: r.id,
        src: r.src || 'tiktok',
        distanceM: Math.round(r.distanceM),
        speedMult: r.speedMult,
        tier: r.tier,
        boostTier: r.boostTier,
        diamonds: r.diamonds,
      })),
    });

    return out;
  }

  board(limit = 8, includeMock = true) {
    return [...this.statsByUid.entries()]
      .filter(([, s]) => includeMock || s.src !== 'mock')
      .map(([uid, s]) => ({
        uid,
        name: s.name,
        src: s.src || 'tiktok',
        distanceM: Math.round(s.distanceM),
        diamonds: s.diamonds,
        tier: s.tier,
      }))
      .sort((a, b) => b.distanceM - a.distanceM || b.diamonds - a.diamonds)
      .slice(0, limit);
  }

  remove(uid) {
    if (!this.runners.has(uid)) return [];
    this.runners.delete(uid);
    return [{ t: 'leave', id: uid }];
  }

  clearAll() {
    const out = [];
    for (const uid of [...this.runners.keys()]) {
      this.runners.delete(uid);
      out.push({ t: 'leave', id: uid });
    }
    this.statsByUid.clear();
    this.worldDistanceM = 0;
    this.realWorldDistanceM = 0;
    this.biomeIdx = 0;
    this.forcedBiome = null;
    this.globalTurboUntil = 0;
    return out;
  }

  triggerEmotionAll(text, { boostMs = 6000, speedMult = 2.0, fxKind = 'spark' } = {}) {
    const t = this.now();
    const out = [];
    for (const r of this.runners.values()) {
      r.expiresAt = Math.max(r.expiresAt, t + 90_000);
      if (boostMs > 0) {
        r.boostUntil = Math.max(r.boostUntil, t + boostMs);
        r.speedMult = Math.max(r.speedMult, speedMult);
      }
      if (text) {
        r.cheer = text;
        out.push({ t: 'say', id: r.id, text, ms: 6000 });
      }
      if (fxKind) {
        out.push({ t: 'fx', kind: fxKind, at: r.id, power: 8 });
      }
    }
    return out;
  }

  has(uid) {
    return this.runners.has(uid);
  }

  snapshot() {
    return [...this.runners.values()].map(r => ({ ...r }));
  }
}
