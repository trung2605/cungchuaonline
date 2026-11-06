import * as THREE from 'three';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

/* ==========================================================================
   10 WEBSITE 3D TREND TIKTOK LIVE — THREE.JS + GSAP + NO-AI ALGO FRONTEND
   ========================================================================== */

const STAGE_W = 1080;
const STAGE_H = 1920;

const GIFT_PRESETS = {
  comment: { type: 'comment', giftName: '', diamondCount: 0 },
  rose_1: { type: 'gift', giftName: 'Hoa Hồng', diamondCount: 1 },
  coin_1: { type: 'gift', giftName: 'Quà 1 Đồng', diamondCount: 1 },
  lotus_5: { type: 'gift', giftName: 'Hoa Sen', diamondCount: 5 },
  confetti_10: { type: 'gift', giftName: 'Pháo Giấy', diamondCount: 10 },
};

const DEMO_NICKNAMES = [
  'Minh Anh 2k1', 'Hoàng Nam 98', 'Bảo Ngọc HN', 'Tuấn Kiệt SG',
  'Khánh Linh 2k3', 'Phúc Lộc 88', 'Thanh Trúc ĐN', 'Đức Huy 99',
  'Ngọc Hân Cần Thơ', 'Gia Bảo 37 Nghệ An',
];

const state = {
  projects: [],
  activeProjectId: 'gieo-que',
  lastSeq: 0,
  leaderboards: {},
  customData: {},
  insights: null,
  recentEvents: [],
  autoDemo: true,
  ttsEnabled: true,
  liveMode: false,
};

// DOM References
const dom = {
  body: document.body,
  btnToggleLiveMode: document.getElementById('btn-toggle-live-mode'),
  stageViewport: document.getElementById('stage-viewport'),
  stage: document.getElementById('stage'),
  canvas: document.getElementById('trend-canvas'),
  projectNavList: document.getElementById('project-nav-list'),

  hudProjectIcon: document.getElementById('hud-project-icon'),
  hudProjectName: document.getElementById('hud-project-name'),
  hudProjectCode: document.getElementById('hud-project-code'),
  hudProjectTagline: document.getElementById('hud-project-tagline'),
  hudFormatPrompt: document.getElementById('hud-format-prompt'),
  hudMicrogiftPrompt: document.getElementById('hud-microgift-prompt'),
  hudRuleNote: document.getElementById('hud-rule-note'),

  hudStatInteractions: document.getElementById('hud-stat-interactions'),
  hudStatMicrogifts: document.getElementById('hud-stat-microgifts'),
  hudStatDiamonds: document.getElementById('hud-stat-diamonds'),

  hudBoardTitle: document.getElementById('hud-board-title'),
  hudLeaderboard: document.getElementById('hud-leaderboard'),

  hudGiftBurst: document.getElementById('hud-gift-burst'),
  giftBurstIcon: document.getElementById('gift-burst-icon'),
  giftBurstUser: document.getElementById('gift-burst-user'),
  giftBurstTitle: document.getElementById('gift-burst-title'),

  hudResultCard: document.getElementById('hud-result-card'),
  resultUserAvatar: document.getElementById('result-user-avatar'),
  resultUserName: document.getElementById('result-user-name'),
  resultFormatTag: document.getElementById('result-format-tag'),
  resultRawComment: document.getElementById('result-raw-comment'),
  resultBadge: document.getElementById('result-badge'),
  resultHeadline: document.getElementById('result-headline'),
  resultMetricsGrid: document.getElementById('result-metrics-grid'),
  resultDetailText: document.getElementById('result-detail-text'),
  hudFeedItems: document.getElementById('hud-feed-items'),

  btnAutoDemo: document.getElementById('btn-auto-demo'),
  btnTtsVoice: document.getElementById('btn-tts-voice'),
  simForm: document.getElementById('sim-comment-form'),
  simNickname: document.getElementById('sim-nickname'),
  simGiftSelect: document.getElementById('sim-gift-select'),
  simCommentText: document.getElementById('sim-comment-text'),
  sampleChipsList: document.getElementById('sample-chips-list'),
  btnQuickRose: document.getElementById('btn-quick-rose'),
  btnQuickBurst: document.getElementById('btn-quick-burst'),

  insightTotalBadge: document.getElementById('insight-total-badge'),
  kpiTotalComments: document.getElementById('kpi-total-comments'),
  kpiMicroGifts: document.getElementById('kpi-micro-gifts'),
  kpiConversionRate: document.getElementById('kpi-conversion-rate'),
  insightFormatBars: document.getElementById('insight-format-bars'),
  insightKeywordsCloud: document.getElementById('insight-keywords-cloud'),

  customDataForm: document.getElementById('custom-data-form'),
  customRuleNote: document.getElementById('custom-rule-note'),
  customBonusBlessing: document.getElementById('custom-bonus-blessing'),
  customMicrogiftTitle: document.getElementById('custom-microgift-title'),
  customSaveStatus: document.getElementById('custom-save-status'),
};

/* ==========================================================================
   STAGE 9:16 RESPONSIVE SCALER
   ========================================================================== */
function fitStage() {
  if (!dom.stageViewport || !dom.stage) return;
  const rect = dom.stageViewport.getBoundingClientRect();
  const pad = state.liveMode ? 0 : 18;
  const availW = Math.max(200, rect.width - pad * 2);
  const availH = Math.max(300, rect.height - pad * 2);
  const scale = Math.min(availW / STAGE_W, availH / STAGE_H);
  dom.stage.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
}
window.addEventListener('resize', fitStage);

/* ==========================================================================
   THREE.JS 3D ENGINE & 10 PROCEDURAL WORLDS
   ========================================================================== */
const renderer = new THREE.WebGLRenderer({
  canvas: dom.canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(STAGE_W, STAGE_H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x09040c, 0.032);

const camera = new THREE.PerspectiveCamera(42, STAGE_W / STAGE_H, 0.1, 120);
camera.position.set(0, 2.3, 10.8);
camera.lookAt(0, 0.5, 0);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffe6a3, 2.2);
keyLight.position.set(5, 10, 7);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xff4d88, 2.4, 24);
rimLight.position.set(-5, 4, -4);
scene.add(rimLight);

const bottomGlow = new THREE.PointLight(0xf5b942, 1.8, 18);
bottomGlow.position.set(0, -2.5, 3);
scene.add(bottomGlow);

// Ambient Starfield / Floating Particles shared across worlds
const particleCount = 220;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePos[i * 3] = (Math.random() - 0.5) * 16;
  particlePos[i * 3 + 1] = (Math.random() - 0.5) * 20;
  particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xffe699,
  size: 0.11,
  transparent: true,
  opacity: 0.75,
});
const starField = new THREE.Points(particleGeo, particleMat);
scene.add(starField);

// Active 3D World Root Group & Dynamic 3D Plaque Canvas
const worldGroup = new THREE.Group();
scene.add(worldGroup);

let activeWorld = {
  mode: '',
  update: () => {},
  triggerAction: () => {},
  plaqueCanvas: null,
  plaqueCtx: null,
  plaqueTexture: null,
};

function disposeHierarchy(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    }
  });
}

function create3DPlaqueMesh(accentHex = '#f5b942') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.PlaneGeometry(4.5, 1.4);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 2.95, 0.4);

  activeWorld.plaqueCanvas = canvas;
  activeWorld.plaqueCtx = ctx;
  activeWorld.plaqueTexture = texture;
  update3DPlaqueText('SẴN SÀNG GIẢI MÃ 3D', 'Bình luận theo cú pháp trên màn hình!', '100% THUẬT TOÁN', accentHex);
  return mesh;
}

function update3DPlaqueText(title, subtitle, badge, accentHex = '#f5b942') {
  const { plaqueCanvas: c, plaqueCtx: ctx, plaqueTexture: tex } = activeWorld;
  if (!c || !ctx || !tex) return;

  ctx.clearRect(0, 0, c.width, c.height);

  // Rounded dark lacquer background
  ctx.fillStyle = 'rgba(12, 8, 20, 0.88)';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(16, 16, c.width - 32, c.height - 32, 36);
  ctx.fill();
  ctx.stroke();

  // Badge pill
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 34px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(badge || 'THUẬT TOÁN 3D').toUpperCase(), c.width / 2, 78);

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px "Be Vietnam Pro", sans-serif';
  ctx.fillText(String(title || '').slice(0, 34), c.width / 2, 155);

  // Subtitle
  ctx.fillStyle = '#ffe8a3';
  ctx.font = '600 34px "Be Vietnam Pro", sans-serif';
  ctx.fillText(String(subtitle || '').slice(0, 44), c.width / 2, 232);

  tex.needsUpdate = true;
}

const THEME_HEX = {
  gold: { accent: '#f5b942', fog: 0x160903, rim: 0xff9900 },
  rose: { accent: '#ff4d88', fog: 0x1a0612, rim: 0xff2a85 },
  violet: { accent: '#a855f7', fog: 0x100521, rim: 0x9333ea },
  emerald: { accent: '#10b981', fog: 0x041912, rim: 0x10b981 },
  crimson: { accent: '#f43f5e', fog: 0x1c050a, rim: 0xf43f5e },
  amber: { accent: '#f59e0b', fog: 0x190d03, rim: 0xf59e0b },
  cyan: { accent: '#06b6d4', fog: 0x04151f, rim: 0x06b6d4 },
  lime: { accent: '#eab308', fog: 0x171203, rim: 0xeab308 },
  teal: { accent: '#14b8a6', fog: 0x041819, rim: 0x14b8a6 },
  indigo: { accent: '#6366f1', fog: 0x07081e, rim: 0x6366f1 },
};

function buildSceneWorld(mode, themeName = 'gold') {
  gsap.killTweensOf(worldGroup.rotation);
  gsap.killTweensOf(worldGroup.position);
  disposeHierarchy(worldGroup);
  worldGroup.clear();

  const palette = THEME_HEX[themeName] || THEME_HEX.gold;
  scene.fog.color.setHex(palette.fog);
  rimLight.color.setHex(palette.rim);
  bottomGlow.color.set(palette.accent);
  particleMat.color.set(palette.accent);

  const plaqueMesh = create3DPlaqueMesh(palette.accent);
  worldGroup.add(plaqueMesh);

  // Base pedestal shared aesthetics
  const baseGeo = new THREE.CylinderGeometry(2.6, 3.0, 0.45, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1f1624,
    metalness: 0.7,
    roughness: 0.25,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -1.65;
  worldGroup.add(baseMesh);

  const rimRingGeo = new THREE.TorusGeometry(2.75, 0.07, 16, 64);
  const goldMat = new THREE.MeshStandardMaterial({
    color: palette.accent,
    emissive: palette.accent,
    emissiveIntensity: 0.35,
    metalness: 0.88,
    roughness: 0.18,
  });
  const rimRing = new THREE.Mesh(rimRingGeo, goldMat);
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = -1.42;
  worldGroup.add(rimRing);

  const centerGroup = new THREE.Group();
  worldGroup.add(centerGroup);

  if (mode === 'oracle_tower') {
    // #1: Bagua Ring + Jade Fortune Cylinder + Rising Golden Fortune Stick
    const baguaRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.12, 16, 8), goldMat);
    baguaRing.position.y = 0.3;
    centerGroup.add(baguaRing);

    const cylinderBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.72, 2.1, 24),
      new THREE.MeshStandardMaterial({ color: 0x8b1e0f, metalness: 0.45, roughness: 0.3 })
    );
    cylinderBody.position.y = -0.35;
    centerGroup.add(cylinderBody);

    const fortuneStick = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 2.4, 0.08),
      goldMat
    );
    fortuneStick.position.set(0, 0.6, 0);
    centerGroup.add(fortuneStick);

    activeWorld.update = (t) => {
      baguaRing.rotation.z = t * 0.55;
      cylinderBody.rotation.y = Math.sin(t * 1.5) * 0.18;
      plaqueMesh.position.y = 2.95 + Math.sin(t * 2.2) * 0.08;
    };
    activeWorld.triggerAction = (isMicroGift) => {
      gsap.fromTo(cylinderBody.rotation, { z: -0.22 }, { z: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.3)' });
      gsap.fromTo(fortuneStick.position, { y: 0.1 }, { y: isMicroGift ? 1.55 : 1.15, duration: 0.75, ease: 'back.out(1.8)' });
    };
  } else if (mode === 'love_sphere') {
    // #2: Rose Quartz Crystal Sphere + Twin Orbiting Lover Orbs + Golden Heart Ring
    const crystalSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 3),
      new THREE.MeshStandardMaterial({
        color: 0xff5c97,
        emissive: 0x701236,
        emissiveIntensity: 0.45,
        metalness: 0.3,
        roughness: 0.12,
        wireframe: false,
      })
    );
    crystalSphere.position.y = 0.35;
    centerGroup.add(crystalSphere);

    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.06, 16, 64), goldMat);
    orbitRing.rotation.x = Math.PI / 3;
    orbitRing.position.y = 0.35;
    centerGroup.add(orbitRing);

    const orbA = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), goldMat);
    const orbB = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), goldMat);
    centerGroup.add(orbA, orbB);

    activeWorld.update = (t) => {
      crystalSphere.rotation.y = t * 0.45;
      orbitRing.rotation.z = t * 0.7;
      orbA.position.set(Math.cos(t * 1.8) * 2.0, 0.35 + Math.sin(t * 1.8) * 0.6, Math.sin(t * 1.8) * 1.6);
      orbB.position.set(Math.cos(t * 1.8 + Math.PI) * 2.0, 0.35 - Math.sin(t * 1.8) * 0.6, Math.sin(t * 1.8 + Math.PI) * 1.6);
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(crystalSphere.scale, { x: 1.35, y: 1.35, z: 1.35 }, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    };
  } else if (mode === 'numerology_pyramid') {
    // #3: Egyptian Crystal Pyramid + 3 Sacred Geometry Rings
    const pyramid = new THREE.Mesh(
      new THREE.ConeGeometry(1.75, 2.4, 4),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x4c1d95,
        emissiveIntensity: 0.5,
        metalness: 0.65,
        roughness: 0.18,
      })
    );
    pyramid.position.y = 0.15;
    centerGroup.add(pyramid);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.05, 16, 64), goldMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.05, 16, 64), goldMat);
    ring1.position.y = 0.25;
    ring2.position.y = 0.25;
    centerGroup.add(ring1, ring2);

    activeWorld.update = (t) => {
      pyramid.rotation.y = t * 0.5;
      ring1.rotation.x = t * 0.8;
      ring2.rotation.y = -t * 0.65;
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(pyramid.position, { y: 0.9 }, { y: 0.15, duration: 0.75, ease: 'bounce.out' });
    };
  } else if (mode === 'dragon_egg') {
    // #4: Glowing Runic Dragon Egg + Floating Guardian Crystals
    const egg = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x065f46,
        emissiveIntensity: 0.55,
        metalness: 0.5,
        roughness: 0.2,
      })
    );
    egg.scale.set(1, 1.38, 1);
    egg.position.y = 0.25;
    centerGroup.add(egg);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.08, 16, 48), goldMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.25;
    centerGroup.add(halo);

    activeWorld.update = (t) => {
      egg.rotation.y = t * 0.6;
      halo.position.y = 0.25 + Math.sin(t * 2.5) * 0.35;
      halo.rotation.z = t;
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(egg.scale, { x: 1.32, y: 1.75, z: 1.32 }, { x: 1, y: 1.38, z: 1, duration: 0.85, ease: 'elastic.out(1.2, 0.3)' });
    };
  } else if (mode === 'province_arena') {
    // #5: 5 Dynamic 3D Province Racing Pillars
    const pillars = [];
    const colors = [0xf5b942, 0xf43f5e, 0x38bdf8, 0x10b981, 0xa855f7];
    for (let i = 0; i < 5; i++) {
      const pMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        metalness: 0.65,
        roughness: 0.22,
      });
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.8, 20), pMat);
      mesh.position.set((i - 2) * 0.95, -0.4 + (4 - i) * 0.18, 0);
      centerGroup.add(mesh);
      pillars.push(mesh);
    }

    activeWorld.update = (t) => {
      centerGroup.rotation.y = Math.sin(t * 0.45) * 0.28;
    };
    activeWorld.triggerAction = () => {
      pillars.forEach((p, idx) => {
        const boost = idx === 0 ? 1.55 : 1.15 + Math.random() * 0.3;
        gsap.fromTo(p.scale, { y: boost }, { y: 1 + (4 - idx) * 0.14, duration: 0.8, ease: 'back.out(1.7)' });
      });
    };
  } else if (mode === 'jade_seal') {
    // #6: Imperial Golden Scroll + Royal Jade Dragon Seal slamming down
    const scroll = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.18, 2.2),
      goldMat
    );
    scroll.position.y = -1.1;
    centerGroup.add(scroll);

    const sealGroup = new THREE.Group();
    const sealBlock = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.1, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.4, roughness: 0.18 })
    );
    const sealKnob = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), goldMat);
    sealKnob.position.y = 0.75;
    sealGroup.add(sealBlock, sealKnob);
    sealGroup.position.y = 0.35;
    centerGroup.add(sealGroup);

    activeWorld.update = (t) => {
      sealGroup.rotation.y = t * 0.5;
      sealGroup.position.y = 0.35 + Math.sin(t * 2.2) * 0.15;
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(sealGroup.position, { y: 1.65 }, { y: -0.25, duration: 0.32, yoyo: true, repeat: 1, ease: 'power3.inOut' });
    };
  } else if (mode === 'nebula_wheel') {
    // #7: 3 Concentric Mechanical Astrolabe Rings (Thiên - Địa - Nhân)
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.11, 16, 64), goldMat);
    const r2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.1, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.75, roughness: 0.2 })
    );
    const r3 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.09, 16, 64), goldMat);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), goldMat);
    centerGroup.add(r1, r2, r3, core);
    centerGroup.position.y = 0.35;

    activeWorld.update = (t) => {
      r1.rotation.z = t * 0.7;
      r2.rotation.x = t * 1.1;
      r3.rotation.y = -t * 1.4;
      core.rotation.y = t * 1.8;
    };
    activeWorld.triggerAction = () => {
      gsap.to(centerGroup.rotation, { z: centerGroup.rotation.z + Math.PI * 2, duration: 0.9, ease: 'power2.out' });
    };
  } else if (mode === 'money_tree') {
    // #8: Golden Money Tree 9999 + Hanging Gold Ingots
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.52, 2.3, 16),
      goldMat
    );
    trunk.position.y = -0.35;
    centerGroup.add(trunk);

    const crown = new THREE.Group();
    crown.position.y = 0.85;
    for (let i = 0; i < 14; i++) {
      const coin = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), goldMat);
      const angle = (i / 14) * Math.PI * 2;
      const rad = i % 2 === 0 ? 1.35 : 0.85;
      coin.position.set(Math.cos(angle) * rad, (i % 3) * 0.35 - 0.2, Math.sin(angle) * rad);
      crown.add(coin);
    }
    centerGroup.add(crown);

    activeWorld.update = (t) => {
      crown.rotation.y = t * 0.55;
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(crown.scale, { x: 1.28, y: 1.28, z: 1.28 }, { x: 1, y: 1, z: 1, duration: 0.75, ease: 'elastic.out(1.2, 0.35)' });
    };
  } else if (mode === 'koi_sanctuary') {
    // #9: Jade Lotus Pond + Dragon Gate Arch + Swimming 3D Koi Fish
    const archLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.5, 16), goldMat);
    const archRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.5, 16), goldMat);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.26, 0.32), goldMat);
    archLeft.position.set(-1.1, -0.2, 0);
    archRight.position.set(1.1, -0.2, 0);
    archTop.position.set(0, 1.05, 0);
    centerGroup.add(archLeft, archRight, archTop);

    const koiGroup = new THREE.Group();
    const koiList = [];
    for (let i = 0; i < 6; i++) {
      const koiMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff5722 : 0xf5b942,
        metalness: 0.5,
        roughness: 0.25,
      });
      const koi = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 12), koiMat);
      koi.rotation.x = Math.PI / 2;
      koiGroup.add(koi);
      koiList.push(koi);
    }
    centerGroup.add(koiGroup);

    activeWorld.update = (t) => {
      koiList.forEach((koi, idx) => {
        const a = t * 1.4 + (idx * Math.PI * 2) / koiList.length;
        koi.position.set(Math.cos(a) * 1.75, -0.95 + Math.sin(t * 3 + idx) * 0.15, Math.sin(a) * 1.75);
        koi.rotation.z = -a;
      });
    };
    activeWorld.triggerAction = () => {
      if (koiList[0]) {
        gsap.fromTo(koiList[0].position, { y: 1.45 }, { y: -0.95, duration: 0.95, ease: 'bounce.out' });
      }
    };
  } else {
    // #10: Sky Fireworks & 3D Glowing Drone Formation
    const droneGroup = new THREE.Group();
    const drones = [];
    for (let i = 0; i < 24; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), goldMat);
      const ring = Math.floor(i / 8) + 1;
      const a = ((i % 8) / 8) * Math.PI * 2;
      d.position.set(Math.cos(a) * ring * 0.75, 0.25 + (ring - 2) * 0.45, Math.sin(a) * ring * 0.75);
      droneGroup.add(d);
      drones.push(d);
    }
    centerGroup.add(droneGroup);

    activeWorld.update = (t) => {
      droneGroup.rotation.y = t * 0.65;
      droneGroup.rotation.x = Math.sin(t * 0.8) * 0.25;
    };
    activeWorld.triggerAction = () => {
      gsap.fromTo(droneGroup.scale, { x: 1.45, y: 1.45, z: 1.45 }, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'elastic.out(1.1, 0.35)' });
    };
  }
}

// Render loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  starField.rotation.y = t * 0.06;
  activeWorld.update(t);
  renderer.render(scene, camera);
}
animate();

/* ==========================================================================
   VIETNAMESE TTS VOICE SYNTHESIS
   ========================================================================== */
function speakVietnamese(text) {
  if (!state.ttsEnabled || !('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = 1.06;
    utter.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang && v.lang.toLowerCase().includes('vi'));
    if (viVoice) utter.voice = viVoice;
    window.speechSynthesis.speak(utter);
  } catch (_) {
    // Ignore TTS blocked before user gesture
  }
}

/* ==========================================================================
   UI RENDERING & EVENT HANDLING
   ========================================================================== */
function getActiveProject() {
  return state.projects.find((p) => p.id === state.activeProjectId) || state.projects[0] || null;
}

function renderProjectNav() {
  if (!dom.projectNavList) return;
  dom.projectNavList.innerHTML = state.projects.map((p) => {
    const isActive = p.id === state.activeProjectId;
    const count = p.stats?.interactions || 0;
    return `
      <button type="button" class="project-nav-item ${isActive ? 'is-active' : ''}" data-project-id="${p.id}" role="tab" aria-selected="${isActive}">
        <span class="project-nav-icon">${p.icon}</span>
        <div class="project-nav-body">
          <div class="project-nav-top">
            <span class="project-nav-name">#${p.index}. ${p.shortName}</span>
            <span class="project-nav-count">${count} lượt</span>
          </div>
          <div class="project-nav-meta">${p.tagline}</div>
        </div>
      </button>
    `;
  }).join('');

  dom.projectNavList.querySelectorAll('.project-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectProject(btn.dataset.projectId, true);
    });
  });
}

function selectProject(projectId, pushUrl = false) {
  const proj = state.projects.find((p) => p.id === projectId) || state.projects[0];
  if (!proj) return;

  const changed = state.activeProjectId !== proj.id || activeWorld.mode !== proj.sceneMode;
  state.activeProjectId = proj.id;
  dom.body.setAttribute('data-theme', proj.theme || 'gold');

  if (pushUrl && window.history?.pushState) {
    window.history.pushState({ projectId: proj.id }, '', `/trends/${proj.slug}`);
  }

  // Update HUD Header
  dom.hudProjectIcon.textContent = proj.icon;
  dom.hudProjectName.textContent = proj.name;
  dom.hudProjectCode.textContent = `#${proj.index} • ${proj.code}`;
  dom.hudProjectTagline.textContent = proj.tagline;
  dom.hudFormatPrompt.textContent = proj.formatPrompt;
  dom.hudMicrogiftPrompt.textContent = proj.microGiftPrompt;

  const custom = state.customData[proj.id] || proj.defaultCustomData || {};
  dom.hudRuleNote.textContent = custom.ruleNote || '';

  // Update Stats
  dom.hudStatInteractions.textContent = String(proj.stats?.interactions || 0);
  dom.hudStatMicrogifts.textContent = `${proj.stats?.microGifts || 0} 🌹`;
  dom.hudStatDiamonds.textContent = `${proj.stats?.diamonds || 0} 💎`;

  dom.hudBoardTitle.textContent = proj.id === 'dai-chien' ? 'TOP TỈNH THÀNH ĐUA ĐIỂM' : 'BẢNG VÀNG TƯƠNG TÁC';

  // Sample comment chips
  if (dom.sampleChipsList) {
    dom.sampleChipsList.innerHTML = (proj.sampleComments || []).map((sample) => `
      <button type="button" class="sample-chip" data-sample="${sample.replace(/"/g, '&quot;')}">${sample}</button>
    `).join('');
    dom.sampleChipsList.querySelectorAll('.sample-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        dom.simCommentText.value = chip.dataset.sample;
        submitInteraction(chip.dataset.sample, dom.simGiftSelect.value);
      });
    });
    if (proj.sampleComments?.[0]) {
      dom.simCommentText.value = proj.sampleComments[0];
    }
  }

  // Populate Custom Data Editor
  if (dom.customRuleNote) dom.customRuleNote.value = custom.ruleNote || '';
  if (dom.customBonusBlessing) dom.customBonusBlessing.value = custom.bonusBlessing || '';
  if (dom.customMicrogiftTitle) dom.customMicrogiftTitle.value = custom.microGiftTitle || '';

  if (changed) {
    buildSceneWorld(proj.sceneMode, proj.theme);
  }
  renderProjectNav();
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = state.leaderboards[state.activeProjectId] || [];
  if (!dom.hudLeaderboard) return;
  if (!list.length) {
    dom.hudLeaderboard.innerHTML = `<li class="board-empty">Hãy comment theo cú pháp để lên bảng vàng 3D!</li>`;
    return;
  }
  dom.hudLeaderboard.innerHTML = list.slice(0, 6).map((item, idx) => `
    <li class="board-row">
      <span class="board-rank">${idx + 1}</span>
      <span class="board-name">${escapeHtml(item.name)}</span>
      <span class="board-score">${item.score}đ</span>
    </li>
  `).join('');
}

function renderInsights() {
  const ins = state.insights;
  if (!ins) return;
  if (dom.insightTotalBadge) dom.insightTotalBadge.textContent = `${ins.totalEvents || 0} sự kiện`;
  if (dom.kpiTotalComments) dom.kpiTotalComments.textContent = String(ins.totalComments || 0);
  if (dom.kpiMicroGifts) dom.kpiMicroGifts.textContent = `${ins.totalMicroGifts || 0} 🌹`;
  if (dom.kpiConversionRate) dom.kpiConversionRate.textContent = `${ins.microGiftConversionRate || 0}%`;

  if (dom.insightFormatBars) {
    const formats = (ins.formatBreakdown || []).slice(0, 5);
    if (!formats.length) {
      dom.insightFormatBars.innerHTML = `<div class="panel-desc">Chưa có bình luận được phân loại.</div>`;
    } else {
      dom.insightFormatBars.innerHTML = formats.map((f) => `
        <div class="format-bar-row">
          <div class="format-bar-top">
            <span>${escapeHtml(f.label)}</span>
            <strong>${f.count} (${f.percent}%)</strong>
          </div>
          <div class="format-bar-track">
            <div class="format-bar-fill" style="width: ${Math.max(6, f.percent)}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  if (dom.insightKeywordsCloud) {
    const kws = (ins.topKeywords || []).slice(0, 10);
    if (!kws.length) {
      dom.insightKeywordsCloud.innerHTML = `<span class="kw-chip">Chưa có từ khóa</span>`;
    } else {
      dom.insightKeywordsCloud.innerHTML = kws.map((k) => `
        <span class="kw-chip">${escapeHtml(k.word)} <b>×${k.count}</b></span>
      `).join('');
    }
  }
}

let giftBurstTimer = null;
function displayAlgorithmicEvent(ev, playEffects = true) {
  if (!ev || !ev.result) return;
  const res = ev.result;
  const proj = getActiveProject();
  const palette = THEME_HEX[proj?.theme || 'gold'] || THEME_HEX.gold;

  dom.resultUserAvatar.textContent = ev.isMicroGift ? '🌹' : (proj?.icon || '✨');
  dom.resultUserName.textContent = ev.nickname || 'Khách TikTok';
  dom.resultFormatTag.textContent = ev.formatLabel || 'Chuẩn Format';
  dom.resultRawComment.textContent = ev.rawText ? `💬 "${ev.rawText}"` : `🎁 Tặng ${ev.giftName || 'Hoa Hồng'} (${ev.diamondCount}💎)`;
  dom.resultBadge.textContent = res.badge || 'HOÀN TẤT';
  dom.resultHeadline.textContent = res.headline || '';
  dom.resultDetailText.textContent = res.detailText || '';

  dom.hudResultCard.classList.toggle('is-upgraded', Boolean(ev.isMicroGift));

  if (Array.isArray(res.metrics) && res.metrics.length) {
    dom.resultMetricsGrid.innerHTML = res.metrics.slice(0, 4).map((m) => `
      <div class="metric-box">
        <span class="metric-label">${escapeHtml(m.label)}</span>
        <strong class="metric-val">${escapeHtml(m.value)}</strong>
      </div>
    `).join('');
  }

  // Update 3D Plaque inside Three.js world
  update3DPlaqueText(
    `${ev.nickname}: ${res.badge}`,
    res.headline,
    ev.isMicroGift ? `🌹 VIP ${ev.diamondCount}💎 • ${ev.formatLabel}` : ev.formatLabel,
    palette.accent
  );

  // Update recent ticker strip
  state.recentEvents.unshift(ev);
  if (state.recentEvents.length > 6) state.recentEvents.length = 6;
  if (dom.hudFeedItems) {
    dom.hudFeedItems.innerHTML = state.recentEvents.slice(0, 3).map((item) => `
      <span class="feed-chip">${item.isMicroGift ? '🌹' : '💬'} <b>${escapeHtml(item.nickname)}</b>: ${escapeHtml(item.result?.badge || '')}</span>
    `).join('');
  }

  if (playEffects) {
    activeWorld.triggerAction(Boolean(ev.isMicroGift));

    if (ev.isMicroGift) {
      dom.giftBurstIcon.textContent = ev.diamondCount >= 5 ? '🪷' : '🌹';
      dom.giftBurstUser.textContent = `${ev.nickname} tặng ${ev.giftName || 'Hoa Hồng'} (${ev.diamondCount}💎)`;
      dom.giftBurstTitle.textContent = res.badge;
      dom.hudGiftBurst.classList.add('is-visible');
      clearTimeout(giftBurstTimer);
      giftBurstTimer = setTimeout(() => dom.hudGiftBurst.classList.remove('is-visible'), 3200);

      try {
        confetti({
          particleCount: 48,
          spread: 70,
          origin: { y: 0.55 },
        });
      } catch (_) {}
    }

    speakVietnamese(res.spokenText);
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ==========================================================================
   API SYNC & INTERACTION DISPATCH
   ========================================================================== */
function detectInitialProjectSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('live') === '1' || params.get('mode') === 'live') {
    setLiveMode(true);
  }
  if (params.get('project')) return params.get('project');
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'trends' && parts[1]) {
    return parts[1];
  }
  return 'gieo-que';
}

function setLiveMode(enabled) {
  state.liveMode = Boolean(enabled);
  dom.body.classList.toggle('is-live-mode', state.liveMode);
  if (dom.btnToggleLiveMode) {
    dom.btnToggleLiveMode.textContent = state.liveMode
      ? '🎛️ Mở Bàn Điều Khiển Studio'
      : '📱 Chế Độ Quay Live 9:16';
  }
  fitStage();
}

async function loadInitialState() {
  const initialSlug = detectInitialProjectSlug();
  try {
    const res = await fetch(`/api/trends/state?project=${encodeURIComponent(initialSlug)}`);
    const data = await res.json();
    if (data && Array.isArray(data.projects)) {
      state.projects = data.projects;
      state.leaderboards = data.leaderboards || {};
      state.customData = data.customData || {};
      state.insights = data.insights || null;
      state.lastSeq = data.seq || 0;

      const matched = state.projects.find(
        (p) => p.id === initialSlug || p.slug === initialSlug || String(p.index) === initialSlug
      ) || state.projects[0];

      selectProject(matched.id, false);
      renderInsights();

      if (Array.isArray(data.recentEvents) && data.recentEvents.length) {
        displayAlgorithmicEvent(data.recentEvents[0], false);
      } else {
        // Trigger one welcome demo calculation so the screen looks alive immediately
        const firstSample = matched.sampleComments?.[0] || '15/08/2001';
        await submitInteraction(firstSample, 'rose_1', 'Phật Tử Mở Hàng');
      }
    }
  } catch (err) {
    console.warn('Could not fetch /api/trends/state:', err);
  }
}

async function submitInteraction(commentText, giftPresetKey = 'comment', customNick = '') {
  const proj = getActiveProject();
  if (!proj) return;
  const preset = GIFT_PRESETS[giftPresetKey] || GIFT_PRESETS.comment;
  const nickname = (customNick || dom.simNickname?.value || 'Khách TikTok').trim();

  try {
    const res = await fetch('/api/trends/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: proj.id,
        nickname,
        text: commentText,
        type: preset.type,
        giftName: preset.giftName,
        diamondCount: preset.diamondCount,
      }),
    });
    const data = await res.json();
    if (data?.ok && data.event) {
      state.lastSeq = Math.max(state.lastSeq, data.event.seq || 0);
      if (data.projectStats) {
        const target = state.projects.find((p) => p.id === proj.id);
        if (target) target.stats = data.projectStats;
      }
      if (data.leaderboard) {
        state.leaderboards[proj.id] = data.leaderboard;
      }
      if (data.insights) {
        state.insights = data.insights;
      }
      selectProject(proj.id, false);
      renderInsights();
      displayAlgorithmicEvent(data.event, true);
    }
  } catch (err) {
    console.warn('submitInteraction error:', err);
  }
}

async function pollServerEvents() {
  try {
    const res = await fetch(`/api/trends/poll?since=${state.lastSeq}&project=${encodeURIComponent(state.activeProjectId)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data?.ok) return;

    if (Array.isArray(data.projects)) {
      state.projects = data.projects;
    }
    if (data.leaderboards) {
      state.leaderboards = data.leaderboards;
    }
    if (data.insights) {
      state.insights = data.insights;
      renderInsights();
    }
    if (Array.isArray(data.events) && data.events.length) {
      state.lastSeq = data.seq || state.lastSeq;
      const latestForActive = [...data.events].reverse().find((e) => e.projectId === state.activeProjectId) || data.events[data.events.length - 1];
      selectProject(state.activeProjectId, false);
      displayAlgorithmicEvent(latestForActive, true);
    }
  } catch (_) {}
}

/* ==========================================================================
   EVENT LISTENERS & AUTO-DEMO LOOP
   ========================================================================== */
if (dom.btnToggleLiveMode) {
  dom.btnToggleLiveMode.addEventListener('click', () => setLiveMode(!state.liveMode));
}
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key.toLowerCase() === 'l') setLiveMode(!state.liveMode);
});

if (dom.btnAutoDemo) {
  dom.btnAutoDemo.addEventListener('click', () => {
    state.autoDemo = !state.autoDemo;
    dom.btnAutoDemo.classList.toggle('is-active', state.autoDemo);
    dom.btnAutoDemo.textContent = state.autoDemo ? '🤖 Auto Demo: BẬT' : '🤖 Auto Demo: TẮT';
  });
}

if (dom.btnTtsVoice) {
  dom.btnTtsVoice.addEventListener('click', () => {
    state.ttsEnabled = !state.ttsEnabled;
    dom.btnTtsVoice.classList.toggle('is-active', state.ttsEnabled);
    dom.btnTtsVoice.textContent = state.ttsEnabled ? '🔊 Giọng Đọc: BẬT' : '🔇 Giọng Đọc: TẮT';
    if (!state.ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  });
}

if (dom.simForm) {
  dom.simForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitInteraction(dom.simCommentText.value, dom.simGiftSelect.value);
  });
}

if (dom.btnQuickRose) {
  dom.btnQuickRose.addEventListener('click', () => {
    const proj = getActiveProject();
    const samples = proj?.sampleComments || ['1999'];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    const nick = DEMO_NICKNAMES[Math.floor(Math.random() * DEMO_NICKNAMES.length)];
    dom.simNickname.value = nick;
    dom.simCommentText.value = sample;
    submitInteraction(sample, 'rose_1', nick);
  });
}

if (dom.btnQuickBurst) {
  dom.btnQuickBurst.addEventListener('click', async () => {
    const proj = getActiveProject();
    const samples = proj?.sampleComments || ['1999'];
    for (let i = 0; i < 5; i++) {
      const sample = samples[i % samples.length];
      const nick = DEMO_NICKNAMES[(i + Math.floor(Math.random() * 5)) % DEMO_NICKNAMES.length];
      const preset = i % 2 === 0 ? 'rose_1' : 'comment';
      await submitInteraction(sample, preset, nick);
      await new Promise((r) => setTimeout(r, 450));
    }
  });
}

if (dom.customDataForm) {
  dom.customDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const proj = getActiveProject();
    if (!proj) return;
    try {
      const res = await fetch('/api/trends/custom-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: proj.id,
          patch: {
            ruleNote: dom.customRuleNote.value,
            bonusBlessing: dom.customBonusBlessing.value,
            microGiftTitle: dom.customMicrogiftTitle.value,
          },
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        state.customData[proj.id] = data.customData;
        dom.hudRuleNote.textContent = data.customData.ruleNote || '';
        dom.customSaveStatus.textContent = '✅ Đã cập nhật kho dữ liệu & công thức thuật toán!';
        setTimeout(() => {
          if (dom.customSaveStatus) dom.customSaveStatus.textContent = '';
        }, 3000);
      }
    } catch (err) {
      console.warn('Failed to save custom data:', err);
    }
  });
}

// Auto-Demo Interval (fires every 6.5s when enabled so the 3D scene stays vibrant)
setInterval(() => {
  if (!state.autoDemo || document.hidden) return;
  const proj = getActiveProject();
  if (!proj || !Array.isArray(proj.sampleComments) || !proj.sampleComments.length) return;
  const sample = proj.sampleComments[Math.floor(Math.random() * proj.sampleComments.length)];
  const nick = DEMO_NICKNAMES[Math.floor(Math.random() * DEMO_NICKNAMES.length)];
  const preset = Math.random() < 0.48 ? 'rose_1' : 'comment';
  submitInteraction(sample, preset, nick);
}, 6500);

setInterval(pollServerEvents, 1800);

fitStage();
loadInitialState();
