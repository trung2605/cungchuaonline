// Lifelike 3D Human Trekkers / Cross-Country Walkers (`Hành Trình Đi Bộ Đường Trường Khám Phá Kỳ Quan`).
// Supports VRM humanoid models (`assets/models/layman_{0..3}.vrm` via `@pixiv/three-vrm`)
// and falls back to an articulated 14-bone human walker rig with realistic proportions:
// - Head with facial features (eyes, eyebrows, nose, warm smile), hair, and Vietnamese Nón Lá / Explorer Hat / Crown
// - Articulated spine, chest, collar, travel jacket, and 3D Trekking Backpack (`balo đường trường`) with sleeping roll
// - Articulated shoulders, elbows (UpperArm + LowerArm), hands holding a Wooden Trekking Staff + Glowing Lantern
// - Articulated hips, knees (UpperLeg + LowerLeg), ankles, and hiking boots with natural heel-to-toe walking kinematics
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRMHumanoid } from '@pixiv/three-vrm';
import { glowTex } from './world3d.js';

const OUTFIT_COLORS = [0x4a6b5b, 0x8c5a3c, 0x3d5a73, 0xa87c4f, 0x6b5b4d, 0x526856];
const TIER_SUITS = {
  1: 0x3b6e8c, // Tier 1 (1-9💎): Slate Blue Explorer Jacket + Feathered Wings
  2: 0xc29347, // Tier 2 (10-99💎): Antique Gold Silk Trekker + Heritage Platform
  3: 0x993838, // Tier 3 (100-999💎): Burgundy Royal Adventurer + Twin Boosters
  4: 0xd9b15f, // Tier 4 (1000+💎): Imperial Champagne Gold + Halo
};

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, ...o });
const skinMat = std(0xe5bc98, { roughness: 0.65 });
const blushMat = std(0xd49284, { roughness: 0.7 });
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x161210 });
const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const hairMats = [
  std(0x1b1410, { roughness: 0.8 }),
  std(0x281911, { roughness: 0.78 }),
  std(0x332014, { roughness: 0.75 }),
  std(0x18181c, { roughness: 0.8 }),
];
const pantsMats = [
  std(0x2b3440, { roughness: 0.82 }),
  std(0x3d352a, { roughness: 0.85 }),
  std(0x232b36, { roughness: 0.82 }),
  std(0x343a42, { roughness: 0.82 }),
];
const bootMat = std(0x452c1b, { roughness: 0.72, metalness: 0.08 });
const soleMat = std(0x1c1917, { roughness: 0.92 });
const packMat = std(0x784e28, { roughness: 0.75 });
const packPocketMat = std(0x573619, { roughness: 0.78 });
const sleepRollMat = std(0x4a6b5d, { roughness: 0.75 });
const nonLaMat = std(0xdfc188, { roughness: 0.72, side: THREE.DoubleSide });
const hatBandMat = std(0x8c352b, { roughness: 0.65 });
const staffWoodMat = std(0x54321a, { roughness: 0.8 });
const lanternGoldMat = new THREE.MeshBasicMaterial({ color: 0xf4d38a });
const wingMat = new THREE.MeshStandardMaterial({
  color: 0xf4eee1,
  emissive: 0x4a3e28,
  emissiveIntensity: 0.35,
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
});
const hoverMat = std(0xc99c4e, { metalness: 0.55, roughness: 0.35, emissive: 0x261804 });
const jetMat = std(0x8c2d2d, { metalness: 0.5, roughness: 0.4, emissive: 0x240808 });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xf2a950 });
const crownMat = std(0xd9b362, { metalness: 0.75, roughness: 0.28, emissive: 0x3b2a08 });

// Optional VRM template cache (if user drops .vrm models into assets/models/)
let vrmTemplates = [null, null, null, null];
function loadVrmTemplates() {
  const loader = new GLTFLoader();
  loader.register(p => new VRMLoaderPlugin(p));
  return Promise.all([0, 1, 2, 3].map(idx =>
    loader.loadAsync(`assets/models/layman_${idx}.vrm`).then(g => {
      const vrm = g.userData.vrm;
      VRMUtils.rotateVRM0(vrm);
      VRMUtils.removeUnnecessaryVertices(g.scene);
      VRMUtils.combineSkeletons(g.scene);
      return vrm;
    }).catch(() => null)
  ));
}
loadVrmTemplates().then(res => { vrmTemplates = res; });

// Builds a detailed 3D Trekking Backpack (`Balo Đi Bộ Đường Trường`)
function createTrekkingBackpack() {
  const pack = new THREE.Group();
  pack.position.set(0, 0.05, -0.17);

  // Main rucksack body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.16), packMat);
  body.castShadow = true;
  pack.add(body);

  // Top flap & back pocket
  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.09, 0.17), packPocketMat);
  flap.position.set(0, 0.15, 0);
  pack.add(flap);

  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.06), packPocketMat);
  pocket.position.set(0, -0.04, -0.1);
  pack.add(pocket);

  // Rolled sleeping mat strapped on top of backpack
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.32, 12), sleepRollMat);
  roll.rotation.z = Math.PI / 2;
  roll.position.set(0, 0.24, -0.02);
  pack.add(roll);

  // Shoulder straps wrapping around torso
  for (const sx of [-0.09, 0.09]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.18), packPocketMat);
    strap.position.set(sx, 0.02, 0.11);
    pack.add(strap);
  }
  return pack;
}

// Builds a Wooden Trekking Staff with a miniature hanging glowing lantern (`Gậy Trúc & Đèn Lồng Dẫn Đường`)
function createTrekkingStaff() {
  const g = new THREE.Group();
  // Staff held in right hand: extends down to the ground and up above the hand
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 1.18, 8), staffWoodMat);
  pole.position.set(0, -0.12, 0.06);
  pole.rotation.x = 0.15;
  pole.castShadow = true;
  g.add(pole);

  // Curved top hook with warm miniature trail lantern
  const lanternBulb = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), lanternGoldMat);
  lanternBulb.position.set(0, 0.42, 0.16);
  g.add(lanternBulb);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffd166, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75,
  }));
  glow.scale.setScalar(0.28);
  glow.position.set(0, 0.42, 0.16);
  g.add(glow);
  return g;
}

function buildRunnerRig(skin = 0, tier = 0) {
  const root = new THREE.Group();
  // Face -Z (walking forward along the scenic trail toward the horizon landmarks)
  root.rotation.y = Math.PI;

  const b = {};
  const bone = (name, parent, x, y, z = 0) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add((b[name] = o));
    return o;
  };

  const baseColor = TIER_SUITS[tier] || OUTFIT_COLORS[skin % OUTFIT_COLORS.length];
  const suitMat = std(baseColor, {
    metalness: tier >= 2 ? 0.38 : 0.08,
    roughness: tier >= 2 ? 0.35 : 0.65,
    emissive: tier >= 4 ? 0x4a3200 : tier >= 2 ? 0x221200 : 0x000000,
  });
  const collarMat = std(0xf8fafc, { roughness: 0.6 });
  const hMat = hairMats[skin % hairMats.length];
  const pMat = pantsMats[skin % pantsMats.length];

  // Full 14-bone Humanoid Hierarchy
  bone('hips', root, 0, 0.94, 0);
  bone('spine', b.hips, 0, 0.08, 0);
  bone('chest', b.spine, 0, 0.2, 0);
  bone('neck', b.chest, 0, 0.28, 0);
  bone('head', b.neck, 0, 0.06, 0);

  // Pelvis / Hips mesh
  const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.135, 0.16, 14), pMat);
  pelvisMesh.position.y = 0.02;
  pelvisMesh.castShadow = true;
  b.hips.add(pelvisMesh);

  // Lower & Upper Torso (Travel Jacket with Belt & Collar)
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.142, 0.48, 16), suitMat);
  torsoMesh.position.y = 0.08;
  torsoMesh.castShadow = true;
  b.chest.add(torsoMesh);

  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.08, 14), collarMat);
  collarMesh.position.y = 0.29;
  b.chest.add(collarMesh);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.09, 10), skinMat);
  neckMesh.position.y = 0.03;
  b.neck.add(neckMesh);

  // Lifelike Head with Facial Features (Eyes, Brows, Nose, Ears, Hair, and Hat)
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.132, 18, 16), skinMat);
  headMesh.scale.set(0.95, 1.06, 0.98);
  headMesh.position.y = 0.11;
  headMesh.castShadow = true;
  b.head.add(headMesh);

  // Ears
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), skinMat);
    ear.scale.set(0.55, 1.1, 0.8);
    ear.position.set(sx * 0.125, 0.105, 0);
    b.head.add(ear);
  }

  // Expressive Eyes + White Highlights + Eyebrows + Nose + Cheeks (on +Z side of head in local bone space)
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), eyeMat);
    eye.position.set(sx * 0.044, 0.12, 0.118);
    b.head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), eyeHighlightMat);
    glint.position.set(sx * 0.048, 0.126, 0.131);
    b.head.add(glint);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), blushMat);
    cheek.scale.set(1.2, 0.65, 0.5);
    cheek.position.set(sx * 0.068, 0.092, 0.112);
    b.head.add(cheek);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.035, 6), skinMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.102, 0.135);
  b.head.add(nose);

  // Styled Hair Cap + Back Hair
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.138, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hMat
  );
  hairCap.position.y = 0.122;
  hairCap.rotation.x = -0.15;
  b.head.add(hairCap);

  if (skin % 2 === 1) {
    // Ponytail for female / long-haired trekkers that sways
    const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.18, 10), hMat);
    ponytail.position.set(0, 0.08, -0.15);
    ponytail.rotation.x = -0.55;
    b.head.add(ponytail);
  }

  // Vietnamese Nón Lá (Conical Hat) or Explorer Sun Hat (hidden when Tier 4 Imperial Crown is worn)
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.22, -0.01);
  hatGroup.rotation.x = -0.12;
  if (skin % 2 === 0) {
    // Traditional Vietnamese Nón Lá
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.15, 20), nonLaMat);
    cone.castShadow = true;
    hatGroup.add(cone);
  } else {
    // Safari / Trekking Sun Hat
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.02, 18), nonLaMat);
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.135, 0.09, 16), nonLaMat);
    dome.position.y = 0.045;
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.136, 0.138, 0.022, 16), hatBandMat);
    ribbon.position.y = 0.015;
    hatGroup.add(brim, dome, ribbon);
  }
  hatGroup.visible = tier < 4;
  b.head.add(hatGroup);

  // Trekking Backpack on Chest/Back
  const backpack = createTrekkingBackpack();
  b.chest.add(backpack);

  // Articulated Arms (UpperArm + Elbow + LowerArm + Hand) & Legs (UpperLeg + Knee + LowerLeg + Hiking Boot)
  let trekkingStaff = null;
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    // Shoulder -> UpperArm
    const upperArm = bone(side + 'UpperArm', b.chest, 0.195 * sx, 0.22, 0);
    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 10), suitMat);
    upperArm.add(shoulderCap);

    const uArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.044, 0.26, 10), suitMat);
    uArmMesh.position.y = -0.13;
    uArmMesh.castShadow = true;
    upperArm.add(uArmMesh);

    // Elbow -> LowerArm (Forearm + Hand)
    const lowerArm = bone(side + 'LowerArm', upperArm, 0, -0.26, 0);
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), skinMat);
    lowerArm.add(elbowJoint);

    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.035, 0.24, 10), skinMat);
    lArmMesh.position.y = -0.12;
    lArmMesh.castShadow = true;
    lowerArm.add(lArmMesh);

    const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), skinMat);
    handMesh.scale.set(0.85, 1.15, 0.95);
    handMesh.position.y = -0.25;
    lowerArm.add(handMesh);

    if (side === 'right') {
      trekkingStaff = createTrekkingStaff();
      trekkingStaff.position.set(0, -0.24, 0.02);
      lowerArm.add(trekkingStaff);
    }

    // Hip -> UpperLeg (Thigh)
    const upperLeg = bone(side + 'UpperLeg', b.hips, 0.092 * sx, -0.03, 0);
    const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), pMat);
    upperLeg.add(hipJoint);

    const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.054, 0.42, 12), pMat);
    thighMesh.position.y = -0.21;
    thighMesh.castShadow = true;
    upperLeg.add(thighMesh);

    // Knee -> LowerLeg (Calf + Ankle + Trekking Boot)
    const lowerLeg = bone(side + 'LowerLeg', upperLeg, 0, -0.42, 0);
    const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), pMat);
    lowerLeg.add(kneeJoint);

    const calfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.4, 12), pMat);
    calfMesh.position.y = -0.2;
    calfMesh.castShadow = true;
    lowerLeg.add(calfMesh);

    // Detailed Trekking Boot
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.42, 0.038);
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.095, 0.21), bootMat);
    bootUpper.castShadow = true;
    const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.032, 0.225), soleMat);
    bootSole.position.y = -0.05;
    bootGroup.add(bootUpper, bootSole);
    lowerLeg.add(bootGroup);
  }

  // Tier 1+: Luminous Feathered / Spirit Wings on back
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 0.14, -0.24);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 5), wingMat);
    w.rotation.z = sx * 1.12;
    w.position.set(sx * 0.38, 0.12, 0);
    wingsGroup.add(w);
  }
  wingsGroup.visible = tier >= 1;
  b.chest.add(wingsGroup);

  // Tier 2+: Golden Cloud / Heritage Hover-Platform under feet
  const hoverGroup = new THREE.Group();
  hoverGroup.position.set(0, 0.08, 0);
  const boardMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.07, 20), hoverMat);
  boardMesh.scale.set(0.85, 1, 1.35);
  const glowUnder = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffd166, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glowUnder.scale.set(1.3, 1.3, 1);
  glowUnder.position.y = -0.04;
  hoverGroup.add(boardMesh, glowUnder);
  hoverGroup.visible = tier >= 2;
  root.add(hoverGroup);

  // Tier 3+: Twin Golden-Crimson Boosters on back
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

  // Tier 4: Champion Imperial Crown + Cosmic Golden Halo Ring
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.09, 0.12, 10, 1, true), crownMat);
  crown.position.y = 0.25;
  crown.visible = tier >= 4;
  b.head.add(crown);

  const cosmicRing = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.78, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
  );
  cosmicRing.rotation.x = Math.PI / 2;
  cosmicRing.position.y = 0.1;
  cosmicRing.visible = tier >= 4;
  root.add(cosmicRing);

  return {
    root,
    bones: b,
    torsoMesh,
    hatGroup,
    backpack,
    trekkingStaff,
    wingsGroup,
    hoverGroup,
    jetGroup,
    crown,
    cosmicRing,
    setVisualTier(newTier, boostTier = 0) {
      const activeTier = Math.max(newTier, boostTier);
      const col = TIER_SUITS[activeTier] || OUTFIT_COLORS[skin % OUTFIT_COLORS.length];
      suitMat.color.setHex(col);
      hatGroup.visible = activeTier < 4;
      wingsGroup.visible = activeTier === 1 || activeTier === 4;
      hoverGroup.visible = activeTier >= 2;
      jetGroup.visible = activeTier >= 3;
      crown.visible = activeTier >= 4;
      cosmicRing.visible = activeTier >= 4;
    },
  };
}

export function createRunners(scene) {
  const live = new Map(); // id -> entry

  const formatDist = m => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

  function updateLabelText(e) {
    const r = e.runner;
    const rankStr = e.rank && e.rank <= 8 ? `🏆#${e.rank} ` : '';
    const dStr = r.diamonds > 0 ? ` · 💎${r.diamonds}` : '';
    e.nameEl.textContent = `${rankStr}${r.name} · ${formatDist(r.distanceM || 0)}${dStr}`;
    const activeTier = Math.max(r.tier || 0, r.boostTier || 0);
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
        label.position.set(0, 2.32, 0);
        holder.add(label);

        const targetX = (runner.lane || 0) * 1.08;
        const targetZ = 7.2 - Math.min(4.5, (runner.tier || 0) * 1.1);
        holder.position.set(targetX, 0, targetZ + 3.5);
        scene.add(holder);

        e = {
          runner: { ...runner },
          holder,
          rig,
          label,
          nameEl,
          bubbleEl,
          targetX,
          targetZ,
          phase: Math.random() * Math.PI * 2,
          lookSeed: Math.random() * 100,
          rank: null,
          activeUntil: performance.now() + 5000,
          waveUntil: performance.now() + 3200,
        };
        live.set(runner.id, e);
      } else {
        if ((runner.diamonds || 0) > (e.runner.diamonds || 0) || (runner.boostTier || 0) > 0) {
          e.activeUntil = performance.now() + 6000;
          e.waveUntil = performance.now() + 3500;
        }
        Object.assign(e.runner, runner);
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
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

      for (const item of runnersList) {
        const e = live.get(item.id);
        if (!e) continue;
        Object.assign(e.runner, item);
        e.rank = rankMap.get(item.id) || null;
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
        // Position leaders closer to the front of the trekking group (1.0 .. 9.0)
        const rankBonus = e.rank ? Math.max(0, (9 - e.rank) * 0.62) : 0;
        const boostBonus = (e.runner.boostTier || 0) * 0.85;
        e.targetZ = Math.max(1.2, 8.8 - rankBonus - boostBonus);
        updateLabelText(e);
      }
    },
    count: () => live.size,
    update(now, dt) {
      let maxSpeed = 1.0;
      let shownLabels = 0;
      const tSec = now / 1000;

      for (const e of live.values()) {
        const spd = e.runner.speedMult || 1.0;
        if (spd > maxSpeed) maxSpeed = spd;

        const hasBubble = e.bubbleEl.style.display !== 'none';
        const isTop3 = e.rank && e.rank <= 3;
        const isBoosted = (e.runner.boostTier || 0) > 0;
        const isRecent = now < (e.activeUntil || 0);
        const shouldShow = hasBubble || isTop3 || isBoosted || (isRecent && shownLabels < 4);
        if (shouldShow) shownLabels++;
        e.label.visible = Boolean(shouldShow);

        // Relaxed, natural human cross-country walking cadence (~2.6 rad/s = ~1.3 steps/sec)
        const cadence = 2.55 + Math.min(1.4, (spd - 1.0) * 0.45);
        e.phase += dt * cadence;
        const p = e.phase;
        const s = Math.sin(p);
        const c = Math.cos(p);

        // Gentle wandering along the scenic trail
        const swayX = Math.sin(tSec * 0.75 + e.lookSeed) * 0.16;
        e.holder.position.x += (e.targetX + swayX - e.holder.position.x) * Math.min(1, dt * 2.8);
        e.holder.position.z += (e.targetZ - e.holder.position.z) * Math.min(1, dt * 2.2);

        const activeTier = Math.max(e.runner.tier || 0, e.runner.boostTier || 0);
        const b = e.rig.bones;

        // Head gently looking around to admire roadside landmarks on left and right
        const lookYaw = Math.sin(tSec * 0.85 + e.lookSeed) * 0.28;
        const lookPitch = Math.cos(tSec * 0.65 + e.lookSeed) * 0.06;
        b.head.rotation.y = lookYaw;
        b.head.rotation.x = lookPitch;

        if (activeTier >= 2) {
          // Graceful gliding pose on Golden Cloud / Hover-Platform
          b.hips.position.y = 1.04 + Math.sin(p * 0.7) * 0.04;
          b.hips.rotation.z = Math.sin(p * 0.5) * 0.03;
          b.chest.rotation.x = 0.06;
          b.chest.rotation.y = Math.sin(p * 0.5) * 0.08;

          b.leftUpperLeg.rotation.x = 0.12;
          b.leftLowerLeg.rotation.x = 0.18;
          b.rightUpperLeg.rotation.x = -0.14;
          b.rightLowerLeg.rotation.x = 0.22;

          b.leftUpperArm.rotation.x = -0.18 + s * 0.1;
          b.leftLowerArm.rotation.x = -0.35;
          b.rightUpperArm.rotation.x = -0.25 - s * 0.1;
          b.rightLowerArm.rotation.x = -0.45;
        } else {
          // Natural Articulated Human Walking Gait (`Đi Bộ Đường Trường`)
          // Note: root.rotation.y = Math.PI, so local +Z is backward and local -Z is forward:
          // - Negative X rotation swings limb FORWARD (toward -Z horizon)
          // - Positive X rotation bends knee BACKWARD (toward +Z camera)
          const strideAmp = 0.44; // Comfortable walking stride angle (~25 degrees)

          // Vertical hip bob (peaks twice per stride cycle during mid-stance) + subtle pelvic roll
          b.hips.position.y = 0.93 + Math.abs(c) * 0.036;
          b.hips.rotation.z = s * 0.035;
          b.hips.rotation.y = -s * 0.06;

          // Upright relaxed posture with natural counter-rotation of the chest/shoulders
          b.chest.rotation.x = 0.045 + Math.abs(s) * 0.015;
          b.chest.rotation.y = s * 0.085;

          // Left & Right Upper Legs (Thighs swing opposite to each other)
          b.leftUpperLeg.rotation.x = s * strideAmp;
          b.rightUpperLeg.rotation.x = -s * strideAmp;

          // Realistic Knee Flexion: Knee bends during the forward swing phase to clear the ground,
          // and straightens during the stance/support phase!
          const leftSwingBend = Math.max(0, c) * 0.58 + 0.06;
          const rightSwingBend = Math.max(0, -c) * 0.58 + 0.06;
          b.leftLowerLeg.rotation.x = leftSwingBend;
          b.rightLowerLeg.rotation.x = rightSwingBend;

          // Natural opposite Arm Swing + Elbow bend + Trekking Staff plant
          const isWaving = now < (e.waveUntil || 0);
          if (isWaving) {
            // Friendly left-hand wave when newly joining or chatting!
            b.leftUpperArm.rotation.x = -2.35;
            b.leftUpperArm.rotation.z = 0.35 + Math.sin(tSec * 9) * 0.22;
            b.leftLowerArm.rotation.x = -0.45;
          } else {
            b.leftUpperArm.rotation.x = -s * 0.36;
            b.leftUpperArm.rotation.z = 0.06;
            b.leftLowerArm.rotation.x = -0.28 - Math.max(0, s) * 0.22;
          }

          // Right arm holds the Wooden Trekking Staff + Glowing Lantern, planting gently each stride
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
