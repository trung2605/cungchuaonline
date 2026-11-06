// Sacred 3D Bodhi Wish Tree (Cây Bồ Đề Ước Nguyện 3D)
// Features:
// - Sculpted CatmullRom 3D ancient trunk, boughs & aerial roots on a carved lotus stone altar
// - Golden & Jade-Emerald heart-shaped Bodhi leaf canopy with Simplex-Noise wind flutter
// - Segmented 3D silk wish ribbons with real-time vertex wind wave physics
// - GSAP 3D Bezier flight animation when a worshipper's wish ribbon flies up to a branch
// - Crisp CSS2D floating calligraphy tags for the latest wishes on the tree

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { gsap } from 'gsap';
import { createNoise2D } from 'simplex-noise';
import { canvasTex, glowTex } from './hall.js';

const noise2D = createNoise2D();

export const BODHI_POS = new THREE.Vector3(3.85, 0, -3.5);
const MAX_RIBBONS = 36;
const MAX_PINNED_TAGS = 4;

// Ceremonial default blessings so the tree looks sacred & vibrant even before the first live comment
const INITIAL_BLESSINGS = [
  { id: 'init_1', name: 'Đại Hùng Bảo Điện', wish: 'Quốc Thái Dân An', tier: 2, diamonds: 20, ribbonColor: 'gold' },
  { id: 'init_2', name: 'Phật Tử Thiện Tâm', wish: 'Cầu Gia Đạo Bình An', tier: 1, diamonds: 5, ribbonColor: 'red' },
  { id: 'init_3', name: 'Tâm An Lạc', wish: 'Cầu Sức Khỏe Dồi Dào', tier: 0, diamonds: 0, ribbonColor: 'red' },
  { id: 'init_4', name: 'Diệu Liên Hoa', wish: 'Tài Lộc Hanh Thông', tier: 1, diamonds: 10, ribbonColor: 'gold' },
  { id: 'init_5', name: 'Phúc Lộc Thọ', wish: 'Vạn Sự Cát Tường', tier: 0, diamonds: 0, ribbonColor: 'red' },
  { id: 'init_6', name: 'Thiện Nhân', wish: 'Tâm Thanh Tịnh An Nhiên', tier: 0, diamonds: 0, ribbonColor: 'rose' },
  { id: 'init_7', name: 'Minh Đức', wish: 'Công Danh Thuận Lợi', tier: 0, diamonds: 0, ribbonColor: 'red' },
  { id: 'init_8', name: 'Ngọc Bích', wish: 'Công Đức Vô Lượng', tier: 2, diamonds: 30, ribbonColor: 'gold' },
];

// Sacred Heart-Shaped Bodhi Leaf Texture (Lá Bồ Đề đuôi dài hoàng kim & ngọc bích)
const bodhiLeafGoldTex = canvasTex(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.save();
  g.translate(w / 2, h / 2);

  // Leaf heart + sacred drip-tip silhouette
  const grad = g.createLinearGradient(0, -52, 0, 56);
  grad.addColorStop(0, '#fff9d2');
  grad.addColorStop(0.35, '#fbbf24');
  grad.addColorStop(0.75, '#d97706');
  grad.addColorStop(1, '#92400e');

  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 56); // Long sacred drip tip at bottom
  g.bezierCurveTo(6, 34, 46, 18, 44, -14);
  g.bezierCurveTo(42, -40, 14, -44, 0, -24);
  g.bezierCurveTo(-14, -44, -42, -40, -44, -14);
  g.bezierCurveTo(-46, 18, -6, 34, 0, 56);
  g.closePath();
  g.fill();

  // Golden leaf veins
  g.strokeStyle = 'rgba(255, 250, 210, 0.78)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, -26);
  g.lineTo(0, 50);
  for (let i = -18; i <= 22; i += 10) {
    const span = 28 - Math.abs(i) * 0.65;
    g.moveTo(0, i);
    g.quadraticCurveTo(span * 0.5, i - 6, span, i - 2);
    g.moveTo(0, i);
    g.quadraticCurveTo(-span * 0.5, i - 6, -span, i - 2);
  }
  g.stroke();
  g.restore();
});

const bodhiLeafJadeTex = canvasTex(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.save();
  g.translate(w / 2, h / 2);

  const grad = g.createLinearGradient(0, -52, 0, 56);
  grad.addColorStop(0, '#a7f3d0');
  grad.addColorStop(0.4, '#10b981');
  grad.addColorStop(0.8, '#047857');
  grad.addColorStop(1, '#fbbf24');

  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 56);
  g.bezierCurveTo(6, 34, 46, 18, 44, -14);
  g.bezierCurveTo(42, -40, 14, -44, 0, -24);
  g.bezierCurveTo(-14, -44, -42, -40, -44, -14);
  g.bezierCurveTo(-46, 18, -6, 34, 0, 56);
  g.closePath();
  g.fill();

  g.strokeStyle = 'rgba(254, 240, 138, 0.75)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, -26);
  g.lineTo(0, 50);
  g.stroke();
  g.restore();
});

// Gnarled sacred Bodhi bark with subtle golden spirit veins
const barkTex = canvasTex(256, 256, (g, w, h) => {
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#2e1608');
  bg.addColorStop(0.5, '#3d1e0c');
  bg.addColorStop(1, '#231005');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 42; i++) {
    const x = (i * 19) % w;
    g.strokeStyle = i % 6 === 0 ? 'rgba(245, 190, 75, 0.32)' : 'rgba(15, 6, 2, 0.55)';
    g.lineWidth = i % 6 === 0 ? 1.5 : 2.5;
    g.beginPath();
    for (let y = 0; y <= h; y += 16) {
      const dx = Math.sin(y * 0.04 + i) * 6;
      if (y === 0) g.moveTo(x + dx, y);
      else g.lineTo(x + dx, y);
    }
    g.stroke();
  }
});
barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
barkTex.repeat.set(2, 4);

// Create high-contrast silk ribbon texture with gold border, lotus symbol, worshipper name & wish
function makeRibbonTexture({ name = 'Phật Tử', wish = 'Cầu Bình An', ribbonColor = 'red', tier = 0 }) {
  return canvasTex(128, 512, (g, w, h) => {
    const isGold = ribbonColor === 'gold' || tier >= 2;
    const isRose = ribbonColor === 'rose' || tier === 1;

    const bg = g.createLinearGradient(0, 0, 0, h);
    if (isGold) {
      bg.addColorStop(0, '#92400e');
      bg.addColorStop(0.25, '#d97706');
      bg.addColorStop(0.65, '#b45309');
      bg.addColorStop(1, '#78350f');
    } else if (isRose) {
      bg.addColorStop(0, '#881337');
      bg.addColorStop(0.3, '#be123c');
      bg.addColorStop(0.75, '#9f1239');
      bg.addColorStop(1, '#4c0519');
    } else {
      bg.addColorStop(0, '#7f1d1d');
      bg.addColorStop(0.25, '#b91c1c');
      bg.addColorStop(0.7, '#991b1b');
      bg.addColorStop(1, '#450a0a');
    }
    g.fillStyle = bg;
    g.fillRect(4, 0, w - 8, h - 28);

    // Swallow-tail V-cut at bottom of ribbon + golden tassel threads
    g.beginPath();
    g.moveTo(4, h - 30);
    g.lineTo(w / 2, h - 6);
    g.lineTo(w - 4, h - 30);
    g.closePath();
    g.fill();

    // Double golden brocade border
    g.strokeStyle = isGold ? '#fef08a' : '#facc15';
    g.lineWidth = 4;
    g.strokeRect(10, 10, w - 20, h - 46);
    g.strokeStyle = 'rgba(254, 240, 138, 0.48)';
    g.lineWidth = 1.5;
    g.strokeRect(16, 16, w - 32, h - 58);

    // Top golden lotus medallion
    g.fillStyle = '#fde047';
    g.beginPath();
    g.arc(w / 2, 46, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#7f1d1d';
    g.font = 'bold 20px "Be Vietnam Pro", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('卍', w / 2, 47);

    // Worshipper Name & Wish rendered vertically along the ribbon
    g.save();
    g.translate(w / 2, 265);
    g.rotate(-Math.PI / 2);

    g.fillStyle = '#fffbeb';
    g.shadowColor = 'rgba(0, 0, 0, 0.85)';
    g.shadowBlur = 4;
    g.font = 'bold 24px "Be Vietnam Pro", sans-serif';
    g.textAlign = 'center';
    g.fillText(String(name).slice(0, 18), 0, -14);

    g.fillStyle = '#fde047';
    g.font = 'bold 20px "Be Vietnam Pro", sans-serif';
    g.fillText(String(wish).slice(0, 26), 0, 16);
    g.restore();

    // Bottom golden tassel fringe
    g.strokeStyle = '#facc15';
    g.lineWidth = 2;
    for (let x = 28; x <= w - 28; x += 6) {
      g.beginPath();
      g.moveTo(x, h - 18);
      g.lineTo(x, h);
      g.stroke();
    }
  });
}

export function createBodhiTree(scene, { low = false, onRibbonTied = null } = {}) {
  const root = new THREE.Group();
  root.position.copy(BODHI_POS);
  scene.add(root);

  // ==========================================================================
  // 1. CARVED LOTUS STONE PEDESTAL & DHARMA FLOOR RING (Đài Sen Đá Cổ)
  // ==========================================================================
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x3b281e,
    roughness: 0.72,
    metalness: 0.15,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x78350f,
    emissiveIntensity: 0.45,
    roughness: 0.28,
    metalness: 0.85,
  });

  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.32, 0.34, 12), stoneMat);
  basePlinth.position.y = 0.17;
  basePlinth.receiveShadow = true;
  root.add(basePlinth);

  const goldRim = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.045, 10, 32), goldMat);
  goldRim.rotation.x = Math.PI / 2;
  goldRim.position.y = 0.34;
  root.add(goldRim);

  // 16 sculpted golden lotus petals around the tree base
  const petalGeo = new THREE.ConeGeometry(0.22, 0.42, 5);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, goldMat);
    petal.position.set(Math.cos(angle) * 1.12, 0.32, Math.sin(angle) * 1.12);
    petal.rotation.y = -angle;
    petal.rotation.z = -0.35;
    root.add(petal);
  }

  // Glowing Dharma inscription ring on the floor around the pedestal
  const floorAuraTex = canvasTex(256, 256, (g, w, h) => {
    const cx = w / 2, cy = h / 2;
    const r = g.createRadialGradient(cx, cy, 30, cx, cy, 124);
    r.addColorStop(0, 'rgba(255, 215, 100, 0.35)');
    r.addColorStop(0.7, 'rgba(255, 190, 60, 0.22)');
    r.addColorStop(1, 'rgba(255, 160, 30, 0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);

    g.strokeStyle = 'rgba(255, 224, 112, 0.72)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cy, 106, 0, Math.PI * 2);
    g.stroke();

    g.strokeStyle = 'rgba(255, 210, 90, 0.42)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(cx, cy, 92, 0, Math.PI * 2);
    g.stroke();
  });
  const floorAura = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({
      map: floorAuraTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  floorAura.rotation.x = -Math.PI / 2;
  floorAura.position.y = 0.02;
  root.add(floorAura);

  // ==========================================================================
  // 2. ANCIENT BODHI TRUNK & SWEEPING BOUGHS (Thân & Cành Bồ Đề Cổ Thụ)
  // ==========================================================================
  const barkMat = new THREE.MeshStandardMaterial({
    map: barkTex,
    color: 0x5c3419,
    emissive: 0x2a1205,
    emissiveIntensity: 0.25,
    roughness: 0.82,
    metalness: 0.12,
  });

  // Main gnarled trunk rising from y=0.25 to y=3.3
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(-0.12, 1.1, 0.08),
    new THREE.Vector3(0.08, 2.1, -0.05),
    new THREE.Vector3(-0.05, 3.1, 0.04),
  ]);
  const trunkMesh = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 20, 0.34, 10, false), barkMat);
  trunkMesh.castShadow = !low;
  root.add(trunkMesh);

  // Root flares & sacred red trunk blessing band (Dải lụa đỏ quấn thân cây cổ thụ)
  const trunkBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.38, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, emissive: 0x450a0a, roughness: 0.5 })
  );
  trunkBand.position.set(-0.06, 1.45, 0.04);
  root.add(trunkBand);

  // 7 Sweeping Boughs (reaching towards the center aisle and framing the canopy)
  const branchSpecs = [
    // Left-front boughs (reaching toward camera & aisle so ribbons are super visible)
    [new THREE.Vector3(-0.05, 2.4, 0.05), new THREE.Vector3(-0.85, 2.95, 0.55), new THREE.Vector3(-1.65, 3.25, 0.95)],
    [new THREE.Vector3(-0.08, 2.75, 0), new THREE.Vector3(-1.05, 3.45, -0.15), new THREE.Vector3(-1.85, 3.75, -0.35)],
    // Center-front & high crown boughs
    [new THREE.Vector3(0, 2.85, 0.05), new THREE.Vector3(-0.35, 3.65, 0.75), new THREE.Vector3(-0.65, 4.05, 1.25)],
    [new THREE.Vector3(0.05, 3.0, 0), new THREE.Vector3(0.15, 3.95, 0.25), new THREE.Vector3(0.25, 4.45, 0.45)],
    // Right & back boughs for full 3D volume
    [new THREE.Vector3(0.08, 2.55, 0.04), new THREE.Vector3(0.85, 3.15, 0.55), new THREE.Vector3(1.45, 3.45, 0.85)],
    [new THREE.Vector3(0.06, 2.8, -0.05), new THREE.Vector3(0.95, 3.5, -0.45), new THREE.Vector3(1.55, 3.85, -0.75)],
    [new THREE.Vector3(-0.04, 2.9, -0.08), new THREE.Vector3(-0.55, 3.65, -0.85), new THREE.Vector3(-0.95, 4.0, -1.35)],
  ];

  const branchAnchorPoints = [];
  for (const pts of branchSpecs) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const bMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.13, 8, false), barkMat);
    root.add(bMesh);

    // Sample 5 ribbon hanging points along each branch
    for (const t of [0.36, 0.52, 0.68, 0.82, 0.96]) {
      const p = curve.getPoint(t);
      branchAnchorPoints.push(p.clone());
    }
  }
  // Add a few lower front anchor points for high visibility
  branchAnchorPoints.unshift(
    new THREE.Vector3(-1.35, 3.05, 0.82),
    new THREE.Vector3(-0.95, 2.88, 0.68),
    new THREE.Vector3(-0.48, 3.45, 0.96),
    new THREE.Vector3(0.45, 3.12, 0.72),
    new THREE.Vector3(1.05, 3.25, 0.68)
  );

  // ==========================================================================
  // 3. SACRED GOLDEN & JADE-EMERALD BODHI FOLIAGE CANOPY (Tán Lá Bồ Đề)
  // ==========================================================================
  const leafGoldMat = new THREE.MeshBasicMaterial({
    map: bodhiLeafGoldTex,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
  });
  const leafJadeMat = new THREE.MeshBasicMaterial({
    map: bodhiLeafJadeTex,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
  });

  const foliageLeaves = [];
  const leafPlaneGeo = new THREE.PlaneGeometry(0.56, 0.56);
  const leafCount = low ? 72 : 110;
  for (let i = 0; i < leafCount; i++) {
    const anchor = branchAnchorPoints[i % branchAnchorPoints.length];
    const isGold = i % 3 !== 0; // 2/3 golden Bodhi leaves, 1/3 jade-emerald leaves
    const leaf = new THREE.Mesh(leafPlaneGeo, isGold ? leafGoldMat : leafJadeMat);
    const radius = 0.25 + (i % 5) * 0.16;
    const angle = i * 2.39996; // Golden angle distribution
    leaf.position.set(
      anchor.x + Math.cos(angle) * radius,
      anchor.y + 0.18 + ((i % 4) - 1) * 0.16,
      anchor.z + Math.sin(angle) * radius
    );
    leaf.rotation.set(
      (Math.random() - 0.5) * 0.7,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.6
    );
    const scale = 0.75 + (i % 4) * 0.18;
    leaf.scale.setScalar(scale);
    root.add(leaf);
    foliageLeaves.push({
      mesh: leaf,
      baseRotZ: leaf.rotation.z,
      baseRotX: leaf.rotation.x,
      phase: i * 0.73,
    });
  }

  // 5 Hanging Golden Lotus Mini-Lanterns under the main boughs
  const miniLanterns = [];
  const lanternPositions = [
    new THREE.Vector3(-1.55, 3.1, 0.88),
    new THREE.Vector3(-0.62, 3.85, 1.15),
    new THREE.Vector3(0.22, 4.25, 0.42),
    new THREE.Vector3(1.35, 3.3, 0.78),
    new THREE.Vector3(-1.72, 3.55, -0.28),
  ];
  for (let i = 0; i < lanternPositions.length; i++) {
    const lp = lanternPositions[i];
    const lGroup = new THREE.Group();
    lGroup.position.copy(lp);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6), goldMat);
    cord.position.y = -0.17;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe082 })
    );
    bulb.position.y = -0.36;
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0xffb74d,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    halo.position.y = -0.36;
    halo.scale.setScalar(0.65);
    lGroup.add(cord, bulb, halo);
    root.add(lGroup);
    miniLanterns.push({ group: lGroup, phase: i * 1.3 });
  }

  // Warm Golden Aura Halo & PointLight inside the Bodhi Canopy
  const treeLight = new THREE.PointLight(0xffca64, 2.6, 9.5, 1.4);
  treeLight.position.set(-0.3, 3.2, 0.6);
  root.add(treeLight);

  const canopyHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffd54f,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  canopyHalo.position.set(0, 3.35, 0);
  canopyHalo.scale.setScalar(4.8);
  root.add(canopyHalo);

  // Floating 3D Header Plaque above the Bodhi Tree ("🌳 CÂY BỒ ĐỀ ƯỚC NGUYỆN")
  const headerDiv = document.createElement('div');
  headerDiv.className = 'bodhi-tree-title-tag';
  headerDiv.innerHTML = '🌳 CÂY BỒ ĐỀ ƯỚC NGUYỆN <span class="bodhi-count-inline">8</span>';
  const headerLabel = new CSS2DObject(headerDiv);
  headerLabel.position.set(-0.15, 4.75, 0.25);
  root.add(headerLabel);

  // ==========================================================================
  // 4. 3D WIND-PHYSICS SILK WISH RIBBONS (Dải Lụa Đỏ Ước Nguyện Đung Đưa)
  // ==========================================================================
  const ribbonsGroup = new THREE.Group();
  root.add(ribbonsGroup);

  // Shared prototype geometry dimensions: 0.26m wide x 1.08m long with 8 vertical segments for wind wave
  const RIBBON_W = 0.26;
  const RIBBON_H = 1.08;
  const RIBBON_SEGS_Y = 8;

  const activeRibbons = []; // { id, data, group, mesh, basePos, phase, tagObj }
  const flyingRibbons = [];

  function updateHeaderCount() {
    const badge = headerDiv.querySelector('.bodhi-count-inline');
    if (badge) badge.textContent = `${activeRibbons.length}`;
  }

  function refreshPinnedTags() {
    // Show crisp CSS2D floating silk tags on the 3 most recent ribbons so viewers can read them clearly
    const total = activeRibbons.length;
    for (let i = 0; i < total; i++) {
      const r = activeRibbons[i];
      const shouldShowTag = i >= total - 3;
      if (shouldShowTag && !r.tagObj) {
        const el = document.createElement('div');
        el.className = `bodhi-wish-tag ${r.data.ribbonColor === 'gold' || r.data.tier >= 2 ? 'gold' : ''}`;
        const bEl = document.createElement('b');
        bEl.textContent = `🧧 ${r.data.name}`;
        const sEl = document.createElement('span');
        sEl.textContent = r.data.wish;
        el.append(bEl, sEl);
        const tagObj = new CSS2DObject(el);
        tagObj.position.set(0, -RIBBON_H * 0.48, 0.05);
        r.group.add(tagObj);
        r.tagObj = tagObj;
      } else if (!shouldShowTag && r.tagObj) {
        r.tagObj.element?.remove();
        r.group.remove(r.tagObj);
        r.tagObj = null;
      }
    }
  }

  const knotGeo = new THREE.SphereGeometry(0.045, 8, 8);

  function createRibbonMesh(wishData, anchorIdx) {
    const anchor = branchAnchorPoints[anchorIdx % branchAnchorPoints.length];
    const group = new THREE.Group();
    group.position.copy(anchor);

    // Golden tie ring at top of ribbon
    const knot = new THREE.Mesh(knotGeo, goldMat);
    group.add(knot);

    // Segmented plane shifted down so y=0 is at the branch knot and y=-RIBBON_H is the bottom tassel
    const geo = new THREE.PlaneGeometry(RIBBON_W, RIBBON_H, 1, RIBBON_SEGS_Y);
    geo.translate(0, -RIBBON_H / 2, 0);

    // Save rest positions for wind wave deformation
    const posAttr = geo.attributes.position;
    const restY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      restY[i] = posAttr.getY(i);
    }
    geo.userData.restY = restY;

    const tex = makeRibbonTexture(wishData);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    return { group, mesh, tex, anchor };
  }

  function removeOldestRibbon() {
    const oldest = activeRibbons.shift();
    if (!oldest) return;
    if (oldest.tagObj) {
      oldest.tagObj.element?.remove();
      oldest.group.remove(oldest.tagObj);
    }
    ribbonsGroup.remove(oldest.group);
    oldest.mesh.geometry.dispose();
    oldest.mesh.material.map?.dispose();
    oldest.mesh.material.dispose();
  }

  function attachRibbonImmediate(wishData) {
    if (!wishData) return;
    // Deduplicate by id if already attached
    if (wishData.id && activeRibbons.some(r => r.id === wishData.id)) return;
    while (activeRibbons.length >= MAX_RIBBONS) {
      removeOldestRibbon();
    }
    const slotIdx = activeRibbons.length % branchAnchorPoints.length;
    const { group, mesh } = createRibbonMesh(wishData, slotIdx);
    ribbonsGroup.add(group);
    activeRibbons.push({
      id: wishData.id || `w_${Date.now()}_${Math.random()}`,
      data: wishData,
      group,
      mesh,
      phase: Math.random() * Math.PI * 2,
      tagObj: null,
    });
    refreshPinnedTags();
    updateHeaderCount();
  }

  // Animate a new Wish Ribbon flying from the worshipper's spot up onto the Sacred Bodhi Tree!
  function flyWishRibbon(wishData, fromWorldPos = { x: 0, z: -5.5 }) {
    if (!wishData) return;
    if (wishData.id && activeRibbons.some(r => r.id === wishData.id)) return;

    // Remove any initial placeholder ribbon first so real viewers take center stage
    const initIdx = activeRibbons.findIndex(r => String(r.id).startsWith('init_'));
    if (initIdx !== -1 && activeRibbons.length >= 12) {
      const [initR] = activeRibbons.splice(initIdx, 1);
      if (initR.tagObj) {
        initR.tagObj.element?.remove();
        initR.group.remove(initR.tagObj);
      }
      ribbonsGroup.remove(initR.group);
      initR.mesh.geometry.dispose();
      initR.mesh.material.map?.dispose();
      initR.mesh.material.dispose();
    }
    while (activeRibbons.length >= MAX_RIBBONS) {
      removeOldestRibbon();
    }

    const slotIdx = activeRibbons.length % branchAnchorPoints.length;
    const { group, mesh, anchor } = createRibbonMesh(wishData, slotIdx);

    // Convert world start position into local Bodhi Tree coordinates
    const startLocal = new THREE.Vector3(
      (fromWorldPos?.x ?? 0) - BODHI_POS.x,
      1.35,
      (fromWorldPos?.z ?? -5.5) - BODHI_POS.z
    );
    const midLocal = new THREE.Vector3(
      (startLocal.x + anchor.x) * 0.5 - 0.65,
      Math.max(startLocal.y, anchor.y) + 1.15,
      (startLocal.z + anchor.z) * 0.5 + 0.85
    );

    group.position.copy(startLocal);
    group.scale.setScalar(1.35);
    ribbonsGroup.add(group);

    // Add a glowing golden aura sprite during flight
    const flightGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0xffe082,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    flightGlow.position.set(0, -RIBBON_H * 0.45, 0);
    flightGlow.scale.setScalar(1.65);
    group.add(flightGlow);

    const entry = {
      id: wishData.id || `w_${Date.now()}_${Math.random()}`,
      data: wishData,
      group,
      mesh,
      phase: Math.random() * Math.PI * 2,
      tagObj: null,
    };
    activeRibbons.push(entry);
    refreshPinnedTags();
    updateHeaderCount();

    // Smooth GSAP quadratic bezier flight up to the Bodhi branch
    const animState = { t: 0 };
    gsap.to(animState, {
      t: 1,
      duration: 2.15,
      ease: 'power2.inOut',
      onUpdate() {
        const u = animState.t;
        const inv = 1 - u;
        // Quadratic Bezier interpolation: B(u) = (1-u)^2 * P0 + 2(1-u)u * P1 + u^2 * P2
        group.position.set(
          inv * inv * startLocal.x + 2 * inv * u * midLocal.x + u * u * anchor.x,
          inv * inv * startLocal.y + 2 * inv * u * midLocal.y + u * u * anchor.y,
          inv * inv * startLocal.z + 2 * inv * u * midLocal.z + u * u * anchor.z
        );
        group.rotation.y = Math.sin(u * Math.PI * 2) * 0.45 * inv;
        const s = 1.35 - 0.35 * u;
        group.scale.setScalar(s);
        flightGlow.material.opacity = 0.95 * (1 - u * 0.82);
      },
      onComplete() {
        group.position.copy(anchor);
        group.scale.setScalar(1);
        group.rotation.y = 0;
        group.remove(flightGlow);
        flightGlow.material.dispose();

        // Pulse canopy golden light & trigger wind chime sound callback
        gsap.fromTo(treeLight, { intensity: 5.2 }, { intensity: 2.6, duration: 1.2, ease: 'power2.out' });
        gsap.fromTo(canopyHalo.scale, { x: 6.2, y: 6.2, z: 1 }, { x: 4.8, y: 4.8, z: 1, duration: 1.2, ease: 'power2.out' });
        onRibbonTied?.(wishData);
      },
    });
  }

  function setWishesSnapshot(wishes = []) {
    if (!Array.isArray(wishes) || wishes.length === 0) {
      if (activeRibbons.length === 0) {
        for (const b of INITIAL_BLESSINGS) attachRibbonImmediate(b);
      }
      return;
    }
    // Clear existing and load snapshot
    while (activeRibbons.length > 0) removeOldestRibbon();
    const list = wishes.slice(-MAX_RIBBONS);
    for (const w of list) attachRibbonImmediate(w);
  }

  function clearAllRibbons() {
    while (activeRibbons.length > 0) removeOldestRibbon();
    for (const b of INITIAL_BLESSINGS) attachRibbonImmediate(b);
  }

  // Initialize with ceremonial blessings so the Bodhi Tree is immediately resplendent
  for (const b of INITIAL_BLESSINGS) {
    attachRibbonImmediate(b);
  }

  return {
    root,
    flyWishRibbon,
    setWishesSnapshot,
    clearAllRibbons,
    getWishesCount: () => activeRibbons.length,
    getRecentWishes: (limit = 12) => activeRibbons.slice(-limit).reverse().map(r => r.data),
    update(now, dt) {
      const t = now * 0.001;

      // 1. Rotate floor Dharma ring & breathe golden canopy aura
      floorAura.rotation.z = t * 0.22;
      canopyHalo.material.opacity = 0.34 + 0.08 * Math.sin(t * 2.1);

      // 2. Gentle Simplex-Noise breeze on Bodhi heart-shaped leaves
      const windBase = noise2D(t * 0.45, 0) * 0.14;
      for (let i = 0; i < foliageLeaves.length; i++) {
        const lf = foliageLeaves[i];
        lf.mesh.rotation.z = lf.baseRotZ + windBase + Math.sin(t * 2.2 + lf.phase) * 0.08;
        lf.mesh.rotation.x = lf.baseRotX + Math.cos(t * 1.7 + lf.phase) * 0.06;
      }

      // 3. Gentle pendulum swing on hanging lotus mini-lanterns
      for (const ml of miniLanterns) {
        ml.group.rotation.z = Math.sin(t * 1.6 + ml.phase) * 0.07;
        ml.group.rotation.x = Math.cos(t * 1.3 + ml.phase) * 0.05;
      }

      // 4. Real-time multi-segment silk wave physics on every hanging Wish Ribbon!
      for (let i = 0; i < activeRibbons.length; i++) {
        const r = activeRibbons[i];
        const posAttr = r.mesh.geometry.attributes.position;
        const restY = r.mesh.geometry.userData.restY;
        const phase = r.phase;

        for (let v = 0; v < posAttr.count; v++) {
          const y = restY[v]; // 0 at knot, -RIBBON_H at bottom tassel
          const bendFactor = Math.min(1, Math.abs(y) / RIBBON_H); // 0 at top knot -> 1 at bottom tip
          const waveZ =
            Math.sin(t * 3.1 + phase - y * 3.6) * 0.11 * bendFactor +
            Math.cos(t * 1.8 + phase * 1.4 - y * 2.2) * 0.05 * bendFactor;
          const waveX = (v % 2 === 0 ? -RIBBON_W / 2 : RIBBON_W / 2) + Math.sin(t * 2.4 + phase - y * 2.8) * 0.06 * bendFactor;
          posAttr.setX(v, waveX);
          posAttr.setZ(v, waveZ);
        }
        posAttr.needsUpdate = true;
      }
    },
  };
}
