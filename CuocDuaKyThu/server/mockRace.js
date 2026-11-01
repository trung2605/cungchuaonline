const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const TEN = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Vân', 'Yến'];

const CHEERS = [
  'Cùng đi bộ xuyên Việt khám phá 63 tỉnh thành!',
  'Việt Nam quê hương ta tươi đẹp quá cả nhà ơi 🇻🇳',
  'Đi bộ vãn cảnh từ Hà Giang tới Mũi Cà Mau!',
  'Chúc đại chúng bình an trên hành trình xuyên Việt 🙏',
  'Cảnh đẹp non sông gấm vóc Việt Nam tuyệt vời quá!',
  'Cố lên cả đoàn ơi, sắp qua cột mốc tỉnh mới rồi!',
  'Việt Nam muôn năm, cùng bước đều khám phá non sông!',
  'Tặng quà cưỡi Xe Cub Phượt xuyên Việt vui ghê 🛵',
];

const GIFTS = [
  [0.25, { giftId: 5655, giftName: 'Rose', diamonds: 1 }],
  [0.42, { giftId: 5269, giftName: 'TikTok', diamonds: 1 }],
  [0.52, { giftId: 6064, giftName: 'GG', diamonds: 1 }],
  [0.60, { giftId: 5827, giftName: 'Ice Cream Cone', diamonds: 1 }],
  [0.70, { giftId: 5994, giftName: 'Lotus', diamonds: 2 }],
  [0.80, { giftId: 5487, giftName: 'Finger Heart', diamonds: 5 }],
  [0.86, { giftId: 5652, giftName: 'Little Yellow Duck', diamonds: 5 }],
  [0.91, { giftId: 5901, giftName: 'Rosa', diamonds: 10 }],
  [0.95, { giftId: 5660, giftName: 'Hand Hearts', diamonds: 10 }],
  [0.98, { giftId: 5658, giftName: 'Perfume', diamonds: 20 }],
  [1.00, { giftId: 5879, giftName: 'Doughnut', diamonds: 30 }],
];

export function startMockRace(ingest, { rate = 3, giftRatio = 0.14, jitter = false, rng = Math.random, now = Date.now } = {}) {
  const DEM = ['', 'Minh ', 'Ngọc ', 'Thanh ', 'Gia ', 'Bảo ', 'Thảo ', 'Phương ', 'Quốc ', 'Hoàng ', 'Khánh ', 'Hữu '];
  const pick = a => a[Math.floor(rng() * a.length)];
  const users = Array.from({ length: 240 }, (_, i) => ({
    uid: `racer_${i}`,
    name: `${HO[(i * 7 + 3) % HO.length]} ${DEM[(i * 5 + 1) % DEM.length]}${TEN[(i * 11 + 2) % TEN.length]}`.slice(0, 16).trim(),
  }));

  const gRatio = Math.max(0, Math.min(0.85, Number(giftRatio) || 0.14));
  const chatCut = Math.max(0.2, 0.85 - gRatio);

  let lastUid = '';
  const gen = () => {
    let u = pick(users);
    if (u.uid === lastUid) u = pick(users);
    lastUid = u.uid;
    const { uid, name } = u;
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
