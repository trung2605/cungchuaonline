import { cleanBubble, cleanName } from '../../server/filter.js';
import { translateGiftName } from '../../server/bowRules.js';
import { raceGiftTier, BONUS_DIST, BOOST_MS, TIER_MOUNT_LABEL } from './raceStage.js';

export function createRaceRules({ stage, lists, now = Date.now, turboEveryLikes = 500 } = {}) {
  let totalLikes = 0;
  let totalGiftsDiamonds = 0;
  let totalChats = 0;
  let viewers = 0;
  let viewersPeak = 0;
  const startedAt = new Date().toISOString();
  const uniqueRacers = new Set();
  const recentEvents = []; // max 80

  function pushRecent(item) {
    recentEvents.unshift({ ...item, time: new Date(now()).toLocaleTimeString('vi-VN', { hour12: false }) });
    if (recentEvents.length > 80) recentEvents.length = 80;
  }

  return {
    handle(e) {
      const t = now();
      const name = e.name ? cleanName(e.name, lists) : 'Tay Đua';

      if (e.kind === 'viewers') {
        viewers = e.count;
        if (viewers > viewersPeak) viewersPeak = viewers;
        return [{ t: 'counter', key: 'viewers', value: viewers }];
      }

      if (e.kind === 'join') {
        // When a user enters the room or taps join, if there's plenty of room on the track, welcome them
        if (!stage.has(e.uid) && stage.runners.size < 45) {
          uniqueRacers.add(e.uid);
          const { msgs } = stage.joinOrBoost(e.uid, name, 0, { cheer: 'Hào hứng nhập cuộc!' });
          pushRecent({ uid: e.uid, name, kind: 'join', src: e.src, detail: `Chào user ${name} đã tham gia cuộc đua cùng chúng tôi` });
          return msgs;
        }
        return [];
      }

      if (e.kind === 'like') {
        const count = Number(e.count) || 1;
        const prev = totalLikes;
        totalLikes += count;
        const out = [{ t: 'counter', key: 'likes', value: totalLikes }];

        uniqueRacers.add(e.uid);
        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, 0, {
          addDistanceM: Math.min(30, count * 2),
          boostMs: 4000,
        });
        out.push(...msgs);
        out.push({ t: 'fx', kind: 'spark', at: e.uid, power: Math.min(10, Math.ceil(count / 3)) });
        if (isNewJoin) {
          pushRecent({ uid: e.uid, name, kind: 'join', src: e.src, detail: `Thả ❤️ nhập cuộc đua (+${Math.min(30, count * 2)}m)` });
        }
        if (Math.floor(totalLikes / turboEveryLikes) > Math.floor(prev / turboEveryLikes)) {
          out.push(...stage.triggerGlobalTurbo(8000));
        }
        return out;
      }

      if (e.kind === 'gift') {
        const repeat = Math.max(1, Number(e.repeat) || 1);
        const diamonds = Math.max(1, Number(e.diamonds) || 1) * repeat;
        totalGiftsDiamonds += diamonds;
        uniqueRacers.add(e.uid);

        const tier = raceGiftTier(diamonds);
        const bonusM = (BONUS_DIST[tier] || 80) * Math.min(repeat, 10);
        const boostMs = BOOST_MS[tier] || 10_000;
        const mountLabel = TIER_MOUNT_LABEL[tier] || 'Đôi Cánh Năng Lượng';
        const giftVi = translateGiftName(e.giftName);

        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, tier, {
          addDiamonds: diamonds,
          addDistanceM: bonusM,
          boostMs,
          cheer: `Kích hoạt ${mountLabel}!`,
        });

        const out = [
          ...msgs,
          {
            t: 'donor',
            uid: e.uid,
            name,
            giftName: e.giftName,
            giftVi,
            repeat,
            diamonds,
            tier,
            mountLabel,
            bonusM,
            isNewJoin,
          },
          { t: 'fx', kind: tier >= 4 ? 'warp' : tier === 3 ? 'jet' : tier === 2 ? 'hover' : 'wings', at: e.uid, power: Math.min(10, repeat + tier * 2) },
        ];

        if (tier >= 3) {
          out.push({
            t: 'banner',
            text: `🚀 ${name} tặng ${giftVi} ×${repeat} (💎${diamonds}) · Kích hoạt ${mountLabel} (+${bonusM.toLocaleString('vi-VN')}m)!`,
            ms: 5500,
          });
        }

        pushRecent({
          uid: e.uid,
          name,
          kind: 'gift',
          src: e.src,
          giftName: `${giftVi} ×${repeat}`,
          diamonds,
          detail: `${mountLabel} (+${bonusM}m)`,
        });
        return out;
      }

      if (e.kind === 'chat') {
        totalChats++;
        uniqueRacers.add(e.uid);
        const bubble = cleanBubble(e.text, lists, 48);
        const { msgs, isNewJoin } = stage.joinOrBoost(e.uid, name, 0, {
          addDistanceM: 15,
          cheer: bubble || 'Tăng tốc khám phá!',
        });
        const out = [...msgs];
        if (bubble) out.push(...stage.say(e.uid, bubble, 6500));
        pushRecent({
          uid: e.uid,
          name,
          kind: isNewJoin ? 'join' : 'chat',
          src: e.src,
          detail: bubble || '(đã lọc)',
        });
        return out;
      }

      return [];
    },
    statsState(status = {}) {
      return {
        startedAt,
        activeRunners: stage.runners.size,
        uniqueRacers: uniqueRacers.size,
        worldDistanceM: Math.round(stage.worldDistanceM),
        currentBiome: stage.currentBiome(),
        totalLikes,
        totalGiftsDiamonds,
        totalChats,
        viewers,
        viewersPeak,
        topRacers: stage.board(10),
        status,
      };
    },
    recent: () => recentEvents,
    clearLogs() {
      recentEvents.length = 0;
    },
    resetAll() {
      totalLikes = 0;
      totalGiftsDiamonds = 0;
      totalChats = 0;
      viewers = 0;
      viewersPeak = 0;
      uniqueRacers.clear();
      recentEvents.length = 0;
    },
  };
}
