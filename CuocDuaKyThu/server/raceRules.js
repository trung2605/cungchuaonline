import { cleanBubble, cleanName } from '../../server/filter.js';
import { translateGiftName } from '../../server/bowRules.js';
import { raceGiftTier, BONUS_DIST, BOOST_MS, TIER_MOUNT_LABEL, resolveRegionalGiftItem } from './raceStage.js';

export function createRaceRules({ stage, lists, now = Date.now, turboEveryLikes = 500 } = {}) {
  let totalLikes = 0;
  let totalGiftsDiamonds = 0;
  let totalChats = 0;
  let viewers = 0;
  let viewersPeak = 0;
  const startedAt = new Date().toISOString();
  const uniqueRacers = new Set();

  let mockLikes = 0;
  let mockGiftsDiamonds = 0;
  let mockChats = 0;
  const mockRacers = new Set();

  const recentEvents = []; // max 80

  function pushRecent(item) {
    recentEvents.unshift({ ...item, time: new Date(now()).toLocaleTimeString('vi-VN', { hour12: false }) });
    if (recentEvents.length > 80) recentEvents.length = 80;
  }

  return {
    handle(e) {
      const t = now();
      const src = e.src || 'tiktok';
      const real = src !== 'mock';
      const name = e.name ? cleanName(e.name, lists) : 'Tay Đua';

      if (e.kind === 'viewers') {
        if (real) {
          viewers = e.count;
          if (viewers > viewersPeak) viewersPeak = viewers;
        }
        return [{ t: 'counter', key: 'viewers', value: viewers }];
      }

      if (e.kind === 'join') {
        if (!stage.has(e.uid) && (real || stage.runners.size < 45)) {
          if (real) uniqueRacers.add(e.uid);
          else mockRacers.add(e.uid);
          const { msgs } = stage.joinOrBoost(e.uid, name, 0, { cheer: 'Hào hứng nhập cuộc!', src });
          pushRecent({ uid: e.uid, name, kind: 'join', src, detail: `Chào mừng ${name} tham gia hành trình đi bộ xuyên Việt` });
          return msgs;
        }
        return [];
      }

      if (e.kind === 'like') {
        const count = Number(e.count) || 1;
        const prev = totalLikes + mockLikes;
        if (real) {
          totalLikes += count;
          uniqueRacers.add(e.uid);
        } else {
          mockLikes += count;
          mockRacers.add(e.uid);
        }
        const combinedLikes = totalLikes + mockLikes;
        const out = [{ t: 'counter', key: 'likes', value: real ? totalLikes : combinedLikes }];

        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, 0, {
          addDistanceM: Math.min(30, count * 2),
          boostMs: 4000,
          src,
        });
        out.push(...msgs);
        out.push({ t: 'fx', kind: 'spark', at: e.uid, power: Math.min(10, Math.ceil(count / 3)) });
        if (isNewJoin) {
          pushRecent({ uid: e.uid, name, kind: 'join', src, detail: `Thả ❤️ nhập cuộc đua (+${Math.min(30, count * 2)}m)` });
        }
        if (Math.floor(combinedLikes / turboEveryLikes) > Math.floor(prev / turboEveryLikes)) {
          out.push(...stage.triggerGlobalTurbo(8000));
        }
        return out;
      }

      if (e.kind === 'gift') {
        const repeat = Math.max(1, Number(e.repeat) || 1);
        const diamonds = Math.max(1, Number(e.diamonds) || 1) * repeat;
        if (real) {
          totalGiftsDiamonds += diamonds;
          uniqueRacers.add(e.uid);
        } else {
          mockGiftsDiamonds += diamonds;
          mockRacers.add(e.uid);
        }

        const prevLeader = stage.board(1)[0] || null;
        const tier = raceGiftTier(diamonds);
        const bonusM = (BONUS_DIST[tier] || 80) * Math.min(repeat, 10);
        const boostMs = BOOST_MS[tier] || 10_000;
        const mountLabel = TIER_MOUNT_LABEL[tier] || 'Đôi Cánh Năng Lượng';
        const giftVi = translateGiftName(e.giftName);

        const curBiome = stage.currentBiome ? stage.currentBiome() : null;
        const regionalItem = resolveRegionalGiftItem({
          provinceCode: curBiome?.province?.code || 1,
          biomeId: curBiome?.id || 'vn_hagiang',
          diamonds,
          tier,
        });

        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, tier, {
          addDiamonds: diamonds,
          addDistanceM: bonusM,
          boostMs,
          cheer: `${regionalItem.icon} ${regionalItem.shortName} · ${mountLabel}!`,
          src,
          regionalItem,
        });

        const chestRes = stage.addChestDiamonds ? stage.addChestDiamonds(diamonds, name) : { unlocked: false, chest: null, msgs: [] };
        const updatedBoard = stage.board(50);
        const newLeader = updatedBoard[0] || null;
        const rankIdx = updatedBoard.findIndex(r => r.uid === e.uid);
        const newRank = rankIdx !== -1 ? rankIdx + 1 : null;
        const overtookKing = Boolean(
          newLeader &&
          newLeader.uid === e.uid &&
          prevLeader &&
          prevLeader.uid !== e.uid
        );

        const out = [
          ...msgs,
          {
            t: 'donor',
            uid: e.uid,
            name,
            src,
            giftName: e.giftName,
            giftVi,
            repeat,
            diamonds,
            tier,
            mountLabel,
            regionalItem,
            bonusM,
            isNewJoin,
            rank: newRank,
            overtookKing,
            prevKingName: overtookKing ? prevLeader.name : '',
            chestUnlocked: chestRes.unlocked,
            giftChest: chestRes.chest,
          },
          { t: 'fx', kind: tier >= 4 ? 'warp' : tier === 3 ? 'jet' : tier === 2 ? 'hover' : 'wings', at: e.uid, power: Math.min(10, repeat + tier * 2) },
        ];

        if (chestRes.msgs?.length) {
          out.push(...chestRes.msgs);
        } else if (overtookKing) {
          out.push({
            t: 'banner',
            text: `👑 SOÁN NGÔI VUA HÀNH TRÌNH! ${name} tặng ${giftVi} ×${repeat} nhận ${regionalItem.icon} ${regionalItem.name} vượt qua ${prevLeader.name} chiếm Top 1 (${newLeader.distanceM.toLocaleString('vi-VN')}m)!`,
            ms: 5500,
          });
        } else if (tier >= 3) {
          out.push({
            t: 'banner',
            text: `🚀 ${name} tặng ${giftVi} ×${repeat} (💎${diamonds}) · Nhận ${regionalItem.icon} ${regionalItem.name} & ${mountLabel} (+${bonusM.toLocaleString('vi-VN')}m)!`,
            ms: 5500,
          });
        }

        pushRecent({
          uid: e.uid,
          name,
          kind: 'gift',
          src,
          giftName: `${giftVi} ×${repeat}`,
          diamonds,
          detail: `${regionalItem.icon} ${regionalItem.shortName} · ${mountLabel} (+${bonusM}m)${overtookKing ? ' · 👑 Soán ngôi #1' : ''}`,
        });
        return out;
      }

      if (e.kind === 'chat') {
        if (real) {
          totalChats++;
          uniqueRacers.add(e.uid);
        } else {
          mockChats++;
          mockRacers.add(e.uid);
        }
        const bubble = cleanBubble(e.text, lists, 48);
        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, 0, {
          addDistanceM: 15,
          cheer: bubble || 'Tăng tốc khám phá!',
          src,
        });
        const out = [...msgs];
        if (bubble) {
          for (const sm of stage.say(e.uid, bubble, 6500)) {
            out.push({ ...sm, name, src });
          }
        }
        pushRecent({
          uid: e.uid,
          name,
          kind: isNewJoin ? 'join' : 'chat',
          src,
          detail: bubble || '(đã lọc)',
        });
        return out;
      }

      return [];
    },
    statsState(status = {}) {
      const allRunners = [...stage.runners.values()];
      const realRunnersCount = allRunners.filter(r => r.src !== 'mock').length;
      const mockRunnersCount = allRunners.filter(r => r.src === 'mock').length;
      return {
        startedAt,
        activeRunners: stage.runners.size,
        realActiveRunners: realRunnersCount,
        mockActiveRunners: mockRunnersCount,
        uniqueRacers: uniqueRacers.size,
        worldDistanceM: Math.round(stage.worldDistanceM),
        realWorldDistanceM: Math.round(stage.realWorldDistanceM ?? 0),
        currentBiome: stage.currentBiome(),
        totalLikes,
        totalGiftsDiamonds,
        totalChats,
        viewers,
        viewersPeak,
        topRacers: stage.board(10, false),
        allTopRacers: stage.board(10, true),
        demoStats: {
          likes: mockLikes,
          diamonds: mockGiftsDiamonds,
          chats: mockChats,
          uniqueRacers: mockRacers.size,
        },
        status,
      };
    },
    recent: () => recentEvents,
    clearLogs() {
      recentEvents.length = 0;
      mockLikes = 0;
      mockGiftsDiamonds = 0;
      mockChats = 0;
      mockRacers.clear();
    },
    resetAll() {
      totalLikes = 0;
      totalGiftsDiamonds = 0;
      totalChats = 0;
      viewers = 0;
      viewersPeak = 0;
      uniqueRacers.clear();
      mockLikes = 0;
      mockGiftsDiamonds = 0;
      mockChats = 0;
      mockRacers.clear();
      recentEvents.length = 0;
    },
  };
}
