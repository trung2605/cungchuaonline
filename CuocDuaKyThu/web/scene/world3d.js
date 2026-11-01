import * as THREE from 'three';

const VN_PROVINCES_63 = [
  { code: 1, name: 'Hà Giang', biomeId: 'vn_hagiang' },
  { code: 2, name: 'Cao Bằng', biomeId: 'vn_hagiang' },
  { code: 3, name: 'Bắc Kạn', biomeId: 'vn_hagiang' },
  { code: 4, name: 'Lạng Sơn', biomeId: 'vn_hagiang' },
  { code: 5, name: 'Tuyên Quang', biomeId: 'vn_hagiang' },
  { code: 6, name: 'Thái Nguyên', biomeId: 'vn_hagiang' },
  { code: 7, name: 'Lào Cai', biomeId: 'vn_sapa' },
  { code: 8, name: 'Yên Bái', biomeId: 'vn_sapa' },
  { code: 9, name: 'Lai Châu', biomeId: 'vn_sapa' },
  { code: 10, name: 'Điện Biên', biomeId: 'vn_sapa' },
  { code: 11, name: 'Sơn La', biomeId: 'vn_sapa' },
  { code: 12, name: 'Hòa Bình', biomeId: 'vn_sapa' },
  { code: 13, name: 'Phú Thọ', biomeId: 'vn_hanoi' },
  { code: 14, name: 'Vĩnh Phúc', biomeId: 'vn_hanoi' },
  { code: 15, name: 'Quảng Ninh', biomeId: 'vn_halong' },
  { code: 16, name: 'Hải Phòng', biomeId: 'vn_halong' },
  { code: 17, name: 'Bắc Giang', biomeId: 'vn_halong' },
  { code: 18, name: 'Bắc Ninh', biomeId: 'vn_halong' },
  { code: 19, name: 'Hải Dương', biomeId: 'vn_halong' },
  { code: 20, name: 'Hưng Yên', biomeId: 'vn_halong' },
  { code: 21, name: 'Thủ Đô Hà Nội', biomeId: 'vn_hanoi' },
  { code: 22, name: 'Hà Nam', biomeId: 'vn_ninhbinh' },
  { code: 23, name: 'Thái Bình', biomeId: 'vn_ninhbinh' },
  { code: 24, name: 'Nam Định', biomeId: 'vn_ninhbinh' },
  { code: 25, name: 'Ninh Bình', biomeId: 'vn_ninhbinh' },
  { code: 26, name: 'Thanh Hóa', biomeId: 'vn_ninhbinh' },
  { code: 27, name: 'Nghệ An', biomeId: 'vn_ninhbinh' },
  { code: 28, name: 'Hà Tĩnh', biomeId: 'vn_ninhbinh' },
  { code: 29, name: 'Quảng Bình', biomeId: 'vn_hue' },
  { code: 30, name: 'Quảng Trị', biomeId: 'vn_hue' },
  { code: 31, name: 'Thừa Thiên Huế', biomeId: 'vn_hue' },
  { code: 32, name: 'Đà Nẵng', biomeId: 'vn_danang' },
  { code: 33, name: 'Quảng Nam', biomeId: 'vn_hoian' },
  { code: 34, name: 'Quảng Ngãi', biomeId: 'vn_hoian' },
  { code: 35, name: 'Bình Định', biomeId: 'vn_hoian' },
  { code: 36, name: 'Phú Yên', biomeId: 'vn_hoian' },
  { code: 37, name: 'Khánh Hòa', biomeId: 'vn_nhatrang' },
  { code: 38, name: 'Ninh Thuận', biomeId: 'vn_nhatrang' },
  { code: 39, name: 'Bình Thuận', biomeId: 'vn_nhatrang' },
  { code: 40, name: 'Kon Tum', biomeId: 'vn_dalat' },
  { code: 41, name: 'Gia Lai', biomeId: 'vn_dalat' },
  { code: 42, name: 'Đắk Lắk', biomeId: 'vn_dalat' },
  { code: 43, name: 'Đắk Nông', biomeId: 'vn_dalat' },
  { code: 44, name: 'Lâm Đồng', biomeId: 'vn_dalat' },
  { code: 45, name: 'Bình Phước', biomeId: 'vn_saigon' },
  { code: 46, name: 'Tây Ninh', biomeId: 'vn_saigon' },
  { code: 47, name: 'Bình Dương', biomeId: 'vn_saigon' },
  { code: 48, name: 'Đồng Nai', biomeId: 'vn_saigon' },
  { code: 49, name: 'Bà Rịa – Vũng Tàu', biomeId: 'vn_saigon' },
  { code: 50, name: 'TP. Hồ Chí Minh', biomeId: 'vn_saigon' },
  { code: 51, name: 'Long An', biomeId: 'vn_mientay' },
  { code: 52, name: 'Tiền Giang', biomeId: 'vn_mientay' },
  { code: 53, name: 'Bến Tre', biomeId: 'vn_mientay' },
  { code: 54, name: 'Trà Vinh', biomeId: 'vn_mientay' },
  { code: 55, name: 'Vĩnh Long', biomeId: 'vn_mientay' },
  { code: 56, name: 'Đồng Tháp', biomeId: 'vn_mientay' },
  { code: 57, name: 'An Giang', biomeId: 'vn_mientay' },
  { code: 58, name: 'Kiên Giang', biomeId: 'vn_mientay' },
  { code: 59, name: 'TP. Cần Thơ', biomeId: 'vn_mientay' },
  { code: 60, name: 'Hậu Giang', biomeId: 'vn_mientay' },
  { code: 61, name: 'Sóc Trăng', biomeId: 'vn_mientay' },
  { code: 62, name: 'Bạc Liêu', biomeId: 'vn_mientay' },
  { code: 63, name: 'Cà Mau', biomeId: 'vn_mientay' },
];

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const glowTex = canvasTex(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.35, 'rgba(255,240,190,0.65)');
  r.addColorStop(1, 'rgba(255,200,100,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, w, w);
});

// Shared live state so runners.js can query the exact curved trail position at any Z coordinate
let activeTrailBiomeId = 'vn_hagiang';
let activeTrailScrollDist = 0;

export function getTrailPose(z, scrollDist = activeTrailScrollDist, biomeId = activeTrailBiomeId) {
  const s = scrollDist * 0.085;
  let x = 0;
  let y = 0.02;

  switch (biomeId) {
    case 'vn_hagiang':
    case 'egypt':
      // Winding S-curve mountain pass (Đèo Mã Pí Lèng)
      x = Math.sin(z * 0.075 - s) * 1.85 + Math.cos(z * 0.035 - s * 0.5) * 0.45;
      y = Math.cos(z * 0.055 - s * 0.7) * 0.24 + 0.16;
      break;
    case 'vn_sapa':
      // Undulating terraced rice ridge (Ruộng bậc thang Tây Bắc)
      x = Math.sin(z * 0.062 - s * 0.85) * 1.45;
      y = Math.sin(z * 0.095 - s) * 0.28 + 0.18;
      break;
    case 'vn_halong':
      // Sweeping coastal bay boardwalk (Đường ven Vịnh Hạ Long)
      x = Math.cos(z * 0.052 - s * 0.75) * 1.55;
      y = 0.06 + Math.sin(z * 0.06 - s) * 0.06;
      break;
    case 'vn_hanoi':
    case 'japan':
      // Arched vermilion wooden Thê Húc Bridge over Hoan Kiem Lake
      x = Math.sin(z * 0.048 - s * 0.65) * 0.95;
      y = Math.max(0.04, Math.cos((z + 8) * 0.055) * 0.46 + 0.08);
      break;
    case 'vn_ninhbinh':
      // Winding lotus causeway between karst peaks
      x = Math.sin(z * 0.068 - s * 0.8) * 1.6;
      y = 0.05;
      break;
    case 'vn_hue':
      // Diagonal imperial brick avenue (Kinh thành Huế & Cầu Trường Tiền)
      x = Math.sin(z * 0.042 - s * 0.6) * 1.2 + (z + 10) * 0.028;
      y = 0.06;
      break;
    case 'vn_danang':
    case 'usa':
    case 'cosmos':
      // Sweeping Golden Bridge arc held by giant stone hands (Cầu Vàng Bà Nà Hills)
      x = Math.cos(z * 0.048 - s * 0.65) * 2.05 - 0.25;
      y = 0.28 + Math.sin(z * 0.05 - s * 0.5) * 0.18;
      break;
    case 'vn_hoian':
    case 'vietnam':
      // Gentle lantern-lit Hoai riverfront curve
      x = Math.sin(z * 0.058 - s * 0.75) * 1.3;
      y = 0.06;
      break;
    case 'vn_dalat':
      // Rolling misty pine-hill curve (Đốc thông Đà Lạt)
      x = Math.sin(z * 0.068 - s * 0.85) * 1.7;
      y = Math.cos(z * 0.085 - s * 0.9) * 0.32 + 0.2;
      break;
    case 'vn_nhatrang':
      // curving white-sand coastal promenade
      x = Math.cos(z * 0.056 - s * 0.75) * 1.55;
      y = 0.05;
      break;
    case 'vn_saigon':
    case 'france':
      // Diagonal modern granite promenade (Phố đi bộ Nguyễn Huệ)
      x = Math.sin(z * 0.042 - s * 0.6) * 1.1 - (z + 10) * 0.024;
      y = 0.05;
      break;
    case 'vn_mientay':
      // Winding wooden canal bridge across Cai Rang floating market
      x = Math.sin(z * 0.075 - s * 0.85) * 1.5;
      y = Math.sin(z * 0.12 - s * 1.1) * 0.12 + 0.08;
      break;
    default:
      x = Math.sin(z * 0.055 - s * 0.7) * 1.25;
      y = 0.05;
      break;
  }

  // Compute tangent angle so walkers & roadside props orient naturally along the curved path
  const dz = 0.6;
  const nextX = (() => {
    const z2 = z - dz;
    switch (biomeId) {
      case 'vn_hagiang':
      case 'egypt':
        return Math.sin(z2 * 0.075 - s) * 1.85 + Math.cos(z2 * 0.035 - s * 0.5) * 0.45;
      case 'vn_sapa':
        return Math.sin(z2 * 0.062 - s * 0.85) * 1.45;
      case 'vn_halong':
        return Math.cos(z2 * 0.052 - s * 0.75) * 1.55;
      case 'vn_hanoi':
      case 'japan':
        return Math.sin(z2 * 0.048 - s * 0.65) * 0.95;
      case 'vn_ninhbinh':
        return Math.sin(z2 * 0.068 - s * 0.8) * 1.6;
      case 'vn_hue':
        return Math.sin(z2 * 0.042 - s * 0.6) * 1.2 + (z2 + 10) * 0.028;
      case 'vn_danang':
      case 'usa':
      case 'cosmos':
        return Math.cos(z2 * 0.048 - s * 0.65) * 2.05 - 0.25;
      case 'vn_hoian':
      case 'vietnam':
        return Math.sin(z2 * 0.058 - s * 0.75) * 1.3;
      case 'vn_dalat':
        return Math.sin(z2 * 0.068 - s * 0.85) * 1.7;
      case 'vn_nhatrang':
        return Math.cos(z2 * 0.056 - s * 0.75) * 1.55;
      case 'vn_saigon':
      case 'france':
        return Math.sin(z2 * 0.042 - s * 0.6) * 1.1 - (z2 + 10) * 0.024;
      case 'vn_mientay':
        return Math.sin(z2 * 0.075 - s * 0.85) * 1.5;
      default:
        return Math.sin(z2 * 0.055 - s * 0.7) * 1.25;
    }
  })();

  const dx = nextX - x;
  const angleY = Math.atan2(dx, dz) * 0.65;
  return { x, y, angleY };
}

const BIOME_PALETTES = {
  vn_hagiang: {
    skyTop: 0x1a2e3b,
    fog: 0x2b4452,
    ground: 0x1e3b2f,
    lane: 0xd94e34,
    sun: 0xffdf9e,
    skyImg: '/assets/sky_vn_highlands.jpg',
  },
  vn_sapa: {
    skyTop: 0x243322,
    fog: 0x3b4d2e,
    ground: 0x4a5d23,
    lane: 0xe0a945,
    sun: 0xffe49e,
    skyImg: '/assets/sky_vn_highlands.jpg',
  },
  vn_halong: {
    skyTop: 0x10323d,
    fog: 0x1a4b57,
    ground: 0x0c4a52,
    lane: 0xd4a86a,
    sun: 0xffe6a8,
    skyImg: '/assets/sky_vietnam.jpg',
  },
  vn_hanoi: {
    skyTop: 0x2b211b,
    fog: 0x3d2e24,
    ground: 0x153d33,
    lane: 0xc92a1d,
    sun: 0xffd98a,
    skyImg: '/assets/sky_vn_hanoi_ninhbinh.jpg',
  },
  vn_ninhbinh: {
    skyTop: 0x182e28,
    fog: 0x26443b,
    ground: 0x174236,
    lane: 0xb89f72,
    sun: 0xf7dca1,
    skyImg: '/assets/sky_vn_hanoi_ninhbinh.jpg',
  },
  vn_hue: {
    skyTop: 0x261d33,
    fog: 0x3a2b4d,
    ground: 0x233830,
    lane: 0xd99b38,
    sun: 0xffd28a,
    skyImg: '/assets/sky_vn_hue_danang.jpg',
  },
  vn_danang: {
    skyTop: 0x1d2d44,
    fog: 0x2e4566,
    ground: 0x243b54,
    lane: 0xffc745,
    sun: 0xfff0b8,
    skyImg: '/assets/sky_vn_hue_danang.jpg',
  },
  vn_hoian: {
    skyTop: 0x2b1e16,
    fog: 0x422d1d,
    ground: 0x1b3336,
    lane: 0xe8a338,
    sun: 0xffd478,
    skyImg: '/assets/sky_vietnam.jpg',
  },
  vn_dalat: {
    skyTop: 0x1b2d2a,
    fog: 0x2c4742,
    ground: 0x1e3b2b,
    lane: 0x9eb872,
    sun: 0xffe8b5,
    skyImg: '/assets/sky_vn_dalat_nhatrang.jpg',
  },
  vn_nhatrang: {
    skyTop: 0x0e3854,
    fog: 0x195375,
    ground: 0x0a5c75,
    lane: 0xf2d294,
    sun: 0xfff2b8,
    skyImg: '/assets/sky_vn_dalat_nhatrang.jpg',
  },
  vn_saigon: {
    skyTop: 0x1c2238,
    fog: 0x2d3554,
    ground: 0x1b2438,
    lane: 0x60a5fa,
    sun: 0xffcf87,
    skyImg: '/assets/sky_vn_saigon.jpg',
  },
  vn_mientay: {
    skyTop: 0x242b1a,
    fog: 0x3b4428,
    ground: 0x3d4d26,
    lane: 0xc28e46,
    sun: 0xffdb8c,
    skyImg: '/assets/sky_vn_mientay.jpg',
  },
  // Legacy & World fallbacks
  vietnam: {
    skyTop: 0x162b33,
    fog: 0x243b40,
    ground: 0x1d3633,
    lane: 0xbfa06a,
    sun: 0xf4dca8,
    skyImg: '/assets/sky_vietnam.jpg',
  },
  japan: {
    skyTop: 0x241d2e,
    fog: 0x382b3a,
    ground: 0x29222b,
    lane: 0xc9a39b,
    sun: 0xf5d6cb,
    skyImg: '/assets/sky_japan.jpg',
  },
  egypt: {
    skyTop: 0x332214,
    fog: 0x523821,
    ground: 0x694b2a,
    lane: 0xcfa763,
    sun: 0xf2c278,
    skyImg: '/assets/sky_egypt.jpg',
  },
  france: {
    skyTop: 0x172030,
    fog: 0x253247,
    ground: 0x1d2636,
    lane: 0xb8a98a,
    sun: 0xf2dfb6,
    skyImg: '/assets/sky_europe.jpg',
  },
  usa: {
    skyTop: 0x162436,
    fog: 0x24384d,
    ground: 0x1b2a38,
    lane: 0xb0a48c,
    sun: 0xe8d8b8,
    skyImg: '/assets/sky_europe.jpg',
  },
  cosmos: {
    skyTop: 0x141624,
    fog: 0x212438,
    ground: 0x181a29,
    lane: 0xc4b082,
    sun: 0xe8d5b5,
    skyImg: '/assets/sky_world.jpg',
  },
};

// ============================================================================
// CUSTOM PROCEDURAL TRAIL SURFACE TEXTURES PER VIETNAMESE LANDMARK BIOME
// ============================================================================
const trailTexCache = {};

function createBiomeTrailTexture(biomeId) {
  if (trailTexCache[biomeId]) return trailTexCache[biomeId];

  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');

  if (biomeId === 'vn_hagiang') {
    // Đèo Mã Pí Lèng: Rocky mountain pass + Red/White pass guard blocks + Tam Giác Mạch flowers
    g.fillStyle = '#2d4a38';
    g.fillRect(0, 0, 512, 512);
    const roadGrad = g.createLinearGradient(36, 0, 476, 0);
    roadGrad.addColorStop(0, '#3e4652');
    roadGrad.addColorStop(0.5, '#525c6b');
    roadGrad.addColorStop(1, '#3e4652');
    g.fillStyle = roadGrad;
    g.fillRect(36, 0, 440, 512);

    // Mountain stone pavers & winding pass texture
    for (let r = 0; r < 16; r++) {
      const y = r * 32;
      for (let x = 48; x < 456; x += 52) {
        g.fillStyle = (r + x) % 2 === 0 ? '#5c6778' : '#4b5563';
        g.beginPath();
        g.roundRect(x + (r % 2) * 14, y + 2, 44, 27, 5);
        g.fill();
      }
      // Red & White mountain pass guardrails (Hộ lan đèo Tây Bắc)
      g.fillStyle = r % 2 === 0 ? '#e11d48' : '#f8fafc';
      g.fillRect(28, y, 16, 32);
      g.fillRect(468, y, 16, 32);
    }
    // Dashed golden mountain pass center line
    g.fillStyle = '#fbbf24';
    for (let y = 12; y < 512; y += 64) g.fillRect(252, y, 8, 36);
    // Pink Tam Giác Mạch flower clusters on shoulders
    for (let i = 0; i < 65; i++) {
      const sx = i % 2 === 0 ? 12 + (i % 14) : 488 + (i % 14);
      const sy = (i * 23) % 512;
      g.fillStyle = i % 3 === 0 ? '#f472b6' : '#fbcfe8';
      g.beginPath();
      g.arc(sx, sy, 3.5, 0, Math.PI * 2);
      g.fill();
    }
  } else if (biomeId === 'vn_sapa') {
    // Sa Pa Ruộng Bậc Thang: Golden terraced earth trail + river stepping stones + golden rice borders
    g.fillStyle = '#ca8a04';
    g.fillRect(0, 0, 512, 512);
    const earthGrad = g.createLinearGradient(40, 0, 472, 0);
    earthGrad.addColorStop(0, '#78552b');
    earthGrad.addColorStop(0.5, '#9a6f3a');
    earthGrad.addColorStop(1, '#78552b');
    g.fillStyle = earthGrad;
    g.fillRect(40, 0, 432, 512);

    // Natural rounded stepping stones embedded in golden earth
    const stoneCols = ['#a8a29e', '#8c7e6a', '#b5a895', '#78716c'];
    for (let r = 0; r < 14; r++) {
      const y = r * 36.5;
      for (let cIdx = 0; cIdx < 6; cIdx++) {
        const x = 62 + cIdx * 66 + (r % 2) * 16;
        g.fillStyle = stoneCols[(r + cIdx) % stoneCols.length];
        g.beginPath();
        g.ellipse(x + 22, y + 18, 26, 13, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    // Golden ripe rice stalks along both edges
    for (let y = 0; y < 512; y += 12) {
      g.fillStyle = y % 24 === 0 ? '#facc15' : '#eab308';
      g.fillRect(24, y, 20, 8);
      g.fillRect(468, y, 20, 8);
    }
  } else if (biomeId === 'vn_hanoi') {
    // Cầu Thê Húc Hồ Gươm: Vermilion Red Lacquered Wooden Bridge Deck + Golden Lotus Medallions
    g.fillStyle = '#0f5245'; // Hoan Kiem emerald water on outer edges
    g.fillRect(0, 0, 512, 512);
    const bridgeGrad = g.createLinearGradient(34, 0, 478, 0);
    bridgeGrad.addColorStop(0, '#7f1d1d');
    bridgeGrad.addColorStop(0.5, '#b91c1c');
    bridgeGrad.addColorStop(1, '#7f1d1d');
    g.fillStyle = bridgeGrad;
    g.fillRect(34, 0, 444, 512);

    // Horizontal red wooden bridge planks
    for (let y = 0; y < 512; y += 24) {
      g.fillStyle = (y / 24) % 2 === 0 ? '#991b1b' : '#b91c1c';
      g.fillRect(44, y + 2, 424, 20);
      g.fillStyle = 'rgba(255, 220, 150, 0.16)';
      g.fillRect(44, y + 3, 424, 3);
    }
    // Vermilion & Gold bridge side rails
    g.fillStyle = '#f59e0b';
    g.fillRect(32, 0, 14, 512);
    g.fillRect(466, 0, 14, 512);
    // Golden lotus emblem down the center of Thê Húc bridge
    g.strokeStyle = 'rgba(253, 224, 71, 0.55)';
    g.lineWidth = 3;
    for (let y = 40; y < 512; y += 80) {
      g.beginPath();
      g.arc(256, y, 16, 0, Math.PI * 2);
      g.stroke();
    }
  } else if (biomeId === 'vn_danang') {
    // Cầu Vàng Bà Nà Hills: Shimmering Metallic Gold Deck + Purple Lobelia flower planters
    g.fillStyle = '#4c1d95';
    g.fillRect(0, 0, 512, 512);
    const goldGrad = g.createLinearGradient(36, 0, 476, 0);
    goldGrad.addColorStop(0, '#b45309');
    goldGrad.addColorStop(0.25, '#d97706');
    goldGrad.addColorStop(0.5, '#f59e0b');
    goldGrad.addColorStop(0.75, '#d97706');
    goldGrad.addColorStop(1, '#b45309');
    g.fillStyle = goldGrad;
    g.fillRect(36, 0, 440, 512);

    // Metallic golden walkway planks
    for (let y = 0; y < 512; y += 20) {
      g.fillStyle = (y / 20) % 2 === 0 ? 'rgba(254, 243, 199, 0.18)' : 'rgba(120, 53, 15, 0.22)';
      g.fillRect(48, y + 2, 416, 16);
    }
    // Purple Lobelia flower beds (Hoa Nữ Hoàng Xanh Tím trên Cầu Vàng)
    for (let y = 0; y < 512; y += 14) {
      g.fillStyle = y % 28 === 0 ? '#a855f7' : '#fbbf24';
      g.beginPath();
      g.arc(28, y + 7, 8, 0, Math.PI * 2);
      g.arc(484, y + 7, 8, 0, Math.PI * 2);
      g.fill();
    }
  } else if (biomeId === 'vn_hue') {
    // Kinh Thành Huế: Diagonal Herringbone Bát Tràng Terracotta Bricks + Royal Gold Trim
    g.fillStyle = '#1e3a2f';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#7c2d12';
    g.fillRect(38, 0, 436, 512);

    const brickCols = ['#9a3412', '#b45309', '#854d0e', '#a16207'];
    for (let y = -32; y < 544; y += 28) {
      for (let x = 44; x < 460; x += 36) {
        g.save();
        g.translate(x + 18, y + 14);
        g.rotate(((x / 36) % 2 === 0 ? 1 : -1) * 0.45);
        g.fillStyle = brickCols[(x + y) % brickCols.length];
        g.fillRect(-16, -9, 32, 18);
        g.restore();
      }
    }
    // Royal Gold Imperial border
    g.fillStyle = '#eab308';
    g.fillRect(34, 0, 12, 512);
    g.fillRect(466, 0, 12, 512);
  } else if (biomeId === 'vn_nhatrang' || biomeId === 'vn_halong') {
    // Coastal Beach & Bay Promenade: Golden sand + White ocean surf foam on edge + Stone walkway
    g.fillStyle = '#0284c7'; // Turquoise ocean edge
    g.fillRect(0, 0, 512, 512);
    const sandGrad = g.createLinearGradient(32, 0, 480, 0);
    sandGrad.addColorStop(0, '#fcd34d');
    sandGrad.addColorStop(0.2, '#fde68a');
    sandGrad.addColorStop(0.8, '#e2e8f0');
    sandGrad.addColorStop(1, '#38bdf8');
    g.fillStyle = sandGrad;
    g.fillRect(32, 0, 448, 512);

    // Coastal sandstone pavers in center
    for (let r = 0; r < 16; r++) {
      const y = r * 32;
      for (let x = 68; x < 420; x += 56) {
        g.fillStyle = (r + x) % 2 === 0 ? '#d6c7b2' : '#c7b299';
        g.beginPath();
        g.roundRect(x + (r % 2) * 14, y + 3, 48, 26, 6);
        g.fill();
      }
      // White foaming ocean surf along right beach edge
      g.fillStyle = 'rgba(255, 255, 255, 0.78)';
      g.beginPath();
      g.arc(462 + Math.sin(r) * 8, y + 16, 16, 0, Math.PI * 2);
      g.fill();
    }
  } else if (biomeId === 'vn_saigon') {
    // Phố Đi Bộ Nguyễn Huệ Sài Gòn: Sleek Granite Promenade + Glowing Musical Fountain Strip
    g.fillStyle = '#1e293b';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#cbd5e1';
    g.fillRect(36, 0, 440, 512);

    // Modern geometric granite slabs
    for (let r = 0; r < 16; r++) {
      const y = r * 32;
      for (let x = 44; x < 460; x += 64) {
        g.fillStyle = ((r + x / 64) % 2 === 0) ? '#94a3b8' : '#cbd5e1';
        g.fillRect(x + 2, y + 2, 60, 28);
      }
    }
    // Glowing cyan & gold lotus fountain strip in the center of Nguyen Hue Walking Street
    const fountainGrad = g.createLinearGradient(226, 0, 286, 0);
    fountainGrad.addColorStop(0, '#0284c7');
    fountainGrad.addColorStop(0.5, '#67e8f9');
    fountainGrad.addColorStop(1, '#0284c7');
    g.fillStyle = fountainGrad;
    g.fillRect(232, 0, 48, 512);
  } else if (biomeId === 'vn_mientay') {
    // Chợ Nổi Miền Tây: Rustic Wooden Canal Bridge Planks over Shimmering Silt-Gold Water
    g.fillStyle = '#0f766e';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#451a03';
    g.fillRect(46, 0, 420, 512);

    // Wooden planks with water peeking between gaps
    const woodCols = ['#78350f', '#92400e', '#653208', '#854d0e'];
    for (let r = 0; r < 24; r++) {
      const y = r * 21.3;
      g.fillStyle = woodCols[r % woodCols.length];
      g.beginPath();
      g.roundRect(52 + (r % 2) * 4, y + 2, 404, 16, 4);
      g.fill();
      // Bamboo side handrails
      g.fillStyle = '#ca8a04';
      g.fillRect(40, y, 10, 20);
      g.fillRect(462, y, 10, 20);
    }
  } else {
    // Classic Warm Vietnamese Flagstone & Lotus Medallion Trail (Tràng An, Hội An, Đà Lạt)
    g.fillStyle = '#1f4d36';
    g.fillRect(0, 0, 512, 512);
    const mortarGrad = g.createLinearGradient(38, 0, 474, 0);
    mortarGrad.addColorStop(0, '#4a3d31');
    mortarGrad.addColorStop(0.5, '#7a6752');
    mortarGrad.addColorStop(1, '#4a3d31');
    g.fillStyle = mortarGrad;
    g.fillRect(38, 0, 436, 512);

    for (let y = 0; y < 512; y += 32) {
      g.fillStyle = (y / 32) % 2 === 0 ? '#d9a75a' : '#c28e42';
      g.fillRect(30, y + 2, 16, 28);
      g.fillRect(466, y + 2, 16, 28);
    }
    const stonePalette = ['#8c765c', '#998266', '#7d6850', '#a38b6d', '#857058', '#917a5f'];
    const rows = 16;
    const rowH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      let x = 50 - (r % 2) * 24;
      let colIdx = 0;
      while (x < 460) {
        const w = 44 + ((r * 13 + colIdx * 19) % 22);
        const drawX = Math.max(50, x);
        const drawW = Math.min(460, x + w - 4) - drawX;
        if (drawW > 8) {
          g.fillStyle = stonePalette[(r * 7 + colIdx * 5) % stonePalette.length];
          g.beginPath();
          g.roundRect(drawX, y + 2, drawW, rowH - 4, 6);
          g.fill();
        }
        x += w;
        colIdx++;
      }
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 10);
  t.colorSpace = THREE.SRGBColorSpace;
  trailTexCache[biomeId] = t;
  return t;
}

// ============================================================================
// 63-PROVINCE NATIONAL HIGHWAY MILESTONE POST (`Cột Mốc Cây Số 63 Tỉnh Thành`)
// ============================================================================
const milestoneTexCache = new Map();

function getMilestoneTexture(prov) {
  const key = prov.code;
  if (milestoneTexCache.has(key)) return milestoneTexCache.get(key);
  const tex = canvasTex(256, 512, (g, w, h) => {
    // White stone body
    g.fillStyle = '#f8fafc';
    g.fillRect(0, 0, w, h);
    // Red top cap of Vietnamese QL1A milestone
    g.fillStyle = '#dc2626';
    g.fillRect(0, 0, w, 118);
    g.fillStyle = '#ffffff';
    g.font = 'bold 34px sans-serif';
    g.textAlign = 'center';
    g.fillText('QL 1A', w / 2, 56);
    g.font = 'bold 24px sans-serif';
    g.fillText(`TỈNH ${prov.code}/63`, w / 2, 96);

    // Province Name & Km
    g.fillStyle = '#0f172a';
    g.font = 'bold 32px sans-serif';
    g.fillText(prov.name.toUpperCase(), w / 2, 195);

    g.fillStyle = '#b91c1c';
    g.font = 'bold 42px sans-serif';
    g.fillText(`${prov.code * 28} KM`, w / 2, 265);

    // Border frame
    g.strokeStyle = '#cbd5e1';
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
  });
  milestoneTexCache.set(key, tex);
  return tex;
}

function buildVietnamMilestonePost(provIndex) {
  const prov = VN_PROVINCES_63[provIndex % VN_PROVINCES_63.length];
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({
    map: getMilestoneTexture(prov),
    roughness: 0.55,
  });
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1.35, 0.34), postMat);
  pillar.position.y = 0.68;
  pillar.castShadow = true;
  g.add(pillar);

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.25, 4),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
  );
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 1.47;
  g.add(cap);
  return g;
}

function buildTrailsideFoliage(side, variant) {
  const g = new THREE.Group();
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x36593e, roughness: 0.88 });
  const flowerColors = [0xfacc15, 0xf472b6, 0xffffff, 0xfb923c];
  const fMat = new THREE.MeshStandardMaterial({
    color: flowerColors[variant % flowerColors.length],
    roughness: 0.75,
  });

  for (let i = 0; i < 3; i++) {
    const zOff = (i - 1) * 1.6;
    const r = 0.36 + ((variant + i) % 3) * 0.11;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), bushMat);
    bush.scale.set(1.2, 0.75, 1.1);
    bush.position.set(side * (0.1 + (i % 2) * 0.35), r * 0.5, zOff);
    g.add(bush);

    const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), fMat);
    blossom.position.set(bush.position.x - side * 0.1, r * 0.85, zOff + 0.1);
    g.add(blossom);
  }
  return g;
}

// Builds a Vietnamese Red Flag with Golden Star on a pole (`Cờ Đỏ Sao Vàng`)
function buildVietnamFlagPole(height = 3.6, animList, phaseOffset = 0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.055, height, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.6, roughness: 0.3 })
  );
  pole.position.y = height / 2;
  g.add(pole);

  const flagTex = canvasTex(128, 84, (ctx, w, h) => {
    ctx.fillStyle = '#da251d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 5; i++) {
      const a1 = ((i * 72 - 90) * Math.PI) / 180;
      const a2 = (((i * 72 + 36) - 90) * Math.PI) / 180;
      ctx.lineTo(cx + Math.cos(a1) * 24, cy + Math.sin(a1) * 24);
      ctx.lineTo(cx + Math.cos(a2) * 9.5, cy + Math.sin(a2) * 9.5);
    }
    ctx.closePath();
    ctx.fill();
  });
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.76, 8, 4),
    new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide })
  );
  flag.position.set(0.58, height - 0.42, 0);
  g.add(flag);

  if (animList) {
    animList.push(t => {
      flag.rotation.y = Math.sin(t * 3.2 + phaseOffset) * 0.18;
    });
  }
  return g;
}

// ============================================================================
// 12 VIETNAMESE REGIONAL ROADSIDE DIORAMA SCENES
// ============================================================================
function buildRoadsideScene(biomeId, side, variant, animList, provBaseIdx = 0) {
  const g = new THREE.Group();
  const phaseOffset = variant * 1.7 + (side > 0 ? 0.9 : 0);

  g.add(buildTrailsideFoliage(side, variant));

  // Place a 63-Province National Highway Milestone Post on the right side every 3 rows
  if (side > 0 && variant % 3 === 0) {
    const ms = buildVietnamMilestonePost(provBaseIdx + Math.floor(variant / 3));
    ms.position.set(0.35, 0, 1.3);
    ms.rotation.y = -0.25;
    g.add(ms);
  }

  if (biomeId === 'vn_hagiang') {
    // Hà Giang: Limestone Karst Peak + Cột Cờ Đỏ Sao Vàng + Tam Giác Mạch terraces
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 6.8 + (variant % 3) * 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b4d54, roughness: 0.88 })
    );
    peak.position.set(side * 3.8, 3.2, 0);
    g.add(peak);

    if (variant % 2 === 0) {
      const flag = buildVietnamFlagPole(4.0, animList, phaseOffset);
      flag.position.set(side * 1.15, 0, -0.4);
      g.add(flag);
    }
  } else if (biomeId === 'vn_sapa') {
    // Sa Pa: Golden Stepped Rice Terraces + Spinning Bamboo Waterwheel (Cối Nước Tây Bắc) + Stilt House
    const terraceGroup = new THREE.Group();
    const goldRiceMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.75 });
    const greenRiceMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8 });
    for (let step = 0; step < 4; step++) {
      const slab = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6 - step * 0.45, 2.8 - step * 0.45, 0.55, 12),
        step % 2 === 0 ? goldRiceMat : greenRiceMat
      );
      slab.position.set(side * 3.6, step * 0.58 + 0.28, 0);
      terraceGroup.add(slab);
    }
    g.add(terraceGroup);

    // Spinning Bamboo Waterwheel (Cối nước tre Tây Bắc)
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.08, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 })
    );
    wheel.position.set(side * 1.55, 1.15, 0.5);
    wheel.rotation.y = Math.PI / 2;
    g.add(wheel);
    animList.push(t => {
      wheel.rotation.x = t * 1.2 + phaseOffset;
    });
  } else if (biomeId === 'vn_halong') {
    // Vịnh Hạ Long: Emerald Limestone Karst + Red-Sail Wooden Junk Boat + Hòn Trống Mái
    const karst = new THREE.Mesh(
      new THREE.ConeGeometry(2.7, 7.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x1b6358, roughness: 0.85 })
    );
    karst.position.set(side * 4.6, 3.4, -0.6);
    g.add(karst);

    const boat = new THREE.Group();
    boat.position.set(side * 2.1, 0.35, 0.4);
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.45, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x6e3b1e, roughness: 0.7 })
    );
    boat.add(hull);
    const sail = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.85, 1.35),
      new THREE.MeshStandardMaterial({ color: 0xd92b1c, emissive: 0x4a0802, roughness: 0.5 })
    );
    sail.position.set(0, 1.35, 0.1);
    boat.add(sail);
    g.add(boat);
    animList.push(t => {
      boat.position.y = 0.35 + Math.sin(t * 1.6 + phaseOffset) * 0.14;
      boat.rotation.z = Math.sin(t * 1.3 + phaseOffset) * 0.08;
    });
  } else if (biomeId === 'vn_hanoi') {
    // Hà Nội: Tháp Rùa / Khuê Văn Các Pavilion + Autumn Gold Foliage + Vermilion Bridge Posts
    const pavilion = new THREE.Group();
    pavilion.position.set(side * 3.1, 0, 0);
    const stoneBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 1.4, 2.3),
      new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.75 })
    );
    stoneBase.position.y = 0.7;
    pavilion.add(stoneBase);
    for (let tier = 0; tier < 2; tier++) {
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.1 - tier * 0.4, 0.7, 4),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.55 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 1.65 + tier * 0.85;
      pavilion.add(roof);
    }
    g.add(pavilion);

    // Vermilion red Thê Húc bridge post with glowing golden lantern
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.8, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 })
    );
    post.position.set(side * 0.35, 0.9, 0);
    g.add(post);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    orb.position.set(side * 0.35, 1.92, 0);
    g.add(orb);
  } else if (biomeId === 'vn_ninhbinh') {
    // Ninh Bình: Bái Đính Stupa Tower + Giant Blooming Pink Lotus on Emerald Water
    const stupa = new THREE.Group();
    stupa.position.set(side * 3.4, 0, 0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.4, roughness: 0.35 });
    for (let i = 0; i < 4; i++) {
      const s = 1.65 - i * 0.22;
      const y = i * 1.25;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.65, s * 0.7, 1.05, 8), bodyMat);
      b.position.y = y + 0.52;
      stupa.add(b);
      const r = new THREE.Mesh(new THREE.ConeGeometry(s * 0.85, 0.52, 8), roofMat);
      r.position.y = y + 1.15;
      stupa.add(r);
    }
    g.add(stupa);

    // Giant Blooming Lotus Flower near water edge
    const lotus = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.42, 8),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x831843, roughness: 0.5 })
    );
    lotus.rotation.x = Math.PI;
    lotus.position.set(side * 1.5, 0.25, 0.6);
    g.add(lotus);
  } else if (biomeId === 'vn_hue') {
    // Cố Đô Huế: Imperial Ngọ Môn Pavilion + Purple Royal Lanterns + Tràng Tiền Arch
    const citadel = new THREE.Group();
    citadel.position.set(side * 3.2, 0, 0);
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.8, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    wall.position.y = 0.9;
    citadel.add(wall);
    const palaceRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.3, 1.1, 4),
      new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0x422006, metalness: 0.5, roughness: 0.3 })
    );
    palaceRoof.rotation.y = Math.PI / 4;
    palaceRoof.position.y = 2.35;
    citadel.add(palaceRoof);
    g.add(citadel);
  } else if (biomeId === 'vn_danang') {
    // Đà Nẵng Cầu Vàng: Giant Mossy Stone Hand (Bàn Tay Đá Khổng Lồ) cradling the Golden Bridge!
    const handGroup = new THREE.Group();
    handGroup.position.set(side * 0.55, -0.45, 0);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.88 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 });

    // Giant Forearm & Sculpted Palm rising from the clouds right under the bridge edge
    const palm = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 1.8), stoneMat);
    palm.position.y = 0.65;
    handGroup.add(palm);

    // 5 Giant Sculpted Stone Fingers curling up right beside the golden bridge railing
    for (let f = 0; f < 5; f++) {
      const zOff = (f - 2) * 0.36;
      const fingerH = f === 2 ? 2.65 : f === 1 || f === 3 ? 2.35 : 1.85;
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, fingerH, 10), stoneMat);
      finger.position.set(-side * 0.45, 1.95 + fingerH * 0.34, zOff);
      finger.rotation.z = side * 0.25;
      handGroup.add(finger);

      const mossCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mossMat);
      mossCap.position.set(-side * 0.38, 1.95 + fingerH * 0.7, zOff);
      handGroup.add(mossCap);
    }
    g.add(handGroup);
  } else if (biomeId === 'vn_hoian' || biomeId === 'vietnam') {
    // Phố Cổ Hội An: Ancient Yellow Heritage House + Bougainvillea (Hoa giấy đỏ) + Swinging Silk Lanterns
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.3, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xe8a838, roughness: 0.7 })
    );
    house.position.set(side * 2.9, 1.65, 0);
    g.add(house);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x9e2a1b, roughness: 0.6 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(side * 2.9, 3.85, 0);
    g.add(roof);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2210 })
    );
    pole.position.set(side * 0.28, 1.75, 0);
    g.add(pole);
    const lanternPivot = new THREE.Group();
    lanternPivot.position.set(side * 0.28, 3.35, 0);
    const lCol = variant % 2 === 0 ? 0xff2a1a : 0xffaa00;
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10),
      new THREE.MeshStandardMaterial({ color: lCol, emissive: lCol, emissiveIntensity: 1.2 })
    );
    lantern.scale.set(1, 1.25, 1);
    lantern.position.y = -0.35;
    lanternPivot.add(lantern);
    g.add(lanternPivot);
    animList.push(t => {
      lanternPivot.rotation.z = Math.sin(t * 2.0 + phaseOffset) * 0.16;
    });
  } else if (biomeId === 'vn_dalat') {
    // Đà Lạt & Tây Nguyên: Towering Pine Trees + Lam Vien Artichoke Glass Bud / Nhà Rông
    for (let p = 0; p < 2; p++) {
      const pine = new THREE.Group();
      pine.position.set(side * (2.2 + p * 1.6), 0, (p - 0.5) * 1.4);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.22, 2.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21 })
      );
      trunk.position.y = 1.3;
      pine.add(trunk);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.82 });
      for (let layer = 0; layer < 3; layer++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35 - layer * 0.28, 1.6, 9), needleMat);
        cone.position.y = 2.4 + layer * 1.05;
        pine.add(cone);
      }
      g.add(pine);
    }
    if (variant % 2 === 0) {
      // Iconic Green Artichoke Dome of Da Lat Lam Vien Square (Nụ Hoa Atiso Đà Lạt)
      const artichoke = new THREE.Mesh(
        new THREE.ConeGeometry(1.25, 2.6, 12, 3),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b, metalness: 0.35, roughness: 0.25 })
      );
      artichoke.position.set(side * 3.2, 1.3, 0);
      g.add(artichoke);
    }
  } else if (biomeId === 'vn_nhatrang') {
    // Nha Trang: Ancient Red-Brick Po Nagar Cham Tower (Tháp Bà Ponagar) + Coconut Palms
    if (variant % 2 === 0) {
      const cham = new THREE.Group();
      cham.position.set(side * 3.3, 0, 0);
      const brickMat = new THREE.MeshStandardMaterial({ color: 0xb9381c, roughness: 0.72 });
      for (let tier = 0; tier < 3; tier++) {
        const w = 1.85 - tier * 0.42;
        const h = 1.55 - tier * 0.2;
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), brickMat);
        block.position.y = tier * 1.35 + h / 2;
        cham.add(block);
      }
      g.add(cham);
    } else {
      // Swaying Coastal Coconut Palm Tree
      const palm = new THREE.Group();
      palm.position.set(side * 2.1, 0, 0);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.2, 3.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x784e28 })
      );
      trunk.position.y = 1.9;
      trunk.rotation.z = -side * 0.14;
      palm.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 0.85, 7),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
      );
      crown.position.set(-side * 0.26, 3.8, 0);
      palm.add(crown);
      g.add(palm);
    }
  } else if (biomeId === 'vn_saigon') {
    // TP.HCM: Illuminated Skyscraper / Ben Thanh Clock Tower + Modern Boulevard Lights
    const h = 5.4 + (variant % 3) * 1.8;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, h, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x172554, metalness: 0.65, roughness: 0.25 })
    );
    tower.position.set(side * 3.7, h / 2, 0);
    g.add(tower);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.25, 2.2, 8),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa })
    );
    spire.position.set(side * 3.7, h + 1.1, 0);
    g.add(spire);
  } else if (biomeId === 'vn_mientay') {
    // Miền Tây: Cai Rang Floating Market Fruit Boat (Ghe Chợ Nổi Cây Bẹo Trái Cây) right beside the wooden bridge
    const boat = new THREE.Group();
    boat.position.set(side * 0.95, 0.18, 0);
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.44, 2.75),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
    );
    boat.add(hull);
    // Colorful mounds of tropical fruits (watermelon, mango, pineapple) on deck
    const fruitCols = [0x16a34a, 0xfacc15, 0xef4444, 0xf97316];
    for (let f = 0; f < 4; f++) {
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: fruitCols[(variant + f) % fruitCols.length], roughness: 0.6 })
      );
      mound.position.set((f % 2 - 0.5) * 0.36, 0.34, (Math.floor(f / 2) - 0.5) * 0.78);
      boat.add(mound);
    }
    // Iconic "Cây Bẹo" bamboo pole advertising fruits at the bow
    const cayBeo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.038, 2.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xca8a04 })
    );
    cayBeo.position.set(0, 1.2, 1.0);
    cayBeo.rotation.x = 0.2;
    boat.add(cayBeo);
    g.add(boat);
    animList.push(t => {
      boat.position.y = 0.18 + Math.sin(t * 1.8 + phaseOffset) * 0.11;
      boat.rotation.z = Math.sin(t * 1.4 + phaseOffset) * 0.06;
    });
  }
  return g;
}

function buildHighwayGateway(biomeId) {
  const g = new THREE.Group();
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8c2318, roughness: 0.65 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd99b38, metalness: 0.35, roughness: 0.45 });

  for (const x of [-6.2, 6.2]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 8.2, 12), pillarMat);
    p.position.set(x, 4.1, 0);
    g.add(p);
  }
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.65, 1.0), roofMat);
  beam1.position.set(0, 8.0, 0);
  g.add(beam1);
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.55, 1.3), pillarMat);
  beam2.position.set(0, 8.8, 0);
  g.add(beam2);

  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0x991b1b, emissiveIntensity: 0.85 });
  for (const x of [-4.2, -1.5, 1.5, 4.2]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), lanternMat);
    l.scale.set(1, 1.25, 1);
    l.position.set(x, 7.35, 0);
    g.add(l);
  }
  return g;
}

function buildSkyBalloon(colorHex, accentHex) {
  const g = new THREE.Group();
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(1.75, 16, 14),
    new THREE.MeshStandardMaterial({ color: colorHex, emissive: accentHex, emissiveIntensity: 0.22, roughness: 0.7 })
  );
  balloon.scale.set(1, 1.28, 1);
  g.add(balloon);

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.72, 0.09, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
  );
  band.rotation.x = Math.PI / 2;
  g.add(band);

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.55, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.8 })
  );
  basket.position.y = -2.6;
  g.add(basket);
  return g;
}

function buildFlockOfCranes() {
  const group = new THREE.Group();
  const birdMat = new THREE.MeshBasicMaterial({ color: 0xfff8eb, side: THREE.DoubleSide });
  const wingGeo = new THREE.BoxGeometry(0.48, 0.03, 0.22);
  const birds = [];

  const offsets = [
    [0, 0, 0],
    [-1.6, 0.4, 1.1],
    [1.6, 0.35, 1.0],
    [-3.1, 0.75, 2.2],
    [3.1, 0.7, 2.1],
  ];

  for (let i = 0; i < offsets.length; i++) {
    const bGroup = new THREE.Group();
    const [ox, oy, oz] = offsets[i];
    bGroup.position.set(ox, oy, oz);

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 6), birdMat);
    body.rotation.x = -Math.PI / 2;
    bGroup.add(body);

    const leftWing = new THREE.Mesh(wingGeo, birdMat);
    leftWing.position.set(-0.22, 0, 0);
    const rightWing = new THREE.Mesh(wingGeo, birdMat);
    rightWing.position.set(0.22, 0, 0);
    bGroup.add(leftWing, rightWing);

    group.add(bGroup);
    birds.push({ bGroup, leftWing, rightWing, phase: i * 0.7 });
  }

  return {
    group,
    update(t) {
      group.position.set(
        Math.cos(t * 0.28) * 12,
        10.5 + Math.sin(t * 0.55) * 1.4,
        -22 + Math.sin(t * 0.28) * 6
      );
      group.rotation.y = -t * 0.28;
      for (const b of birds) {
        const flap = Math.sin(t * 5.2 + b.phase) * 0.55;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
      }
    },
  };
}

function buildSkyDragon() {
  const g = new THREE.Group();
  const segments = [];
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcf48, emissive: 0x8a4f00, emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0x990f00, emissiveIntensity: 0.8 });

  for (let i = 0; i < 12; i++) {
    const seg = new THREE.Group();
    const r = i === 0 ? 0.68 : Math.max(0.22, 0.56 - i * 0.032);
    const body = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), goldMat);
    seg.add(body);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, r * 1.2, 4), redMat);
    fin.position.y = r * 0.85;
    seg.add(fin);
    g.add(seg);
    segments.push(seg);
  }
  return {
    group: g,
    update(t) {
      for (let i = 0; i < segments.length; i++) {
        const lag = t - i * 0.14;
        const s = segments[i];
        s.position.set(
          Math.sin(lag * 0.36) * 14,
          13.2 + Math.cos(lag * 0.72) * 2.0 + Math.sin(lag * 2.8) * 0.32,
          -30 + Math.sin(lag * 0.72) * 5
        );
      }
    },
  };
}

function buildHorizonLandmark(biomeId, animList) {
  const g = new THREE.Group();
  g.position.set(0, 0, -42);

  if (biomeId === 'vn_hagiang' || biomeId === 'vn_sapa') {
    // Towering Lũng Cú Flag Tower & Fansipan Peak on the horizon
    const mount = new THREE.Mesh(
      new THREE.ConeGeometry(18, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x2d4a43, roughness: 0.85 })
    );
    mount.position.set(0, 7, -12);
    g.add(mount);
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 2.2, 7.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 })
    );
    tower.position.set(0, 15.5, -12);
    g.add(tower);
    const giantFlag = buildVietnamFlagPole(6.5, animList, 0);
    giantFlag.scale.setScalar(2.2);
    giantFlag.position.set(0, 18.5, -12);
    g.add(giantFlag);
  } else if (biomeId === 'vn_saigon') {
    // Landmark 81 Skyscraper Spire on Horizon
    const lm81 = new THREE.Group();
    lm81.position.set(0, 0, -10);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1, metalness: 0.8, roughness: 0.2 });
    for (let b = 0; b < 5; b++) {
      const h = 22 - b * 3.2;
      const ox = (b === 0 ? 0 : (b % 2 === 0 ? 1 : -1) * 1.6);
      const oz = (b >= 3 ? (b % 2 === 0 ? 1 : -1) * 1.4 : 0);
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.8, h, 1.8), glassMat);
      col.position.set(ox, h / 2, oz);
      lm81.add(col);
    }
    g.add(lm81);
  } else {
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x1b5e55, roughness: 0.8 });
    for (const [x, h, r] of [[-14, 15, 5.5], [15, 17, 6], [-23, 12, 4.5], [23, 14, 5]]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), karstMat);
      m.position.set(x, h / 2 - 1, -6);
      g.add(m);
    }
  }
  return g;
}

export function buildRaceWorld(scene) {
  scene.background = new THREE.Color(0x1a2e3b);
  scene.fog = new THREE.FogExp2(0x2b4452, 0.0085);

  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x1d3244, 1.6);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.95);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  scene.add(dir);

  // Nano Banana Panoramic Sky Backdrop Plane on the distant horizon
  const texLoader = new THREE.TextureLoader();
  const skyTextures = {};
  for (const url of [
    '/assets/sky_vn_highlands.jpg',
    '/assets/sky_vn_hanoi_ninhbinh.jpg',
    '/assets/sky_vn_hue_danang.jpg',
    '/assets/sky_vn_dalat_nhatrang.jpg',
    '/assets/sky_vn_saigon.jpg',
    '/assets/sky_vn_mientay.jpg',
    '/assets/sky_vietnam.jpg',
    '/assets/sky_japan.jpg',
    '/assets/sky_egypt.jpg',
    '/assets/sky_europe.jpg',
    '/assets/sky_world.jpg',
  ]) {
    const t = texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    skyTextures[url] = t;
  }
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTextures['/assets/sky_vn_highlands.jpg'],
    fog: false,
    transparent: true,
    opacity: 0.96,
  });
  const skyBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(106, 48), skyMat);
  skyBackdrop.position.set(0, 16.2, -56);
  scene.add(skyBackdrop);

  const sunOrb = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffe299, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sunOrb.scale.setScalar(20);
  sunOrb.position.set(0, 15, -52);
  scene.add(sunOrb);

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e3b2f, roughness: 0.65, metalness: 0.18 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.08, -20);
  scene.add(ground);

  // ==========================================================================
  // SUBDIVIDED DYNAMIC CURVED & UNDULATING WALKING TRAIL MESH
  // Deforms in real-time into S-curves, arches, terraces, and coastal bends!
  // ==========================================================================
  const trailWidth = 9.2;
  const trailLength = 100;
  const segX = 18;
  const segZ = 84;
  const roadGeo = new THREE.PlaneGeometry(trailWidth, trailLength, segX, segZ);
  roadGeo.rotateX(-Math.PI / 2);
  // Shift Z so the trail spans from z = +22 (near camera) to z = -78 (horizon)
  roadGeo.translate(0, 0, -28);

  const basePositions = Float32Array.from(roadGeo.attributes.position.array);

  let currentRoadTex = createBiomeTrailTexture('vn_hagiang');
  const roadMat = new THREE.MeshStandardMaterial({
    map: currentRoadTex,
    roughness: 0.74,
    metalness: 0.08,
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.receiveShadow = true;
  scene.add(road);

  function deformTrailGeometry() {
    const pos = roadGeo.attributes.position;
    const arr = pos.array;
    for (let i = 0; i < pos.count; i++) {
      const idx = i * 3;
      const bx = basePositions[idx];
      const bz = basePositions[idx + 2];
      const pose = getTrailPose(bz, activeTrailScrollDist, activeTrailBiomeId);
      arr[idx] = bx + pose.x;
      arr[idx + 1] = pose.y;
      arr[idx + 2] = bz;
    }
    pos.needsUpdate = true;
  }

  // Persistent Animated 3D Sky Actors
  const dragon = buildSkyDragon();
  scene.add(dragon.group);

  const cranes = buildFlockOfCranes();
  scene.add(cranes.group);

  const balloons = [
    { mesh: buildSkyBalloon(0xdc2626, 0x991b1b), baseX: -14, baseY: 11.5, baseZ: -26, speed: 0.6, phase: 0.2 },
    { mesh: buildSkyBalloon(0xeab308, 0x854d0e), baseX: 15, baseY: 13.0, baseZ: -32, speed: 0.5, phase: 1.8 },
    { mesh: buildSkyBalloon(0x0ea5e9, 0x0369a1), baseX: -9, baseY: 15.2, baseZ: -38, speed: 0.55, phase: 3.4 },
    { mesh: buildSkyBalloon(0x10b981, 0x047857), baseX: 11, baseY: 10.2, baseZ: -20, speed: 0.68, phase: 4.7 },
  ];
  for (const b of balloons) {
    b.mesh.position.set(b.baseX, b.baseY, b.baseZ);
    scene.add(b.mesh);
  }

  const propsGroup = new THREE.Group();
  scene.add(propsGroup);
  let horizonGroup = null;
  let currentBiomeId = '';
  const propRows = [];
  const gateRows = [];
  const animCallbacks = [];
  let elapsed = 0;

  function updatePropRowsCurveAlignment() {
    for (const row of propRows) {
      const pose = getTrailPose(row.position.z, activeTrailScrollDist, activeTrailBiomeId);
      row.position.x = pose.x;
      row.position.y = pose.y;
      row.rotation.y = pose.angleY * 0.45;
    }
    for (const gate of gateRows) {
      const pose = getTrailPose(gate.position.z, activeTrailScrollDist, activeTrailBiomeId);
      gate.position.x = pose.x;
      gate.position.y = pose.y;
      gate.rotation.y = pose.angleY * 0.5;
    }
  }

  function rebuildBiomeScenery(biomeId) {
    if (biomeId === currentBiomeId) return;
    currentBiomeId = biomeId;
    activeTrailBiomeId = biomeId;

    const pal = BIOME_PALETTES[biomeId] || BIOME_PALETTES.vn_hagiang;
    scene.background.setHex(pal.skyTop);
    scene.fog.color.setHex(pal.fog);
    groundMat.color.setHex(pal.ground);
    sunOrb.material.color.setHex(pal.sun);

    if (skyTextures[pal.skyImg]) {
      skyMat.map = skyTextures[pal.skyImg];
      skyMat.needsUpdate = true;
    }

    currentRoadTex = createBiomeTrailTexture(biomeId);
    roadMat.map = currentRoadTex;
    roadMat.needsUpdate = true;

    const worldCard = document.getElementById('world-card');
    if (worldCard && pal.skyImg) {
      worldCard.style.backgroundImage = `linear-gradient(180deg, rgba(26, 22, 18, .74), rgba(14, 12, 10, .86)), url('${pal.skyImg}')`;
    }

    while (propsGroup.children.length) propsGroup.remove(propsGroup.children[0]);
    propRows.length = 0;
    gateRows.length = 0;
    animCallbacks.length = 0;

    const provStartIdx = Math.max(0, VN_PROVINCES_63.findIndex(p => p.biomeId === biomeId));

    for (let i = 0; i < 12; i++) {
      const row = new THREE.Group();
      row.position.z = 16 - i * 6.2;
      const leftProp = buildRoadsideScene(biomeId, -1, i, animCallbacks, provStartIdx);
      leftProp.position.x = -4.55;
      const rightProp = buildRoadsideScene(biomeId, 1, i + 1, animCallbacks, provStartIdx);
      rightProp.position.x = 4.55;
      row.add(leftProp, rightProp);
      propsGroup.add(row);
      propRows.push(row);
    }

    for (let gIdx = 0; gIdx < 2; gIdx++) {
      const gate = buildHighwayGateway(biomeId);
      gate.position.z = -14 - gIdx * 36;
      propsGroup.add(gate);
      gateRows.push(gate);
    }

    if (horizonGroup) scene.remove(horizonGroup);
    horizonGroup = buildHorizonLandmark(biomeId, animCallbacks);
    scene.add(horizonGroup);

    deformTrailGeometry();
    updatePropRowsCurveAlignment();
  }

  rebuildBiomeScenery('vn_hagiang');

  return {
    setBiome(biomeId) {
      rebuildBiomeScenery(biomeId || 'vn_hagiang');
    },
    update(dt, speedMult = 1.0) {
      elapsed += dt;
      const scroll = dt * 1.75 * speedMult;
      activeTrailScrollDist += scroll;
      currentRoadTex.offset.y -= scroll * 0.105;

      for (const row of propRows) {
        row.position.z += scroll;
        if (row.position.z > 19) {
          row.position.z -= 12 * 6.2;
        }
      }
      for (const gate of gateRows) {
        gate.position.z += scroll;
        if (gate.position.z > 19) {
          gate.position.z -= 72;
        }
      }

      deformTrailGeometry();
      updatePropRowsCurveAlignment();

      dragon.update(elapsed);
      cranes.update(elapsed);
      for (const b of balloons) {
        b.mesh.position.y = b.baseY + Math.sin(elapsed * b.speed + b.phase) * 0.85;
        b.mesh.position.x = b.baseX + Math.cos(elapsed * b.speed * 0.6 + b.phase) * 1.3;
        b.mesh.rotation.y = elapsed * 0.3 + b.phase;
      }
      for (const fn of animCallbacks) fn(elapsed);
    },
  };
}
