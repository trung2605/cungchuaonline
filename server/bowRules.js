import { isTrigger, detectIntent, cleanBubble, cleanName } from './filter.js';

export const giftTier = total => (total >= 1000 ? 2 : total >= 10 ? 1 : 0);

const INCENSE_RE = /\b(rose|hoa hong|tiktok|gg|nhang|huong|incense|tram|thumbs up|like)\b/i;
const LAMP_RE = /\b(lamp|light|candle|lantern|heart|tim|nen|den|star|sao|rosa|necklace|vong|non la|hat|bottle|binh)\b/i;

export const TIKTOK_GIFT_VI = {
  rose: 'Hoa Hồng',
  tiktok: 'TikTok',
  gg: 'GG',
  'heart me': 'Trái Tim',
  'ice cream cone': 'Kem Ốc Quế',
  'wishing bottle': 'Bình Ước Nguyện',
  'thumbs up': 'Like Vàng',
  'love letter': 'Thư Tình',
  lotus: 'Hoa Sen',
  'finger heart': 'Tim Tay',
  'little yellow duck': 'Vịt Vàng',
  duck: 'Vịt Vàng',
  panda: 'Gấu Trúc',
  mic: 'Micro Vàng',
  'club cheers': 'Trà Sen',
  rosa: 'Hoa Rosa',
  'friendship necklace': 'Vòng Hữu Nghị',
  'little crown': 'Vương Miện Nhỏ',
  'hand hearts': 'Tim Đôi',
  'conical hat': 'Nón Lá',
  perfume: 'Nước Hoa',
  doughnut: 'Bánh Vòng',
  bouquet: 'Bó Hoa Tươi',
  mirror: 'Gương Thần',
  'paper crane': 'Hạc Giấy',
  confetti: 'Pháo Hoa',
  hearts: 'Mưa Tim',
  garland: 'Vòng Hoa',
  'money gun': 'Pháo Lộc Vàng',
  swan: 'Thiên Nga',
  galaxy: 'Dải Ngân Hà',
};

export function translateGiftName(giftName = '') {
  const raw = String(giftName || '').trim();
  if (!raw) return 'Lễ vật';
  const k = raw.toLowerCase();
  return TIKTOK_GIFT_VI[k] || raw;
}

export function giftOffering(giftName = '', total = 0) {
  const tier = giftTier(total);
  if (tier === 2) return 'phát tâm công đức';
  const s = String(giftName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
  if (tier === 1 || LAMP_RE.test(s)) return 'dâng đèn hoa đăng';
  if (INCENSE_RE.test(s)) return 'dâng hương';
  return 'dâng hoa';
}

export function createBowRules({ stage, lists, stats = null, now = Date.now, cooldownMs = 600_000, allowAllRealChat = false }) {
  const lastFree = new Map(); // uid -> ts of last free bow; gifts never touch it

  return {
    handle(e) {
      // Mock events never reach real session stats (BR-09.9, test.md scenario), but feed demoStats.
      const st = e.src === 'mock' ? null : stats;
      const granted = (n, msgs) => {
        if (msgs.length) {
          if (e.src === 'mock') stats?.noteMockBow?.(e.uid, n);
          else st?.noteBow(e.uid, n);
        }
        return msgs;
      };
      if (e.kind === 'gift') {
        const total = e.diamonds * e.repeat;
        const n = Math.min(e.repeat, 10);
        return granted(n, stage.enter(e.uid, cleanName(e.name, lists), giftTier(total), n, {
          addDiamonds: total,
          visit: true,
          src: e.src,
        }));
      }
      if (e.kind === 'join') {
        // Real viewers joining the livestream immediately enter the 3D hall and are welcomed by name
        if (e.src && e.src !== 'mock') {
          return granted(1, stage.enter(e.uid, cleanName(e.name, lists), 0, 1, {
            src: e.src,
          }));
        }
        return [];
      }
      if (e.kind !== 'chat') return [];

      const out = [];
      const t = now();
      const last = lastFree.get(e.uid);
      const isReal = Boolean(e.src && e.src !== 'mock');
      const bubble = cleanBubble(e.text, lists);
      // Real viewers who write ANY non-sensitive comment (when allowAllRealChat is enabled) or anyone matching trigger words enter the hall
      if ((isTrigger(e.text, lists) || (allowAllRealChat && isReal && bubble)) && (last === undefined || t - last >= cooldownMs)) {
        lastFree.set(e.uid, t);
        out.push(...granted(1, stage.enter(e.uid, cleanName(e.name, lists), 0, 1, {
          intent: detectIntent(e.text, lists) ?? undefined,
          src: e.src,
        })));
      }
      if (bubble) out.push(...stage.say(e.uid, bubble));
      else st?.noteFiltered();
      return out;
    },
  };
}
