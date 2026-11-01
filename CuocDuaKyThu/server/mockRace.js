const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const TEN = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Vân', 'Yến'];

const CHEERS = [
  'Cho mình tham gia cuộc đua với!',
  'Tăng tốc vượt lên dẫn đầu nào anh em ơi 🔥',
  'Đẹp quá, đang chạy qua kỳ quan thế giới!',
  'Quyết tâm lấy Top 1 chặng này 🏁',
  'Đua vui quá cả nhà ơi, thả tim mở Turbo nào!',
  'Chạy xuyên lục địa cùng mọi người vui ghê 🚀',
  'Việt Nam vô địch, bứt tốc thôi!',
  'Cố lên anh em ơi sắp sang điểm đến mới rồi!',
];

const GIFTS = [
  [0.45, { giftId: 5655, giftName: 'Rose', diamonds: 1 }],
  [0.65, { giftId: 5269, giftName: 'TikTok', diamonds: 1 }],
  [0.80, { giftId: 5487, giftName: 'Finger Heart', diamonds: 5 }],
  [0.90, { giftId: 5879, giftName: 'Doughnut', diamonds: 30 }],
  [0.95, { giftId: 5659, giftName: 'Paper Crane', diamonds: 99 }],
  [0.985, { giftId: 6012, giftName: 'Garland', diamonds: 299 }],
  [1.00, { giftId: 11046, giftName: 'Galaxy', diamonds: 1000 }],
];

export function startMockRace(ingest, { rate = 3, giftRatio = 0.14, rng = Math.random, now = Date.now } = {}) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const users = Array.from({ length: 120 }, (_, i) => ({
    uid: `racer_${i}`,
    name: `${HO[i % HO.length]} ${TEN[Math.floor(i / HO.length) % TEN.length]}`,
  }));

  const gRatio = Math.max(0, Math.min(0.85, Number(giftRatio) || 0.14));
  const chatCut = Math.max(0.2, 0.85 - gRatio);

  const gen = () => {
    const { uid, name } = pick(users);
    const ts = now();
    const r = rng();
    if (r < chatCut * 0.62) {
      return { kind: 'chat', src: 'mock', uid, name, text: pick(CHEERS), ts };
    }
    if (r < chatCut) {
      return { kind: 'like', src: 'mock', uid, name, count: 2 + Math.floor(rng() * 14), ts };
    }
    if (r < chatCut + gRatio) {
      const g = rng();
      const gift = GIFTS.find(([p]) => g < p)[1];
      return { kind: 'gift', src: 'mock', uid, name, ...gift, repeat: 1 + Math.floor(rng() * 3), ts };
    }
    return { kind: 'join', src: 'mock', uid, name, ts };
  };

  const start = now();
  let sent = 0;
  const timer = setInterval(() => {
    const due = Math.floor(((now() - start) * rate) / 1000);
    while (sent < due) {
      sent++;
      ingest(gen());
    }
  }, Math.max(1000 / rate, 60));

  return () => clearInterval(timer);
}
