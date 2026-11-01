import { isTrigger, cleanName } from './filter.js';
import { giftTier, giftOffering } from './bowRules.js';

export function createCounters({
  lists, now = Date.now, joinGapMs = 2000, priorityMs = 5000, namoEvery = 1000, boardMs = 2000, boardSize = 8,
} = {}) {
  let namo = 0;
  let viewers = 0;
  let lastJoinBannerAt = -Infinity;
  let priorityUntil = -Infinity;
  const donors = new Map(); // uid -> { name, diamonds, reachedAt }
  let lastBoardAt = -Infinity;
  let lastTop = '[]';
  let boardDirty = false;

  // ponytail: full sort per call; n = donors per session (hundreds), fine.
  const board = () => [...donors.values()]
    .sort((a, b) => b.diamonds - a.diamonds || a.reachedAt - b.reachedAt)
    .slice(0, boardSize)
    .map(({ name, diamonds }) => ({ name, diamonds }));

  const flushBoard = t => {
    if (!boardDirty || t - lastBoardAt < boardMs) return [];
    boardDirty = false;
    const top = board();
    const key = JSON.stringify(top);
    if (key === lastTop) return [];
    lastTop = key;
    lastBoardAt = t;
    return [{ t: 'board', top }];
  };

  return {
    handle(e) {
      const t = now();
      switch (e.kind) {
        case 'chat': {
          if (!isTrigger(e.text, lists)) return [];
          namo++;
          const out = [{ t: 'counter', key: 'namo', value: namo }];
          if (namo % namoEvery === 0) {
            priorityUntil = t + 4000;
            out.push({ t: 'banner', text: `Cả chùa đã niệm ${namo} lần 🙏`, ms: 4000 });
          }
          return out;
        }
        case 'viewers':
          viewers = e.count;
          return [{ t: 'counter', key: 'viewers', value: viewers }];
        case 'join':
          if (t < priorityUntil || t - lastJoinBannerAt < joinGapMs) return [];
          lastJoinBannerAt = t;
          return [{ t: 'banner', text: `${cleanName(e.name, lists)} vừa vào chùa`, ms: 3000 }];
        case 'gift': {
          const name = cleanName(e.name, lists);
          const total = e.diamonds * e.repeat;
          const offering = giftOffering(e.giftName, total);
          const out = [{ t: 'donor', uid: e.uid, name, giftName: e.giftName, repeat: e.repeat, diamonds: total, offering }];
          if (giftTier(total) === 2) {
            priorityUntil = t + priorityMs;
            out.push({ t: 'banner', text: `Cảm ơn ${name} đã ${offering} (${e.giftName}) 🙏`, ms: 5000 });
          }
          const d = donors.get(e.uid);
          donors.set(e.uid, { name, diamonds: (d?.diamonds ?? 0) + total, reachedAt: t });
          boardDirty = true;
          return [...out, ...flushBoard(t)];
        }
        default:
          return [];
      }
    },
    tick: () => flushBoard(now()),
    state: () => ({ namo, viewers }),
    board,
  };
}
