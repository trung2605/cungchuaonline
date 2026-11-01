const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const TEN = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Nhung', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Thu', 'Trang', 'Tuấn', 'Vân', 'Yến'];
const NAMO = [
  'Nam mô A Di Đà Phật',
  'Nam mô A Di Đà Phật cầu bình an 🙏',
  'A Di Đà Phật cầu tài lộc may mắn',
  'Nam Mô A Di Đà Phật cầu sức khỏe cho gia đình',
  'namo a di đà phật cầu gia đạo an vui',
  'Nam mô A Di Đà Phật cầu tình duyên viên mãn',
  'A Di Đà Phật cầu học hành đỗ đạt',
];
const CHAT = ['Chào cả nhà', 'Con chúc mọi người bình an', 'Đẹp quá', 'Hay quá ạ', 'Cho con xin vía an lành', '🙏🙏🙏'];
// [cumulative probability, gift] — synchronized with real TikTok LIVE gift catalog
const GIFTS = [
  [0.42, { giftId: 5655, giftName: 'Rose', diamonds: 1 }],
  [0.62, { giftId: 5269, giftName: 'TikTok', diamonds: 1 }],
  [0.74, { giftId: 5901, giftName: 'Lotus', diamonds: 2 }],
  [0.85, { giftId: 5487, giftName: 'Finger Heart', diamonds: 5 }],
  [0.91, { giftId: 5658, giftName: 'Perfume', diamonds: 20 }],
  [0.95, { giftId: 5879, giftName: 'Doughnut', diamonds: 30 }],
  [0.98, { giftId: 5659, giftName: 'Paper Crane', diamonds: 99 }],
  [0.992, { giftId: 6012, giftName: 'Garland', diamonds: 299 }],
  [1.00, { giftId: 11046, giftName: 'Galaxy', diamonds: 1000 }],
];

// Fake NormEvents at `rate` events/second. Returns stop().
export function startMock(ingest, { rate = 5, giftRatio = 0.08, prayerRatio = 0.65, rng = Math.random, now = Date.now } = {}) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const users = Array.from({ length: 200 }, (_, i) => ({
    uid: `mock${i}`,
    name: `${HO[i % HO.length]} ${TEN[Math.floor(i / HO.length) % TEN.length]}`,
  }));

  const gRatio = Math.max(0, Math.min(0.9, Number(giftRatio) || 0.08));
  const pRatio = Math.max(0.1, Math.min(0.95, Number(prayerRatio) || 0.65));
  const chatCut = Math.max(0.1, 0.9 - gRatio);

  const gen = () => {
    const { uid, name } = pick(users);
    const ts = now();
    const r = rng();
    if (r < chatCut * 0.68) return { kind: 'chat', src: 'mock', uid, name, text: pick(rng() < pRatio ? NAMO : CHAT), ts };
    if (r < chatCut) return { kind: 'like', src: 'mock', uid, name, count: 1 + Math.floor(rng() * 15), ts };
    if (r < chatCut + gRatio) {
      const g = rng();
      const gift = GIFTS.find(([p]) => g < p)[1];
      return { kind: 'gift', src: 'mock', uid, name, ...gift, repeat: 1 + Math.floor(rng() * 3), ts };
    }
    return { kind: 'join', src: 'mock', uid, name, ts };
  };

  // Windows timers are coarse (~15 ms), so emit however many events the elapsed time owes.
  const start = now();
  let sent = 0;
  const timer = setInterval(() => {
    const due = Math.floor(((now() - start) * rate) / 1000);
    while (sent < due) { sent++; ingest(gen()); }
  }, Math.max(1000 / rate, 50));
  return () => clearInterval(timer);
}
