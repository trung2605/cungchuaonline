// Raw tiktok-live-connector@2.5.0 event (proto v3 shape) -> NormEvent | null.
const KNOWN_GIFTS = {
  5655: { name: 'Rose', diamonds: 1 },
  5269: { name: 'TikTok', diamonds: 1 },
  6064: { name: 'GG', diamonds: 1 },
  7934: { name: 'Heart Me', diamonds: 1 },
  5827: { name: 'Ice Cream Cone', diamonds: 1 },
  5650: { name: 'Wishing Bottle', diamonds: 1 },
  5994: { name: 'Lotus', diamonds: 2 },
  5487: { name: 'Finger Heart', diamonds: 5 },
  5652: { name: 'Little Yellow Duck', diamonds: 5 },
  5659: { name: 'Panda', diamonds: 5 },
  5901: { name: 'Rosa', diamonds: 10 },
  8913: { name: 'Friendship Necklace', diamonds: 10 },
  5660: { name: 'Hand Hearts', diamonds: 10 },
  6093: { name: 'Conical Hat', diamonds: 15 },
  5658: { name: 'Perfume', diamonds: 20 },
  5879: { name: 'Doughnut', diamonds: 30 },
  6427: { name: 'Bouquet', diamonds: 30 },
  5657: { name: 'Paper Crane', diamonds: 99 },
};

export function mapTiktok(name, data, now = Date.now()) {
  const base = { src: 'tiktok' };
  const who = () => {
    const uid = data.user?.displayId || data.user?.uniqueId || data.user?.id || data.uniqueId || '';
    return { uid: String(uid), name: data.user?.nickname || data.nickname || String(uid) };
  };

  switch (name) {
    case 'chat':
      return { kind: 'chat', ...base, ...who(), text: data.content ?? data.comment ?? '', ts: now };
    case 'like':
      return { kind: 'like', ...base, ...who(), count: Number(data.count || data.likeCount) || 1, ts: now };
    case 'member':
      return { kind: 'join', ...base, ...who(), ts: now };
    case 'roomUser':
      return { kind: 'viewers', ...base, count: Number(data.total || data.viewerCount) || 0, ts: now };
    case 'streamEnd':
      return { kind: 'end', ...base, ts: now };
    case 'gift': {
      // Combo gifts (type 1) stream one message per tick; only the last one counts.
      const giftType = data.gift?.type ?? data.giftType ?? data.giftDetails?.giftType;
      const combo = giftType === 1;
      if (combo && !data.repeatEnd) return null;
      const giftId = Number(data.giftId || data.gift?.id || data.giftDetails?.giftId || 0);
      const known = KNOWN_GIFTS[giftId];
      const giftName = data.gift?.name ?? data.giftName ?? data.giftDetails?.giftName ?? data.extendedGiftInfo?.name ?? known?.name ?? '';
      const rawDiamonds = Number(data.gift?.diamondCount ?? data.diamondCount ?? data.giftDetails?.diamondCount ?? data.extendedGiftInfo?.diamond_count ?? known?.diamonds ?? 0);
      const diamonds = rawDiamonds > 0 ? rawDiamonds : (giftId > 0 || giftName ? 1 : 0);
      return {
        kind: 'gift', ...base, ...who(),
        giftId,
        giftName,
        diamonds,
        repeat: Number(combo ? data.repeatCount : data.repeatCount || 1) || 1,
        // One id per send (a whole combo streak shares it); '0' means unknown.
        group: data.groupId && data.groupId !== '0' ? String(data.groupId) : '',
        ts: now,
      };
    }
    default:
      return null;
  }
}
