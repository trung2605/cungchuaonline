// RaceStage: manages 3D walkers on the Cross-Vietnam Walking Journey ("Hành Trình Đi Bộ Xuyên Việt 63 Tỉnh Thành"),
// their speed multipliers, boost tiers, accumulated distance, current Vietnamese landmark biome, and province milestone.

export const VN_PROVINCES_63 = [
  // Đông Bắc & Tây Bắc (1–14)
  { code: 1, name: 'Hà Giang', landmark: 'Đèo Mã Pí Lèng & Cột Cờ Lũng Cú', biomeId: 'vn_hagiang' },
  { code: 2, name: 'Cao Bằng', landmark: 'Thác Bản Giốc & Suối Lê Nin', biomeId: 'vn_hagiang' },
  { code: 3, name: 'Bắc Kạn', landmark: 'Hồ Ba Bể Xanh Ngọc', biomeId: 'vn_hagiang' },
  { code: 4, name: 'Lạng Sơn', landmark: 'Đỉnh Mẫu Sơn & Thành Nhà Mạc', biomeId: 'vn_hagiang' },
  { code: 5, name: 'Tuyên Quang', landmark: 'Khu Sinh Thái Na Hang', biomeId: 'vn_hagiang' },
  { code: 6, name: 'Thái Nguyên', landmark: 'Đồi Chè Tân Cương & Hồ Núi Cốc', biomeId: 'vn_hagiang' },
  { code: 7, name: 'Lào Cai', landmark: 'Đỉnh Fansipan & Ruộng Bậc Thang Sa Pa', biomeId: 'vn_sapa' },
  { code: 8, name: 'Yên Bái', landmark: 'Ruộng Bậc Thang Mù Cang Chải', biomeId: 'vn_sapa' },
  { code: 9, name: 'Lai Châu', landmark: 'Đèo Ô Quy Hồ & Đỉnh Pu Ta Leng', biomeId: 'vn_sapa' },
  { code: 10, name: 'Điện Biên', landmark: 'Đèo Pha Đin & Cánh Đồng Mường Thanh', biomeId: 'vn_sapa' },
  { code: 11, name: 'Sơn La', landmark: 'Cao Nguyên Mộc Châu Mùa Hoa Cải', biomeId: 'vn_sapa' },
  { code: 12, name: 'Hòa Bình', landmark: 'Thung Nai & Bản Lác Mai Châu', biomeId: 'vn_sapa' },
  { code: 13, name: 'Phú Thọ', landmark: 'Đền Hùng Đất Tổ Vua Hùng', biomeId: 'vn_hanoi' },
  { code: 14, name: 'Vĩnh Phúc', landmark: 'Đỉnh Tam Đảo Mờ Sương', biomeId: 'vn_hanoi' },

  // Đồng Bằng Sông Hồng & Duyên Hải Bắc Bộ (15–25)
  { code: 15, name: 'Quảng Ninh', landmark: 'Kỳ Quan Vịnh Hạ Long & Yên Tử', biomeId: 'vn_halong' },
  { code: 16, name: 'Hải Phòng', landmark: 'Đảo Cát Bà & Đồ Sơn Hoa Phượng Đỏ', biomeId: 'vn_halong' },
  { code: 17, name: 'Bắc Giang', landmark: 'Tây Yên Tử & Đồi Vải Lục Ngạn', biomeId: 'vn_halong' },
  { code: 18, name: 'Bắc Ninh', landmark: 'Miền Quan Họ & Chùa Dâu Cổ Kính', biomeId: 'vn_halong' },
  { code: 19, name: 'Hải Dương', landmark: 'Côn Sơn Kiếp Bạc', biomeId: 'vn_halong' },
  { code: 20, name: 'Hưng Yên', landmark: 'Phố Hiến Cổ Kính & Đầm Sen', biomeId: 'vn_halong' },
  { code: 21, name: 'Thủ Đô Hà Nội', landmark: 'Hồ Gươm, Cầu Thê Húc & 36 Phố Phường', biomeId: 'vn_hanoi' },
  { code: 22, name: 'Hà Nam', landmark: 'Quần Thể Chùa Tam Chúc', biomeId: 'vn_ninhbinh' },
  { code: 23, name: 'Thái Bình', landmark: 'Chùa Keo & Biển Cồn Vành', biomeId: 'vn_ninhbinh' },
  { code: 24, name: 'Nam Định', landmark: 'Đền Trần & Phủ Dầy Cổ Kính', biomeId: 'vn_ninhbinh' },
  { code: 25, name: 'Ninh Bình', landmark: 'Danh Thắng Tràng An & Chùa Bái Đính', biomeId: 'vn_ninhbinh' },

  // Bắc Trung Bộ & Cố Đô Huế (26–31)
  { code: 26, name: 'Thanh Hóa', landmark: 'Thành Nhà Hồ & Biển Sầm Sơn', biomeId: 'vn_ninhbinh' },
  { code: 27, name: 'Nghệ An', landmark: 'Làng Sen Quê Bác & Biển Cửa Lò', biomeId: 'vn_ninhbinh' },
  { code: 28, name: 'Hà Tĩnh', landmark: 'Chùa Hương Tích & Núi Hồng Sông La', biomeId: 'vn_ninhbinh' },
  { code: 29, name: 'Quảng Bình', landmark: 'Hang Sơn Đoòng & Động Phong Nha', biomeId: 'vn_hue' },
  { code: 30, name: 'Quảng Trị', landmark: 'Cầu Hiền Lương Sông Bến Hải', biomeId: 'vn_hue' },
  { code: 31, name: 'Thừa Thiên Huế', landmark: 'Kinh Thành Huế, Ngọ Môn & Cầu Trường Tiền', biomeId: 'vn_hue' },

  // Đà Nẵng, Hội An & Duyên Hải Nam Trung Bộ (32–39)
  { code: 32, name: 'Đà Nẵng', landmark: 'Cầu Vàng Bà Nà Hills & Cầu Rồng Sông Hàn', biomeId: 'vn_danang' },
  { code: 33, name: 'Quảng Nam', landmark: 'Phố Cổ Hội An & Thánh Địa Mỹ Sơn', biomeId: 'vn_hoian' },
  { code: 34, name: 'Quảng Ngãi', landmark: 'Đảo Lý Sơn & Núi Ấn Sông Trà', biomeId: 'vn_hoian' },
  { code: 35, name: 'Bình Định', landmark: 'Eo Gió Kỳ Co Quy Nhơn & Tháp Đôi', biomeId: 'vn_hoian' },
  { code: 36, name: 'Phú Yên', landmark: 'Ghềnh Đá Đĩa & Hoa Vàng Trên Cỏ Xanh', biomeId: 'vn_hoian' },
  { code: 37, name: 'Khánh Hòa', landmark: 'Vịnh Nha Trang & Tháp Bà Ponagar', biomeId: 'vn_nhatrang' },
  { code: 38, name: 'Ninh Thuận', landmark: 'Vịnh Vĩnh Hy & Tháp Chăm Po Klong Garai', biomeId: 'vn_nhatrang' },
  { code: 39, name: 'Bình Thuận', landmark: 'Đồi Cát Bay Mũi Né & Hải Đăng Kê Gà', biomeId: 'vn_nhatrang' },

  // Tây Nguyên Đại Ngàn (40–44)
  { code: 40, name: 'Kon Tum', landmark: 'Nhà Rông Ba Na & Cầu Treo Kon Klor', biomeId: 'vn_dalat' },
  { code: 41, name: 'Gia Lai', landmark: 'Biển Hồ T’Nưng Đôi Mắt Pleiku', biomeId: 'vn_dalat' },
  { code: 42, name: 'Đắk Lắk', landmark: 'Buôn Ma Thuột & Thác Dray Nur', biomeId: 'vn_dalat' },
  { code: 43, name: 'Đắk Nông', landmark: 'Hồ Tà Đùng Vịnh Hạ Long Tây Nguyên', biomeId: 'vn_dalat' },
  { code: 44, name: 'Lâm Đồng', landmark: 'Quảng Trường Lâm Viên & Rừng Thông Đà Lạt', biomeId: 'vn_dalat' },

  // Đông Nam Bộ & TP. Hồ Chí Minh (45–50)
  { code: 45, name: 'Bình Phước', landmark: 'Vườn Quốc Gia Bù Gia Mập & Sóc Bom Bo', biomeId: 'vn_saigon' },
  { code: 46, name: 'Tây Ninh', landmark: 'Đỉnh Núi Bà Đen Nóc Nhà Nam Bộ', biomeId: 'vn_saigon' },
  { code: 47, name: 'Bình Dương', landmark: 'Chùa Hội Khánh & Làng Gốm Lái Thiêu', biomeId: 'vn_saigon' },
  { code: 48, name: 'Đồng Nai', landmark: 'Khu Du Lịch Bửu Long & Rừng Nam Cát Tiên', biomeId: 'vn_saigon' },
  { code: 49, name: 'Bà Rịa – Vũng Tàu', landmark: 'Hải Đăng Vũng Tàu & Biển Hồ Tràm', biomeId: 'vn_saigon' },
  { code: 50, name: 'TP. Hồ Chí Minh', landmark: 'Bến Nhà Rồng, Chợ Bến Thành & Landmark 81', biomeId: 'vn_saigon' },

  // Miền Tây Sông Nước Đồng Bằng Sông Cửu Long (51–63)
  { code: 51, name: 'Long An', landmark: 'Làng Nổi Tân Lập Rừng Tràm Xanh', biomeId: 'vn_mientay' },
  { code: 52, name: 'Tiền Giang', landmark: 'Cù Lao Thới Sơn & Chợ Nổi Cái Bè', biomeId: 'vn_mientay' },
  { code: 53, name: 'Bến Tre', landmark: 'Xứ Dừa Xanh Mát & Cồn Phụng', biomeId: 'vn_mientay' },
  { code: 54, name: 'Trà Vinh', landmark: 'Ao Bà Om & Chùa Âng Khmer Cổ Kính', biomeId: 'vn_mientay' },
  { code: 55, name: 'Vĩnh Long', landmark: 'Cù Lao An Bình & Vương Quốc Gốm Đỏ', biomeId: 'vn_mientay' },
  { code: 56, name: 'Đồng Tháp', landmark: 'Đồng Sen Tháp Mười & Làng Hoa Sa Đéc', biomeId: 'vn_mientay' },
  { code: 57, name: 'An Giang', landmark: 'Rừng Tràm Trà Sư & Núi Cấm Thất Sơn', biomeId: 'vn_mientay' },
  { code: 58, name: 'Kiên Giang', landmark: 'Đảo Ngọc Phú Quốc & Hà Tiên Thập Cảnh', biomeId: 'vn_mientay' },
  { code: 59, name: 'TP. Cần Thơ', landmark: 'Bến Ninh Kiều & Chợ Nổi Cái Răng', biomeId: 'vn_mientay' },
  { code: 60, name: 'Hậu Giang', landmark: 'Khu Bảo Tồn Lung Ngọc Hoàng', biomeId: 'vn_mientay' },
  { code: 61, name: 'Sóc Trăng', landmark: 'Chùa Dơi & Chợ Nổi Ngã Năm', biomeId: 'vn_mientay' },
  { code: 62, name: 'Bạc Liêu', landmark: 'Cánh Đồng Điện Gió & Nhà Công Tử Bạc Liêu', biomeId: 'vn_mientay' },
  { code: 63, name: 'Cà Mau', landmark: 'Cột Mốc Tọa Độ Quốc Gia Đất Mũi Cà Mau', biomeId: 'vn_mientay' },
];

export const BIOMES = [
  {
    id: 'vn_hagiang',
    name: 'Đèo Mã Pí Lèng & Cột Cờ Lũng Cú – Hà Giang 🇻🇳',
    sub: 'Cung đường đèo chữ S hùng vĩ & hoa tam giác mạch nở rộ',
    region: 'Đông Bắc Bộ (Tỉnh 1–6/63)',
    trailStyle: 'winding_pass',
    lengthM: 600,
  },
  {
    id: 'vn_sapa',
    name: 'Đỉnh Fansipan & Ruộng Bậc Thang – Sa Pa, Tây Bắc 🇻🇳',
    sub: 'Đường bờ lúa chín vàng óng uốn lượn giữa biển mây Tây Bắc',
    region: 'Tây Bắc Bộ (Tỉnh 7–12/63)',
    trailStyle: 'terraced_ridge',
    lengthM: 600,
  },
  {
    id: 'vn_halong',
    name: 'Kỳ Quan Vịnh Hạ Long – Quảng Ninh & Hải Phòng 🇻🇳',
    sub: 'Cung đường ven vịnh biển ngọc bích & Hòn Trống Mái kỳ vĩ',
    region: 'Duyên Hải Bắc Bộ (Tỉnh 15–20/63)',
    trailStyle: 'bay_boardwalk',
    lengthM: 600,
  },
  {
    id: 'vn_hanoi',
    name: 'Hồ Gươm, Cầu Thê Húc & Phố Cổ – Thủ Đô Hà Nội 🇻🇳',
    sub: 'Nhịp cầu gỗ đỏ uốn vòm qua mặt hồ & Tháp Rùa ngàn năm văn hiến',
    region: 'Đồng Bằng Sông Hồng (Tỉnh 13–14, 21/63)',
    trailStyle: 'arch_red_bridge',
    lengthM: 600,
  },
  {
    id: 'vn_ninhbinh',
    name: 'Danh Thắng Tràng An & Chùa Bái Đính – Ninh Bình 🇻🇳',
    sub: 'Đường đá cổ rêu phong xuyên đầm sen hồng & non nước cố đô',
    region: 'Nam Đồng Bằng & Bắc Trung Bộ (Tỉnh 22–28/63)',
    trailStyle: 'lotus_stone_causeway',
    lengthM: 600,
  },
  {
    id: 'vn_hue',
    name: 'Kinh Thành Huế, Ngọ Môn & Sông Hương – Cố Đô Huế 🇻🇳',
    sub: 'Đường gạch Bát Tràng lát xéo cung đình & Cầu Trường Tiền',
    region: 'Bắc Trung Bộ (Tỉnh 29–31/63)',
    trailStyle: 'imperial_diagonal',
    lengthM: 600,
  },
  {
    id: 'vn_danang',
    name: 'Cầu Vàng Bà Nà Hills & Cầu Rồng – Đà Nẵng 🇻🇳',
    sub: 'Cung đường vàng cánh cung trên đôi bàn tay đá khổng lồ giữa mây',
    region: 'Trung Trung Bộ (Tỉnh 32/63)',
    trailStyle: 'golden_bridge_arc',
    lengthM: 600,
  },
  {
    id: 'vn_hoian',
    name: 'Phố Cổ Hội An & Chùa Cầu Hoa Đăng – Quảng Nam 🇻🇳',
    sub: 'Đường cổ ven sông Hoài rực rỡ ngàn đèn lồng lụa & giàn hoa giấy',
    region: 'Duyên Hải Miền Trung (Tỉnh 33–36/63)',
    trailStyle: 'lantern_riverside',
    lengthM: 600,
  },
  {
    id: 'vn_dalat',
    name: 'Quảng Trường Lâm Viên & Rừng Thông – Đà Lạt, Tây Nguyên 🇻🇳',
    sub: 'Đường dốc thông uốn lượn sương mù, Nụ Atiso & Nhà Rông đại ngàn',
    region: 'Tây Nguyên (Tỉnh 40–44/63)',
    trailStyle: 'pine_slope_curve',
    lengthM: 600,
  },
  {
    id: 'vn_nhatrang',
    name: 'Tháp Bà Ponagar & Vịnh Biển Xanh – Nha Trang, Mũi Né 🇻🇳',
    sub: 'Cung đường cát trắng ôm bờ biển sóng vỗ & rặng dừa nghiêng bóng',
    region: 'Nam Trung Bộ (Tỉnh 37–39/63)',
    trailStyle: 'coastal_sand_curve',
    lengthM: 600,
  },
  {
    id: 'vn_saigon',
    name: 'Bến Nhà Rồng, Chợ Bến Thành & Landmark 81 – TP.HCM 🇻🇳',
    sub: 'Đại lộ đá hoa cương Phố đi bộ Nguyễn Huệ & nhạc nước rực sáng',
    region: 'Đông Nam Bộ (Tỉnh 45–50/63)',
    trailStyle: 'saigon_promenade',
    lengthM: 600,
  },
  {
    id: 'vn_mientay',
    name: 'Chợ Nổi Cái Răng Cần Thơ & Đất Mũi Cà Mau – Miền Tây 🇻🇳',
    sub: 'Cầu ván gỗ uốn lượn giữa ghe bầu trái cây & cột mốc cực Nam Tổ quốc',
    region: 'Đồng Bằng Sông Cửu Long (Tỉnh 51–63/63)',
    trailStyle: 'mekong_wooden_plank',
    lengthM: 600,
  },
];

// Optional international biomes preserved so Admin or API calls can still switch to them if desired
export const WORLD_BIOMES = [
  { id: 'vietnam', name: 'Vịnh Hạ Long & Phố Cổ Việt Nam 🇻🇳', sub: 'Kỳ quan thiên nhiên & đèn lồng rực rỡ', trailStyle: 'lantern_riverside', lengthM: 600 },
  { id: 'japan', name: 'Núi Phú Sĩ & Cổng Torii Nhật Bản 🇯🇵', sub: 'Mùa hoa anh đào dưới chân núi tuyết', trailStyle: 'arch_red_bridge', lengthM: 600 },
  { id: 'egypt', name: 'Kim Tự Tháp Giza Ai Cập 🇪🇬', sub: 'Hành trình xuyên sa mạc vàng cổ đại', trailStyle: 'winding_pass', lengthM: 600 },
  { id: 'france', name: 'Tháp Eiffel Paris Pháp 🇫🇷', sub: 'Kinh đô ánh sáng bên dòng sông Seine', trailStyle: 'saigon_promenade', lengthM: 600 },
  { id: 'usa', name: 'Tượng Nữ Thần Tự Do & Cầu Cổng Vàng 🇺🇸', sub: 'Đại lộ nhịp sống hiện đại rực sáng', trailStyle: 'golden_bridge_arc', lengthM: 600 },
  { id: 'cosmos', name: 'Cung Đường Ngân Hà Vũ Trụ 🌌', sub: 'Đường đua cầu vồng xuyên qua các vì sao', trailStyle: 'golden_bridge_arc', lengthM: 600 },
];

export const ALL_BIOMES = [...BIOMES, ...WORLD_BIOMES];

export function getProvinceForState(worldDistanceM = 0, biomeId = '') {
  const biomeProvinces = VN_PROVINCES_63.filter(p => p.biomeId === biomeId);
  if (biomeProvinces.length > 0) {
    const localStep = Math.floor((worldDistanceM % 600) / Math.max(1, Math.floor(600 / biomeProvinces.length)));
    return biomeProvinces[Math.min(biomeProvinces.length - 1, localStep)];
  }
  const idx = Math.floor(worldDistanceM / 95) % VN_PROVINCES_63.length;
  return VN_PROVINCES_63[idx];
}

// Gift tier mapping for Hành Trình Đi Bộ Xuyên Việt:
// Tier 0: Free join / comment / like (Runner, 1.0x speed, TTL 90s)
// Tier 1: 1-9 💎 (Đôi Cánh Chim Lạc, 1.8x speed for 10s, +80m/gift, TTL 150s)
// Tier 2: 10-99 💎 (Xe Cub Phượt Xuyên Việt, 2.8x speed for 18s, +350m/gift, TTL 240s)
// Tier 3: 100-999 💎 (Chiến Mã Thánh Gióng, 4.2x speed for 28s, +1500m/gift, TTL 360s)
// Tier 4: 1000+ 💎 (Rồng Vàng Lạc Long Quân, 6.5x speed for 45s, +10000m/gift, TTL 600s)
export const RACE_TTL = { 0: 300_000, 1: 600_000, 2: 900_000, 3: 1_500_000, 4: 2_700_000 };
export const BOOST_SPEED = { 0: 1.0, 1: 1.8, 2: 2.8, 3: 4.2, 4: 6.5 };
export const BOOST_MS = { 0: 0, 1: 10_000, 2: 18_000, 3: 28_000, 4: 45_000 };
export const BONUS_DIST = { 0: 0, 1: 80, 2: 350, 3: 1500, 4: 10_000 };

export function raceGiftTier(totalDiamonds) {
  if (totalDiamonds >= 1000) return 4;
  if (totalDiamonds >= 100) return 3;
  if (totalDiamonds >= 10) return 2;
  if (totalDiamonds >= 1) return 1;
  return 0;
}

export const TIER_MOUNT_LABEL = {
  0: 'Đi bộ xuyên Việt',
  1: 'Đôi Cánh Chim Lạc',
  2: 'Xe Cub Phượt Xuyên Việt',
  3: 'Chiến Mã Thánh Gióng',
  4: 'Rồng Vàng Lạc Long Quân',
};

function skinOf(uid) {
  let h = 0x811c9dc5;
  for (let i = 0; i < uid.length; i++) h = Math.imul(h ^ uid.charCodeAt(i), 0x01000193);
  return (h >>> 0) % 4;
}

function laneOf(uid, occupiedCount) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  // 7 lanes across the road width (-3.6 to +3.6)
  return ((h + occupiedCount) % 7) - 3;
}

export class RaceStage {
  constructor({ max = 120, now = Date.now, baseSpeedMps = 14, stayMinutes = 5 } = {}) {
    Object.assign(this, { max, now, baseSpeedMps });
    this.runners = new Map(); // uid -> Runner
    this.statsByUid = new Map(); // uid -> { name, distanceM, diamonds, tier, src, updatedAt }
    this.worldDistanceM = 0;
    this.realWorldDistanceM = 0;
    this.biomeIdx = 0;
    this.forcedBiome = null; // null = auto cycle
    this.globalTurboUntil = 0;
    this.lastTickAt = now();
    this.stayMinutes = 5;
    this.ttlMap = { ...RACE_TTL };
    if (stayMinutes > 0) this.setStayMinutes(stayMinutes);
  }

  setStayMinutes(mins) {
    const m = Math.max(0.5, Math.min(180, Number(mins) || 5));
    this.stayMinutes = m;
    const baseMs = Math.round(m * 60_000);
    this.ttlMap = {
      0: baseMs,
      1: Math.round(baseMs * 2),
      2: Math.round(baseMs * 3),
      3: Math.round(baseMs * 5),
      4: Math.round(baseMs * 8),
    };
    const t = this.now();
    for (const r of this.runners.values()) {
      const targetExp = (r.joinedAt || t) + this.ttlMap[r.tier || 0];
      r.expiresAt = Math.max(r.expiresAt, t + baseMs, targetExp);
    }
    return this.getStayConfig();
  }

  getStayConfig() {
    const baseMinutes = Math.round((this.ttlMap[0] / 60_000) * 10) / 10;
    return {
      stayMinutes: baseMinutes,
      ttlSec: {
        0: Math.round(this.ttlMap[0] / 1000),
        1: Math.round(this.ttlMap[1] / 1000),
        2: Math.round(this.ttlMap[2] / 1000),
        3: Math.round(this.ttlMap[3] / 1000),
        4: Math.round(this.ttlMap[4] / 1000),
      },
    };
  }

  currentBiome() {
    let base = BIOMES[this.biomeIdx % BIOMES.length];
    if (this.forcedBiome) {
      base = ALL_BIOMES.find(b => b.id === this.forcedBiome) || base;
    }
    const prov = getProvinceForState(this.worldDistanceM, base.id);
    return {
      ...base,
      province: prov ? { ...prov, total: VN_PROVINCES_63.length } : null,
    };
  }

  setBiome(biomeId) {
    if (biomeId === 'auto' || !biomeId) {
      this.forcedBiome = null;
    } else {
      const idx = BIOMES.findIndex(b => b.id === biomeId);
      if (idx !== -1) {
        this.biomeIdx = idx;
        this.forcedBiome = biomeId;
      } else if (ALL_BIOMES.some(b => b.id === biomeId)) {
        this.forcedBiome = biomeId;
      }
    }
    const b = this.currentBiome();
    return [
      { t: 'biome', biome: b, worldDistanceM: Math.round(this.worldDistanceM) },
      { t: 'banner', text: `🇻🇳 Hành trình đi bộ khám phá: ${b.name}`, ms: 4500 },
    ];
  }

  joinOrBoost(uid, name, giftTierLevel = 0, { addDiamonds = 0, addDistanceM = 0, boostMs = 0, cheer = '', src = 'tiktok' } = {}) {
    const t = this.now();
    const prev = this.statsByUid.get(uid) || { name, distanceM: 0, diamonds: 0, tier: 0, src, updatedAt: t };
    const diamonds = prev.diamonds + addDiamonds;
    const distanceM = prev.distanceM + addDistanceM;
    const bestTier = Math.max(prev.tier, giftTierLevel, raceGiftTier(diamonds));
    const finalSrc = src === 'mock' && prev.src && prev.src !== 'mock' ? prev.src : (src || prev.src || 'tiktok');

    this.statsByUid.set(uid, { name, distanceM, diamonds, tier: bestTier, src: finalSrc, updatedAt: t });

    const existing = this.runners.get(uid);
    const out = [];
    let isNewJoin = false;

    if (existing) {
      existing.name = name;
      existing.src = finalSrc;
      existing.tier = Math.max(existing.tier, bestTier);
      existing.diamonds = diamonds;
      existing.distanceM = distanceM;
      existing.expiresAt = Math.max(existing.expiresAt, t + this.ttlMap[existing.tier]);
      if (cheer) existing.cheer = cheer;
      if (giftTierLevel > 0 || boostMs > 0) {
        const bTier = Math.max(giftTierLevel, existing.boostTier || 1);
        existing.boostTier = bTier;
        existing.boostUntil = Math.max(existing.boostUntil, t) + (boostMs || BOOST_MS[bTier] || 8000);
        existing.speedMult = BOOST_SPEED[bTier] || 1.8;
      }
      out.push({
        t: 'boost',
        id: uid,
        runner: { ...existing },
        giftTier: giftTierLevel,
        addDiamonds,
        addDistanceM,
      });
      return { msgs: out, isNewJoin: false, runner: existing };
    }

    // Evict oldest lowest-tier runner if full (prioritize evicting mock bots for real users)
    const isReal = finalSrc !== 'mock';
    if (this.runners.size >= this.max) {
      let victim = null;
      if (isReal) {
        for (const r of this.runners.values()) {
          if (r.src !== 'mock') continue;
          if (!victim || r.tier < victim.tier || (r.tier === victim.tier && r.joinedAt < victim.joinedAt)) {
            victim = r;
          }
        }
      }
      if (!victim) {
        for (const r of this.runners.values()) {
          if (r.tier > bestTier) continue;
          if (!isReal && r.src !== 'mock') continue;
          if (!victim || r.tier < victim.tier || (r.tier === victim.tier && r.joinedAt < victim.joinedAt)) {
            victim = r;
          }
        }
      }
      if (victim) {
        this.runners.delete(victim.id);
        out.push({ t: 'leave', id: victim.id });
      } else {
        return { msgs: [], isNewJoin: false, runner: null };
      }
    }

    isNewJoin = true;
    const boostUntil = giftTierLevel > 0 ? t + (boostMs || BOOST_MS[giftTierLevel]) : (boostMs > 0 ? t + boostMs : 0);
    const speedMult = giftTierLevel > 0 ? BOOST_SPEED[giftTierLevel] : (boostMs > 0 ? 1.35 : 1.0);
    const runner = {
      id: uid,
      name,
      src: finalSrc,
      skin: skinOf(uid),
      lane: laneOf(uid, this.runners.size),
      tier: bestTier,
      boostTier: giftTierLevel,
      boostUntil,
      speedMult,
      distanceM,
      diamonds,
      cheer: cheer || 'Quyết tâm về đích!',
      joinedAt: t,
      expiresAt: t + this.ttlMap[bestTier],
    };
    this.runners.set(uid, runner);

    const welcomeText = `Chào mừng ${name} vừa vào chùa lễ Phật và khởi hành vãn cảnh`;
    out.push(
      { t: 'spawn', runner: { ...runner } },
      { t: 'welcome', id: uid, name, text: welcomeText, tier: bestTier, src: finalSrc, ...(giftTierLevel > 0 && { fromGift: true }) },
    );

    if (giftTierLevel > 0) {
      out.push({
        t: 'boost',
        id: uid,
        runner: { ...runner },
        giftTier: giftTierLevel,
        addDiamonds,
        addDistanceM,
      });
    }

    return { msgs: out, isNewJoin: true, runner };
  }

  triggerGlobalTurbo(durationMs = 8000) {
    const t = this.now();
    this.globalTurboUntil = Math.max(this.globalTurboUntil, t) + durationMs;
    for (const r of this.runners.values()) {
      r.boostUntil = Math.max(r.boostUntil, t + durationMs);
      r.speedMult = Math.max(r.speedMult, 2.2);
    }
    return [
      { t: 'fx', kind: 'turbo', power: 10 },
      { t: 'banner', text: '⚡ BÃO TIM TIKTOK! Toàn bộ tay đua được tăng tốc Cầu Vồng x2.2!', ms: 4500 },
    ];
  }

  say(uid, text, ms = 6000) {
    const r = this.runners.get(uid);
    if (!r) return [];
    r.cheer = text;
    return [{ t: 'say', id: uid, text, ms }];
  }

  tick() {
    const t = this.now();
    const dt = Math.max(0.05, Math.min(2.0, (t - this.lastTickAt) / 1000));
    this.lastTickAt = t;

    const out = [];
    const globalTurbo = t < this.globalTurboUntil;
    const prevCycle = Math.floor(this.worldDistanceM / 600);
    const activeCount = this.runners.size;
    const realActiveCount = [...this.runners.values()].filter(r => r.src !== 'mock').length;
    if (activeCount > 0) {
      const worldStep = (this.baseSpeedMps + Math.min(12, activeCount * 0.25)) * (globalTurbo ? 1.6 : 1.0) * dt;
      this.worldDistanceM += worldStep;
    }
    if (realActiveCount > 0) {
      const realStep = (this.baseSpeedMps + Math.min(12, realActiveCount * 0.25)) * (globalTurbo ? 1.6 : 1.0) * dt;
      this.realWorldDistanceM += realStep;
    }

    const newCycle = Math.floor(this.worldDistanceM / 600);
    if (!this.forcedBiome && newCycle > prevCycle) {
      this.biomeIdx = newCycle % BIOMES.length;
      const b = this.currentBiome();
      out.push(
        { t: 'biome', biome: b, worldDistanceM: Math.round(this.worldDistanceM) },
        { t: 'banner', text: `🌍 Đoàn đua tiến vào: ${b.name}`, ms: 5000 },
      );
    }

    for (const r of [...this.runners.values()]) {
      if (r.expiresAt <= t) {
        this.runners.delete(r.id);
        out.push({ t: 'leave', id: r.id });
        continue;
      }
      if (r.boostUntil > 0 && t >= r.boostUntil) {
        r.boostUntil = 0;
        r.boostTier = 0;
        // Higher permanent tier keeps a base speed advantage
        r.speedMult = r.tier >= 4 ? 1.65 : r.tier === 3 ? 1.4 : r.tier === 2 ? 1.25 : r.tier === 1 ? 1.12 : 1.0;
      }
      const stepM = this.baseSpeedMps * r.speedMult * (globalTurbo ? 1.35 : 1.0) * dt;
      r.distanceM = Math.round((r.distanceM + stepM) * 10) / 10;
      const st = this.statsByUid.get(r.id);
      if (st) st.distanceM = r.distanceM;
    }

    out.push({
      t: 'worldTick',
      worldDistanceM: Math.round(this.worldDistanceM),
      biome: this.currentBiome(),
      board: this.board(),
      runners: [...this.runners.values()].map(r => ({
        id: r.id,
        src: r.src || 'tiktok',
        distanceM: Math.round(r.distanceM),
        speedMult: r.speedMult,
        tier: r.tier,
        boostTier: r.boostTier,
        diamonds: r.diamonds,
      })),
    });

    return out;
  }

  board(limit = 12, includeMock = true) {
    return [...this.statsByUid.entries()]
      .filter(([, s]) => includeMock || s.src !== 'mock')
      .map(([uid, s]) => ({
        uid,
        name: s.name,
        src: s.src || 'tiktok',
        distanceM: Math.round(s.distanceM),
        diamonds: s.diamonds,
        tier: s.tier,
      }))
      .sort((a, b) => b.distanceM - a.distanceM || b.diamonds - a.diamonds)
      .slice(0, limit);
  }

  remove(uid) {
    if (!this.runners.has(uid)) return [];
    this.runners.delete(uid);
    return [{ t: 'leave', id: uid }];
  }

  clearAll() {
    const out = [];
    for (const uid of [...this.runners.keys()]) {
      this.runners.delete(uid);
      out.push({ t: 'leave', id: uid });
    }
    this.statsByUid.clear();
    this.worldDistanceM = 0;
    this.realWorldDistanceM = 0;
    this.biomeIdx = 0;
    this.forcedBiome = null;
    this.globalTurboUntil = 0;
    return out;
  }

  triggerEmotionAll(text, { boostMs = 6000, speedMult = 2.0, fxKind = 'spark' } = {}) {
    const t = this.now();
    const out = [];
    for (const r of this.runners.values()) {
      r.expiresAt = Math.max(r.expiresAt, t + 90_000);
      if (boostMs > 0) {
        r.boostUntil = Math.max(r.boostUntil, t + boostMs);
        r.speedMult = Math.max(r.speedMult, speedMult);
      }
      if (text) {
        r.cheer = text;
        out.push({ t: 'say', id: r.id, text, ms: 6000 });
      }
      if (fxKind) {
        out.push({ t: 'fx', kind: fxKind, at: r.id, power: 8 });
      }
    }
    return out;
  }

  has(uid) {
    return this.runners.has(uid);
  }

  snapshot() {
    return [...this.runners.values()].map(r => ({ ...r }));
  }
}
