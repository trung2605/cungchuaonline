const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn', 'Lâm', 'Trương'];
const DEM = ['', 'Minh ', 'Ngọc ', 'Thanh ', 'Gia ', 'Bảo ', 'Thảo ', 'Phương ', 'Quốc ', 'Hoàng ', 'Khánh ', 'Hữu ', 'Thiên ', 'Mỹ ', 'Đức ', 'Tuấn '];
const TEN = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Nhung', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Thu', 'Trang', 'Tuấn', 'Vân', 'Yến', 'Vy', 'Kiệt', 'Tùng', 'Hân', 'Ân', 'Châu', 'Đạt', 'Khoa', 'Nhi', 'Trâm'];
const NAMO = [
  'Nam mô A Di Đà Phật',
  'Nam mô A Di Đà Phật cầu bình an 🙏',
  'A Di Đà Phật cầu tài lộc may mắn',
  'Nam Mô A Di Đà Phật cầu sức khỏe cho gia đình',
  'namo a di đà phật cầu gia đạo an vui',
  'Nam mô A Di Đà Phật cầu tình duyên viên mãn',
  'A Di Đà Phật cầu học hành đỗ đạt',
  'Nam mô A Di Đà Phật cầu bình an cho cha mẹ',
  'A Di Đà Phật cầu công việc thuận lợi hanh thông',
  'Nam mô Quan Thế Âm Bồ Tát cầu gia đình mạnh khỏe',
  'A Di Đà Phật tâm thành lễ Phật cầu bình an',
  'Nam mô A Di Đà Phật cầu vạn sự cát tường',
];
const CHAT = [
  'Chào cả nhà',
  'Con chúc mọi người bình an',
  'Đẹp quá',
  'Hay quá ạ',
  'Cho con xin vía an lành',
  '🙏🙏🙏',
  'Chánh điện trang nghiêm quá',
  'Chúc cả nhà buổi tối an lành',
  'Tâm thanh tịnh',
];
// [cumulative probability, gift] — focused on 1-30 diamond TikTok gifts
const GIFTS = [
  [0.24, { giftId: 5655, giftName: 'Rose', diamonds: 1 }],
  [0.40, { giftId: 5269, giftName: 'TikTok', diamonds: 1 }],
  [0.50, { giftId: 6064, giftName: 'GG', diamonds: 1 }],
  [0.58, { giftId: 5827, giftName: 'Ice Cream Cone', diamonds: 1 }],
  [0.64, { giftId: 5999, giftName: 'Wishing Bottle', diamonds: 1 }],
  [0.73, { giftId: 5994, giftName: 'Lotus', diamonds: 2 }],
  [0.81, { giftId: 5487, giftName: 'Finger Heart', diamonds: 5 }],
  [0.87, { giftId: 5652, giftName: 'Little Yellow Duck', diamonds: 5 }],
  [0.92, { giftId: 5901, giftName: 'Rosa', diamonds: 10 }],
  [0.95, { giftId: 5659, giftName: 'Friendship Necklace', diamonds: 10 }],
  [0.97, { giftId: 5660, giftName: 'Hand Hearts', diamonds: 10 }],
  [0.99, { giftId: 5658, giftName: 'Perfume', diamonds: 20 }],
  [1.00, { giftId: 5879, giftName: 'Doughnut', diamonds: 30 }],
];

// Fake NormEvents at `rate` events/second. Supports fractional rates (e.g. 0.02 = ~1 event / 50s) and natural random jitter.
export function startMock(ingest, { rate = 5, giftRatio = 0.08, prayerRatio = 0.65, jitter = false, rng = Math.random, now = Date.now } = {}) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const users = Array.from({ length: 320 }, (_, i) => {
    const ho = HO[(i * 7 + 3) % HO.length];
    const dem = DEM[(i * 5 + 1) % DEM.length];
    const ten = TEN[(i * 11 + 2) % TEN.length];
    return {
      uid: `mock${i}`,
      name: `${ho} ${dem}${ten}`.slice(0, 16).trim(),
    };
  });

  const gRatio = Math.max(0, Math.min(0.9, Number(giftRatio) || 0.08));
  const pRatio = Math.max(0.1, Math.min(0.95, Number(prayerRatio) || 0.65));
  const chatCut = Math.max(0.1, 0.9 - gRatio);

  let lastUid = '';
  const gen = () => {
    let u = pick(users);
    if (u.uid === lastUid) u = pick(users);
    lastUid = u.uid;
    const { uid, name } = u;
    const ts = now();
    const r = rng();
    if (r < chatCut * 0.68) return { kind: 'chat', src: 'mock', uid, name, text: pick(rng() < pRatio ? NAMO : CHAT), ts };
    if (r < chatCut) return { kind: 'like', src: 'mock', uid, name, count: 1 + Math.floor(rng() * 18), ts };
    if (r < chatCut + gRatio) {
      const g = rng();
      const gift = GIFTS.find(([p]) => g < p)[1];
      const maxRepeat = gift.diamonds >= 10 ? 2 : 4;
      return { kind: 'gift', src: 'mock', uid, name, ...gift, repeat: 1 + Math.floor(rng() * maxRepeat), ts };
    }
    return { kind: 'join', src: 'mock', uid, name, ts };
  };

  if (jitter) {
    let stopped = false;
    let timeoutId = null;
    const baseMs = 1000 / Math.max(0.01, rate);
    const scheduleNext = () => {
      if (stopped) return;
      // Natural human timing: mix of short bursts (0.25x) and quiet pauses (up to 2.2x)
      const factor = 0.25 + rng() * 1.15 + (rng() < 0.3 ? rng() * 0.85 : 0);
      const delayMs = Math.max(80, Math.round(baseMs * factor));
      timeoutId = setTimeout(() => {
        if (stopped) return;
        ingest(gen());
        scheduleNext();
      }, delayMs);
    };
    scheduleNext();
    return () => {
      stopped = true;
      clearTimeout(timeoutId);
    };
  }

  // Deterministic mode for unit tests (TC-01.7 / TC-01.8)
  const start = now();
  let sent = 0;
  const timer = setInterval(() => {
    const due = Math.floor(((now() - start) * rate) / 1000);
    while (sent < due) { sent++; ingest(gen()); }
  }, Math.max(1000 / rate, 50));
  return () => clearInterval(timer);
}
