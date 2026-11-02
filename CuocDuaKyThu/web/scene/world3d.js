import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise2D, createNoise3D } from 'simplex-noise';

const noise2D = createNoise2D();
const noise3D = createNoise3D();

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

// Custom landmark-directed trail trajectories:
// Steers, curves, and elevates the 3D road from the foreground (z = +10..-2, centered for walkers)
// directly toward the orientation & focal point of the landmark in each region's panorama!
const BIOME_TRAIL_DIRECTORS = {
  // Hà Giang: Climbs upward-left toward Cột Cờ Lũng Cú on the peak, overlooking Nho Quế canyon on right
  vn_hagiang: { targetX: -3.6, targetY: 3.4, fgX: 0.25, waveAmpX: 0.72, waveFreqZ: 0.065, waveAmpY: 0.14, skyPanX: 4.5, skyPanY: 12.6, terrainMode: 'mountain' },
  // Sa Pa: Curves & climbs along golden terraced rice slopes toward Fansipan Buddha peak on right-center
  vn_sapa: { targetX: 3.6, targetY: 3.1, fgX: -0.35, waveAmpX: 0.65, waveFreqZ: 0.058, waveAmpY: 0.16, skyPanX: -4.2, skyPanY: 12.5, terrainMode: 'terrace' },
  // Vịnh Hạ Long: Sweeps rightward along the emerald bay channel toward Hòn Trống Mái in center
  vn_halong: { targetX: 2.6, targetY: 0.7, fgX: -0.25, waveAmpX: 0.58, waveFreqZ: 0.052, waveAmpY: 0.04, skyPanX: 0.0, skyPanY: 12.4, terrainMode: 'water' },
  // Hà Nội: Vermilion Thê Húc wooden bridge arches over Hồ Gươm from right-foreground toward Tháp Rùa on center-left
  vn_hanoi: { targetX: -3.0, targetY: 1.1, fgX: 0.55, waveAmpX: 0.38, waveFreqZ: 0.045, archBumpY: 0.52, skyPanX: -4.8, skyPanY: 12.4, terrainMode: 'water' },
  // Ninh Bình: Winds along the Tràng An river valley into the karst water cave & Bái Đính Pagoda on upper-right
  vn_ninhbinh: { targetX: -2.2, targetY: 1.4, fgX: 0.25, waveAmpX: 0.68, waveFreqZ: 0.06, waveAmpY: 0.04, skyPanX: -2.8, skyPanY: 12.6, terrainMode: 'valley' },
  // Cố Đô Huế: Diagonal Imperial Bát Tràng brick avenue leading toward Ngọ Môn Gate on left & Trường Tiền on right
  vn_hue: { targetX: -3.4, targetY: 2.0, fgX: 0.45, waveAmpX: 0.28, waveFreqZ: 0.04, waveAmpY: 0.03, skyPanX: 3.5, skyPanY: 12.5, hasImperialGate: false, terrainMode: 'water' },
  // Đà Nẵng: Sweeps diagonally from foreground-left upward-right along Cầu Vàng's giant stone hands toward Cầu Rồng
  vn_danang: { targetX: 4.4, targetY: 3.6, fgX: -0.65, waveAmpX: 0.38, waveFreqZ: 0.046, archBumpY: 0.35, skyPanX: 0.0, skyPanY: 12.6, terrainMode: 'mountain' },
  // Hội An: Gentle lantern-lit riverside curve toward Chùa Cầu in the center along the glowing Hoài River
  vn_hoian: { targetX: 2.0, targetY: 1.0, fgX: -0.3, waveAmpX: 0.52, waveFreqZ: 0.055, waveAmpY: 0.03, skyPanX: -0.8, skyPanY: 12.4, terrainMode: 'water' },
  // Đà Lạt: Winds & climbs through misty pine hills & wildflowers toward Lâm Viên Artichoke Bud on right-center
  vn_dalat: { targetX: 3.2, targetY: 2.8, fgX: -0.3, waveAmpX: 0.68, waveFreqZ: 0.062, waveAmpY: 0.16, skyPanX: -4.2, skyPanY: 12.5, terrainMode: 'mountain' },
  // Nha Trang: Curves rightward along the white-sand turquoise bay toward Tháp Bà Ponagar on the headland
  vn_nhatrang: { targetX: 3.8, targetY: 1.4, fgX: -0.35, waveAmpX: 0.55, waveFreqZ: 0.052, waveAmpY: 0.04, skyPanX: -5.8, skyPanY: 12.4, terrainMode: 'water' },
  // Sài Gòn: Sweeps from Bến Nhà Rồng on foreground-left diagonally rightward toward Bitexco & Landmark 81
  vn_saigon: { targetX: 3.6, targetY: 1.9, fgX: -0.5, waveAmpX: 0.32, waveFreqZ: 0.042, waveAmpY: 0.03, skyPanX: 0.5, skyPanY: 12.6, terrainMode: 'water' },
  // Miền Tây: Rustic wooden bridge winds diagonally upward-left across Cái Răng Floating Market toward Đất Mũi Cà Mau Sail Monument
  vn_mientay: { targetX: -3.6, targetY: 1.7, fgX: 0.35, waveAmpX: 0.62, waveFreqZ: 0.064, waveAmpY: 0.07, skyPanX: 2.5, skyPanY: 12.5, terrainMode: 'water' },
  // Fallback / World Biomes
  vietnam: { targetX: 3.2, targetY: 1.0, fgX: -0.2, waveAmpX: 0.55, waveFreqZ: 0.052, skyPanX: 0, skyPanY: 12.5, terrainMode: 'water' },
  japan: { targetX: -3.0, targetY: 1.8, fgX: 0.3, waveAmpX: 0.45, waveFreqZ: 0.048, archBumpY: 0.4, skyPanX: 0, skyPanY: 12.5, terrainMode: 'mountain' },
  egypt: { targetX: 3.4, targetY: 2.2, fgX: -0.3, waveAmpX: 0.65, waveFreqZ: 0.058, skyPanX: 0, skyPanY: 12.5, terrainMode: 'mountain' },
  france: { targetX: -3.2, targetY: 1.6, fgX: 0.3, waveAmpX: 0.35, waveFreqZ: 0.042, skyPanX: 0, skyPanY: 12.5, terrainMode: 'valley' },
  usa: { targetX: 4.0, targetY: 2.8, fgX: -0.4, waveAmpX: 0.42, waveFreqZ: 0.045, skyPanX: 0, skyPanY: 12.5, terrainMode: 'mountain' },
  cosmos: { targetX: -3.8, targetY: 3.2, fgX: 0.3, waveAmpX: 0.6, waveFreqZ: 0.055, skyPanX: 0, skyPanY: 12.5, terrainMode: 'mountain' },
};

function evalTrailCoord(z, s, cfg) {
  // Normalized progress from foreground walker zone (z = +6 -> t = 0) to distant landmark horizon (z = -52 -> t = 1)
  const t = Math.max(0, Math.min(1, (6 - z) / 58));
  const dirX = (cfg.fgX || 0) * (1 - t) + (cfg.targetX || 0) * Math.pow(t, 1.32);
  const dirY = (cfg.targetY || 0) * Math.pow(t, 1.22) + (cfg.archBumpY ? Math.sin(t * Math.PI) * cfg.archBumpY : 0);
  const waveX = Math.sin(z * (cfg.waveFreqZ || 0.055) - s * 0.62) * (cfg.waveAmpX || 0.5) * (0.28 + 0.72 * (1 - t * 0.35));
  const waveY = (cfg.waveAmpY || 0) * Math.cos(z * 0.065 - s * 0.55);
  return {
    x: dirX + waveX,
    y: Math.max(0.03, 0.04 + dirY + waveY),
    t,
  };
}

export function getTrailPose(z, scrollDist = activeTrailScrollDist, biomeId = activeTrailBiomeId) {
  const s = scrollDist * 0.085;
  const cfg = BIOME_TRAIL_DIRECTORS[biomeId] || BIOME_TRAIL_DIRECTORS.vn_hagiang;
  const cur = evalTrailCoord(z, s, cfg);
  const dz = 0.6;
  const nxt = evalTrailCoord(z - dz, s, cfg);
  const dx = nxt.x - cur.x;
  const angleY = Math.atan2(dx, dz) * 0.65;
  return { x: cur.x, y: cur.y, angleY, t: cur.t };
}

const BIOME_PALETTES = {
  vn_hagiang: {
    skyTop: 0x1a2e3b,
    fog: 0x2b4452,
    ground: 0x1e3b2f,
    hillColor: 0x2f5241,
    lane: 0xd94e34,
    sun: 0xffdf9e,
    skyImg: '/assets/sky_vn_hagiang.jpg',
  },
  vn_sapa: {
    skyTop: 0x243322,
    fog: 0x3b4d2e,
    ground: 0x4a5d23,
    hillColor: 0xa17c1b,
    lane: 0xe0a945,
    sun: 0xffe49e,
    skyImg: '/assets/sky_vn_sapa.jpg',
  },
  vn_halong: {
    skyTop: 0x10323d,
    fog: 0x1a4b57,
    ground: 0x0c4a52,
    hillColor: 0x166970,
    lane: 0xd4a86a,
    sun: 0xffe6a8,
    skyImg: '/assets/sky_vn_halong.jpg',
  },
  vn_hanoi: {
    skyTop: 0x2b211b,
    fog: 0x3d2e24,
    ground: 0x153d33,
    hillColor: 0x285e4d,
    lane: 0xc92a1d,
    sun: 0xffd98a,
    skyImg: '/assets/sky_vn_hanoi.jpg',
  },
  vn_ninhbinh: {
    skyTop: 0x182e28,
    fog: 0x26443b,
    ground: 0x174236,
    hillColor: 0x4d6b2b,
    lane: 0xb89f72,
    sun: 0xf7dca1,
    skyImg: '/assets/sky_vn_ninhbinh.jpg',
  },
  vn_hue: {
    skyTop: 0x261d33,
    fog: 0x3a2b4d,
    ground: 0x1c2838,
    hillColor: 0x312e54,
    lane: 0xd99b38,
    sun: 0xffd28a,
    skyImg: '/assets/sky_vn_hue.jpg',
  },
  vn_danang: {
    skyTop: 0x1d2d44,
    fog: 0x2e4566,
    ground: 0x243b54,
    hillColor: 0x2f5244,
    lane: 0xffc745,
    sun: 0xfff0b8,
    skyImg: '/assets/sky_vn_danang.jpg',
  },
  vn_hoian: {
    skyTop: 0x141824,
    fog: 0x242838,
    ground: 0x122630,
    hillColor: 0x2d3a45,
    lane: 0xe8a338,
    sun: 0xffd478,
    skyImg: '/assets/sky_vn_hoian.jpg',
  },
  vn_dalat: {
    skyTop: 0x1b2d2a,
    fog: 0x2c4742,
    ground: 0x1e3b2b,
    hillColor: 0x2b593c,
    lane: 0x9eb872,
    sun: 0xffe8b5,
    skyImg: '/assets/sky_vn_dalat.jpg',
  },
  vn_nhatrang: {
    skyTop: 0x0e3854,
    fog: 0x195375,
    ground: 0x0a5c75,
    hillColor: 0x14829c,
    lane: 0xf2d294,
    sun: 0xfff2b8,
    skyImg: '/assets/sky_vn_nhatrang.jpg',
  },
  vn_saigon: {
    skyTop: 0x1c2238,
    fog: 0x2d3554,
    ground: 0x1b2438,
    hillColor: 0x3b2d4a,
    lane: 0x60a5fa,
    sun: 0xffcf87,
    skyImg: '/assets/sky_vn_saigon.jpg',
  },
  vn_mientay: {
    skyTop: 0x242b1a,
    fog: 0x3b4428,
    ground: 0x2d442b,
    hillColor: 0x4d6628,
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
    // Sa Pa Ruộng Bậc Thang: Rich Dark-Roast Mountain Soil + Mossy Slate Stepping Stones + Golden Rice Trim
    g.fillStyle = '#713f12';
    g.fillRect(0, 0, 512, 512);
    const earthGrad = g.createLinearGradient(40, 0, 472, 0);
    earthGrad.addColorStop(0, '#3e2714');
    earthGrad.addColorStop(0.5, '#52361e');
    earthGrad.addColorStop(1, '#3e2714');
    g.fillStyle = earthGrad;
    g.fillRect(40, 0, 432, 512);

    // Natural dark slate stepping stones embedded in warm earth
    const stoneCols = ['#57534e', '#44403c', '#61584f', '#3f3b37'];
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
    // Warm golden ripe rice stalks along both edges
    for (let y = 0; y < 512; y += 12) {
      g.fillStyle = y % 24 === 0 ? '#ca8a04' : '#a16207';
      g.fillRect(24, y, 20, 8);
      g.fillRect(468, y, 20, 8);
    }
  } else if (biomeId === 'vn_hanoi') {
    // Cầu Thê Húc Hồ Gươm: Deep Vermilion Lacquered Wooden Bridge Deck + Golden Lotus Medallions
    g.fillStyle = '#0f3d33'; // Hoan Kiem deep emerald water on outer edges
    g.fillRect(0, 0, 512, 512);
    const bridgeGrad = g.createLinearGradient(34, 0, 478, 0);
    bridgeGrad.addColorStop(0, '#5c1212');
    bridgeGrad.addColorStop(0.5, '#7f1d1d');
    bridgeGrad.addColorStop(1, '#5c1212');
    g.fillStyle = bridgeGrad;
    g.fillRect(34, 0, 444, 512);

    // Horizontal crimson wooden bridge planks
    for (let y = 0; y < 512; y += 24) {
      g.fillStyle = (y / 24) % 2 === 0 ? '#6b1616' : '#7f1d1d';
      g.fillRect(44, y + 2, 424, 20);
      g.fillStyle = 'rgba(217, 119, 6, 0.18)';
      g.fillRect(44, y + 3, 424, 3);
    }
    // Vermilion & Gold bridge side rails
    g.fillStyle = '#b45309';
    g.fillRect(32, 0, 14, 512);
    g.fillRect(466, 0, 14, 512);
    // Golden lotus emblem down the center of Thê Húc bridge
    g.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    g.lineWidth = 3;
    for (let y = 40; y < 512; y += 80) {
      g.beginPath();
      g.arc(256, y, 16, 0, Math.PI * 2);
      g.stroke();
    }
  } else if (biomeId === 'vn_danang') {
    // Cầu Vàng Bà Nà Hills: Rich Antique Bronze-Gold Deck + Purple Lobelia flower planters
    g.fillStyle = '#3b0764';
    g.fillRect(0, 0, 512, 512);
    const goldGrad = g.createLinearGradient(36, 0, 476, 0);
    goldGrad.addColorStop(0, '#5c2d0c');
    goldGrad.addColorStop(0.25, '#78350f');
    goldGrad.addColorStop(0.5, '#92400e');
    goldGrad.addColorStop(0.75, '#78350f');
    goldGrad.addColorStop(1, '#5c2d0c');
    g.fillStyle = goldGrad;
    g.fillRect(36, 0, 440, 512);

    // Rich antique golden walkway planks (never bleached white)
    for (let y = 0; y < 512; y += 20) {
      g.fillStyle = (y / 20) % 2 === 0 ? 'rgba(217, 119, 6, 0.25)' : 'rgba(69, 26, 3, 0.28)';
      g.fillRect(48, y + 2, 416, 16);
    }
    // Purple Lobelia flower beds (Hoa Nữ Hoàng Xanh Tím trên Cầu Vàng)
    for (let y = 0; y < 512; y += 14) {
      g.fillStyle = y % 28 === 0 ? '#9333ea' : '#ca8a04';
      g.beginPath();
      g.arc(28, y + 7, 8, 0, Math.PI * 2);
      g.arc(484, y + 7, 8, 0, Math.PI * 2);
      g.fill();
    }
  } else if (biomeId === 'vn_hue') {
    // Kinh Thành Huế: Diagonal Herringbone Bát Tràng Terracotta Bricks + Royal Gold Trim
    g.fillStyle = '#1e3a2f';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#5c1f0c';
    g.fillRect(38, 0, 436, 512);

    const brickCols = ['#6e260e', '#7c2d12', '#61340b', '#78350f'];
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
    g.fillStyle = '#b45309';
    g.fillRect(34, 0, 12, 512);
    g.fillRect(466, 0, 12, 512);
  } else if (biomeId === 'vn_nhatrang' || biomeId === 'vn_halong') {
    // Vịnh Hạ Long & Nha Trang: Deep Emerald-Slate & Warm Teakwood Coastal Pier Promenade (Zero white glare!)
    g.fillStyle = '#0c4a6e'; // Deep ocean border
    g.fillRect(0, 0, 512, 512);
    const pierGrad = g.createLinearGradient(32, 0, 480, 0);
    pierGrad.addColorStop(0, '#27383b');
    pierGrad.addColorStop(0.5, '#33484d');
    pierGrad.addColorStop(1, '#1e3a4c');
    g.fillStyle = pierGrad;
    g.fillRect(32, 0, 448, 512);

    // Rich dark sandstone & teakwood coastal promenade pavers
    for (let r = 0; r < 16; r++) {
      const y = r * 32;
      for (let x = 56; x < 436; x += 56) {
        g.fillStyle = (r + x) % 2 === 0 ? '#4b5563' : '#3f4a56';
        g.beginPath();
        g.roundRect(x + (r % 2) * 12, y + 3, 48, 26, 6);
        g.fill();
      }
      // Warm bronze promenade curb on left & subtle turquoise wave rim on right
      g.fillStyle = '#92400e';
      g.fillRect(34, y + 2, 14, 28);
      g.fillStyle = 'rgba(56, 189, 248, 0.38)';
      g.beginPath();
      g.arc(466 + Math.sin(r) * 6, y + 16, 12, 0, Math.PI * 2);
      g.fill();
    }
  } else if (biomeId === 'vn_saigon') {
    // Phố Đi Bộ Nguyễn Huệ Sài Gòn: Deep Charcoal Basalt Granite Promenade + Glowing Fountain Strip
    g.fillStyle = '#0f172a';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#1e293b';
    g.fillRect(36, 0, 440, 512);

    // Modern dark basalt granite slabs
    for (let r = 0; r < 16; r++) {
      const y = r * 32;
      for (let x = 44; x < 460; x += 64) {
        g.fillStyle = ((r + x / 64) % 2 === 0) ? '#334155' : '#263346';
        g.fillRect(x + 2, y + 2, 60, 28);
      }
    }
    // Glowing cyan lotus fountain strip in the center of Nguyen Hue Walking Street
    const fountainGrad = g.createLinearGradient(226, 0, 286, 0);
    fountainGrad.addColorStop(0, '#0369a1');
    fountainGrad.addColorStop(0.5, '#0284c7');
    fountainGrad.addColorStop(1, '#0369a1');
    g.fillStyle = fountainGrad;
    g.fillRect(232, 0, 48, 512);
  } else if (biomeId === 'vn_mientay') {
    // Chợ Nổi Miền Tây: Rustic Dark Teakwood Canal Bridge Planks over Silt-Emerald Water
    g.fillStyle = '#115e59';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#2e1202';
    g.fillRect(46, 0, 420, 512);

    // Rich dark wooden planks
    const woodCols = ['#4a2208', '#5c2b0b', '#3f1d06', '#542709'];
    for (let r = 0; r < 24; r++) {
      const y = r * 21.3;
      g.fillStyle = woodCols[r % woodCols.length];
      g.beginPath();
      g.roundRect(52 + (r % 2) * 4, y + 2, 404, 16, 4);
      g.fill();
      // Bamboo side handrails
      g.fillStyle = '#a16207';
      g.fillRect(40, y, 10, 20);
      g.fillRect(462, y, 10, 20);
    }
  } else {
    // Classic Warm Ancient Vietnamese Flagstone Trail (Tràng An, Hội An, Đà Lạt) - Rich Earthy Tones
    g.fillStyle = '#193b29';
    g.fillRect(0, 0, 512, 512);
    const mortarGrad = g.createLinearGradient(38, 0, 474, 0);
    mortarGrad.addColorStop(0, '#2e251d');
    mortarGrad.addColorStop(0.5, '#42362b');
    mortarGrad.addColorStop(1, '#2e251d');
    g.fillStyle = mortarGrad;
    g.fillRect(38, 0, 436, 512);

    for (let y = 0; y < 512; y += 32) {
      g.fillStyle = (y / 32) % 2 === 0 ? '#926829' : '#78531e';
      g.fillRect(30, y + 2, 16, 28);
      g.fillRect(466, y + 2, 16, 28);
    }
    const stonePalette = ['#4f4336', '#594b3d', '#453a2e', '#615243', '#4a3e32', '#544739'];
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

function buildTrailsideFoliage(biomeId, side, variant, animList) {
  const g = new THREE.Group();
  const phaseOffset = variant * 1.3 + (side > 0 ? 0.7 : 0);

  // Biome-adaptive organic foliage & blossom palettes
  const bushPalettes = {
    vn_hagiang: [0x274e3b, 0x36593e, 0x1e3f2f],
    vn_sapa: [0x3f6212, 0x4d7c0f, 0x65a30d],
    vn_halong: [0x1b6344, 0x164e35, 0x0f5238],
    vn_hanoi: [0xca8a04, 0xb45309, 0x3f6212],
    vn_ninhbinh: [0x15803d, 0x166534, 0x14532d],
    vn_hue: [0x2e5a36, 0x3b6e44, 0x1e4620],
    vn_danang: [0x365314, 0x3f6212, 0x166534],
    vn_hoian: [0x15803d, 0x166534, 0x3f6212],
    vn_dalat: [0x14532d, 0x064e3b, 0x1e3a2f],
    vn_nhatrang: [0x16a34a, 0x15803d, 0x22c55e],
    vn_saigon: [0x15803d, 0x166534, 0x14532d],
    vn_mientay: [0x22c55e, 0x16a34a, 0x15803d],
  };
  const flowerPalettes = {
    vn_hagiang: [0xf472b6, 0xfbcfe8, 0xc084fc], // Hoa Tam Giác Mạch hồng tím
    vn_sapa: [0xfacc15, 0xfde047, 0xfb923c], // Hoa cải vàng Tây Bắc
    vn_halong: [0xffffff, 0xfef08a, 0x38bdf8],
    vn_hanoi: [0xfacc15, 0xf59e0b, 0xef4444], // Hoa sữa & lá vàng mùa thu
    vn_ninhbinh: [0xf472b6, 0xfb7185, 0xfef08a], // Hoa sen hồng Tràng An
    vn_hue: [0xc084fc, 0xa855f7, 0xfacc15], // Sắc tím Huế & hoàng mai
    vn_danang: [0xf43f5e, 0xfb7185, 0xfacc15], // Hoa cẩm tú cầu Bà Nà
    vn_hoian: [0xe11d48, 0xf43f5e, 0xfacc15], // Hoa giấy đỏ Hội An
    vn_dalat: [0xfacc15, 0xf59e0b, 0xa855f7], // Hoa dã quỳ vàng & cẩm tú cầu
    vn_nhatrang: [0xf97316, 0xfacc15, 0xffffff],
    vn_saigon: [0xfacc15, 0xec4899, 0x38bdf8],
    vn_mientay: [0xfacc15, 0xf43f5e, 0xf97316],
  };

  const greens = bushPalettes[biomeId] || bushPalettes.vn_hagiang;
  const flowers = flowerPalettes[biomeId] || flowerPalettes.vn_hagiang;

  // 1. Sculpted 3D Mossy Roadside Boulders (Dodecahedron crags instead of round balls)
  const rockMat = new THREE.MeshStandardMaterial({
    map: mossStoneTex,
    color: 0x6b7c73,
    roughness: 0.9,
    flatShading: true,
  });
  for (let rIdx = 0; rIdx < 2; rIdx++) {
    const rSize = 0.28 + ((variant + rIdx) % 3) * 0.1;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rSize, 1), rockMat);
    rock.scale.set(1.35, 0.78, 1.15);
    rock.rotation.set(rIdx * 0.7, variant * 1.1, rIdx * 0.4);
    rock.position.set(side * (0.05 + rIdx * 0.42), rSize * 0.35, (rIdx - 0.5) * 2.2);
    rock.castShadow = true;
    rock.receiveShadow = true;
    g.add(rock);
  }

  // 2. Multi-Clustered Organic Shrubs & Ferns (Faceted Icosahedron foliage clusters)
  for (let i = 0; i < 3; i++) {
    const zOff = (i - 1) * 1.65;
    const cluster = new THREE.Group();
    cluster.position.set(side * (0.14 + (i % 2) * 0.38), 0, zOff);

    const bMat = new THREE.MeshStandardMaterial({
      color: greens[(variant + i) % greens.length],
      roughness: 0.84,
      flatShading: true,
    });
    const fMat = new THREE.MeshStandardMaterial({
      color: flowers[(variant + i) % flowers.length],
      emissive: flowers[(variant + i) % flowers.length],
      emissiveIntensity: 0.18,
      roughness: 0.65,
    });

    for (let sub = 0; sub < 3; sub++) {
      const r = 0.26 + ((variant + i + sub) % 3) * 0.08;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), bMat);
      crown.scale.set(1.25, 0.72 + (sub % 2) * 0.2, 1.15);
      crown.position.set(
        (sub - 1) * 0.24,
        r * 0.55 + (sub === 1 ? 0.12 : 0),
        (sub % 2 - 0.5) * 0.22
      );
      crown.rotation.y = sub * 1.2 + variant;
      crown.castShadow = true;
      cluster.add(crown);

      const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), fMat);
      blossom.position.set(crown.position.x - side * 0.06, crown.position.y + r * 0.58, crown.position.z + 0.06);
      cluster.add(blossom);
    }
    g.add(cluster);
  }

  // 3. Swaying 3D Vietnamese Green Bamboo Grove (Khóm Tre / Trúc Xanh Việt Nam)
  if ((variant + (side > 0 ? 1 : 0)) % 2 === 0 && biomeId !== 'vn_saigon') {
    const bambooGroup = new THREE.Group();
    bambooGroup.position.set(side * 0.92, 0, -0.85);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.62 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.75, flatShading: true });

    for (let b = 0; b < 3; b++) {
      const h = 2.1 + (b % 2) * 0.55;
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, h, 6), stalkMat);
      stalk.position.set((b - 1) * 0.16, h / 2, (b % 2) * 0.14);
      stalk.rotation.z = -side * (0.08 + b * 0.04);
      bambooGroup.add(stalk);

      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.65, 5), leafMat);
      tuft.position.set(stalk.position.x - side * 0.12, h - 0.15, stalk.position.z);
      tuft.rotation.z = -side * 0.22;
      bambooGroup.add(tuft);
    }
    g.add(bambooGroup);
    if (animList) {
      animList.push(t => {
        bambooGroup.rotation.z = Math.sin(t * 1.9 + phaseOffset) * 0.055;
      });
    }
  }

  return g;
}

// Procedural architectural & natural textures for rich 3D Vietnamese heritage buildings
const mossStoneTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#5c6b64';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = i % 3 === 0 ? 'rgba(63, 98, 18, 0.38)' : i % 2 === 0 ? 'rgba(42, 52, 48, 0.35)' : 'rgba(148, 163, 156, 0.25)';
    g.beginPath();
    g.arc((i * 43) % w, (i * 71) % h, 4 + (i % 10), 0, Math.PI * 2);
    g.fill();
  }
});

const heritageWallTex = canvasTex(128, 128, (g, w, h) => {
  // Warm Hoi An / Hanoi ochre plaster with weathered patina & wooden lattice window
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#d9962b');
  grad.addColorStop(0.55, '#e8a838');
  grad.addColorStop(1, '#b8761c');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);

  // Subtle moss & weathering streaks
  for (let i = 0; i < 32; i++) {
    g.fillStyle = 'rgba(74, 52, 22, 0.16)';
    g.fillRect((i * 29) % w, (i * 41) % h, 14, 6);
  }
  // Wooden cornice & pillars
  g.fillStyle = '#4a2210';
  g.fillRect(0, 0, w, 10);
  g.fillRect(0, h - 10, w, 10);
  g.fillRect(6, 0, 8, h);
  g.fillRect(w - 14, 0, 8, h);

  // Glowing heritage window with wooden shutters
  g.fillStyle = '#3b1a0b';
  g.fillRect(34, 30, 60, 56);
  const winGlow = g.createRadialGradient(64, 58, 4, 64, 58, 30);
  winGlow.addColorStop(0, '#fff3b0');
  winGlow.addColorStop(0.6, '#f59e0b');
  winGlow.addColorStop(1, '#78350f');
  g.fillStyle = winGlow;
  g.fillRect(40, 36, 48, 44);
  g.fillStyle = '#3b1a0b';
  for (let x = 48; x < 88; x += 12) g.fillRect(x, 36, 3, 44);
  g.fillRect(40, 56, 48, 3);
});

const yinYangRoofTex = canvasTex(128, 128, (g, w, h) => {
  // Traditional Vietnamese Yin-Yang Terra-Cotta Roof Tiles (Ngói Âm Dương)
  g.fillStyle = '#7c2214';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 12) {
    g.fillStyle = x % 24 === 0 ? '#9e2a1b' : '#5e170d';
    g.fillRect(x, 0, 10, h);
  }
  for (let y = 0; y < h; y += 16) {
    g.fillStyle = 'rgba(28, 10, 6, 0.35)';
    g.fillRect(0, y, w, 3);
  }
});

const chamBrickTex = canvasTex(128, 128, (g, w, h) => {
  // Ancient Po Nagar Champa Fired Red Brickcourses & Pilasters
  g.fillStyle = '#9a2e17';
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 10) {
    const rowOff = (y / 10) % 2 === 0 ? 0 : 12;
    for (let x = -12; x < w; x += 24) {
      g.fillStyle = (x + y) % 3 === 0 ? '#b9381c' : '#7f2310';
      g.fillRect(x + rowOff + 1, y + 1, 22, 8);
    }
  }
  // Carved vertical pilaster grooves
  g.fillStyle = 'rgba(45, 10, 4, 0.35)';
  g.fillRect(24, 14, 10, h - 28);
  g.fillRect(w - 34, 14, 10, h - 28);
});

const skyscraperGlassTex = canvasTex(128, 256, (g, w, h) => {
  // Modern Saigon Skyscraper Illuminated Curtain Wall
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0f2942');
  grad.addColorStop(0.5, '#1e3a8a');
  grad.addColorStop(1, '#09192b');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  for (let y = 8; y < h - 8; y += 14) {
    for (let x = 8; x < w - 8; x += 16) {
      const lit = (x * 7 + y * 13) % 5 !== 0;
      g.fillStyle = lit
        ? (x + y) % 3 === 0
          ? 'rgba(253, 224, 71, 0.85)'
          : 'rgba(125, 211, 252, 0.82)'
        : 'rgba(15, 23, 42, 0.7)';
      g.fillRect(x, y, 11, 9);
    }
  }
});

// Builds an animated 3D cascading mountain waterfall with rising mist spray
function build3DWaterfall(side, phaseOffset, animList) {
  const g = new THREE.Group();
  const streamMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.38,
    roughness: 0.2,
    transparent: true,
    opacity: 0.82,
  });
  const stream = new THREE.Mesh(new THREE.BoxGeometry(0.52, 4.4, 0.45), streamMat);
  stream.position.set(-side * 0.85, 2.35, 0.35);
  stream.rotation.z = side * 0.16;
  g.add(stream);

  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.1, 0.12, 12),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.65 })
  );
  pool.position.set(-side * 1.15, 0.12, 0.35);
  g.add(pool);

  if (animList) {
    animList.push(t => {
      streamMat.emissiveIntensity = 0.32 + Math.sin(t * 6.5 + phaseOffset) * 0.14;
      pool.scale.setScalar(0.92 + Math.sin(t * 4.2 + phaseOffset) * 0.1);
    });
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

// Builds a 3D Simplex-Noise sculpted limestone karst mountain with natural crags, vegetation cap & mist halo
function buildSculptedKarstMountain(radius = 2.6, height = 7.2, rockColor = 0x3b4d54, foliageColor = 0x22543d, seed = 1) {
  const g = new THREE.Group();
  const geo = new THREE.ConeGeometry(radius, height, 14, 7);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const hNorm = (vy + height / 2) / height;
    const n = noise3D(vx * 0.55 + seed * 3.1, vy * 0.45, vz * 0.55 + seed * 1.7);
    const cragScale = 1 + n * 0.28 * (1 - hNorm * 0.35);
    pos.setXYZ(i, vx * cragScale, vy + n * 0.32 * hNorm, vz * cragScale);
  }
  geo.computeVertexNormals();

  const rockMat = new THREE.MeshStandardMaterial({
    color: rockColor,
    roughness: 0.86,
    metalness: 0.08,
    flatShading: true,
  });
  const mainPeak = new THREE.Mesh(geo, rockMat);
  mainPeak.position.y = height / 2 - 0.3;
  mainPeak.castShadow = true;
  mainPeak.receiveShadow = true;
  g.add(mainPeak);

  // Secondary natural sub-peak for multi-dimensional silhouette
  const subH = height * 0.62;
  const subGeo = new THREE.ConeGeometry(radius * 0.68, subH, 10, 5);
  const subMesh = new THREE.Mesh(subGeo, rockMat);
  subMesh.position.set(radius * 0.45 * (seed % 2 === 0 ? 1 : -1), subH / 2 - 0.3, -0.55);
  g.add(subMesh);

  // Lush foliage canopy clusters clinging to the karst slopes
  const vegMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.82 });
  for (let c = 0; c < 3; c++) {
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(radius * (0.34 - c * 0.05), 1), vegMat);
    bush.scale.set(1.25, 0.68, 1.15);
    bush.position.set(
      Math.cos(c * 2.1 + seed) * radius * 0.38,
      height * (0.28 + c * 0.22),
      Math.sin(c * 2.1 + seed) * radius * 0.32
    );
    g.add(bush);
  }
  return g;
}

// ============================================================================
// 12 VIETNAMESE REGIONAL ROADSIDE DIORAMA SCENES (DETAILED 3D ARCHITECTURE)
// ============================================================================
function buildRoadsideScene(biomeId, side, variant, animList, provBaseIdx = 0) {
  const g = new THREE.Group();
  const phaseOffset = variant * 1.7 + (side > 0 ? 0.9 : 0);

  g.add(buildTrailsideFoliage(biomeId, side, variant, animList));

  // Place a 63-Province National Highway Milestone Post on the right side every 3 rows
  if (side > 0 && variant % 3 === 0) {
    const ms = buildVietnamMilestonePost(provBaseIdx + Math.floor(variant / 3));
    ms.position.set(0.35, 0, 1.3);
    ms.rotation.y = -0.25;
    g.add(ms);
  }

  if (biomeId === 'vn_hagiang') {
    // 1. HÀ GIANG: Hộ Lan Đèo Mã Pí Lèng + Nhà Trình Tường Đá + Núi Đá Tai Mèo + Cột Cờ Lũng Cú Mini
    const railGroup = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.68, roughness: 0.32 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 5.2), steelMat);
    beam.position.set(-side * 0.12, 0.52, 0);
    railGroup.add(beam);
    for (const zPost of [-2.0, 0, 2.0]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 8), postMat);
      p.position.set(-side * 0.14, 0.36, zPost);
      railGroup.add(p);
    }
    g.add(railGroup);

    // Sculpted Limestone Karst Peak + Cascading Cliff Waterfall
    const peak = buildSculptedKarstMountain(2.6, 7.4 + (variant % 3) * 1.6, 0x3b4d54, 0x274e3b, variant + (side > 0 ? 10 : 0));
    peak.position.set(side * 4.4, 0, -0.3);
    if (variant % 2 === 1) {
      peak.add(build3DWaterfall(side, phaseOffset, animList));
    }
    g.add(peak);

    if (variant % 2 === 0) {
      // Traditional Ha Giang "Nhà Trình Tường" (Yellow Rammed-Earth House with Stone Fence & Yin-Yang Roof)
      const houseGrp = new THREE.Group();
      houseGrp.position.set(side * 2.45, 0, 0.4);
      const stoneWall = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.65, 0.25),
        new THREE.MeshStandardMaterial({ map: mossStoneTex, roughness: 0.9 })
      );
      stoneWall.position.set(-side * 0.65, 0.32, 0.85);
      houseGrp.add(stoneWall);

      const earthBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.95, 1.65, 1.75),
        new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0xd97706, roughness: 0.85 })
      );
      earthBody.position.y = 0.82;
      houseGrp.add(earthBody);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.75, 0.95, 4),
        new THREE.MeshStandardMaterial({ map: yinYangRoofTex, color: 0x57534e, roughness: 0.75 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.05;
      houseGrp.add(roof);
      g.add(houseGrp);

      const flag = buildVietnamFlagPole(4.2, animList, phaseOffset);
      flag.position.set(side * 0.95, 0, -0.8);
      g.add(flag);
    }
  } else if (biomeId === 'vn_sapa') {
    // 2. SA PA: Ruộng Bậc Thang Mù Cang Chải 5 Tầng + Nhà Sàn Gỗ Tây Bắc + Cối Nước Tre 12 Nang
    const terraceGroup = new THREE.Group();
    const goldRiceMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.68, flatShading: true });
    const greenRiceMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.75, flatShading: true });
    const waterMirrorMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.75, roughness: 0.15 });
    for (let step = 0; step < 5; step++) {
      const rTop = 2.8 - step * 0.44;
      const slab = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rTop + 0.18, 0.52, 14),
        step % 2 === 0 ? goldRiceMat : greenRiceMat
      );
      slab.position.set(side * 3.8, step * 0.54 + 0.26, -0.2);
      terraceGroup.add(slab);

      // Gleaming water-mirror paddy rim on each terrace step
      const mirrorRim = new THREE.Mesh(new THREE.CylinderGeometry(rTop * 0.92, rTop * 0.92, 0.04, 14), waterMirrorMat);
      mirrorRim.position.set(side * 3.8, step * 0.54 + 0.53, -0.2);
      terraceGroup.add(mirrorRim);
    }
    g.add(terraceGroup);

    if (variant % 2 === 0) {
      // Detailed Northwest Wooden Stilt House (Nhà Sàn Gỗ Tây Bắc trên 6 cột gỗ + mái Khau Cút)
      const stilt = new THREE.Group();
      stilt.position.set(side * 2.35, 0, 0.6);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
      for (const px of [-0.7, 0, 0.7]) {
        for (const pz of [-0.55, 0.55]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.15, 6), woodMat);
          post.position.set(px, 0.57, pz);
          stilt.add(post);
        }
      }
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.85, 1.15, 1.45),
        new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0x92400e, roughness: 0.75 })
      );
      cabin.position.y = 1.65;
      stilt.add(cabin);
      const thatchRoof = new THREE.Mesh(
        new THREE.ConeGeometry(1.68, 1.15, 4),
        new THREE.MeshStandardMaterial({ map: yinYangRoofTex, color: 0x713f12, roughness: 0.85 })
      );
      thatchRoof.rotation.y = Math.PI / 4;
      thatchRoof.position.y = 2.75;
      stilt.add(thatchRoof);
      g.add(stilt);
    }

    // Detailed Spinning Bamboo Waterwheel (Cối Nước Tây Bắc có nan tre & ống trúc múc nước)
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(side * 1.45, 1.25, -0.4);
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.065, 8, 20), bambooMat);
    rim.rotation.y = Math.PI / 2;
    wheelGroup.add(rim);
    for (let sp = 0; sp < 8; sp++) {
      const a = (sp * Math.PI) / 4;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 6), bambooMat);
      spoke.rotation.x = a;
      wheelGroup.add(spoke);
      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 6), bambooMat);
      bucket.position.set(0, Math.cos(a) * 1.02, Math.sin(a) * 1.02);
      bucket.rotation.z = Math.PI / 2;
      wheelGroup.add(bucket);
    }
    g.add(wheelGroup);
    animList.push(t => {
      wheelGroup.rotation.x = t * 1.25 + phaseOffset;
    });
  } else if (biomeId === 'vn_halong') {
    // 3. VỊNH HẠ LONG: Đảo Đá Vôi + Hòn Trống Mái 3D + Du Thuyền Buồm Cánh Dơi 3 Cánh
    const karst = buildSculptedKarstMountain(2.9, 8.2 + (variant % 2) * 1.5, 0x26544e, 0x1b6344, variant + 20);
    karst.position.set(side * 4.9, -0.2, -0.7);
    g.add(karst);

    if (variant % 2 === 0) {
      // Iconic 3D Hòn Trống Mái (Twin Kissing Rooster & Hen Limestone Islets rising from emerald water)
      const trongMai = new THREE.Group();
      trongMai.position.set(side * 2.55, -0.1, -0.6);
      const rockMat = new THREE.MeshStandardMaterial({
        map: mossStoneTex,
        color: 0x335c57,
        roughness: 0.85,
        flatShading: true,
      });
      const rooster = new THREE.Mesh(new THREE.ConeGeometry(0.68, 2.65, 7), rockMat);
      rooster.rotation.x = Math.PI;
      rooster.rotation.z = 0.22;
      rooster.position.set(-0.42, 1.25, 0);
      trongMai.add(rooster);

      const hen = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.35, 7), rockMat);
      hen.rotation.x = Math.PI;
      hen.rotation.z = -0.24;
      hen.position.set(0.42, 1.12, 0.15);
      trongMai.add(hen);

      const foam = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 1.25, 16),
        new THREE.MeshBasicMaterial({ color: 0xa7f3d0, transparent: true, opacity: 0.48, side: THREE.DoubleSide })
      );
      foam.rotation.x = -Math.PI / 2;
      foam.position.y = 0.15;
      trongMai.add(foam);
      g.add(trongMai);
    }

    // Detailed Ha Long Wooden Junk Cruise Boat with 2-Deck Lit Cabin & 2 Ribbed Scarlet Batwing Sails
    const boat = new THREE.Group();
    boat.position.set(side * 1.95, 0.32, 0.65);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.65 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.48, 2.85), hullMat);
    boat.add(hull);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.55, 1.45),
      new THREE.MeshStandardMaterial({ map: heritageWallTex, roughness: 0.6 })
    );
    cabin.position.set(0, 0.48, -0.1);
    boat.add(cabin);

    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xd92b1c,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.45,
      roughness: 0.48,
      side: THREE.DoubleSide,
    });
    for (const [sz, sh, sw] of [
      [0.45, 2.05, 1.35],
      [-0.65, 1.55, 1.05],
    ]) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, sh + 0.5, 6), hullMat);
      mast.position.set(0, sh * 0.5 + 0.3, sz);
      boat.add(mast);
      const sail = new THREE.Mesh(new THREE.BoxGeometry(0.06, sh, sw), sailMat);
      sail.position.set(0, sh * 0.5 + 0.45, sz);
      sail.rotation.y = 0.18 * side;
      boat.add(sail);
    }
    g.add(boat);
    animList.push(t => {
      boat.position.y = 0.32 + Math.sin(t * 1.6 + phaseOffset) * 0.14;
      boat.rotation.z = Math.sin(t * 1.3 + phaseOffset) * 0.08;
    });
  } else if (biomeId === 'vn_hanoi') {
    // 4. HÀ NỘI: Lan Can Cầu Thê Húc Đỏ Son + Khuê Văn Các (Cửa Sổ Mặt Trời) + Tháp Rùa Hồ Gươm
    const railGroup = new THREE.Group();
    const vermilionMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.42 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xa16207, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.3 });
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 5.8), vermilionMat);
    topRail.position.set(-side * 0.12, 1.15, 0);
    railGroup.add(topRail);
    const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 5.8), vermilionMat);
    midRail.position.set(-side * 0.12, 0.65, 0);
    railGroup.add(midRail);

    for (const zp of [-2.2, 0, 2.2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.55, 0.22), vermilionMat);
      post.position.set(-side * 0.12, 0.78, zp);
      railGroup.add(post);
      const lotusCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), goldMat);
      lotusCap.position.set(-side * 0.12, 1.65, zp);
      railGroup.add(lotusCap);
    }
    g.add(railGroup);

    // Khuê Văn Các (Constellation of Literature Pavilion with Circular Sun Window & 4 Stilts)
    const khueVan = new THREE.Group();
    khueVan.position.set(side * 3.15, 0, 0);
    const stonePedestal = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.55, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    stonePedestal.position.y = 0.28;
    khueVan.add(stonePedestal);

    for (const px of [-0.85, 0.85]) {
      for (const pz of [-0.85, 0.85]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.25, 0.24), vermilionMat);
        pillar.position.set(px, 1.15, pz);
        khueVan.add(pillar);
      }
    }
    const upperPavilion = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 1.15, 2.05),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.55 })
    );
    upperPavilion.position.y = 2.3;
    khueVan.add(upperPavilion);

    // Iconic Golden Circular Sun Window ("Cửa Sổ Mặt Trời Khuê Văn Các")
    const sunWin = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.055, 8, 18), goldMat);
    sunWin.rotation.y = Math.PI / 2;
    sunWin.position.set(-side * 1.04, 2.3, 0);
    khueVan.add(sunWin);

    for (let tier = 0; tier < 2; tier++) {
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.25 - tier * 0.42, 0.72, 4),
        new THREE.MeshStandardMaterial({ map: yinYangRoofTex, roughness: 0.55 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.95 + tier * 0.78;
      khueVan.add(roof);
    }
    g.add(khueVan);
  } else if (biomeId === 'vn_ninhbinh') {
    // 5. NINH BÌNH: Bảo Tháp Bái Đính + Thuyền Đò Tràng An (Người Chèo Đò Nón Lá) + Đầm Sen Hồng 8 Cánh
    const stupa = new THREE.Group();
    stupa.position.set(side * 3.55, 0, -0.2);
    const bodyMat = new THREE.MeshStandardMaterial({ map: chamBrickTex, roughness: 0.62 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.5, roughness: 0.28 });
    for (let i = 0; i < 5; i++) {
      const s = 1.72 - i * 0.22;
      const y = i * 1.18;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.65, s * 0.7, 1.02, 8), bodyMat);
      b.position.y = y + 0.51;
      stupa.add(b);
      const r = new THREE.Mesh(new THREE.ConeGeometry(s * 0.88, 0.5, 8), roofMat);
      r.position.y = y + 1.12;
      stupa.add(r);
    }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.2, 8), roofMat);
    spire.position.y = 5 * 1.18 + 0.5;
    stupa.add(spire);
    g.add(stupa);

    // Multi-Petal 3D Pink Lotus Flower + Green Lily Pad on the water edge
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(side * 1.15, 0.12, -0.8);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    lotusGroup.add(pad);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x9d174d, emissiveIntensity: 0.3, roughness: 0.45 });
    for (let p = 0; p < 8; p++) {
      const a = (p * Math.PI) / 4;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 5), petalMat);
      petal.position.set(Math.cos(a) * 0.24, 0.2, Math.sin(a) * 0.24);
      petal.rotation.z = -Math.cos(a) * 0.55;
      petal.rotation.x = Math.sin(a) * 0.55;
      lotusGroup.add(petal);
    }
    const stamen = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), roofMat);
    stamen.position.y = 0.22;
    lotusGroup.add(stamen);
    g.add(lotusGroup);

    // Trang An Rowing Sampan Boat with Conical-Hat Rower (Đò Tràng An & Người Chèo Đò Nón Lá)
    if (variant % 2 === 0) {
      const sampan = new THREE.Group();
      sampan.position.set(side * 1.85, 0.18, 0.85);
      const hull = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.28, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
      );
      hull.rotation.x = Math.PI / 2;
      hull.scale.set(1.1, 1.0, 0.45);
      sampan.add(hull);

      // Rower with Ao Ba Ba & White Non La conical hat
      const rowerTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.52, 8),
        new THREE.MeshStandardMaterial({ color: 0x92400e })
      );
      rowerTorso.position.set(0, 0.38, -0.55);
      sampan.add(rowerTorso);
      const nonLa = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 0.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
      );
      nonLa.position.set(0, 0.74, -0.55);
      sampan.add(nonLa);
      g.add(sampan);
      animList.push(t => {
        sampan.position.y = 0.18 + Math.sin(t * 1.7 + phaseOffset) * 0.08;
        sampan.rotation.z = Math.sin(t * 1.3 + phaseOffset) * 0.05;
      });
    }
  } else if (biomeId === 'vn_hue') {
    // 6. CỐ ĐÔ HUẾ: Lầu Ngũ Phụng Ngọ Môn 2 Tầng Mái Hoàng Lưu Ly + Thuyền Rồng Sông Hương + Đèn Lồng Tím
    const citadel = new THREE.Group();
    citadel.position.set(side * 3.35, 0, 0);
    const battlement = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.65, 2.4),
      new THREE.MeshStandardMaterial({ map: chamBrickTex, color: 0x78350f, roughness: 0.82 })
    );
    battlement.position.y = 0.82;
    citadel.add(battlement);

    // Arched Imperial Brass-Studded Gate Doorway
    const gateArch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 2.46, 12),
      new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.7 })
    );
    gateArch.rotation.z = Math.PI / 2;
    gateArch.position.set(0, 0.65, 0);
    citadel.add(gateArch);

    // Red-and-Gold Lầu Ngũ Phụng Colonnade + 2-Tiered Imperial Yellow Glazed Roofs
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.1, 1.9),
      new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0xb91c1c, roughness: 0.6 })
    );
    pavilion.position.y = 2.15;
    citadel.add(pavilion);

    const royalRoofMat = new THREE.MeshStandardMaterial({
      map: yinYangRoofTex,
      color: 0xfacc15,
      emissive: 0x713f12,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.3,
    });
    for (let t = 0; t < 2; t++) {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.45 - t * 0.45, 0.85, 4), royalRoofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.85 + t * 0.75;
      citadel.add(roof);
    }
    g.add(citadel);

    // Royal Purple Silk Lantern on Gold Pillar along the road edge
    const lPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.6, roughness: 0.3 })
    );
    lPost.position.set(side * 0.25, 1.4, 0.6);
    g.add(lPost);
    const purpleLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 1.1 })
    );
    purpleLantern.scale.set(1, 1.3, 1);
    purpleLantern.position.set(side * 0.25, 2.65, 0.6);
    g.add(purpleLantern);
  } else if (biomeId === 'vn_danang') {
    // 7. ĐÀ NẴNG CẦU VÀNG: Lan Can Cầu Vàng Mạ Vàng + Bồn Hoa Nữ Hoàng Xanh + Bàn Tay Đá Khổng Lồ Đỡ Cầu
    const bridgeEdge = new THREE.Group();
    const goldRailMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x854d0e,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.18,
    });
    const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 5.8, 10), goldRailMat);
    handrail.rotation.x = Math.PI / 2;
    handrail.position.set(-side * 0.14, 1.12, 0);
    bridgeEdge.add(handrail);

    for (const zp of [-2.2, -0.7, 0.7, 2.2]) {
      const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.12, 8), goldRailMat);
      baluster.position.set(-side * 0.14, 0.56, zp);
      bridgeEdge.add(baluster);
    }
    // Continuous Purple Lobelia Flower Planter Box along the Golden Bridge deck edge
    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.28, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.75 })
    );
    planter.position.set(-side * 0.05, 0.18, 0);
    bridgeEdge.add(planter);
    g.add(bridgeEdge);

    // Sculpted Multi-Jointed Giant Mossy Stone Hand (Bàn Tay Đá Khổng Lồ Đỡ Cầu Vàng)
    const handGroup = new THREE.Group();
    handGroup.position.set(side * 0.62, -0.55, 0);
    const stoneMat = new THREE.MeshStandardMaterial({
      map: mossStoneTex,
      color: 0x9ca3af,
      roughness: 0.88,
      flatShading: true,
    });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85, flatShading: true });

    // Sculpted Forearm & Wrist emerging from swirling cloud puffs
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 2.4, 9), stoneMat);
    forearm.position.set(side * 0.45, -0.35, 0);
    forearm.rotation.z = side * 0.32;
    handGroup.add(forearm);

    const palm = new THREE.Mesh(new THREE.DodecahedronGeometry(1.42, 1), stoneMat);
    palm.scale.set(1.4, 1.55, 1.3);
    palm.position.y = 0.72;
    handGroup.add(palm);

    // Opposable Stone Thumb curving inward toward the bridge rail
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.65, 8), stoneMat);
    thumb.position.set(-side * 0.85, 1.55, 1.05);
    thumb.rotation.set(-0.35, 0, -side * 0.48);
    handGroup.add(thumb);

    // 4 Multi-Jointed Sculpted Stone Fingers curling up beside the golden railing
    for (let f = 0; f < 4; f++) {
      const zOff = (f - 1.5) * 0.48 - 0.15;
      const fingerH = f === 1 ? 2.85 : f === 2 ? 2.65 : 2.15;
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.31, fingerH, 8), stoneMat);
      finger.position.set(-side * 0.38, 1.95 + fingerH * 0.35, zOff);
      finger.rotation.z = side * 0.28;
      handGroup.add(finger);

      // Distal fingertip phalange curving inward over the bridge
      const tip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), stoneMat);
      tip.position.set(-side * 0.68, 1.95 + fingerH * 0.78, zOff);
      handGroup.add(tip);

      const mossCap = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 1), mossMat);
      mossCap.scale.set(1.2, 0.65, 1.2);
      mossCap.position.set(-side * 0.62, 2.08 + fingerH * 0.82, zOff);
      handGroup.add(mossCap);
    }
    g.add(handGroup);
  } else if (biomeId === 'vn_hoian' || biomeId === 'vietnam') {
    // 8. PHỐ CỔ HỘI AN: Nhà Cổ 2 Tầng Ban Công Gỗ + Giàn Hoa Giấy Đỏ Hồng + Đèn Lồng Lụa Đủ Màu
    const houseGrp = new THREE.Group();
    houseGrp.position.set(side * 2.95, 0, 0);
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.4, 2.6),
      new THREE.MeshStandardMaterial({ map: heritageWallTex, roughness: 0.66 })
    );
    house.position.y = 1.7;
    house.castShadow = true;
    houseGrp.add(house);

    // Upper Wooden Balcony & Veranda Eave facing the street
    const balcony = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.42, 2.55),
      new THREE.MeshStandardMaterial({ color: 0x4a2210, roughness: 0.75 })
    );
    balcony.position.set(-side * 1.45, 1.95, 0);
    houseGrp.add(balcony);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.35, 4),
      new THREE.MeshStandardMaterial({ map: yinYangRoofTex, roughness: 0.58 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.92;
    houseGrp.add(roof);

    // Cascading 3D Magenta Bougainvillea ("Giàn Hoa Giấy Hội An") spilling over the balcony
    const bougMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0x881337,
      emissiveIntensity: 0.35,
      roughness: 0.6,
      flatShading: true,
    });
    for (let b = 0; b < 4; b++) {
      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 1), bougMat);
      bloom.position.set(-side * 1.55, 2.25 - (b % 2) * 0.28, (b - 1.5) * 0.55);
      houseGrp.add(bloom);
    }
    g.add(houseGrp);

    // Bamboo Pole + Pair of Multi-Colored Hoi An Silk Lanterns
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 3.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2210 })
    );
    pole.position.set(side * 0.26, 1.85, 0);
    g.add(pole);

    const lanternPivot = new THREE.Group();
    lanternPivot.position.set(side * 0.26, 3.55, 0);
    const lanternColors = [0xff2a1a, 0xffaa00, 0x10b981, 0xc084fc];
    const lCol = lanternColors[variant % lanternColors.length];
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10),
      new THREE.MeshStandardMaterial({ color: lCol, emissive: lCol, emissiveIntensity: 1.25 })
    );
    lantern.scale.set(1, 1.28, 1);
    lantern.position.y = -0.35;
    lanternPivot.add(lantern);
    g.add(lanternPivot);
    animList.push(t => {
      lanternPivot.rotation.z = Math.sin(t * 2.0 + phaseOffset) * 0.16;
    });
  } else if (biomeId === 'vn_dalat') {
    // 9. ĐÀ LẠT & TÂY NGUYÊN: Rừng Thông 3 Lá + Nụ Hoa Atiso Xoắn Ốc + Nhà Rông Tây Nguyên Mái Vút Cao
    for (let p = 0; p < 2; p++) {
      const pine = new THREE.Group();
      pine.position.set(side * (2.2 + p * 1.6), 0, (p - 0.5) * 1.4);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.22, 2.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21 })
      );
      trunk.position.y = 1.35;
      pine.add(trunk);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.82, flatShading: true });
      for (let layer = 0; layer < 4; layer++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4 - layer * 0.26, 1.5, 9), needleMat);
        cone.position.y = 2.3 + layer * 0.95;
        pine.add(cone);
      }
      g.add(pine);
    }
    if (variant % 2 === 0) {
      // Detailed Helical Glass Artichoke Bud of Lam Vien Square (Nụ Hoa Atiso Đà Lạt)
      const artichokeGrp = new THREE.Group();
      artichokeGrp.position.set(side * 3.15, 0, 0.2);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.45,
        metalness: 0.45,
        roughness: 0.2,
        flatShading: true,
      });
      for (let tier = 0; tier < 3; tier++) {
        const budTier = new THREE.Mesh(
          new THREE.ConeGeometry(1.32 - tier * 0.28, 1.45, 10),
          glassMat
        );
        budTier.position.y = 0.72 + tier * 0.85;
        budTier.rotation.y = tier * 0.4;
        artichokeGrp.add(budTier);
      }
      g.add(artichokeGrp);
    } else {
      // Towering Central Highlands "Nhà Rông Tây Nguyên" on stilts with giant axe-blade roof
      const nhaRong = new THREE.Group();
      nhaRong.position.set(side * 3.45, 0, -0.2);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.1, 2.2), woodMat);
      body.position.y = 1.2;
      nhaRong.add(body);
      const axeRoof = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 4.2, 4),
        new THREE.MeshStandardMaterial({ map: yinYangRoofTex, color: 0x92400e, roughness: 0.82 })
      );
      axeRoof.scale.set(0.65, 1.0, 1.35);
      axeRoof.position.y = 3.75;
      nhaRong.add(axeRoof);
      g.add(nhaRong);
    }
  } else if (biomeId === 'vn_nhatrang') {
    // 10. NHA TRANG: Tháp Bà Ponagar Champa Điêu Khắc + Rặng Dừa Biển + Dù Nghỉ Dưỡng Bãi Cát
    if (variant % 2 === 0) {
      const cham = new THREE.Group();
      cham.position.set(side * 3.35, 0, 0);
      const brickMat = new THREE.MeshStandardMaterial({ map: chamBrickTex, roughness: 0.68 });
      const goldTipMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.5, roughness: 0.3 });

      for (let tier = 0; tier < 3; tier++) {
        const w = 1.95 - tier * 0.44;
        const h = 1.6 - tier * 0.22;
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), brickMat);
        block.position.y = tier * 1.38 + h / 2;
        cham.add(block);

        // Corner terracotta sandstone finials on each tier
        for (const cx of [-1, 1]) {
          for (const cz of [-1, 1]) {
            const finial = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), brickMat);
            finial.position.set(cx * (w * 0.46), tier * 1.38 + h + 0.18, cz * (w * 0.46));
            cham.add(finial);
          }
        }
      }
      // Carved Vestibule Gate (Mandapa Entrance) facing the road
      const vestibule = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.95), brickMat);
      vestibule.position.set(-side * 1.15, 0.68, 0);
      cham.add(vestibule);

      const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.85, 6), goldTipMat);
      pinnacle.position.y = 4.35;
      cham.add(pinnacle);
      g.add(cham);
    } else {
      // Swaying Coastal Coconut Palm Tree + White Beach Parasol
      const palm = new THREE.Group();
      palm.position.set(side * 2.15, 0, 0);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.22, 3.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x784e28 })
      );
      trunk.position.y = 1.95;
      trunk.rotation.z = -side * 0.15;
      palm.add(trunk);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65, flatShading: true });
      for (let frond = 0; frond < 6; frond++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.75, 5), crownMat);
        const ang = (frond * Math.PI * 2) / 6;
        leaf.position.set(-side * 0.28 + Math.cos(ang) * 0.58, 3.85, Math.sin(ang) * 0.58);
        leaf.rotation.z = Math.cos(ang) * 0.88;
        leaf.rotation.x = Math.sin(ang) * 0.88;
        palm.add(leaf);
      }
      g.add(palm);
    }
  } else if (biomeId === 'vn_saigon') {
    // 11. TP.HCM: Tháp Landmark 81 Đa Khối Bậc Thang & Tháp Đồng Hồ Chợ Bến Thành
    const towerMat = new THREE.MeshStandardMaterial({
      map: skyscraperGlassTex,
      emissive: 0x1e3a8a,
      emissiveMap: skyscraperGlassTex,
      emissiveIntensity: 0.62,
      metalness: 0.78,
      roughness: 0.18,
    });
    if (variant % 2 === 0) {
      // Multi-Bundled Stepped Supertall Skyscraper (Landmark 81 Inspired)
      const lmGroup = new THREE.Group();
      lmGroup.position.set(side * 3.85, 0, 0);
      const bundles = [
        [0, 0, 1.15, 7.6],
        [-0.75, 0.55, 0.82, 5.8],
        [0.75, -0.55, 0.82, 5.2],
        [-0.75, -0.55, 0.78, 4.4],
        [0.75, 0.55, 0.78, 6.4],
      ];
      for (const [bx, bz, bw, bh] of bundles) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw), towerMat);
        col.position.set(bx, bh / 2, bz);
        lmGroup.add(col);
      }
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.18, 2.4, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      spire.position.set(0, 7.6 + 1.2, 0);
      lmGroup.add(spire);
      g.add(lmGroup);
    } else {
      // Iconic Ben Thanh Market Clock Tower (Tháp Đồng Hồ Chợ Bến Thành)
      const benThanh = new THREE.Group();
      benThanh.position.set(side * 3.35, 0, 0);
      const hall = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.85, 2.4),
        new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0xfef08a, roughness: 0.7 })
      );
      hall.position.y = 0.92;
      benThanh.add(hall);
      const clockTower = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 2.2, 1.35),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 })
      );
      clockTower.position.y = 2.65;
      benThanh.add(clockTower);
      const clockFace = new THREE.Mesh(
        new THREE.CircleGeometry(0.38, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      clockFace.rotation.y = -side * (Math.PI / 2);
      clockFace.position.set(-side * 0.69, 3.05, 0);
      benThanh.add(clockFace);
      const pyramidRoof = new THREE.Mesh(
        new THREE.ConeGeometry(1.15, 0.85, 4),
        new THREE.MeshStandardMaterial({ map: yinYangRoofTex, roughness: 0.55 })
      );
      pyramidRoof.rotation.y = Math.PI / 4;
      pyramidRoof.position.y = 4.15;
      benThanh.add(pyramidRoof);
      g.add(benThanh);
    }
  } else if (biomeId === 'vn_mientay') {
    // 12. MIỀN TÂY: Ghe Bầu Chợ Nổi Cái Răng (Mắt Ghe + Mui Ghe + Cây Bẹo + Thương Hồ Nón Lá) & Rặng Dừa Nước
    const boat = new THREE.Group();
    boat.position.set(side * 1.15, 0.18, 0);
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.46, 2.95),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 })
    );
    boat.add(hull);

    // Traditional Red & White Mekong Boat Eyes ("Mắt Ghe Miền Tây") at the bow
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (const ex of [-0.59, 0.59]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat);
      eye.position.set(ex, 0.1, 1.15);
      boat.add(eye);
    }

    // Arched Wooden Cabin ("Mui Ghe") at the stern
    const cabin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 1.15, 10, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.78 })
    );
    cabin.rotation.x = Math.PI / 2;
    cabin.position.set(0, 0.22, -0.65);
    boat.add(cabin);

    // Colorful mounds of tropical fruits (watermelon, mango, pineapple, dragonfruit) on deck
    const fruitCols = [0x16a34a, 0xfacc15, 0xef4444, 0xf97316];
    for (let f = 0; f < 4; f++) {
      const mound = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.28, 1),
        new THREE.MeshStandardMaterial({ color: fruitCols[(variant + f) % fruitCols.length], roughness: 0.55 })
      );
      mound.position.set((f % 2 - 0.5) * 0.36, 0.36, 0.15 + (Math.floor(f / 2) - 0.5) * 0.65);
      boat.add(mound);
    }

    // Iconic "Cây Bẹo" bamboo pole with hanging sample fruits at the bow
    const cayBeo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.038, 2.55, 6),
      new THREE.MeshStandardMaterial({ color: 0xca8a04 })
    );
    cayBeo.position.set(0, 1.3, 1.15);
    cayBeo.rotation.x = 0.22;
    boat.add(cayBeo);
    const hangingFruit = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.16, 1),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xa16207, emissiveIntensity: 0.3 })
    );
    hangingFruit.position.set(0, 2.25, 1.35);
    boat.add(hangingFruit);

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

// Procedural soft volumetric mist/cloud texture for multi-plane 3D atmospheric depth
const mistStrataTex = canvasTex(256, 128, (g, w, h) => {
  const grad = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(255, 252, 245, 0.36)');
  grad.addColorStop(0.45, 'rgba(240, 248, 255, 0.18)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
});

// Builds a Curved 3D Panoramic Amphitheater Dome with Simplex-Noise & Image-Luminance 3D depth relief
function createCurved3DPanoramaGeometry() {
  const w = 96;
  const h = 48;
  const geo = new THREE.PlaneGeometry(w, h, 64, 32);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const u = vx / (w * 0.5); // -1 .. +1
    const v = vy / (h * 0.5); // -1 .. +1
    // Cylindrical amphitheater wrap-around curve so the flanks curve forward in 3D space
    const curveZ = (1 - Math.cos(u * 1.05)) * 18.5;
    // Vertical dome curvature at top sky
    const domeZ = v > 0 ? Math.pow(v, 1.6) * 3.8 : 0;
    // Natural 3D Simplex-Noise depth relief across mountain ridges & clouds
    const reliefZ = noise2D(u * 3.6, v * 2.8) * 2.15 * (1 - Math.abs(u) * 0.3);
    pos.setZ(i, curveZ + domeZ + reliefZ);
  }
  geo.computeVertexNormals();
  return geo;
}

// Displaces the 65x33 vertices of `domeGeo` in 3D space using actual image luminance/saturation depth relief
function applyPanoramaDepthRelief(domeGeo, baseDomeZ, depthGrid) {
  const pos = domeGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const baseZ = baseDomeZ[i * 3 + 2];
    const imgDepth = depthGrid ? depthGrid[i] || 0 : 0;
    pos.setZ(i, baseZ + imgDepth);
  }
  pos.needsUpdate = true;
}

// Processes a loaded AI Panorama Image into:
// 1. Bottom-edge alpha-feathered main CanvasTexture (eliminates any horizontal horizon seam)
// 2. 65x33 pixel-luminance/saturation 3D vertex relief grid (`depthGrid`)
// 3. Midground 3D Parallax Cutout Texture (`midTex`) for multi-plane 2.5D/3D separation
function processPanorama25D(img) {
  const cw = 1024;
  const ch = 576;
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = cw;
  mainCanvas.height = ch;
  const ctx = mainCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0, cw, ch);

  // Feather the bottom 15% alpha so the panorama merges smoothly into the 3D terrain & mist
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const fadeGrad = ctx.createLinearGradient(0, 0, 0, ch);
  fadeGrad.addColorStop(0, 'rgba(0,0,0,1)');
  fadeGrad.addColorStop(0.84, 'rgba(0,0,0,1)');
  fadeGrad.addColorStop(0.95, 'rgba(0,0,0,0.45)');
  fadeGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  const mainTex = new THREE.CanvasTexture(mainCanvas);
  mainTex.colorSpace = THREE.SRGBColorSpace;
  mainTex.anisotropy = 4;

  // Sample 65x33 luminance & color-saturation grid to drive real 3D vertex relief on the dome
  const segX = 64;
  const segY = 32;
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = segX + 1;
  sampleCanvas.height = segY + 1;
  const sCtx = sampleCanvas.getContext('2d');
  sCtx.drawImage(img, 0, 0, segX + 1, segY + 1);
  const pixels = sCtx.getImageData(0, 0, segX + 1, segY + 1).data;
  const depthGrid = new Float32Array((segX + 1) * (segY + 1));

  for (let iy = 0; iy <= segY; iy++) {
    const vNorm = 1 - (iy / segY) * 2; // +1 top .. -1 bottom
    for (let ix = 0; ix <= segX; ix++) {
      const idx = iy * (segX + 1) + ix;
      const p = idx * 4;
      const r = pixels[p] / 255;
      const g = pixels[p + 1] / 255;
      const b = pixels[p + 2] / 255;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      // Darker/saturated foreground mountains, towers, and bridges bulge forward (+Z up to +3.1m), bright sky recedes (-1.4m)
      const structureWeight = (1 - lum) * 0.72 + sat * 0.48;
      const lowerBias = vNorm < 0.35 ? 1.0 : Math.max(0.2, 1 - (vNorm - 0.35) * 1.1);
      depthGrid[idx] = (structureWeight - 0.38) * 4.4 * lowerBias;
    }
  }

  // Build Midground 3D Parallax Cutout Layer (flanks & lower-midground silhouettes)
  const midCanvas = document.createElement('canvas');
  midCanvas.width = 512;
  midCanvas.height = 288;
  const mCtx = midCanvas.getContext('2d');
  mCtx.drawImage(img, 0, 0, 512, 288);
  const mImg = mCtx.getImageData(0, 0, 512, 288);
  const md = mImg.data;
  for (let y = 0; y < 288; y++) {
    const yn = y / 288; // 0 top .. 1 bottom
    const vMask = yn < 0.25 ? 0 : yn < 0.45 ? (yn - 0.25) / 0.2 : yn > 0.86 ? Math.max(0, (1 - yn) / 0.14) : 1;
    for (let x = 0; x < 512; x++) {
      const xn = (x / 512) * 2 - 1; // -1 .. +1
      // Keep center road corridor transparent so only the 3D side flanks & silhouettes project forward
      const sideMask = Math.max(0, Math.min(1, (Math.abs(xn) - 0.22) / 0.26));
      const p = (y * 512 + x) * 4;
      const lum = (md[p] * 0.299 + md[p + 1] * 0.587 + md[p + 2] * 0.114) / 255;
      const silMask = Math.max(0, Math.min(1, (0.76 - lum) * 2.1));
      md[p + 3] = Math.round(255 * vMask * sideMask * silMask * 0.58);
    }
  }
  mCtx.putImageData(mImg, 0, 0);
  const midTex = new THREE.CanvasTexture(midCanvas);
  midTex.colorSpace = THREE.SRGBColorSpace;

  return { mainTex, midTex, depthGrid };
}

function buildHorizonLandmark(biomeId, animList) {
  // Builds bespoke 3D Mid-Horizon Landmark Monuments (z = -30 .. -45) flanking the road corridor
  // while keeping the center vanishing point open so the 3D road merges into the curved panorama!
  const g = new THREE.Group();
  g.position.set(0, 0, -44);

  const pal = BIOME_PALETTES[biomeId] || BIOME_PALETTES.vn_hagiang;
  for (const [x, h, r, seed] of [
    [-23, 12.8, 4.9, 11],
    [-18.5, 9.4, 3.9, 22],
    [18.5, 9.8, 4.0, 33],
    [23, 13.2, 5.1, 44],
  ]) {
    const karst = buildSculptedKarstMountain(r, h, pal.ground, pal.hillColor || 0x2b593c, seed);
    karst.position.set(x, -1.2, -3);
    g.add(karst);
  }

  // Volumetric Horizon Mist Cushion over the road-to-panorama junction (z = -47 .. -52)
  for (let m = 0; m < 3; m++) {
    const cushion = new THREE.Mesh(
      new THREE.PlaneGeometry(28 + m * 6, 4.8),
      new THREE.MeshBasicMaterial({
        map: mistStrataTex,
        color: pal.sun || 0xffe299,
        transparent: true,
        opacity: 0.22 - m * 0.05,
        depthWrite: false,
      })
    );
    cushion.position.set((m - 1) * 3.5, 0.85 + m * 0.45, -3.5 - m * 1.5);
    g.add(cushion);
  }

  if (biomeId === 'vn_hagiang') {
    // Monumental 3D Cột Cờ Quốc Gia Lũng Cú atop Mount Rồng (Octagonal Stone Tower + Giant Flag)
    const lungCu = new THREE.Group();
    lungCu.position.set(-11.5, 0, 7);
    const mount = buildSculptedKarstMountain(3.4, 6.2, 0x3b4d54, 0x274e3b, 77);
    lungCu.add(mount);
    const basePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.55, 1.4, 8),
      new THREE.MeshStandardMaterial({ map: chamBrickTex, color: 0x9ca3af, roughness: 0.75 })
    );
    basePedestal.position.y = 6.0;
    lungCu.add(basePedestal);
    const towerShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.92, 4.2, 8),
      new THREE.MeshStandardMaterial({ map: mossStoneTex, color: 0xd6d3d1, roughness: 0.7 })
    );
    towerShaft.position.y = 8.6;
    lungCu.add(towerShaft);
    const topFlag = buildVietnamFlagPole(3.4, animList, 0.5);
    topFlag.position.y = 10.6;
    lungCu.add(topFlag);
    g.add(lungCu);
  } else if (biomeId === 'vn_sapa') {
    // 3D Cáp Treo Fansipan (Overhead Steel Cable + Moving 3D Cable Car Cabins gliding across the valley!)
    const cableSys = new THREE.Group();
    cableSys.position.set(0, 10.5, 12);
    const cableLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 38, 6),
      new THREE.MeshBasicMaterial({ color: 0x475569 })
    );
    cableLine.rotation.z = Math.PI / 2 - 0.12;
    cableSys.add(cableLine);

    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.25 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    for (let c = 0; c < 2; c++) {
      const cabinGrp = new THREE.Group();
      const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), cableLine.material);
      hanger.position.y = -0.55;
      cabinGrp.add(hanger);
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.95, 0.85), cabinMat);
      box.position.y = -1.1;
      cabinGrp.add(box);
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.45, 0.88), glassMat);
      win.position.y = -1.05;
      cabinGrp.add(win);
      cableSys.add(cabinGrp);
      if (animList) {
        animList.push(t => {
          const u = ((t * 0.09 + c * 0.5) % 1) * 2 - 1; // -1 .. +1
          cabinGrp.position.set(u * 15, u * 1.8, 0);
          cabinGrp.rotation.z = Math.sin(t * 2.2 + c) * 0.05;
        });
      }
    }
    g.add(cableSys);
  } else if (biomeId === 'vn_halong') {
    // Giant 3D Hòn Trống Mái & Limestone Arch on the Bay Horizon
    for (const side of [-1, 1]) {
      const archIsle = buildSculptedKarstMountain(3.4, 9.5, 0x1e4e48, 0x155e3f, side > 0 ? 88 : 99);
      archIsle.position.set(side * 12.5, -0.5, 6);
      g.add(archIsle);
    }
  } else if (biomeId === 'vn_hanoi') {
    // Monumental 3D Tháp Rùa Hồ Gươm (3-Tiered Turtle Tower on a Green Lake Mound)
    const thapRua = new THREE.Group();
    thapRua.position.set(-10.8, 0, 8);
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.8, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
    );
    island.position.y = 0.35;
    thapRua.add(island);
    const wallMat = new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0xd6b88d, roughness: 0.72 });
    const roofMat = new THREE.MeshStandardMaterial({ map: yinYangRoofTex, roughness: 0.55 });
    for (let tier = 0; tier < 3; tier++) {
      const w = 2.4 - tier * 0.52;
      const h = 1.45 - tier * 0.22;
      const yBase = 0.75 + tier * 1.32;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.82), wallMat);
      body.position.y = yBase + h / 2;
      thapRua.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 0.52, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = yBase + h + 0.22;
      thapRua.add(roof);
    }
    g.add(thapRua);
  } else if (biomeId === 'vn_ninhbinh') {
    // 3D Đỉnh Ngọa Long Hang Múa (Limestone Peak with Coiling White Stone Dragon & Watchtower)
    const hangMua = new THREE.Group();
    hangMua.position.set(-12.2, 0, 6);
    const peak = buildSculptedKarstMountain(3.8, 10.2, 0x3f4e4f, 0x166534, 61);
    hangMua.add(peak);
    const dragonMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x475569, emissiveIntensity: 0.25, roughness: 0.5 });
    for (let s = 0; s < 8; s++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.38 - s * 0.025, 8, 8), dragonMat);
      seg.position.set(Math.sin(s * 0.55) * (2.2 - s * 0.22), 2.5 + s * 0.92, 1.6 - s * 0.18);
      hangMua.add(seg);
    }
    g.add(hangMua);
  } else if (biomeId === 'vn_hue') {
    // 3D Cầu Trường Tiền 6 Vài 12 Nhịp (Glowing Royal Purple-Gold Parabolic Steel Truss Arches)
    const truongTien = new THREE.Group();
    truongTien.position.set(11.5, 0.5, 8);
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x9333ea,
      emissiveIntensity: 0.55,
      metalness: 0.8,
      roughness: 0.2,
    });
    for (let a = 0; a < 3; a++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.14, 8, 18, Math.PI),
        trussMat
      );
      arch.position.set(0, 0.2, (a - 1) * 4.2);
      arch.rotation.y = Math.PI / 2;
      truongTien.add(arch);
    }
    g.add(truongTien);
  } else if (biomeId === 'vn_danang') {
    // 3D Cầu Rồng Đà Nẵng (Undulating Golden Steel Dragon Arch breathing Fire Orbs!)
    const dragonBridge = new THREE.Group();
    dragonBridge.position.set(11.8, 1.2, 7);
    const goldDragonMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      metalness: 0.75,
      roughness: 0.22,
    });
    for (let s = 0; s < 10; s++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 10), goldDragonMat);
      seg.position.set(0, Math.sin(s * 0.7) * 1.45 + 1.5, (s - 4.5) * 1.15);
      dragonBridge.add(seg);
    }
    const fireOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    fireOrb.position.set(-0.6, 2.4, 5.8);
    dragonBridge.add(fireOrb);
    if (animList) {
      animList.push(t => {
        fireOrb.scale.setScalar(0.8 + Math.sin(t * 6.0) * 0.35);
      });
    }
    g.add(dragonBridge);
  } else if (biomeId === 'vn_hoian' || biomeId === 'vietnam') {
    // 3D Chùa Cầu Hội An (Iconic Japanese Covered Bridge with Arched Stone Piers & Tiled Pavilion)
    const chuaCau = new THREE.Group();
    chuaCau.position.set(-10.5, 0, 8);
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 1.1, 2.6),
      new THREE.MeshStandardMaterial({ map: heritageWallTex, color: 0xd97706, roughness: 0.7 })
    );
    bridgeDeck.position.y = 1.1;
    chuaCau.add(bridgeDeck);
    const pagoda = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.65, 2.3),
      new THREE.MeshStandardMaterial({ map: heritageWallTex, roughness: 0.65 })
    );
    pagoda.position.y = 2.45;
    chuaCau.add(pagoda);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.8, 1.45, 4),
      new THREE.MeshStandardMaterial({ map: yinYangRoofTex, roughness: 0.58 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.9;
    chuaCau.add(roof);
    g.add(chuaCau);
  } else if (biomeId === 'vn_dalat') {
    // Giant 3D Bông Hoa Dã Quỳ Vàng & Nụ Atiso Quảng Trường Lâm Viên
    const daQuy = new THREE.Group();
    daQuy.position.set(-10.8, 0, 8);
    const yellowGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.25,
      flatShading: true,
    });
    const dome = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 1), yellowGlassMat);
    dome.position.y = 2.2;
    daQuy.add(dome);
    g.add(daQuy);
  } else if (biomeId === 'vn_nhatrang') {
    // 3D Trụ Cáp Treo Vượt Biển Vinpearl (Over-Sea Eiffel-Style Illuminated Lattice Tower)
    const vinTower = new THREE.Group();
    vinTower.position.set(11.8, 0, 7);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
      metalness: 0.7,
      roughness: 0.25,
    });
    const lowerA = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 4, 1, true), towerMat);
    lowerA.position.y = 2.75;
    lowerA.rotation.y = Math.PI / 4;
    vinTower.add(lowerA);
    const upperA = new THREE.Mesh(new THREE.ConeGeometry(1.1, 5.2, 4), towerMat);
    upperA.position.y = 7.8;
    upperA.rotation.y = Math.PI / 4;
    vinTower.add(upperA);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.25, 0.25), towerMat);
    crossArm.position.y = 9.2;
    vinTower.add(crossArm);
    g.add(vinTower);
  } else if (biomeId === 'vn_saigon') {
    // 3D Cầu Ba Son (Thủ Thiêm 2 Asymmetric Cable-Stayed Arch Pylon)
    const baSon = new THREE.Group();
    baSon.position.set(-11.2, 0, 7);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      metalness: 0.75,
      roughness: 0.2,
    });
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.65, 11.5, 10), pylonMat);
    pylon.position.y = 5.5;
    pylon.rotation.z = -0.18;
    baSon.add(pylon);
    g.add(baSon);
  } else if (biomeId === 'vn_mientay') {
    // 3D Biểu Tượng Con Tàu Đất Mũi Cà Mau (GPS 0001 Monument Ship with Giant White Sail & Flag)
    const datMui = new THREE.Group();
    datMui.position.set(-10.8, 0, 8);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const shipHull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 5.2), whiteMat);
    shipHull.position.y = 0.7;
    datMui.add(shipHull);
    const giantSail = new THREE.Mesh(new THREE.ConeGeometry(2.1, 6.2, 4), whiteMat);
    giantSail.scale.set(0.35, 1.0, 1.2);
    giantSail.position.set(0, 4.2, 0.4);
    datMui.add(giantSail);
    const flag = buildVietnamFlagPole(3.6, animList, 0.3);
    flag.position.set(0, 1.4, 2.2);
    datMui.add(flag);
    g.add(datMui);
  }

  return g;
}

export function buildRaceWorld(scene) {
  scene.background = new THREE.Color(0x1a2e3b);
  scene.fog = new THREE.FogExp2(0x2b4452, 0.0056);

  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x1d3244, 0.95);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.12);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  scene.add(dir);

  // Preload all 12 dedicated Vietnamese Landmark Panoramas + World Fallbacks
  // and process each image into a 2.5D/3D multi-plane depth relief + feathered horizon + midground cutout
  const texLoader = new THREE.TextureLoader();
  const skyTextures = {};
  const skyMidTextures = {};
  const skyDepthGrids = {};

  // Curved 3D Panoramic Amphitheater Dome + Secondary GSAP Cross-Fade Dome + Midground 3D Parallax Layer
  const domeGeo = createCurved3DPanoramaGeometry();
  const baseDomeZ = Float32Array.from(domeGeo.attributes.position.array);

  const midGeo = createCurved3DPanoramaGeometry();
  midGeo.scale(0.82, 0.82, 1.15);

  const skyMat = new THREE.MeshBasicMaterial({
    fog: false,
    transparent: true,
    opacity: 0.99,
  });
  const skyBackdrop = new THREE.Mesh(domeGeo, skyMat);
  skyBackdrop.position.set(2.0, 14.2, -56);
  scene.add(skyBackdrop);

  const skyFadeMat = new THREE.MeshBasicMaterial({
    fog: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const skyBackdropFade = new THREE.Mesh(domeGeo, skyFadeMat);
  skyBackdropFade.position.set(2.0, 14.2, -55.8);
  scene.add(skyBackdropFade);

  // Midground 3D Parallax Cutout Layer (z = -43) that shifts at 1.85x parallax speed relative to the main dome!
  const skyMidMat = new THREE.MeshBasicMaterial({
    fog: false,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const skyMidground = new THREE.Mesh(midGeo, skyMidMat);
  skyMidground.position.set(2.0, 11.4, -43);
  scene.add(skyMidground);

  for (const url of [
    '/assets/sky_vn_hagiang.jpg',
    '/assets/sky_vn_sapa.jpg',
    '/assets/sky_vn_halong.jpg',
    '/assets/sky_vn_hanoi.jpg',
    '/assets/sky_vn_ninhbinh.jpg',
    '/assets/sky_vn_hue.jpg',
    '/assets/sky_vn_danang.jpg',
    '/assets/sky_vn_hoian.jpg',
    '/assets/sky_vn_dalat.jpg',
    '/assets/sky_vn_nhatrang.jpg',
    '/assets/sky_vn_saigon.jpg',
    '/assets/sky_vn_mientay.jpg',
    '/assets/sky_vn_highlands.jpg',
    '/assets/sky_vn_hanoi_ninhbinh.jpg',
    '/assets/sky_vn_hue_danang.jpg',
    '/assets/sky_vn_dalat_nhatrang.jpg',
    '/assets/sky_vietnam.jpg',
    '/assets/sky_japan.jpg',
    '/assets/sky_egypt.jpg',
    '/assets/sky_europe.jpg',
    '/assets/sky_world.jpg',
  ]) {
    const t = texLoader.load(url, loadedTex => {
      if (loadedTex.image) {
        const { mainTex, midTex, depthGrid } = processPanorama25D(loadedTex.image);
        skyTextures[url] = mainTex;
        skyMidTextures[url] = midTex;
        skyDepthGrids[url] = depthGrid;
        const activePal = BIOME_PALETTES[activeTrailBiomeId] || BIOME_PALETTES.vn_hagiang;
        if (activePal.skyImg === url) {
          skyMat.map = mainTex;
          skyMat.needsUpdate = true;
          skyMidMat.map = midTex;
          skyMidMat.needsUpdate = true;
          applyPanoramaDepthRelief(domeGeo, baseDomeZ, depthGrid);
        }
      }
    });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    skyTextures[url] = t;
  }
  skyMat.map = skyTextures['/assets/sky_vn_hagiang.jpg'];
  skyFadeMat.map = skyTextures['/assets/sky_vn_hagiang.jpg'];

  // 6 Multi-Plane 3D Parallax Volumetric Mist & Cloud Strata bridging 3D world to panorama
  const mistLayers = [];
  const mistGroup = new THREE.Group();
  scene.add(mistGroup);
  for (let i = 0; i < 6; i++) {
    const mMat = new THREE.MeshBasicMaterial({
      map: mistStrataTex,
      transparent: true,
      opacity: 0.08 + (i % 3) * 0.03,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const mMesh = new THREE.Mesh(new THREE.PlaneGeometry(38 + i * 5, 6.5 + (i % 3) * 2.0), mMat);
    const baseZ = -20 - i * 5.8;
    const baseX = (i % 2 === 0 ? -1 : 1) * (13 + (i % 3) * 3.5);
    const baseY = 1.2 + (i % 3) * 0.85;
    mMesh.position.set(baseX, baseY, baseZ);
    mistGroup.add(mMesh);
    mistLayers.push({
      mesh: mMesh,
      mat: mMat,
      baseX,
      baseY,
      baseZ,
      speed: 0.22 + i * 0.07,
      parallax: 0.25 + i * 0.12,
      phase: i * 1.4,
    });
  }

  const sunOrb = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffe299, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sunOrb.scale.setScalar(18);
  sunOrb.position.set(0, 14, -51);
  scene.add(sunOrb);

  // ==========================================================================
  // 3D SIMPLEX-NOISE SCULPTED VALLEY, HILLS & WATER TERRAIN MESH
  // Undulates in 3D space on both sides while staying nestled under the road!
  // ==========================================================================
  const groundGeo = new THREE.PlaneGeometry(156, 114, 56, 52);
  groundGeo.rotateX(-Math.PI / 2);
  groundGeo.translate(0, -0.1, -18);
  const baseGroundPos = Float32Array.from(groundGeo.attributes.position.array);
  const groundColors = new Float32Array(groundGeo.attributes.position.count * 3);
  groundGeo.setAttribute('color', new THREE.BufferAttribute(groundColors, 3));

  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0.18,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  scene.add(ground);

  const cGroundLow = new THREE.Color(0x1e3b2f);
  const cGroundHigh = new THREE.Color(0x2f5241);
  const cTemp = new THREE.Color();

  function deformTerrainValley(timeSec = 0) {
    const pos = groundGeo.attributes.position;
    const col = groundGeo.attributes.color;
    const dirCfg = BIOME_TRAIL_DIRECTORS[activeTrailBiomeId] || BIOME_TRAIL_DIRECTORS.vn_hagiang;
    const mode = dirCfg.terrainMode || 'mountain';
    groundMat.roughness = mode === 'water' ? 0.28 : 0.72;
    groundMat.metalness = mode === 'water' ? 0.42 : 0.12;

    for (let i = 0; i < pos.count; i++) {
      const idx = i * 3;
      const gx = baseGroundPos[idx];
      const gz = baseGroundPos[idx + 2];
      const pose = getTrailPose(gz, activeTrailScrollDist, activeTrailBiomeId);
      const distFromRoad = Math.abs(gx - pose.x);

      // Smoothly clamp terrain beneath the road (|dx| <= 5.2), then sculpt 3D relief outward
      const bankFactor = Math.max(0, Math.min(1, (distFromRoad - 5.2) / 14.0));
      let yRelief = 0;
      if (mode === 'water') {
        // Gentle 3D water ripples near the trail + natural shoreline banks further out
        const wave = Math.sin(gx * 0.45 + timeSec * 1.8 + gz * 0.25) * 0.12;
        const outerHill = Math.pow(Math.max(0, (distFromRoad - 14) / 22), 1.4) * (2.8 + noise2D(gx * 0.06, gz * 0.06) * 1.8);
        yRelief = bankFactor * (wave + outerHill);
      } else if (mode === 'terrace') {
        // Stepped 3D rice terrace tiers rising on both flanks
        const rawH = bankFactor * (3.8 + (noise2D(gx * 0.055, gz * 0.055 - activeTrailScrollDist * 0.01) + 0.6) * 2.6);
        yRelief = Math.floor(rawH * 1.6) / 1.6;
      } else {
        // Natural 3D undulating mountain valley & hills
        const n1 = noise2D(gx * 0.05, gz * 0.05 - activeTrailScrollDist * 0.008);
        const n2 = noise2D(gx * 0.12 + 7.3, gz * 0.12);
        yRelief = Math.pow(bankFactor, 1.25) * (2.6 + (n1 * 0.7 + n2 * 0.3 + 0.55) * 3.8);
      }

      pos.array[idx + 1] = pose.y - 0.18 + yRelief;
      const hBlend = Math.max(0, Math.min(1, yRelief / 4.5));
      cTemp.copy(cGroundLow).lerp(cGroundHigh, hBlend);
      col.array[idx] = cTemp.r;
      col.array[idx + 1] = cTemp.g;
      col.array[idx + 2] = cTemp.b;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  // ==========================================================================
  // SUBDIVIDED DYNAMIC LANDMARK-DIRECTED WALKING TRAIL MESH
  // Steers, curves, climbs, and tapers directly into each regional landmark!
  // ==========================================================================
  const trailWidth = 9.2;
  const trailLength = 74;
  const segX = 18;
  const segZ = 84;
  const roadGeo = new THREE.PlaneGeometry(trailWidth, trailLength, segX, segZ);
  roadGeo.rotateX(-Math.PI / 2);
  // Shift Z so the trail spans from z = +21 (near camera) to z = -53 (right where it meets the landmark horizon)
  roadGeo.translate(0, 0, -16);

  const basePositions = Float32Array.from(roadGeo.attributes.position.array);

  let currentRoadTex = createBiomeTrailTexture('vn_hagiang');
  const roadMat = new THREE.MeshStandardMaterial({
    map: currentRoadTex,
    color: 0xd8cbb8,
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.14,
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
      const t = pose.t || 0;
      // Perspective taper + soft horizon crest dip at the far 15% so the road melts into the 3D landmark
      const horizonTail = t > 0.85 ? (t - 0.85) / 0.15 : 0;
      const taper = (1 - 0.36 * Math.pow(t, 1.45)) * (1 - horizonTail * 0.35);
      const horizonDip = horizonTail * horizonTail * 0.65;
      arr[idx] = bx * taper + pose.x;
      arr[idx + 1] = pose.y - horizonDip;
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
  let baseSkyPanX = 2.0;
  let baseSkyPanY = 14.2;
  const propRows = [];
  const gateRows = [];
  const animCallbacks = [];
  let elapsed = 0;

  function updatePropRowsCurveAlignment() {
    for (const row of propRows) {
      const pose = getTrailPose(row.position.z, activeTrailScrollDist, activeTrailBiomeId);
      const taper = 1 - 0.28 * Math.pow(pose.t || 0, 1.4);
      row.position.x = pose.x;
      row.position.y = pose.y;
      row.rotation.y = pose.angleY * 0.55;
      if (row.children[0]) row.children[0].position.x = -4.55 * taper;
      if (row.children[1]) row.children[1].position.x = 4.55 * taper;
    }
    for (const gate of gateRows) {
      const pose = getTrailPose(gate.position.z, activeTrailScrollDist, activeTrailBiomeId);
      gate.position.x = pose.x;
      gate.position.y = pose.y;
      gate.rotation.y = pose.angleY * 0.55;
    }
  }

  function rebuildBiomeScenery(biomeId) {
    if (biomeId === currentBiomeId) return;
    currentBiomeId = biomeId;
    activeTrailBiomeId = biomeId;

    const pal = BIOME_PALETTES[biomeId] || BIOME_PALETTES.vn_hagiang;
    const dirCfg = BIOME_TRAIL_DIRECTORS[biomeId] || BIOME_TRAIL_DIRECTORS.vn_hagiang;
    scene.background.setHex(pal.skyTop);
    scene.fog.color.setHex(pal.fog);
    cGroundLow.setHex(pal.ground);
    cGroundHigh.setHex(pal.hillColor || pal.fog);
    sunOrb.material.color.setHex(pal.sun);

    for (const m of mistLayers) {
      m.mat.color.setHex(pal.sun);
    }

    baseSkyPanX = dirCfg.skyPanX ?? 0;
    baseSkyPanY = dirCfg.skyPanY ?? 13.8;

    const nextTex = skyTextures[pal.skyImg] || skyTextures['/assets/sky_vn_hagiang.jpg'];
    if (nextTex && skyMat.map !== nextTex) {
      skyFadeMat.map = skyMat.map;
      skyFadeMat.opacity = 0.95;
      skyFadeMat.needsUpdate = true;

      skyMat.map = nextTex;
      skyMat.needsUpdate = true;

      gsap.killTweensOf(skyFadeMat);
      gsap.to(skyFadeMat, { opacity: 0, duration: 1.1, ease: 'power2.out' });
    }
    const nextMidTex = skyMidTextures[pal.skyImg];
    if (nextMidTex) {
      skyMidMat.map = nextMidTex;
      skyMidMat.needsUpdate = true;
    }
    applyPanoramaDepthRelief(domeGeo, baseDomeZ, skyDepthGrids[pal.skyImg]);

    skyBackdrop.position.set(baseSkyPanX, baseSkyPanY, -56);
    skyBackdropFade.position.set(baseSkyPanX, baseSkyPanY, -55.8);
    skyMidground.position.set(baseSkyPanX * 0.75, baseSkyPanY - 2.6, -43);

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

    for (let i = 0; i < 11; i++) {
      const row = new THREE.Group();
      row.position.z = 16 - i * 6.0;
      const leftProp = buildRoadsideScene(biomeId, -1, i, animCallbacks, provStartIdx);
      leftProp.position.x = -4.55;
      const rightProp = buildRoadsideScene(biomeId, 1, i + 1, animCallbacks, provStartIdx);
      rightProp.position.x = 4.55;
      row.add(leftProp, rightProp);
      propsGroup.add(row);
      propRows.push(row);
    }

    // Only spawn an Imperial Gate in Cố Đô Huế so all natural/modern landmark horizons stay 100% unobstructed
    if (dirCfg.hasImperialGate) {
      const gate = buildHighwayGateway(biomeId);
      gate.position.z = -24;
      propsGroup.add(gate);
      gateRows.push(gate);
    }

    if (horizonGroup) scene.remove(horizonGroup);
    horizonGroup = buildHorizonLandmark(biomeId, animCallbacks);
    scene.add(horizonGroup);

    deformTrailGeometry();
    deformTerrainValley(elapsed);
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
          row.position.z -= 11 * 6.0;
        }
      }
      for (const gate of gateRows) {
        gate.position.z += scroll;
        if (gate.position.z > 19) {
          gate.position.z -= 58;
        }
      }

      deformTrailGeometry();
      deformTerrainValley(elapsed);
      updatePropRowsCurveAlignment();

      // Multi-dimensional 3D Parallax Sway on the Curved Panorama Dome, Midground Cutout & Mist Strata
      const fgPose = getTrailPose(2, activeTrailScrollDist, activeTrailBiomeId);
      const parallaxX = -fgPose.x * 0.45 + Math.sin(elapsed * 0.32) * 0.65;
      const parallaxY = Math.cos(elapsed * 0.26) * 0.28;
      skyBackdrop.position.x = baseSkyPanX + parallaxX;
      skyBackdrop.position.y = baseSkyPanY + parallaxY;
      skyBackdrop.rotation.y = -fgPose.angleY * 0.18 + Math.sin(elapsed * 0.22) * 0.015;

      skyMidground.position.x = baseSkyPanX * 0.75 + parallaxX * 1.85;
      skyMidground.position.y = baseSkyPanY - 2.6 + parallaxY * 1.4;
      skyMidground.rotation.y = -fgPose.angleY * 0.28 + Math.sin(elapsed * 0.22) * 0.022;

      for (const m of mistLayers) {
        m.mesh.position.x = m.baseX + Math.sin(elapsed * m.speed + m.phase) * 5.5 - fgPose.x * m.parallax;
        m.mesh.position.y = m.baseY + Math.cos(elapsed * m.speed * 0.8 + m.phase) * 0.45;
      }

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
