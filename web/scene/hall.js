// Procedural main hall, placeholder Buddha, carpet, cushions, lights and themes (BR-07.10, BR-07.16).
// Look: a night hall lit mostly by candles. Lacquer and gilt pick up a room env map; everything
// else stays dark so light pools on the altar and the statue.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ALTAR, slotPosition } from './layout.js';

const THEMES = {
  night: { bg: 0x0a0503, sky: 0xffcf96, ground: 0x1c0a04, hemi: 0.16, sun: 0xffa860, sunI: 0.55, fillI: 0.35, candle: 3.2, spot: 1, glow: 1, shaft: 0.05, shaftC: 0xffc890, fog: 0.022, moon: 0, lotus: 0 },
  day: { bg: 0x8a6f4c, sky: 0xfff1d8, ground: 0x5a3c22, hemi: 0.75, sun: 0xfff0d0, sunI: 2.4, fillI: 0.9, candle: 0.7, spot: 0.35, glow: 0.25, shaft: 0.3, shaftC: 0xfff0c8, fog: 0.012, moon: 0, lotus: 0 },
  ram: { bg: 0x070a1e, sky: 0x9fb2ff, ground: 0x160a1c, hemi: 0.22, sun: 0xa8b8ff, sunI: 0.6, fillI: 0.3, candle: 2.8, spot: 0.9, glow: 1.5, shaft: 0.1, shaftC: 0xb8c8ff, fog: 0.02, moon: 1, lotus: 1 },
};
const COLOR_KEYS = new Set(['bg', 'sky', 'ground', 'sun', 'shaftC']);
const FADE_MS = 2000;
const STATUE_Z = ALTAR.z - 0.8;
const WALL_Z = ALTAR.z - 3.5;
const TABLE_Z = ALTAR.z + 0.6;

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export const glowTex = canvasTex(128, 128, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,230,150,1)'); r.addColorStop(0.55, 'rgba(255,190,80,.45)'); r.addColorStop(1, 'rgba(255,160,40,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});

// Teardrop candle flame: white core, amber body, soft tip.
const flameTex = canvasTex(64, 128, (g, w, h) => {
  const r = g.createRadialGradient(w / 2, h * 0.72, 2, w / 2, h * 0.62, h * 0.5);
  r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(0.25, 'rgba(255,214,120,.95)');
  r.addColorStop(0.6, 'rgba(255,140,40,.35)'); r.addColorStop(1, 'rgba(255,110,20,0)');
  g.fillStyle = r;
  g.beginPath();
  g.moveTo(w / 2, 4);
  g.bezierCurveTo(w * 0.95, h * 0.55, w * 0.85, h * 0.95, w / 2, h - 4);
  g.bezierCurveTo(w * 0.15, h * 0.95, w * 0.05, h * 0.55, w / 2, 4);
  g.fill();
});

// Seeded so every load draws the same grain.
const rand = (() => { let s = 7; return () => ((s = Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x9e3779b9 | 0) >>> 0) / 4294967296; })();

// Dark teak planks with grain streaks and seams.
const planks = canvasTex(512, 512, (g, w, h) => {
  const ph = 64;
  for (let y = 0; y < h; y += ph) {
    g.fillStyle = `hsl(20, 42%, ${11 + rand() * 6}%)`;
    g.fillRect(0, y, w, ph);
    for (let k = 0; k < 18; k++) {
      g.strokeStyle = `rgba(${rand() < 0.5 ? '10,4,2' : '70,36,18'},${0.15 + rand() * 0.25})`;
      g.lineWidth = 0.6 + rand() * 1.4;
      const yy = y + rand() * ph, amp = 1 + rand() * 3, f = 0.01 + rand() * 0.02;
      g.beginPath();
      for (let x = 0; x <= w; x += 8) g.lineTo(x, yy + Math.sin(x * f + k) * amp);
      g.stroke();
    }
    g.fillStyle = '#080302'; g.fillRect(0, y, w, 2);
    g.fillRect((y * 37) % w, y, 2, ph);
  }
});
planks.wrapS = planks.wrapT = THREE.RepeatWrapping;
planks.repeat.set(3, 7);

// Lacquered wall: oxblood panels with gilt frames and a faint carved medallion.
const lacquer = canvasTex(512, 512, (g, w, h) => {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2a0705'); bg.addColorStop(1, '#3c0b07');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const pw = w / 2, ph = h / 2;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const x = i * pw, y = j * ph;
    g.strokeStyle = 'rgba(176,128,52,.75)'; g.lineWidth = 3;
    g.strokeRect(x + 14, y + 14, pw - 28, ph - 28);
    g.strokeStyle = 'rgba(176,128,52,.3)'; g.lineWidth = 1;
    g.strokeRect(x + 24, y + 24, pw - 48, ph - 48);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 6;
    g.beginPath(); g.arc(x + pw / 2, y + ph / 2, 52, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(160,110,40,.35)'; g.lineWidth = 2;
    for (let a = 0; a < 8; a++) {
      const t = a / 8 * Math.PI * 2;
      g.beginPath();
      g.ellipse(x + pw / 2 + Math.cos(t) * 30, y + ph / 2 + Math.sin(t) * 30, 16, 7, t, 0, Math.PI * 2);
      g.stroke();
    }
  }
});
lacquer.wrapS = lacquer.wrapT = THREE.RepeatWrapping;
lacquer.repeat.set(5, 4);

// Runner carpet: deep red with a gilt border.
const carpetTex = canvasTex(128, 512, (g, w, h) => {
  g.fillStyle = '#5e0c09'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(${rand() < 0.5 ? '0,0,0' : '140,30,20'},${rand() * 0.12})`;
    g.fillRect(rand() * w, rand() * h, 2, 2);
  }
  g.fillStyle = '#a07a34'; g.fillRect(6, 0, 4, h); g.fillRect(w - 10, 0, 4, h);
  g.fillStyle = 'rgba(160,122,52,.45)'; g.fillRect(16, 0, 2, h); g.fillRect(w - 18, 0, 2, h);
});
carpetTex.wrapT = THREE.RepeatWrapping;
carpetTex.repeat.set(1, 6);

// Lantern silk: vertical ribs, brighter in the middle (light from inside).
const lanternTex = canvasTex(256, 128, (g, w, h) => {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, '#5a0a06'); v.addColorStop(0.5, '#ff6a2a'); v.addColorStop(1, '#5a0a06');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(40,4,2,.55)'; g.fillRect(x, 0, 3, h); }
});

// Light shaft: bright top fading downward and toward both edges.
const shaftTex = canvasTex(64, 256, (g, w, h) => {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  const u = g.createLinearGradient(0, 0, w, 0);
  u.addColorStop(0, 'rgba(0,0,0,0)'); u.addColorStop(0.5, 'rgba(0,0,0,1)'); u.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = u; g.fillRect(0, 0, w, h);
});

function plaqueTex(text) {
  const draw = (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#3a0906'); bg.addColorStop(1, '#250504');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b58a3c'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
    g.strokeStyle = 'rgba(181,138,60,.5)'; g.lineWidth = 2; g.strokeRect(28, 28, w - 56, h - 56);
    g.font = `700 ${h * 0.42}px "Be Vietnam Pro", serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(text, w / 2 + 3, h / 2 + 5);
    g.fillStyle = '#e2b866'; g.fillText(text, w / 2, h / 2 + 2);
  };
  const t = canvasTex(1024, 220, draw);
  // Canvas text drawn before the web font loads falls back; redraw once it is ready.
  document.fonts?.load('700 40px "Be Vietnam Pro"').then(() => { draw(t.image.getContext('2d'), 1024, 220); t.needsUpdate = true; });
  return t;
}

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent?.add(m);
  return m;
}

// Placeholder seated Buddha (~6 units tall) on a lotus throne. Swapped for assets/models/buddha.glb when present.
function placeholderBuddha(gold, petal) {
  const g = new THREE.Group();
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 14; i++) {
    const a = (i + ring * 0.5) / 14 * Math.PI * 2, r = 1.9 - ring * 0.35;
    const p = mesh(new THREE.SphereGeometry(0.5, 16, 10), petal, Math.cos(a) * r, 0.45 + ring * 0.3, Math.sin(a) * r, g);
    p.scale.set(0.7, 0.9, 0.35);
    p.lookAt(0, p.position.y, 0);
    p.rotateX(-0.5);
  }
  const body = [[0, 0.8], [2.0, 0.85], [2.1, 1.25], [1.8, 1.65], [1.15, 1.85], [1.05, 2.6], [1.2, 3.4], [1.0, 3.75], [0.45, 3.95], [0.35, 4.2], [0, 4.25]];
  mesh(new THREE.LatheGeometry(body.map(([x, y]) => new THREE.Vector2(x, y)), 64), gold, 0, 0, 0, g);
  mesh(new THREE.SphereGeometry(0.72, 48, 32), gold, 0, 4.85, 0, g);
  mesh(new THREE.SphereGeometry(0.3, 24, 16), gold, 0, 5.6, 0, g);
  // Aura: a soft warm disc behind the head and a thin gilt ring, kept below bloom blow-out.
  const halo = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), new THREE.MeshBasicMaterial({
    map: glowTex, color: 0xffb860, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.position.set(0, 4.7, -0.9);
  g.add(halo);
  mesh(new THREE.TorusGeometry(1.2, 0.045, 8, 96), gold, 0, 4.85, -0.65, g);
  return g;
}

export function buildHall(scene, { low = false, renderer } = {}) {
  scene.background = new THREE.Color();
  scene.fog = new THREE.FogExp2(0x0a0503, 0.022);

  // Room env map only on lacquer and gilt, so reflections read without lifting the shadows.
  const env = renderer ? new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture : null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  const red = std(0x5c0f0b, { roughness: 0.32, envMap: env, envMapIntensity: 0.35 });
  const gold = std(0xa87a2e, { metalness: 1, roughness: 0.34, envMap: env, envMapIntensity: 0.7 });
  const bronze = std(0x6b4a24, { metalness: 0.9, roughness: 0.45, envMap: env, envMapIntensity: 0.8 });
  const petal = std(0xd9958c, { roughness: 0.55, envMap: env, envMapIntensity: 0.2 });

  const floor = mesh(new THREE.PlaneGeometry(20, 36), std(0xffffff, { map: planks, roughness: 0.55, envMap: env, envMapIntensity: 0.25 }), 0, 0, 2, scene);
  floor.rotation.x = -Math.PI / 2;
  const carpet = mesh(new THREE.PlaneGeometry(2.2, 21), std(0xffffff, { map: carpetTex, roughness: 1 }), 0, 0.01, 3.7, scene);
  carpet.rotation.x = -Math.PI / 2;

  // Altar platform (two steps), table with gilt top, lacquer wall, beam, columns.
  mesh(new THREE.BoxGeometry(11, 0.35, 4.6), red, 0, 0.175, ALTAR.z - 0.9, scene);
  mesh(new THREE.BoxGeometry(11.1, 0.04, 4.7), gold, 0, 0.36, ALTAR.z - 0.9, scene);
  mesh(new THREE.BoxGeometry(8.5, 0.35, 3.6), red, 0, 0.525, ALTAR.z - 1.2, scene);
  mesh(new THREE.BoxGeometry(4.6, 0.9, 1.2), red, 0, 0.8, TABLE_Z, scene);
  mesh(new THREE.BoxGeometry(4.8, 0.08, 1.3), gold, 0, 1.27, TABLE_Z, scene);
  mesh(new THREE.BoxGeometry(4.0, 0.08, 0.02), gold, 0, 0.95, TABLE_Z + 0.61, scene); // apron trim
  mesh(new THREE.PlaneGeometry(20, 16), std(0xffffff, { map: lacquer, roughness: 0.4, envMap: env, envMapIntensity: 0.25 }), 0, 8, WALL_Z, scene);
  const beam = mesh(new THREE.BoxGeometry(20, 0.9, 0.9), red, 0, 13.2, WALL_Z + 0.5, scene);
  mesh(new THREE.BoxGeometry(20, 0.08, 0.92), gold, 0, -0.35, 0, beam);
  for (const x of [-7.6, 7.6]) for (const z of [-10, -4, 2, 8]) {
    mesh(new THREE.CylinderGeometry(0.34, 0.34, 14, 24), red, x, 7, z, scene);
    mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.4, 24), bronze, x, 0.2, z, scene);
    mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.25, 24), gold, x, 13.6, z, scene);
  }

  // Arched niche framing the statue, and the hoành phi plaque above it.
  const nicheShape = new THREE.Shape();
  nicheShape.moveTo(-3.4, 0); nicheShape.lineTo(-3.4, 5.6);
  nicheShape.absarc(0, 5.6, 3.4, Math.PI, 0, true);
  nicheShape.lineTo(3.4, 0); nicheShape.lineTo(-3.4, 0);
  mesh(new THREE.ShapeGeometry(nicheShape, 32), std(0x140403, { roughness: 0.9 }), 0, 0.7, WALL_Z + 0.02, scene);
  mesh(new THREE.TorusGeometry(3.4, 0.08, 8, 64, Math.PI), gold, 0, 6.3, WALL_Z + 0.06, scene).castShadow = false;
  for (const x of [-3.4, 3.4]) mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.6, 8), gold, x, 3.5, WALL_Z + 0.06, scene);
  const plaqueFace = std(0xffffff, { map: plaqueTex('ĐẠI HÙNG BẢO ĐIỆN'), roughness: 0.4, envMap: env, envMapIntensity: 0.3 });
  mesh(new THREE.BoxGeometry(5.2, 1.1, 0.14), [red, red, red, red, plaqueFace, red], 0, 11.2, WALL_Z + 0.25, scene).castShadow = false;

  // Statue gilt is satin, not mirror: a glossy sphere turns the two candle lights into "eyes".
  const statueGold = std(0xa87a2e, { metalness: 0.9, roughness: 0.55, envMap: env, envMapIntensity: 0.9 });
  const buddha = placeholderBuddha(statueGold, petal);
  buddha.position.set(0, 0.7, STATUE_Z);
  scene.add(buddha);
  new GLTFLoader().loadAsync('assets/models/buddha.glb').then(gltf => {
    // Fit the real statue to the placeholder's height, then swap.
    const box = new THREE.Box3().setFromObject(gltf.scene);
    gltf.scene.scale.setScalar(5.8 / (box.max.y - box.min.y));
    gltf.scene.traverse(o => {
      o.castShadow = o.receiveShadow = true;
      if (o.isMesh && env) o.material.envMap ??= env;
    });
    buddha.clear();
    buddha.add(gltf.scene);
  }).catch(() => {});

  // Altar candles: two tall pillars plus a row of votives on the upper step.
  const wax = std(0xf2e4c8, { roughness: 0.5 });
  const flameMat = new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const flameHalo = new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a40, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 });
  const flames = [];
  const addFlame = (x, y, z, size) => {
    const f = new THREE.Sprite(flameMat);
    f.position.set(x, y, z);
    const h = new THREE.Sprite(flameHalo);
    h.position.set(x, y, z);
    scene.add(f, h);
    flames.push({ f, h, size, seed: rand() * 100 });
  };
  for (const x of [-1.8, 1.8]) {
    mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.7, 16), wax, x, 1.66, TABLE_Z, scene);
    mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.06, 16), gold, x, 1.32, TABLE_Z, scene);
    addFlame(x, 2.13, TABLE_Z, 1);
  }
  if (!low) {
    const votives = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10), wax, 16);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 16; i++) {
      const x = -3.75 + i * 0.5, y = 0.78, z = ALTAR.z + 0.35 - (i % 2) * 0.12;
      votives.setMatrixAt(i, m4.makeTranslation(x, y, z));
      addFlame(x, y + 0.14, z, 0.35);
    }
    scene.add(votives);
  }

  // Bronze censer with three incense sticks and glowing tips.
  mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.45, 32), bronze, 0, 1.55, TABLE_Z, scene);
  mesh(new THREE.TorusGeometry(0.42, 0.035, 8, 32), gold, 0, 1.77, TABLE_Z, scene).rotation.x = Math.PI / 2;
  const stick = std(0x6a2a14, { roughness: 0.9 });
  const ember = new THREE.MeshBasicMaterial({ color: 0xff5a1a });
  for (const dx of [-0.08, 0, 0.08]) {
    const s = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), stick, dx, 1.98, TABLE_Z, scene);
    s.rotation.z = dx * 1.5;
    mesh(new THREE.SphereGeometry(0.018, 6, 4), ember, 0, 0.25, 0, s).castShadow = false;
  }

  // Lanterns: ribbed silk lit from inside, gilt caps, tassel, soft halo. Emissive only, no light each.
  const lanternMat = std(0xffffff, { map: lanternTex, emissiveMap: lanternTex, emissive: 0xffffff, roughness: 0.8 });
  const lanternHalo = new THREE.SpriteMaterial({ map: glowTex, color: 0xff6a2a, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 });
  const tassel = std(0x9a1810, { roughness: 0.9 });
  const cord = std(0x2a1a10);
  for (const x of [-5, 5]) for (const z of [-7, -1, 5]) {
    const g = new THREE.Group();
    g.position.set(x, 7.2, z);
    const body = mesh(new THREE.SphereGeometry(0.46, 24, 16), lanternMat, 0, 0, 0, g);
    body.scale.y = 1.2;
    body.castShadow = false;
    mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 16), gold, 0, 0.56, 0, g);
    mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.1, 16), gold, 0, -0.56, 0, g);
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 6, 4), cord, 0, 3.6, 0, g);
    mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.5, 8), tassel, 0, -0.86, 0, g);
    const h = new THREE.Sprite(lanternHalo);
    h.scale.setScalar(2.6);
    g.add(h);
    scene.add(g);
  }

  // Red cushions (bồ đoàn) for every slot, empty or not. Rounded profile, matte felt.
  const cushionGeo = new THREE.LatheGeometry([[0, 0], [0.33, 0], [0.37, 0.04], [0.37, 0.1], [0.33, 0.15], [0, 0.16]].map(([x, y]) => new THREE.Vector2(x, y)), 24);
  const cushions = new THREE.InstancedMesh(cushionGeo, std(0x5a120d, { roughness: 0.95 }), 150);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 150; i++) {
    const p = slotPosition(i);
    cushions.setMatrixAt(i, m4.makeTranslation(p.x, 0, p.z));
  }
  cushions.receiveShadow = true;
  scene.add(cushions);

  // Light shafts from high windows, visible only through the incense haze.
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const shafts = low ? [] : [[-5.5, -0.42, 0], [-3.2, -0.36, 0.25], [4.6, 0.4, -0.15]].map(([x, tilt, yaw]) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 16), shaftMat);
    s.position.set(x, 7, ALTAR.z + 1);
    s.rotation.set(0, yaw, tilt);
    scene.add(s);
    return s;
  });

  // 'ram' extras: full moon and lotus pots.
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, fog: false }));
  moon.position.set(5.2, 12, WALL_Z + 0.1);
  scene.add(moon);
  const lotusDecor = new THREE.Group();
  for (const x of [-4.2, -3, 3, 4.2]) {
    mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 20), bronze, x, 0.95, ALTAR.z - 0.3, lotusDecor);
    mesh(new THREE.SphereGeometry(0.32, 16, 10), std(0xf3a6c0, { emissive: 0x401020 }), x, 1.35, ALTAR.z - 0.3, lotusDecor).scale.y = 0.7;
  }
  scene.add(lotusDecor);

  // Key light from the altar side, a fill from the camera, a warm spot that makes the statue the focal point,
  // and two candle points that pool light on the table and the front rows.
  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.position.set(-4, 14, -4);
  sun.target.position.set(0, 0, 3);
  sun.castShadow = !low;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 14, bottom: -14, near: 1, far: 40 });
  // Fill from the camera side: the camera sees people's backs, which the key light leaves dark.
  const fill = new THREE.DirectionalLight(0xffd8b0);
  fill.position.set(0, 10, 20);
  const spot = new THREE.SpotLight(0xffc27a, 0, 30, 0.42, 0.85, 1.2);
  spot.position.set(0, 12, ALTAR.z + 6);
  spot.target.position.set(0, 4, STATUE_Z);
  scene.add(hemi, sun, sun.target, fill, spot, spot.target);
  const candles = [-1.8, 1.8].map(x => {
    const l = new THREE.PointLight(0xff9a40, 1, 16, 1.5);
    l.position.set(x, 2.4, ALTAR.z + 1.2);
    scene.add(l);
    return l;
  });

  // Theme lerps every number and color over FADE_MS.
  const cur = { ...THEMES.night };
  let from = { ...cur }, to = THEMES.night, t0 = -Infinity;
  const ca = new THREE.Color(), cb = new THREE.Color();
  // Two incommensurate sines per flame: reads as flicker, never as a loop.
  const flick = (now, seed) => 0.82 + 0.18 * Math.sin(now * 0.011 + seed) * Math.sin(now * 0.0067 + seed * 1.7);

  function apply(s, now) {
    scene.background.set(s.bg);
    scene.fog.color.set(s.bg);
    scene.fog.density = s.fog;
    hemi.color.set(s.sky); hemi.groundColor.set(s.ground); hemi.intensity = s.hemi;
    sun.color.set(s.sun); sun.intensity = s.sunI;
    fill.intensity = s.fillI;
    spot.intensity = s.spot * 70;
    const f0 = flick(now, 0);
    for (const l of candles) l.intensity = s.candle * f0 * 7;
    flameMat.opacity = 0.4 + 0.6 * Math.min(1, s.candle / 2);
    for (const { f, h, size, seed } of flames) {
      const k = flick(now, seed);
      f.scale.set(0.16 * size * (0.9 + 0.1 * k), 0.34 * size * k, 1);
      h.scale.setScalar(0.9 * size * k);
    }
    lanternMat.emissiveIntensity = 0.55 * s.glow;
    lanternHalo.opacity = 0.45 * Math.min(1, s.glow);
    for (const sh of shafts) sh.visible = s.shaft > 0.01;
    shaftMat.color.set(s.shaftC).multiplyScalar(s.shaft);
    moon.material.opacity = s.moon;
    moon.visible = s.moon > 0.01;
    lotusDecor.visible = s.lotus > 0.01;
    lotusDecor.scale.setScalar(Math.max(0.01, s.lotus));
  }

  return {
    smokeOrigin: new THREE.Vector3(0, 2.25, TABLE_Z),
    setTheme(name, now) {
      if (!THEMES[name] || THEMES[name] === to) return;
      from = { ...cur }; to = THEMES[name]; t0 = now;
    },
    update(now) {
      const u = Math.min(1, (now - t0) / FADE_MS);
      for (const k in cur) cur[k] = COLOR_KEYS.has(k) ? ca.set(from[k]).lerp(cb.set(to[k]), u).getHex() : from[k] + (to[k] - from[k]) * u;
      apply(cur, now);
    },
  };
}
