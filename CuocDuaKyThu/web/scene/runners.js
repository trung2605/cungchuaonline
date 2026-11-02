// Lifelike 3D Vietnamese Cross-Country Walkers (`Hành Trình Đi Bộ Xuyên Việt 63 Tỉnh Thành`).
// Features:
// - Full 16-bone anatomical human walker rig (Head, Neck, Chest, Spine, Hips, Upper/Lower Arms, Hands,
//   Upper/Lower Legs, Ankles/Feet with heel-to-toe walking kinematics)
// - 4 Signature Vietnamese Outfits:
//   0: Phượt Thủ Áo Đỏ Sao Vàng + Balo gắn Cờ Tổ Quốc bay trong gió
//   1: Áo Dài Truyền Thống Việt Nam (có tà áo bay nhẹ theo nhịp bước) + Nón Lá
//   2: Áo Bà Ba & Khăn Rằn Nam Bộ + Nón Lá Miền Tây
//   3: Áo Chàm Thổ Cẩm Tây Bắc + Balo Xuyên Việt
// - Follows the live 3D curved & undulating trail (`getTrailPose`) across all 12 Vietnamese landmarks
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { glowTex, canvasTex, getTrailPose } from './world3d.js';

const OUTFIT_COLORS = [0xda251d, 0x2563eb, 0x854d0e, 0x1e3a8a, 0x0f766e, 0xb91c1c];
const TIER_SUITS = {
  1: 0xda251d, // Tier 1 (1-9💎): Áo Cờ Đỏ Sao Vàng + Đôi Cánh Chim Lạc
  2: 0x0284c7, // Tier 2 (10-99💎): Phượt Thủ Xe Cub Xuyên Việt
  3: 0xb91c1c, // Tier 3 (100-999💎): Chiến Bào Thánh Gióng Hoàng Kim
  4: 0xd97706, // Tier 4 (1000+💎): Long Bào Rồng Vàng Lạc Long Quân
};

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const skinMat = std(0xe8be99, { roughness: 0.62 });
const blushMat = std(0xd98a7c, { roughness: 0.68 });
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x161210 });
const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const hairMats = [
  std(0x17120e, { roughness: 0.78 }),
  std(0x241811, { roughness: 0.76 }),
  std(0x2e1e14, { roughness: 0.75 }),
  std(0x141418, { roughness: 0.78 }),
];
const pantsMats = [
  std(0x1e293b, { roughness: 0.82 }),
  std(0xf8fafc, { roughness: 0.72 }), // Quần lụa trắng Áo Dài
  std(0x27272a, { roughness: 0.85 }),
  std(0x334155, { roughness: 0.82 }),
];
const bootMat = std(0x3b2618, { roughness: 0.7, metalness: 0.08 });
const soleMat = std(0xf8fafc, { roughness: 0.85 });
const packMat = std(0x573b22, { roughness: 0.75 });
const packPocketMat = std(0x3f2917, { roughness: 0.78 });
const sleepRollMat = std(0x15803d, { roughness: 0.75 });
const nonLaMat = std(0xe5c993, { roughness: 0.68, side: THREE.DoubleSide });
const hatBandMat = std(0xdc2626, { roughness: 0.6 });
const staffWoodMat = std(0x54321a, { roughness: 0.8 });
const lanternGoldMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

// Texture for Áo Cờ Đỏ Sao Vàng (Red Shirt with Golden 5-Pointed Star on Back & Front)
const vnShirtTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#da251d';
  g.fillRect(0, 0, w, h);
  const drawStar = (cx, cy, rOuter, rInner) => {
    g.fillStyle = '#ffff00';
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = ((i * 72 - 90) * Math.PI) / 180;
      const a2 = (((i * 72 + 36) - 90) * Math.PI) / 180;
      g.lineTo(cx + Math.cos(a1) * rOuter, cy + Math.sin(a1) * rOuter);
      g.lineTo(cx + Math.cos(a2) * rInner, cy + Math.sin(a2) * rInner);
    }
    g.closePath();
    g.fill();
  };
  drawStar(64, 120, 32, 13);
  drawStar(192, 120, 32, 13);
});

// Checkered Khăn Rằn Nam Bộ texture (Black & White Southern Vietnamese Scarf)
const khanRanTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#f8fafc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e293b';
  for (let y = 0; y < h; y += 16) {
    for (let x = 0; x < w; x += 16) {
      if ((x / 16 + y / 16) % 2 === 0) g.fillRect(x, y, 16, 16);
    }
  }
});
const khanRanMat = std(0xffffff, { map: khanRanTex, roughness: 0.75 });

// Miniature Vietnamese Flag texture for Backpack
const miniFlagTex = canvasTex(128, 84, (g, w, h) => {
  g.fillStyle = '#da251d';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffff00';
  g.beginPath();
  const cx = w / 2;
  const cy = h / 2;
  for (let i = 0; i < 5; i++) {
    const a1 = ((i * 72 - 90) * Math.PI) / 180;
    const a2 = (((i * 72 + 36) - 90) * Math.PI) / 180;
    g.lineTo(cx + Math.cos(a1) * 24, cy + Math.sin(a1) * 24);
    g.lineTo(cx + Math.cos(a2) * 9.5, cy + Math.sin(a2) * 9.5);
  }
  g.closePath();
  g.fill();
});
const miniFlagMat = new THREE.MeshBasicMaterial({ map: miniFlagTex, side: THREE.DoubleSide });

const wingMat = new THREE.MeshStandardMaterial({
  color: 0xfacc15,
  emissive: 0x854d0e,
  emissiveIntensity: 0.45,
  metalness: 0.55,
  roughness: 0.3,
  side: THREE.DoubleSide,
});
const cubBodyMat = std(0x0284c7, { metalness: 0.5, roughness: 0.32 });
const cubShieldMat = std(0xf8fafc, { roughness: 0.4 });
const jetMat = std(0xb91c1c, { metalness: 0.55, roughness: 0.35, emissive: 0x450a0a });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
const crownMat = std(0xfacc15, { metalness: 0.78, roughness: 0.25, emissive: 0x422006 });

// Builds a detailed 3D Trekking Backpack with a Waving Miniature Vietnamese Flag (`Balo Xuyên Việt & Cờ Đỏ Sao Vàng`)
function createTrekkingBackpack() {
  const pack = new THREE.Group();
  pack.position.set(0, 0.05, -0.17);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.35, 0.15), packMat);
  body.castShadow = true;
  pack.add(body);

  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.16), packPocketMat);
  flap.position.set(0, 0.15, 0);
  pack.add(flap);

  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.06), packPocketMat);
  pocket.position.set(0, -0.04, -0.1);
  pack.add(pocket);

  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12), sleepRollMat);
  roll.rotation.z = Math.PI / 2;
  roll.position.set(0, 0.23, -0.02);
  pack.add(roll);

  // Miniature Vietnamese Flag Pole sticking up from the backpack!
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.01, 0.42, 6),
    std(0xe2e8f0, { metalness: 0.7 })
  );
  pole.position.set(0.09, 0.34, -0.04);
  pack.add(pole);

  const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), miniFlagMat);
  flagMesh.position.set(0.21, 0.46, -0.04);
  pack.add(flagMesh);
  pack.userData.flagMesh = flagMesh;

  for (const sx of [-0.09, 0.09]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.34, 0.17), packPocketMat);
    strap.position.set(sx, 0.02, 0.11);
    pack.add(strap);
  }
  return pack;
}

function createTrekkingStaff() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 1.16, 8), staffWoodMat);
  pole.position.set(0, -0.12, 0.06);
  pole.rotation.x = 0.15;
  pole.castShadow = true;
  g.add(pole);

  const lanternBulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), lanternGoldMat);
  lanternBulb.position.set(0, 0.42, 0.16);
  g.add(lanternBulb);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffd166, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75,
  }));
  glow.scale.setScalar(0.26);
  glow.position.set(0, 0.42, 0.16);
  g.add(glow);
  return g;
}

// ============================================================================
// 3D REGIONAL SPECIALTY HANDHELD PROPS (`Vật Phẩm Đặc Sản 63 Tỉnh Thành 3D`)
// Builds lifelike 3D props held in the walker's left hand (`leftLowerArm`),
// such as Bịch Rau Má Thanh Hóa, Tô Mì Quảng Đà Nẵng, Trái Dừa Bến Tre,
// Bánh Mì Phượng Hội An, Mâm Cỗ Hoàng Gia, etc.
// ============================================================================
function buildRegionalHandheldProp(item = null) {
  if (!item || !item.propType) return null;
  const g = new THREE.Group();
  // Position in front of the left palm (`handMesh` is at y = -0.25 on `leftLowerArm`)
  g.position.set(0.02, -0.26, 0.09);

  const mainCol = Number.isFinite(item.color) ? item.color : 0xf59e0b;
  const accCol = Number.isFinite(item.accent) ? item.accent : 0x22c55e;
  const mainMat = std(mainCol, { roughness: 0.45 });
  const accMat = std(accCol, { roughness: 0.5 });

  switch (item.propType) {
    case 'bag_drink': {
      // Bịch Nước Rau Má Thanh Hóa / Nước Mía cột dây thun đỏ + ống hút
      const bagOuter = new THREE.Mesh(
        new THREE.SphereGeometry(0.082, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, roughness: 0.2 })
      );
      bagOuter.scale.set(0.88, 1.32, 0.88);
      const liquid = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 12, 10),
        new THREE.MeshStandardMaterial({ color: mainCol, roughness: 0.35, emissive: mainCol, emissiveIntensity: 0.18 })
      );
      liquid.scale.set(0.86, 1.15, 0.86);
      liquid.position.y = -0.012;
      const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.06, 0.024, 10), accMat);
      foam.position.y = 0.045;
      const rubberTie = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 6, 12), std(0xdc2626));
      rubberTie.rotation.x = Math.PI / 2;
      rubberTie.position.y = 0.088;
      const knotEar = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.045, 8), std(0xf8fafc, { transparent: true, opacity: 0.65 }));
      knotEar.position.y = 0.112;
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.21, 8), std(0xef4444));
      straw.position.set(0.015, 0.095, 0.01);
      straw.rotation.z = -0.22;
      g.add(liquid, foam, bagOuter, rubberTie, knotEar, straw);
      break;
    }
    case 'coconut': {
      // Trái Dừa Xiêm Bến Tre / Dừa Sáp Cầu Kè cắm ống hút & lát hoa
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.088, 14, 12), mainMat);
      shell.scale.set(0.96, 1.08, 0.96);
      const topCut = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.072, 0.024, 12), std(0xfefce8));
      topCut.position.y = 0.076;
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), std(0xec4899));
      straw.position.set(0.018, 0.125, 0.01);
      straw.rotation.z = -0.25;
      g.add(shell, topCut, straw);
      break;
    }
    case 'cup_drink': {
      // Ly Trà Shan Tuyết / Cà Phê Sữa Đá / Nước Mót Hội An
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.046, 0.155, 12), mainMat);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.007, 6, 14), std(0xf8fafc));
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.078;
      const topping = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.022, 12), accMat);
      topping.position.y = 0.072;
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.17, 8), std(0x22c55e));
      straw.position.set(0.02, 0.11, 0);
      straw.rotation.z = -0.2;
      g.add(cup, rim, topping, straw);
      break;
    }
    case 'banh_mi': {
      // Ổ Bánh Mì Phượng Hội An / Bánh Mì Sài Gòn / Bánh Mì Que Hải Phòng
      const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), mainMat);
      loaf.scale.set(0.68, 0.62, 1.48);
      const herbs = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.21), accMat);
      herbs.position.set(0, 0.038, 0);
      const wrapper = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.11, 10), std(0xfef3c7));
      wrapper.rotation.x = Math.PI / 2;
      wrapper.position.z = -0.025;
      g.add(loaf, herbs, wrapper);
      break;
    }
    case 'noodle_bowl': {
      // Tô Mì Quảng Đà Nẵng / Tô Phở Hà Nội / Tô Bún Bò Huế + Bánh đa + Đũa
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.062, 0.095, 16),
        std(0xf8fafc, { roughness: 0.3 })
      );
      const rimBand = new THREE.Mesh(new THREE.TorusGeometry(0.114, 0.008, 6, 18), std(0x0284c7));
      rimBand.rotation.x = Math.PI / 2;
      rimBand.position.y = 0.045;
      const broth = new THREE.Mesh(new THREE.CylinderGeometry(0.106, 0.102, 0.02, 14), mainMat);
      broth.position.y = 0.038;
      // Garnish: shrimp/meat + fresh herbs + crispy rice cracker (Bánh đa Mì Quảng)
      const herb = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), accMat);
      herb.scale.set(1.2, 0.45, 1.1);
      herb.position.set(-0.028, 0.055, 0.015);
      const shrimp = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), std(0xef4444));
      shrimp.scale.set(1.1, 0.5, 0.8);
      shrimp.position.set(0.032, 0.055, -0.015);
      const cracker = new THREE.Mesh(new THREE.CircleGeometry(0.055, 10), std(0xfef08a, { side: THREE.DoubleSide }));
      cracker.position.set(0, 0.072, -0.035);
      cracker.rotation.x = -0.45;
      // Pair of wooden chopsticks resting on the bowl
      for (const cz of [-0.016, 0.016]) {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.24, 6), staffWoodMat);
        stick.rotation.z = Math.PI / 2 - 0.18;
        stick.position.set(0.02, 0.068, cz);
        g.add(stick);
      }
      g.add(bowl, rimBand, broth, herb, shrimp, cracker);
      break;
    }
    case 'plate_dish': {
      // Đĩa Cơm Cháy Ninh Bình / Cơm Tấm Sài Gòn / Bánh Xèo / Cá Nướng
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.095, 0.026, 16), std(0xf8fafc));
      const foodMain = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.092, 0.038, 12), mainMat);
      foodMain.position.y = 0.025;
      const garnish = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), accMat);
      garnish.scale.set(1.2, 0.5, 1.2);
      garnish.position.set(0.02, 0.048, 0.01);
      g.add(plate, foodMain, garnish);
      break;
    }
    case 'woven_gift': {
      // Chục Nem Chua Thanh Hóa / Cốm Làng Vòng / Bánh Chưng / Bánh Pía
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.115, 0.145), mainMat);
      const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.152, 0.122, 0.026), accMat);
      const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.122, 0.152), accMat);
      g.add(pack, ribbon1, ribbon2);
      break;
    }
    case 'royal_tray':
    default: {
      // Mâm Cỗ Hoàng Gia / Đại Tiệc Hải Sản / Nồi Lẩu Đặc Sản Vùng Miền
      const tray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.155, 0.135, 0.032, 18),
        std(0xfacc15, { metalness: 0.65, roughness: 0.28 })
      );
      const hotpot = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.078, 0.075, 14), mainMat);
      hotpot.position.y = 0.048;
      for (const [dx, dz, col] of [[-0.08, 0.06, accCol], [0.08, 0.06, 0xef4444], [0, -0.085, 0xfef08a]]) {
        const sideDish = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), std(col));
        sideDish.scale.set(1, 0.6, 1);
        sideDish.position.set(dx, 0.032, dz);
        g.add(sideDish);
      }
      g.add(tray, hotpot);
      break;
    }
  }

  // Soft golden aura around the specialty item so viewers immediately spot it on stream!
  const itemGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffe082,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.55,
  }));
  itemGlow.scale.setScalar(0.32);
  itemGlow.position.set(0, 0.04, 0);
  g.add(itemGlow);

  return g;
}

// Builds a 3D Vintage Vietnamese Honda Cub 81 Scooter (`Xe Máy Cub Phượt Xuyên Việt`) for Tier 2+
function createHondaCubMount() {
  const g = new THREE.Group();
  g.position.set(0, 0.12, 0);

  // Main underbone frame & rear fender
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.92), cubBodyMat);
  body.position.set(0, 0.14, 0);
  g.add(body);

  // Iconic white leg-shield (Yếm xe Cub trắng)
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.08), cubShieldMat);
  shield.position.set(0, 0.26, 0.28);
  shield.rotation.x = -0.2;
  g.add(shield);

  // Handlebars + Round glowing headlight
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8), std(0xd4d4d8, { metalness: 0.8 }));
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.56, 0.24);
  g.add(bar);

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), lanternGoldMat);
  lamp.position.set(0, 0.56, 0.3);
  g.add(lamp);

  // Front & Rear wheels
  const wheelMat = std(0x18181b, { roughness: 0.9 });
  for (const wz of [-0.36, 0.38]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 16), wheelMat);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.08, wz);
    g.add(wheel);
  }

  const glowUnder = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x38bdf8, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glowUnder.scale.set(1.25, 1.25, 1);
  glowUnder.position.y = -0.04;
  g.add(glowUnder);
  return g;
}

function buildRunnerRig(skin = 0, tier = 0) {
  const root = new THREE.Group();
  root.rotation.y = Math.PI;

  const b = {};
  const bone = (name, parent, x, y, z = 0) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add((b[name] = o));
    return o;
  };

  const outfitStyle = skin % 4; // 0: Áo Cờ Đỏ Sao Vàng, 1: Áo Dài, 2: Áo Bà Ba Khăn Rằn, 3: Thổ Cẩm Tây Bắc
  const baseColor = TIER_SUITS[tier] || OUTFIT_COLORS[outfitStyle];
  const suitMat = std(outfitStyle === 0 && tier === 0 ? 0xffffff : baseColor, {
    map: outfitStyle === 0 && tier <= 1 ? vnShirtTex : null,
    metalness: tier >= 3 ? 0.38 : 0.06,
    roughness: tier >= 3 ? 0.35 : 0.65,
  });
  const collarMat = outfitStyle === 2 ? khanRanMat : std(0xfacc15, { roughness: 0.55 });
  const hMat = hairMats[skin % hairMats.length];
  const pMat = pantsMats[outfitStyle];

  // Full 16-bone Humanoid Hierarchy (including Ankle/Foot bones for natural heel-to-toe roll)
  bone('hips', root, 0, 0.94, 0);
  bone('spine', b.hips, 0, 0.08, 0);
  bone('chest', b.spine, 0, 0.2, 0);
  bone('neck', b.chest, 0, 0.28, 0);
  bone('head', b.neck, 0, 0.06, 0);

  // Pelvis
  const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.138, 0.13, 0.16, 14), pMat);
  pelvisMesh.position.y = 0.02;
  pelvisMesh.castShadow = true;
  b.hips.add(pelvisMesh);

  // Torso (Tapered human waist-to-shoulder silhouette)
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.132, 0.48, 16), suitMat);
  torsoMesh.position.y = 0.08;
  torsoMesh.castShadow = true;
  b.chest.add(torsoMesh);

  // Collar / Khăn Rằn Scarf
  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.085, 14), collarMat);
  collarMesh.position.y = 0.29;
  b.chest.add(collarMesh);

  // Flowing Áo Dài Front & Back Silk Panels (`Tà Áo Dài Việt Nam`) for Outfit 1
  const aoDaiFront = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.46),
    new THREE.MeshStandardMaterial({ color: baseColor, side: THREE.DoubleSide, roughness: 0.5 })
  );
  aoDaiFront.position.set(0, -0.22, 0.135);
  aoDaiFront.visible = outfitStyle === 1;
  b.hips.add(aoDaiFront);

  const aoDaiBack = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.46),
    new THREE.MeshStandardMaterial({ color: baseColor, side: THREE.DoubleSide, roughness: 0.5 })
  );
  aoDaiBack.position.set(0, -0.22, -0.135);
  aoDaiBack.visible = outfitStyle === 1;
  b.hips.add(aoDaiBack);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.09, 10), skinMat);
  neckMesh.position.y = 0.03;
  b.neck.add(neckMesh);

  // Lifelike Head with Facial Features
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.128, 18, 16), skinMat);
  headMesh.scale.set(0.94, 1.06, 0.96);
  headMesh.position.y = 0.11;
  headMesh.castShadow = true;
  b.head.add(headMesh);

  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), skinMat);
    ear.scale.set(0.55, 1.1, 0.8);
    ear.position.set(sx * 0.122, 0.105, 0);
    b.head.add(ear);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
    eye.position.set(sx * 0.043, 0.12, 0.115);
    b.head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 6, 6), eyeHighlightMat);
    glint.position.set(sx * 0.047, 0.125, 0.128);
    b.head.add(glint);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), blushMat);
    cheek.scale.set(1.2, 0.65, 0.5);
    cheek.position.set(sx * 0.066, 0.092, 0.11);
    b.head.add(cheek);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.034, 6), skinMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.102, 0.132);
  b.head.add(nose);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.134, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hMat
  );
  hairCap.position.y = 0.122;
  hairCap.rotation.x = -0.15;
  b.head.add(hairCap);

  if (skin % 2 === 1) {
    const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.046, 0.18, 10), hMat);
    ponytail.position.set(0, 0.08, -0.145);
    ponytail.rotation.x = -0.55;
    b.head.add(ponytail);
  }

  // Traditional Vietnamese Nón Lá (`Nón Lá Bài Thơ` with red silk chin strap)
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.22, -0.01);
  hatGroup.rotation.x = -0.1;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.155, 24), nonLaMat);
  cone.castShadow = true;
  hatGroup.add(cone);
  const chinRibbon = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.008, 6, 16, Math.PI), hatBandMat);
  chinRibbon.rotation.x = Math.PI;
  chinRibbon.position.set(0, -0.07, 0.04);
  hatGroup.add(chinRibbon);
  hatGroup.visible = tier < 4;
  b.head.add(hatGroup);

  // Trekking Backpack with Waving Vietnamese Flag
  const backpack = createTrekkingBackpack();
  b.chest.add(backpack);

  // Articulated Arms & Legs with Foot/Ankle Joints
  let trekkingStaff = null;
  const regionalPropHolder = new THREE.Group();
  let currentRegionalPropKey = '';
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const upperArm = bone(side + 'UpperArm', b.chest, 0.188 * sx, 0.22, 0);
    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), suitMat);
    upperArm.add(shoulderCap);

    const uArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.26, 10), suitMat);
    uArmMesh.position.y = -0.13;
    uArmMesh.castShadow = true;
    upperArm.add(uArmMesh);

    const lowerArm = bone(side + 'LowerArm', upperArm, 0, -0.26, 0);
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.039, 8, 8), skinMat);
    lowerArm.add(elbowJoint);

    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.033, 0.24, 10), skinMat);
    lArmMesh.position.y = -0.12;
    lArmMesh.castShadow = true;
    lowerArm.add(lArmMesh);

    const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.039, 10, 8), skinMat);
    handMesh.scale.set(0.85, 1.15, 0.95);
    handMesh.position.y = -0.25;
    lowerArm.add(handMesh);

    if (side === 'left') {
      lowerArm.add(regionalPropHolder);
    }
    if (side === 'right') {
      trekkingStaff = createTrekkingStaff();
      trekkingStaff.position.set(0, -0.24, 0.02);
      lowerArm.add(trekkingStaff);
    }

    const upperLeg = bone(side + 'UpperLeg', b.hips, 0.088 * sx, -0.03, 0);
    const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 8), pMat);
    upperLeg.add(hipJoint);

    const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.05, 0.42, 12), pMat);
    thighMesh.position.y = -0.21;
    thighMesh.castShadow = true;
    upperLeg.add(thighMesh);

    const lowerLeg = bone(side + 'LowerLeg', upperLeg, 0, -0.42, 0);
    const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), pMat);
    lowerLeg.add(kneeJoint);

    const calfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.4, 12), pMat);
    calfMesh.position.y = -0.2;
    calfMesh.castShadow = true;
    lowerLeg.add(calfMesh);

    // Articulated Foot / Ankle Bone (`leftFoot`, `rightFoot`) for Heel-Strike & Toe-Off
    const footBone = bone(side + 'Foot', lowerLeg, 0, -0.41, 0);
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.088, 0.21), bootMat);
    bootUpper.position.set(0, -0.01, 0.04);
    bootUpper.castShadow = true;
    const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.03, 0.225), soleMat);
    bootSole.position.set(0, -0.055, 0.04);
    footBone.add(bootUpper, bootSole);
  }

  // Tier 1+: Đôi Cánh Chim Lạc Đông Sơn (Golden Dong Son Crane Wings)
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 0.14, -0.24);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 6), wingMat);
    w.rotation.z = sx * 1.12;
    w.position.set(sx * 0.4, 0.12, 0);
    wingsGroup.add(w);
  }
  wingsGroup.visible = tier >= 1;
  b.chest.add(wingsGroup);

  // Tier 2+: Xe Máy Cub Phượt Xuyên Việt / Đài Mây Hoàng Kim
  const hoverGroup = createHondaCubMount();
  hoverGroup.visible = tier >= 2;
  root.add(hoverGroup);

  // Tier 3+: Chiến Bào Thánh Gióng Twin Flame Boosters
  const jetGroup = new THREE.Group();
  jetGroup.position.set(0, 0.06, -0.26);
  for (const sx of [-0.12, 0.12]) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.38, 10), jetMat);
    cyl.position.x = sx;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), flameMat);
    flame.rotation.x = Math.PI;
    flame.position.set(sx, -0.3, 0);
    jetGroup.add(cyl, flame);
  }
  jetGroup.visible = tier >= 3;
  b.chest.add(jetGroup);

  // Tier 4: Vương Miện & Hào Quang Rồng Vàng Lạc Long Quân
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.09, 0.12, 10, 1, true), crownMat);
  crown.position.y = 0.25;
  crown.visible = tier >= 4;
  b.head.add(crown);

  const cosmicRing = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.78, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  cosmicRing.rotation.x = Math.PI / 2;
  cosmicRing.position.y = 0.1;
  cosmicRing.visible = tier >= 4;
  root.add(cosmicRing);

  return {
    root,
    bones: b,
    torsoMesh,
    aoDaiFront,
    aoDaiBack,
    hatGroup,
    backpack,
    trekkingStaff,
    regionalPropHolder,
    wingsGroup,
    hoverGroup,
    jetGroup,
    crown,
    cosmicRing,
    setRegionalItem(item = null) {
      const nextKey = item ? `${item.propType}:${item.color}:${item.accent}` : '';
      if (nextKey === currentRegionalPropKey) return;
      currentRegionalPropKey = nextKey;
      regionalPropHolder.clear();
      if (item) {
        const mesh = buildRegionalHandheldProp(item);
        if (mesh) regionalPropHolder.add(mesh);
      }
    },
    setVisualTier(newTier, boostTier = 0) {
      const activeTier = Math.max(newTier, boostTier);
      const col = TIER_SUITS[activeTier] || (outfitStyle === 0 ? 0xffffff : OUTFIT_COLORS[outfitStyle]);
      suitMat.color.setHex(col);
      hatGroup.visible = activeTier < 4;
      wingsGroup.visible = activeTier === 1 || activeTier >= 3;
      hoverGroup.visible = activeTier >= 2;
      jetGroup.visible = activeTier >= 3;
      crown.visible = activeTier >= 4;
      cosmicRing.visible = activeTier >= 4;
    },
  };
}

export function createRunners(scene) {
  const live = new Map();

  const formatDist = m => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

  function hashRunnerId(id = '') {
    let h = 2166136261;
    const s = String(id);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function computeFormationTarget(runner, rank = null, vipSpotlight = false) {
    const h = hashRunnerId(runner.id);
    if (vipSpotlight) {
      // Newly gifted VIP runner glides right into the front-center camera spotlight!
      return { laneOffset: 0, targetZ: -1.05 };
    }
    if (rank && rank <= 6) {
      // Spread Top 6 leaders into distinct staggered lanes & mid-road depths so 3D labels never overlap or clip edges
      const topLanes = [0, 0.85, -0.85, 1.48, -1.48, 0.38, -0.42];
      const laneOffset = topLanes[rank] ?? 0;
      const targetZ = -0.8 - (rank - 1) * 1.35;
      return { laneOffset, targetZ };
    }
    const laneX = (runner.lane || 0) * 0.58;
    const xJitter = (((h % 9) - 4) / 4) * 0.24;
    const laneOffset = Math.max(-1.58, Math.min(1.58, laneX + xJitter));

    // Golden-ratio depth distribution (-9.2 .. -1.2) keeps walkers in the upper-middle road zone above TikTok chat
    const goldenFrac = ((h * 0.61803398875) % 1 + 1) % 1;
    const rowDepth = goldenFrac * 7.6;
    const activeTier = Math.max(runner.tier || 0, runner.boostTier || 0);
    const tierBonus = Math.min(1.6, activeTier * 0.35);
    const targetZ = Math.max(-9.2, Math.min(-1.0, -1.0 - rowDepth + tierBonus * 0.45));

    return { laneOffset, targetZ };
  }

  function updateLabelText(e) {
    const r = e.runner;
    const activeTier = Math.max(r.tier || 0, r.boostTier || 0);
    const rankStr = e.rank === 1 ? '👑#1 ' : (e.rank && e.rank <= 8 ? `🏆#${e.rank} ` : '');
    const mountIcon = activeTier >= 4 ? '🐉' : activeTier === 3 ? '🐎' : activeTier === 2 ? '🛵' : activeTier === 1 ? '🪽' : '';
    const dStr = r.diamonds > 0 ? ` · ${mountIcon}💎${r.diamonds}` : '';
    const itemStr = r.regionalItem?.shortName
      ? ` · ${r.regionalItem.icon || '🍜'} ${r.regionalItem.shortName}`
      : '';
    const boostStr = (r.boostTier || 0) > 0 && (r.speedMult || 1) > 1.2 ? ` ⚡×${Number(r.speedMult).toFixed(1)}` : '';
    e.nameEl.textContent = `${rankStr}${r.name} · ${formatDist(r.distanceM || 0)}${dStr}${itemStr}${boostStr}`;
    e.nameEl.className = 'label' + (activeTier >= 4 ? ' tier4' : activeTier === 3 ? ' tier3' : activeTier === 2 ? ' tier2' : activeTier === 1 ? ' tier1' : '');
  }

  function remove(id) {
    const e = live.get(id);
    if (!e) return;
    clearTimeout(e.bubbleTimer);
    e.label.element.remove();
    e.holder.removeFromParent();
    live.delete(id);
  }

  return {
    addOrUpdate(runner) {
      let e = live.get(runner.id);
      if (!e) {
        const holder = new THREE.Group();
        const rig = buildRunnerRig(runner.skin, Math.max(runner.tier || 0, runner.boostTier || 0));
        if (runner.regionalItem) rig.setRegionalItem(runner.regionalItem);
        rig.root.scale.setScalar(0.58);
        holder.add(rig.root);

        const el = document.createElement('div');
        el.style.cssText = 'display:flex;flex-direction:column;align-items:center';
        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'label bubble';
        bubbleEl.style.display = 'none';
        const nameEl = document.createElement('div');
        nameEl.className = 'label';
        el.append(bubbleEl, nameEl);

        const label = new CSS2DObject(el);
        label.center.set(0.5, 1);
        const h = hashRunnerId(runner.id);
        label.position.set(0, 1.34 + (h % 5) * 0.18, 0);
        holder.add(label);

        const { laneOffset, targetZ } = computeFormationTarget(runner, null);
        const initialZ = Math.min(4.8, targetZ + 2.8);
        const pose = getTrailPose(initialZ);
        holder.position.set(pose.x + laneOffset, pose.y, initialZ);
        scene.add(holder);

        e = {
          runner: { ...runner },
          holder,
          rig,
          label,
          nameEl,
          bubbleEl,
          laneOffset,
          currentLaneOffset: laneOffset,
          targetZ,
          phase: Math.random() * Math.PI * 2,
          lookSeed: Math.random() * 100,
          rank: null,
          activeUntil: performance.now() + 5000,
          waveUntil: performance.now() + 3200,
          vipSpotlightUntil: (runner.diamonds || 0) > 0 ? performance.now() + 10_000 : 0,
        };
        live.set(runner.id, e);
      } else {
        const nowTs = performance.now();
        if ((runner.diamonds || 0) > (e.runner.diamonds || 0) || (runner.boostTier || 0) > 0) {
          e.activeUntil = nowTs + 8000;
          e.waveUntil = nowTs + 4500;
          e.vipSpotlightUntil = nowTs + 10_000;
        }
        Object.assign(e.runner, runner);
        const pos = computeFormationTarget(e.runner, e.rank, nowTs < (e.vipSpotlightUntil || 0));
        e.laneOffset = pos.laneOffset;
        e.targetZ = pos.targetZ;
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
        if (e.runner.regionalItem) e.rig.setRegionalItem(e.runner.regionalItem);
      }
      updateLabelText(e);
    },
    remove,
    clear() {
      for (const id of [...live.keys()]) remove(id);
    },
    say(id, text, ms = 6000) {
      const e = live.get(id);
      if (!e) return;
      for (const [otherId, other] of live) {
        if (otherId !== id && other.bubbleEl.style.display !== 'none') {
          clearTimeout(other.bubbleTimer);
          other.bubbleEl.style.display = 'none';
        }
      }
      clearTimeout(e.bubbleTimer);
      e.activeUntil = performance.now() + ms + 1500;
      e.waveUntil = performance.now() + 2800;
      Object.assign(e.bubbleEl.style, { display: '', opacity: 1 });
      e.bubbleEl.textContent = text;
      e.bubbleTimer = setTimeout(() => {
        e.bubbleEl.style.opacity = 0;
        e.bubbleTimer = setTimeout(() => { e.bubbleEl.style.display = 'none'; }, 500);
      }, ms);
    },
    syncTick(runnersList = [], board = []) {
      const rankMap = new Map();
      board.forEach((b, i) => rankMap.set(b.uid, i + 1));

      const nowTs = performance.now();
      for (const item of runnersList) {
        const e = live.get(item.id);
        if (!e) continue;
        Object.assign(e.runner, item);
        e.rank = rankMap.get(item.id) || null;
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
        if (e.runner.regionalItem) e.rig.setRegionalItem(e.runner.regionalItem);
        const pos = computeFormationTarget(e.runner, e.rank, nowTs < (e.vipSpotlightUntil || 0));
        e.laneOffset = pos.laneOffset;
        e.targetZ = pos.targetZ;
        updateLabelText(e);
      }
    },
    count: () => live.size,
    getRunner: id => live.get(id)?.runner || null,
    getRunnerPose(id) {
      const e = live.get(id);
      if (!e) return null;
      const activeTier = Math.max(e.runner.tier || 0, e.runner.boostTier || 0);
      return {
        id,
        name: e.runner.name || '',
        x: e.holder.position.x,
        y: e.holder.position.y,
        z: e.holder.position.z,
        rotY: e.holder.rotation.y,
        tier: e.runner.tier || 0,
        boostTier: e.runner.boostTier || 0,
        activeTier,
        rank: e.rank || null,
        diamonds: e.runner.diamonds || 0,
        hasBubble: e.bubbleEl.style.display !== 'none',
      };
    },
    getCameraSpotlightTarget(now) {
      let best = null;
      let bestScore = -1;
      for (const [id, e] of live.entries()) {
        const hasBubble = e.bubbleEl.style.display !== 'none';
        const isVipSpotlight = now < (e.vipSpotlightUntil || 0);
        const isRecent = now < (e.activeUntil || 0);
        const activeTier = Math.max(e.runner.tier || 0, e.runner.boostTier || 0);
        const isReal = id && !String(id).startsWith('bot_') && !String(id).startsWith('seed_');
        let score = 0;
        if (isVipSpotlight) score += 160;
        if (hasBubble) score += 130;
        if (e.rank === 1) score += 85;
        else if (e.rank && e.rank <= 3) score += 55;
        score += activeTier * 28;
        if (isRecent) score += 45;
        if (isReal) score += 25;
        // Slight periodic shift so different walkers also get featured when idle
        score += (Math.sin(now / 4200 + e.lookSeed) + 1) * 12;
        if (score > bestScore) {
          bestScore = score;
          best = {
            id,
            name: e.runner.name || '',
            x: e.holder.position.x,
            y: e.holder.position.y,
            z: e.holder.position.z,
            activeTier,
            rank: e.rank || null,
            hasBubble,
            isVipSpotlight,
          };
        }
      }
      return best;
    },
    update(now, dt, camState = null) {
      let maxSpeed = 1.0;
      let shownLabels = 0;
      const tSec = now / 1000;
      const focusId = camState?.focusId || null;
      const camMode = camState?.mode || 'rear_chase_master';
      const isFrontOrHeroCam =
        camMode === 'front_lead_closeup' ||
        camMode === 'vip_target_zoom' ||
        camMode === 'diag_left_sweep' ||
        camMode === 'diag_right_sweep' ||
        camMode === 'side_dolly_glide';

      for (const [id, e] of live.entries()) {
        const spd = e.runner.speedMult || 1.0;
        if (spd > maxSpeed) maxSpeed = spd;

        const isFocusTarget = id === focusId;
        const hasBubble = e.bubbleEl.style.display !== 'none';
        const isTop3 = e.rank && e.rank <= 3;
        const isBoosted = (e.runner.boostTier || 0) > 0;
        const isRecent = now < (e.activeUntil || 0);
        const shouldShow =
          isFocusTarget || hasBubble || isTop3 || (isBoosted && shownLabels < 4) || (isRecent && shownLabels < 4);
        if (shouldShow) shownLabels++;
        e.label.visible = Boolean(shouldShow);

        // Natural human cross-country walking cadence
        const cadence = 2.65 + Math.min(1.4, (spd - 1.0) * 0.45);
        e.phase += dt * cadence;
        const p = e.phase;
        const s = Math.sin(p);
        const c = Math.cos(p);

        // Follow the curved & undulating 3D trail at the walker's current Z position!
        const swayX = Math.sin(tSec * 0.75 + e.lookSeed) * 0.1;
        e.currentLaneOffset += (e.laneOffset + swayX - e.currentLaneOffset) * Math.min(1, dt * 2.8);
        e.holder.position.z += (e.targetZ - e.holder.position.z) * Math.min(1, dt * 2.2);

        const trailPose = getTrailPose(e.holder.position.z);
        e.holder.position.x = trailPose.x + e.currentLaneOffset;
        e.holder.position.y = trailPose.y;
        e.holder.rotation.y = trailPose.angleY * 0.55;

        const activeTier = Math.max(e.runner.tier || 0, e.runner.boostTier || 0);
        const b = e.rig.bones;

        // Animate miniature Vietnamese flag on backpack
        const flagMesh = e.rig.backpack?.userData?.flagMesh;
        if (flagMesh) {
          flagMesh.rotation.y = Math.sin(tSec * 6.5 + e.lookSeed) * 0.25;
        }

        // Dynamic Hero Turn toward Camera Lens when focused in Front / VIP / Diagonal shots!
        let targetRootYaw = Math.PI;
        if ((isFocusTarget || (camMode === 'front_lead_closeup' && e.holder.position.z > -3.2)) && isFrontOrHeroCam) {
          const camX = camState?.camX ?? 0;
          const camZ = camState?.camZ ?? 10;
          const dx = camX - e.holder.position.x;
          const dz = camZ - e.holder.position.z;
          const angleToCam = Math.atan2(dx, dz);
          if (camMode === 'front_lead_closeup' || camMode === 'vip_target_zoom') {
            targetRootYaw = angleToCam * 0.78;
            e.waveUntil = Math.max(e.waveUntil || 0, now + 400);
          } else {
            targetRootYaw = Math.PI + Math.max(-0.85, Math.min(0.85, (angleToCam - Math.PI) * 0.45));
          }
        }
        const curYaw = e.rig.root.rotation.y;
        const diffYaw = Math.atan2(Math.sin(targetRootYaw - curYaw), Math.cos(targetRootYaw - curYaw));
        e.rig.root.rotation.y = curYaw + diffYaw * Math.min(1, dt * 4.2);

        // Head gently looking around to admire Vietnamese landmarks (or looking at camera when spotlighted)
        const lookYaw = isFocusTarget && isFrontOrHeroCam
          ? Math.sin(tSec * 1.6) * 0.15
          : Math.sin(tSec * 0.85 + e.lookSeed) * 0.26;
        const lookPitch = Math.cos(tSec * 0.65 + e.lookSeed) * 0.055;
        b.head.rotation.y = lookYaw;
        b.head.rotation.x = lookPitch;

        const hasFoodProp = Boolean(e.runner.regionalItem);
        // Periodic eating/sipping gesture ("vừa đi vừa ăn tô mì Quảng / hút bịch rau má")
        const sipWave = hasFoodProp ? Math.max(0, Math.sin(tSec * 2.1 + e.lookSeed)) : 0;

        if (activeTier >= 2) {
          // Riding the Vietnamese Honda Cub Scooter / Golden Cloud Mount
          b.hips.position.y = 0.98 + Math.sin(p * 1.2) * 0.025;
          b.hips.rotation.z = Math.sin(p * 0.5) * 0.025;
          b.chest.rotation.x = 0.08;
          b.chest.rotation.y = Math.sin(p * 0.5) * 0.05;

          b.leftUpperLeg.rotation.x = -0.35;
          b.leftLowerLeg.rotation.x = 0.45;
          b.rightUpperLeg.rotation.x = -0.35;
          b.rightLowerLeg.rotation.x = 0.45;

          if (hasFoodProp) {
            // Left hand holds the specialty bowl/drink while right hand steers the Honda Cub!
            b.leftUpperArm.rotation.x = -0.82 - sipWave * 0.38;
            b.leftUpperArm.rotation.z = -0.18;
            b.leftLowerArm.rotation.x = -0.95 - sipWave * 0.35;
            if (sipWave > 0.5) b.head.rotation.x = 0.14;
          } else {
            b.leftUpperArm.rotation.x = -0.55;
            b.leftLowerArm.rotation.x = -0.35;
          }
          b.rightUpperArm.rotation.x = -0.55;
          b.rightLowerArm.rotation.x = -0.35;
        } else {
          // Lifelike Biomechanical Human Walking Gait (`Chuyển Động Đi Bộ Thực Tế`)
          const strideAmp = 0.46;

          // Double-peaked vertical hip bounce + natural pelvic sway & rotation
          b.hips.position.y = 0.93 + Math.abs(c) * 0.038;
          b.hips.rotation.z = s * 0.038;
          b.hips.rotation.y = -s * 0.068;

          // Counter-rotating shoulders & gentle forward trekking lean
          b.chest.rotation.x = 0.05 + Math.abs(s) * 0.016;
          b.chest.rotation.y = s * 0.095;

          // Thigh swing
          b.leftUpperLeg.rotation.x = s * strideAmp;
          b.rightUpperLeg.rotation.x = -s * strideAmp;

          // Realistic Knee Flexion during forward swing + support extension
          const leftKnee = Math.max(0, c) * 0.62 + 0.05;
          const rightKnee = Math.max(0, -c) * 0.62 + 0.05;
          b.leftLowerLeg.rotation.x = leftKnee;
          b.rightLowerLeg.rotation.x = rightKnee;

          // Realistic Ankle/Foot Heel-Strike to Toe-Off Flexion
          if (b.leftFoot && b.rightFoot) {
            b.leftFoot.rotation.x = -s * 0.24 - leftKnee * 0.35;
            b.rightFoot.rotation.x = s * 0.24 - rightKnee * 0.35;
          }

          // Flowing Áo Dài silk panels swaying with stride
          if (e.rig.aoDaiFront?.visible) {
            e.rig.aoDaiFront.rotation.x = -0.08 - Math.abs(s) * 0.14;
            e.rig.aoDaiBack.rotation.x = 0.08 + Math.abs(c) * 0.14;
          }

          // Natural opposite Arm Swing + Friendly Wave or Holding/Eating Regional Specialty Prop!
          const isWaving = now < (e.waveUntil || 0);
          if (hasFoodProp) {
            b.leftUpperArm.rotation.x = -0.78 - sipWave * 0.42;
            b.leftUpperArm.rotation.z = -0.15;
            b.leftLowerArm.rotation.x = -0.92 - sipWave * 0.38;
            if (sipWave > 0.55) {
              b.head.rotation.x = 0.15;
            }
          } else if (isWaving) {
            b.leftUpperArm.rotation.x = -2.35;
            b.leftUpperArm.rotation.z = 0.35 + Math.sin(tSec * 9) * 0.22;
            b.leftLowerArm.rotation.x = -0.45;
          } else {
            b.leftUpperArm.rotation.x = -s * 0.38;
            b.leftUpperArm.rotation.z = 0.06;
            b.leftLowerArm.rotation.x = -0.28 - Math.max(0, s) * 0.24;
          }

          b.rightUpperArm.rotation.x = -0.22 + s * 0.32;
          b.rightUpperArm.rotation.z = -0.06;
          b.rightLowerArm.rotation.x = -0.48 - Math.max(0, -s) * 0.18;
        }

        if (e.rig.wingsGroup.visible) {
          e.rig.wingsGroup.children[0].rotation.y = Math.sin(p * 1.4) * 0.28;
          e.rig.wingsGroup.children[1].rotation.y = -Math.sin(p * 1.4) * 0.28;
        }
        if (e.rig.cosmicRing.visible) {
          e.rig.cosmicRing.rotation.z += dt * 1.8;
        }
      }
      return maxSpeed;
    },
  };
}
