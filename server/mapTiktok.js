// Raw tiktok-live-connector@2.5.0 event (proto v3 shape) -> NormEvent | null.
export function mapTiktok(name, data, now = Date.now()) {
  const base = { src: 'tiktok' };
  const who = () => {
    const uid = data.user?.displayId || data.user?.id || '';
    return { uid, name: data.user?.nickname || uid };
  };

  switch (name) {
    case 'chat':
      return { kind: 'chat', ...base, ...who(), text: data.content ?? '', ts: now };
    case 'like':
      return { kind: 'like', ...base, ...who(), count: data.count || 1, ts: now };
    case 'member':
      return { kind: 'join', ...base, ...who(), ts: now };
    case 'roomUser':
      return { kind: 'viewers', ...base, count: Number(data.total) || 0, ts: now };
    case 'streamEnd':
      return { kind: 'end', ...base, ts: now };
    case 'gift': {
      // Combo gifts (type 1) stream one message per tick; only the last one counts.
      const combo = data.gift?.type === 1;
      if (combo && !data.repeatEnd) return null;
      return {
        kind: 'gift', ...base, ...who(),
        giftId: Number(data.giftId || data.gift?.id),
        giftName: data.gift?.name ?? data.extendedGiftInfo?.name ?? '',
        diamonds: data.gift?.diamondCount ?? data.extendedGiftInfo?.diamond_count ?? 0,
        repeat: combo ? data.repeatCount : data.repeatCount || 1,
        ts: now,
      };
    }
    default:
      return null;
  }
}
