const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const TEN = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Nhung', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Thu', 'Trang', 'Tuấn', 'Vân', 'Yến'];
const NAMO = ['Nam mô A Di Đà Phật', 'nam mo a di da phat', 'Nam Mô A Di Đà Phật 🙏', 'namo a di đà phật', 'A Di Đà Phật'];
const CHAT = ['Chào cả nhà', 'Con chúc mọi người bình an', 'Đẹp quá', 'Hay quá ạ', 'Cho con xin vía an lành', '🙏🙏🙏'];
// [cumulative probability, gift]
const GIFTS = [
  [0.80, { giftId: 5655, giftName: 'Rose', diamonds: 1 }],
  [0.90, { giftId: 5487, giftName: 'Finger Heart', diamonds: 5 }],
  [0.97, { giftId: 5879, giftName: 'Doughnut', diamonds: 30 }],
  [1.00, { giftId: 11046, giftName: 'Galaxy', diamonds: 1000 }],
];

// Fake NormEvents at `rate` events/second. Returns stop().
export function startMock(ingest, { rate = 5, rng = Math.random, now = Date.now } = {}) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const users = Array.from({ length: 200 }, (_, i) => ({
    uid: `mock${i}`,
    name: `${HO[i % HO.length]} ${TEN[Math.floor(i / HO.length) % TEN.length]}`,
  }));

  const gen = () => {
    const { uid, name } = pick(users);
    const ts = now();
    const r = rng();
    if (r < 0.6) return { kind: 'chat', src: 'mock', uid, name, text: pick(rng() < 0.5 ? NAMO : CHAT), ts };
    if (r < 0.9) return { kind: 'like', src: 'mock', uid, name, count: 1 + Math.floor(rng() * 15), ts };
    if (r < 0.98) {
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
