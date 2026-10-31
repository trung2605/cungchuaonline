// Procedural main hall, placeholder Buddha, carpet, cushions, lights and themes (BR-07.10, BR-07.16).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ALTAR, slotPosition } from './layout.js';

const THEMES = {
  night: { bg: 0x140904, sky: 0xffd9a0, ground: 0x2a1006, hemi: 0.45, sun: 0xffb060, sunI: 1.4, candle: 3, glow: 1, moon: 0, lotus: 0 },
  day: { bg: 0xcdb48a, sky: 0xfff4e0, ground: 0x6b4a2a, hemi: 0.8, sun: 0xfff1d0, sunI: 2.2, candle: 0.6, glow: 0.3, moon: 0, lotus: 0 },
  ram: { bg: 0x0b1030, sky: 0xa8b8ff, ground: 0x1a0d20, hemi: 0.55, sun: 0xffc070, sunI: 1.1, candle: 2.6, glow: 1.6, moon: 1, lotus: 1 },
};
const COLOR_KEYS = new Set(['bg', 'sky', 'ground', 'sun']);
const FADE_MS = 2000;
const STATUE_Z = ALTAR.z - 0.8;

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const red = std(0x8a1410, { roughness: 0.45 });
const gold = std(0xd4a52a, { metalness: 0.85, roughness: 0.3, emissive: 0x2a1800 });

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent?.add(m);
  return m;
}

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const glowTex = canvasTex(128, 128, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,230,150,1)'); r.addColorStop(0.55, 'rgba(255,190,80,.45)'); r.addColorStop(1, 'rgba(255,160,40,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});

const planks = canvasTex(256, 256, (g, w, h) => {
  for (let y = 0; y < h; y += 32) {
    g.fillStyle = `hsl(25, 50%, ${20 + Math.random() * 8}%)`; g.fillRect(0, y, w, 32);
    g.fillStyle = '#2a1408'; g.fillRect(0, y, w, 1); g.fillRect((y * 37) % w, y, 2, 32);
  }
});
planks.wrapS = planks.wrapT = THREE.RepeatWrapping;
planks.repeat.set(4, 8);

const lattice = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#6e0f0c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c99a3a'; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.beginPath(); g.arc(i * 64 + 32, j * 64 + 32, 22, 0, Math.PI * 2); g.stroke();
    g.strokeRect(i * 64 + 4, j * 64 + 4, 56, 56);
  }
});
lattice.wrapS = lattice.wrapT = THREE.RepeatWrapping;
lattice.repeat.set(6, 4);

// Placeholder seated Buddha (~6 units tall) on a lotus throne. Swapped for assets/models/buddha.glb when present.
function placeholderBuddha() {
  const g = new THREE.Group();
  const petal = std(0xe7a6a0, { roughness: 0.5 });
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 14; i++) {
    const a = (i + ring * 0.5) / 14 * Math.PI * 2, r = 1.9 - ring * 0.35;
    const p = mesh(new THREE.SphereGeometry(0.5, 12, 8), petal, Math.cos(a) * r, 0.45 + ring * 0.3, Math.sin(a) * r, g);
    p.scale.set(0.7, 0.9, 0.35);
    p.lookAt(0, p.position.y, 0);
    p.rotateX(-0.5);
  }
  const body = [[0, 0.8], [2.0, 0.85], [2.1, 1.25], [1.8, 1.65], [1.15, 1.85], [1.05, 2.6], [1.2, 3.4], [1.0, 3.75], [0.45, 3.95], [0.35, 4.2], [0, 4.25]];
  mesh(new THREE.LatheGeometry(body.map(([x, y]) => new THREE.Vector2(x, y)), 48), gold, 0, 0, 0, g);
  mesh(new THREE.SphereGeometry(0.72, 32, 24), gold, 0, 4.85, 0, g);
  mesh(new THREE.SphereGeometry(0.3, 16, 12), gold, 0, 5.6, 0, g);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  halo.position.set(0, 4.5, -0.9);
  g.add(halo);
  mesh(new THREE.TorusGeometry(1.15, 0.06, 8, 64), std(0xffd66b, { emissive: 0xffb030, emissiveIntensity: 1.2 }), 0, 4.85, -0.6, g);
  return g;
}

export function buildHall(scene, { low = false } = {}) {
  scene.background = new THREE.Color();
  scene.fog = new THREE.Fog(0x140904, 34, 70);

  const floor = mesh(new THREE.PlaneGeometry(20, 36), std(0xffffff, { map: planks, roughness: 0.75 }), 0, 0, 2, scene);
  floor.rotation.x = -Math.PI / 2;
  const carpet = mesh(new THREE.PlaneGeometry(2.2, 21), std(0x9c1512, { roughness: 0.9 }), 0, 0.01, 3.7, scene);
  carpet.rotation.x = -Math.PI / 2;

  // Altar platform, table, back wall, columns.
  mesh(new THREE.BoxGeometry(11, 0.35, 4.6), red, 0, 0.175, ALTAR.z - 0.9, scene);
  mesh(new THREE.BoxGeometry(8.5, 0.35, 3.6), red, 0, 0.525, ALTAR.z - 1.2, scene);
  mesh(new THREE.BoxGeometry(4.6, 0.9, 1.2), red, 0, 0.8, ALTAR.z + 0.6, scene);
  mesh(new THREE.BoxGeometry(4.8, 0.08, 1.3), gold, 0, 1.27, ALTAR.z + 0.6, scene);
  mesh(new THREE.PlaneGeometry(20, 16), std(0xffffff, { map: lattice }), 0, 8, ALTAR.z - 3.5, scene);
  for (const x of [-7.6, 7.6]) for (const z of [-10, -4, 2, 8]) {
    mesh(new THREE.CylinderGeometry(0.34, 0.34, 14, 16), red, x, 7, z, scene);
    mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.4, 16), gold, x, 0.2, z, scene);
  }

  const buddha = placeholderBuddha();
  buddha.position.set(0, 0.7, STATUE_Z);
  scene.add(buddha);
  new GLTFLoader().loadAsync('assets/models/buddha.glb').then(gltf => {
    // Fit the real statue to the placeholder's height, then swap.
    const box = new THREE.Box3().setFromObject(gltf.scene);
    gltf.scene.scale.setScalar(5.8 / (box.max.y - box.min.y));
    gltf.scene.traverse(o => { o.castShadow = o.receiveShadow = true; });
    buddha.clear();
    buddha.add(gltf.scene);
  }).catch(() => {});

  // Candles and incense burner on the altar table.
  const flameMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffb040, blending: THREE.AdditiveBlending, depthWrite: false });
  const flames = [-1.8, 1.8].map(x => {
    mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 12), std(0xfff3d6), x, 1.65, ALTAR.z + 0.6, scene);
    const f = new THREE.Sprite(flameMat);
    f.position.set(x, 2.1, ALTAR.z + 0.6);
    scene.add(f);
    return f;
  });
  mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.45, 20), std(0x7a5a2a, { metalness: 0.7, roughness: 0.4 }), 0, 1.55, ALTAR.z + 0.6, scene);

  // Lanterns: emissive only, no light each.
  const lanternMat = std(0xc0201a, { emissive: 0xff5a20 });
  for (const x of [-5, 5]) for (const z of [-7, -1, 5]) {
    const l = mesh(new THREE.SphereGeometry(0.42, 16, 12), lanternMat, x, 7.2, z, scene);
    l.scale.y = 1.25;
    l.castShadow = false;
  }

  // Red cushions (bồ đoàn) for every slot, empty or not.
  const cushions = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.34, 0.36, 0.14, 20), std(0xa0201a, { roughness: 0.85 }), 150);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 150; i++) {
    const p = slotPosition(i);
    cushions.setMatrixAt(i, m4.makeTranslation(p.x, 0.07, p.z));
  }
  cushions.receiveShadow = true;
  scene.add(cushions);

  // 'ram' extras: full moon and lotus pots.
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, fog: false }));
  moon.position.set(5.2, 12, ALTAR.z - 3.4);
  scene.add(moon);
  const lotusDecor = new THREE.Group();
  for (const x of [-4.2, -3, 3, 4.2]) {
    mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 16), std(0x355e3b), x, 0.95, ALTAR.z - 0.3, lotusDecor);
    mesh(new THREE.SphereGeometry(0.32, 12, 8), std(0xf3a6c0, { emissive: 0x401020 }), x, 1.35, ALTAR.z - 0.3, lotusDecor).scale.y = 0.7;
  }
  scene.add(lotusDecor);

  // One shadow-casting key light from the altar side, a sky fill, two candle points.
  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.position.set(-4, 14, -4);
  sun.target.position.set(0, 0, 3);
  sun.castShadow = !low;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 14, bottom: -14, near: 1, far: 40 });
  // Fill from the camera side: the camera sees people's backs, which the key light leaves dark.
  const fill = new THREE.DirectionalLight(0xffe2c0);
  fill.position.set(0, 10, 20);
  scene.add(hemi, sun, sun.target, fill);
  const candles = [-1.8, 1.8].map(x => {
    const l = new THREE.PointLight(0xffa040, 1, 14, 1.6);
    l.position.set(x, 2.4, ALTAR.z + 1.2);
    scene.add(l);
    return l;
  });

  // Theme lerps every number and color over FADE_MS.
  const cur = { ...THEMES.night };
  let from = { ...cur }, to = THEMES.night, t0 = -Infinity;
  const ca = new THREE.Color(), cb = new THREE.Color();

  function apply(s, now) {
    scene.background.set(s.bg);
    scene.fog.color.set(s.bg);
    hemi.color.set(s.sky); hemi.groundColor.set(s.ground); hemi.intensity = s.hemi;
    sun.color.set(s.sun); sun.intensity = s.sunI;
    fill.intensity = s.hemi * 2;
    const flicker = 0.85 + 0.15 * Math.sin(now * 0.013) * Math.sin(now * 0.0071);
    for (const l of candles) l.intensity = s.candle * flicker * 6;
    for (const f of flames) f.scale.setScalar(0.4 + 0.08 * flicker);
    lanternMat.emissiveIntensity = s.glow;
    moon.material.opacity = s.moon;
    moon.visible = s.moon > 0.01;
    lotusDecor.visible = s.lotus > 0.01;
    lotusDecor.scale.setScalar(Math.max(0.01, s.lotus));
  }

  return {
    smokeOrigin: new THREE.Vector3(0, 1.9, ALTAR.z + 0.6),
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
