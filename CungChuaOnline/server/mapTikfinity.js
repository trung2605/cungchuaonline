import { mapTiktok } from './mapTiktok.js';

// TikFinity WS message {event, data} -> NormEvent | null.
// Format unverified (Q-10.1): accepts the connector's nested shape as-is and
// lifts the flat v1 shape (uniqueId, comment, giftType...) into it.
const nest = d => d.user ? d : {
  ...d,
  user: { id: d.userId, displayId: d.uniqueId, nickname: d.nickname },
  content: d.content ?? d.comment,
  count: d.count ?? d.likeCount,
  total: d.total ?? d.viewerCount,
  gift: d.gift ?? { id: d.giftId, name: d.giftName, diamondCount: d.diamondCount, type: d.giftType },
};

export function mapTikfinity(msg, now = Date.now()) {
  if (!msg?.event || !msg.data) return null;
  const e = mapTiktok(msg.event, nest(msg.data), now);
  return e && { ...e, src: 'tikfinity' };
}
