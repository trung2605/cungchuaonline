// Advanced 3D Visual Effects & Atmospheric Graphics Engine for Hành Trình Đi Bộ Xuyên Việt
// Powered by Three.js + GSAP + Simplex-Noise + Canvas-Confetti
// Includes:
// 1. 3D Volumetric Sunbeams / God-Rays (Simplex-noise modulated light shafts)
// 2. Biome-Aware 3D Curl-Noise Particle System (Peach blossoms, Fireflies, Sea sparkles, Lotus petals)
// 3. 3D Multi-Stage Festival Fireworks (Aerial shells + spherical chrysanthemum bursts)
// 4. 3D Rainbow Speed Gates along the curved landmark trail (`getTrailPose`)
// 5. 3D Golden Dragon Double-Helix & GSAP Expanding Shockwave Rings
// 6. 3D Floating Sky Lanterns (Thiên Đăng Hội An / Cố Đô)
// 7. Celebratory HUD Confetti bursts (`canvas-confetti`)
import * as THREE from 'three';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { createNoise3D } from 'simplex-noise';
import { glowTex, canvasTex, getTrailPose } from './world3d.js';

const noise3D = createNoise3D();

// Procedural particle textures
const petalTex = canvasTex(64, 64, g => {
  const r = g.createRadialGradient(28, 28, 2, 32, 32, 28);
  r.addColorStop(0, '#fff5f8');
  r.addColorStop(0.55, '#fb7185');
  r.addColorStop(1, 'rgba(244, 63, 94, 0)');
  g.fillStyle = r;
  g.beginPath();
  g.ellipse(32, 32, 15, 27, 0.5, 0, Math.PI * 2);
  g.fill();
});

const starSparkTex = canvasTex(64, 64, g => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.3, 'rgba(253,224,71,0.92)');
  r.addColorStop(1, 'rgba(251,146,60,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(30, 4, 4, 56);
  g.fillRect(4, 30, 56, 4);
});

const beamTex = canvasTex(64, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(255, 243, 196, 0.22)');
  gr.addColorStop(0.45, 'rgba(255, 232, 168, 0.09)');
  gr.addColorStop(1, 'rgba(255, 220, 140, 0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
});

const FIREWORK_PALETTE = [
  0xff3b30, // Đỏ cờ Tổ Quốc
  0xfacc15, // Vàng sao
  0x38bdf8, // Xanh biển Đông
  0x34d399, // Xanh ngọc Tây Bắc
  0xf472b6, // Hồng sen Đồng Tháp
  0xa78bfa, // Tím Huế
];

const BIOME_AMBIENT_PROFILES = {
  vn_hagiang: { color: 0xfda4af, usePetal: true, size: 0.24, speedY: -0.35, wind: 0.9, beamColor: 0xffe4b5 },
  vn_sapa:    { color: 0xfef08a, usePetal: false, size: 0.20, speedY: 0.18, wind: 0.7, beamColor: 0xfff3c4 },
  vn_halong:  { color: 0x7dd3fc, usePetal: false, size: 0.19, speedY: 0.22, wind: 0.5, beamColor: 0xe0f2fe },
  vn_hanoi:   { color: 0xfde047, usePetal: true, size: 0.22, speedY: -0.28, wind: 0.6, beamColor: 0xffedd5 },
  vn_ninhbinh:{ color: 0xfbcfe8, usePetal: true, size: 0.23, speedY: -0.25, wind: 0.55, beamColor: 0xfef3c7 },
  vn_hue:     { color: 0xe9d5ff, usePetal: true, size: 0.22, speedY: -0.22, wind: 0.5, beamColor: 0xf3e8ff },
  vn_danang:  { color: 0xfde047, usePetal: false, size: 0.21, speedY: 0.30, wind: 0.75, beamColor: 0xfef08a },
  vn_hoian:   { color: 0xfb923c, usePetal: false, size: 0.24, speedY: 0.42, wind: 0.45, beamColor: 0xffedd5 },
  vn_dalat:   { color: 0xfda4af, usePetal: true, size: 0.23, speedY: -0.30, wind: 0.8, beamColor: 0xfef3c7 },
  vn_nhatrang:{ color: 0x38bdf8, usePetal: false, size: 0.20, speedY: 0.26, wind: 0.65, beamColor: 0xe0f2fe },
  vn_saigon:  { color: 0xfacc15, usePetal: false, size: 0.22, speedY: 0.35, wind: 0.6, beamColor: 0xfef08a },
  vn_mientay: { color: 0xf9a8d4, usePetal: true, size: 0.23, speedY: -0.24, wind: 0.55, beamColor: 0xffedd5 },
};

export function createRaceFx(scene) {
  const fxRoot = new THREE.Group();
  scene.add(fxRoot);

  const rnd = (a, b) => a + Math.random() * (b - a);
  let clockT = 0;
  let currentBiomeId = 'vn_hagiang';

  // ==========================================================================
  // 1. VOLUMETRIC GOD-RAYS / SUNBEAMS (5 Angled Light Shafts in the Sky)
  // ==========================================================================
  const sunbeamGroup = new THREE.Group();
  fxRoot.add(sunbeamGroup);
  const sunbeams = [];
  const beamGeo = new THREE.ConeGeometry(2.6, 18, 16, 1, true);
  for (let i = 0; i < 4; i++) {
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      color: 0xffe8b0,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(beamGeo, beamMat);
    mesh.position.set(-6 + i * 4.2, 8.5, -18 - (i % 2) * 6);
    mesh.rotation.z = -0.22 + i * 0.08;
    mesh.rotation.x = 0.12;
    sunbeamGroup.add(mesh);
    sunbeams.push({ mesh, baseX: mesh.position.x, baseRotZ: mesh.rotation.z, phase: i * 1.7 });
  }

  // ==========================================================================
  // 2. BIOME CURL-NOISE AMBIENT PARTICLE SYSTEM (Petals / Fireflies / Sparkles)
  // ==========================================================================
  const maxAmbient = 320;
  const ambPos = new Float32Array(maxAmbient * 3);
  const ambVel = new Float32Array(maxAmbient * 3);
  const ambLife = new Float32Array(maxAmbient);
  const ambMaxLife = new Float32Array(maxAmbient);
  for (let i = 0; i < maxAmbient; i++) {
    ambPos[i * 3] = rnd(-9, 9);
    ambPos[i * 3 + 1] = rnd(0.4, 8.5);
    ambPos[i * 3 + 2] = rnd(-34, 10);
    ambLife[i] = rnd(0.2, 4.0);
    ambMaxLife[i] = 4.0;
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({
    map: petalTex,
    size: 0.22,
    color: 0xfda4af,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ambPoints = new THREE.Points(ambGeo, ambMat);
  ambPoints.frustumCulled = false;
  fxRoot.add(ambPoints);

  // ==========================================================================
  // 3. 3D MULTI-STAGE FIREWORKS & STARBURST SYSTEM (700 Additive Sparks)
  // ==========================================================================
  const maxSparks = 750;
  const spPos = new Float32Array(maxSparks * 3).fill(-200);
  const spVel = new Float32Array(maxSparks * 3);
  const spCol = new Float32Array(maxSparks * 3).fill(1);
  const spLife = new Float32Array(maxSparks);
  const spMaxLife = new Float32Array(maxSparks).fill(1);
  const spGravity = new Float32Array(maxSparks);

  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  spGeo.setAttribute('color', new THREE.BufferAttribute(spCol, 3));
  const spMat = new THREE.PointsMaterial({
    map: starSparkTex,
    size: 0.34,
    transparent: true,
    opacity: 0.92,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const spPoints = new THREE.Points(spGeo, spMat);
  spPoints.frustumCulled = false;
  fxRoot.add(spPoints);

  let spCursor = 0;
  const tmpColor = new THREE.Color();

  function emitSpark(x, y, z, vx, vy, vz, hexColor, ttl = 1.6, grav = -2.4) {
    const i = spCursor;
    spCursor = (spCursor + 1) % maxSparks;
    const j = i * 3;
    spPos[j] = x;
    spPos[j + 1] = y;
    spPos[j + 2] = z;
    spVel[j] = vx;
    spVel[j + 1] = vy;
    spVel[j + 2] = vz;
    tmpColor.setHex(hexColor);
    spCol[j] = tmpColor.r;
    spCol[j + 1] = tmpColor.g;
    spCol[j + 2] = tmpColor.b;
    spLife[i] = ttl;
    spMaxLife[i] = ttl;
    spGravity[i] = grav;
  }

  function spawnFireworkBurst(cx, cy, cz, mainColorHex, count = 75) {
    const secondaryHex = FIREWORK_PALETTE[Math.floor(Math.random() * FIREWORK_PALETTE.length)];
    for (let i = 0; i < count; i++) {
      // Fibonacci / uniform sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const speed = rnd(2.2, 6.2);
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed + 0.8;
      const vz = Math.cos(phi) * speed;
      const col = i % 3 === 0 ? 0xffffff : i % 2 === 0 ? mainColorHex : secondaryHex;
      emitSpark(cx, cy, cz, vx, vy, vz, col, rnd(1.1, 2.1), -2.6);
    }
  }

  // ==========================================================================
  // 4. GSAP 3D SHOCKWAVE RINGS, RAINBOW GATES & SKY LANTERNS
  // ==========================================================================
  const activeMeshes = new THREE.Group();
  fxRoot.add(activeMeshes);

  const ringGeo = new THREE.RingGeometry(0.6, 0.92, 36);
  ringGeo.rotateX(-Math.PI / 2);

  const gateGeo = new THREE.TorusGeometry(2.85, 0.09, 12, 42, Math.PI);

  const lanternBodyGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.42, 10);

  function spawnShockwaveRings(colorHex = 0xfacc15, ringCount = 3) {
    const pose0 = getTrailPose(2.5);
    for (let i = 0; i < ringCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? colorHex : 0xffffff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.position.set(pose0.x, pose0.y + 0.08 + i * 0.05, 2.5);
      ring.scale.setScalar(0.2);
      activeMeshes.add(ring);

      gsap.to(ring.scale, {
        x: 6.5 + i * 1.4,
        y: 6.5 + i * 1.4,
        z: 6.5 + i * 1.4,
        duration: 1.35,
        delay: i * 0.14,
        ease: 'power2.out',
      });
      gsap.to(mat, {
        opacity: 0,
        duration: 1.35,
        delay: i * 0.14,
        ease: 'power2.out',
        onComplete: () => {
          activeMeshes.remove(ring);
          mat.dispose();
        },
      });
    }
  }

  function spawnRainbowSpeedGates(gateCount = 5) {
    const gateColors = [0xff3b30, 0xfacc15, 0x34d399, 0x38bdf8, 0xc084fc];
    for (let i = 0; i < gateCount; i++) {
      const z = -2 - i * 4.2;
      const pose = getTrailPose(z);
      const mat = new THREE.MeshBasicMaterial({
        color: gateColors[i % gateColors.length],
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const gate = new THREE.Mesh(gateGeo, mat);
      gate.position.set(pose.x, pose.y + 0.05, z);
      gate.rotation.y = -pose.yaw * 0.7;
      gate.scale.setScalar(0.3);
      activeMeshes.add(gate);

      gsap.to(gate.scale, {
        x: 1.18,
        y: 1.18,
        z: 1.18,
        duration: 0.55,
        delay: i * 0.09,
        ease: 'back.out(1.6)',
      });
      gsap.to(mat, {
        opacity: 0.78,
        duration: 0.35,
        delay: i * 0.09,
        yoyo: true,
        repeat: 1,
        repeatDelay: 1.1,
        onComplete: () => {
          activeMeshes.remove(gate);
          mat.dispose();
        },
      });
    }
  }

  function spawnSkyLanterns(count = 10) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffedd5 : 0xfde047,
        transparent: true,
        opacity: 0.92,
      });
      const lantern = new THREE.Mesh(lanternBodyGeo, mat);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xfb923c,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      glow.scale.setScalar(1.15);
      lantern.add(glow);

      const startX = rnd(-6.5, 6.5);
      const startY = rnd(1.2, 3.2);
      const startZ = rnd(-18, 4);
      lantern.position.set(startX, startY, startZ);
      lantern.scale.setScalar(0.01);
      activeMeshes.add(lantern);

      gsap.to(lantern.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'back.out(1.7)',
      });
      gsap.to(lantern.position, {
        x: startX + rnd(-2.2, 2.2),
        y: startY + rnd(7.5, 11.5),
        z: startZ - rnd(2, 6),
        duration: rnd(4.2, 6.0),
        delay: i * 0.08,
        ease: 'sine.inOut',
      });
      gsap.to(mat, {
        opacity: 0,
        duration: 1.2,
        delay: 3.6 + i * 0.08,
        onComplete: () => {
          activeMeshes.remove(lantern);
          mat.dispose();
        },
      });
    }
  }

  function spawnGoldenDragonHelix() {
    // Double-helix of 48 golden dragon energy orbs spiraling upward along the trail!
    for (let i = 0; i < 48; i++) {
      const t = i / 48;
      const z = 5 - t * 22;
      const pose = getTrailPose(z);
      const angle = t * Math.PI * 6;
      const radius = 1.65;
      const ox = pose.x + Math.cos(angle) * radius;
      const oy = pose.y + 0.6 + t * 4.5 + Math.sin(angle) * 0.45;
      emitSpark(ox, oy, z, Math.cos(angle + 1.5) * 1.4, 2.2, -1.5, 0xfacc15, 1.8, -0.3);
      emitSpark(
        pose.x - Math.cos(angle) * radius,
        pose.y + 0.6 + t * 4.5 - Math.sin(angle) * 0.45,
        z,
        -Math.cos(angle + 1.5) * 1.4,
        2.2,
        -1.5,
        0xff3b30,
        1.8,
        -0.3
      );
    }
  }

  function triggerHudConfetti(power = 5) {
    try {
      if (typeof confetti !== 'function') return;
      confetti({
        particleCount: Math.min(70, 22 + power * 6),
        spread: 78,
        origin: { x: 0.5, y: 0.26 },
        colors: ['#da251d', '#facc15', '#38bdf8', '#10b981', '#f472b6'],
        disableForReducedMotion: true,
      });
    } catch {}
  }

  return {
    setBiome(biomeId) {
      if (!biomeId || biomeId === currentBiomeId) return;
      currentBiomeId = biomeId;
      const prof = BIOME_AMBIENT_PROFILES[biomeId] || BIOME_AMBIENT_PROFILES.vn_hagiang;
      ambMat.map = prof.usePetal ? petalTex : starSparkTex;
      ambMat.size = prof.size;
      ambMat.needsUpdate = true;

      const targetCol = new THREE.Color(prof.color);
      gsap.to(ambMat.color, { r: targetCol.r, g: targetCol.g, b: targetCol.b, duration: 1.2 });

      const beamCol = new THREE.Color(prof.beamColor);
      for (const b of sunbeams) {
        gsap.to(b.mesh.material.color, { r: beamCol.r, g: beamCol.g, b: beamCol.b, duration: 1.2 });
      }

      // Celebratory 3D firework burst when entering a new Vietnamese landmark!
      spawnFireworkBurst(rnd(-3.5, 3.5), rnd(7.2, 9.8), rnd(-16, -22), prof.color, 55);
    },

    spawn(kind = 'cheer', power = 5) {
      const p = Math.max(1, Math.min(12, Number(power) || 5));

      if (kind === 'rainbow' || kind === 'turbo') {
        spawnRainbowSpeedGates(5);
        spawnShockwaveRings(0x38bdf8, 3);
        spawnFireworkBurst(-2.8, 8.2, -16, 0x38bdf8, 65);
        spawnFireworkBurst(2.8, 8.8, -18, 0xfacc15, 65);
        triggerHudConfetti(p);
      } else if (kind === 'rocket' || kind === 'warp') {
        spawnGoldenDragonHelix();
        spawnShockwaveRings(0xfacc15, 4);
        spawnRainbowSpeedGates(4);
        for (let k = 0; k < 3; k++) {
          setTimeout(() => {
            spawnFireworkBurst(rnd(-4.2, 4.2), rnd(7.0, 10.5), rnd(-14, -24), FIREWORK_PALETTE[k % FIREWORK_PALETTE.length], 80);
          }, k * 220);
        }
        triggerHudConfetti(p + 3);
      } else if (kind === 'hover' || kind === 'lamp' || kind === 'lantern_festival') {
        spawnSkyLanterns(12);
        spawnShockwaveRings(0xfb923c, 2);
      } else {
        // Default / 'cheer' / 'wings' / gift bursts
        spawnShockwaveRings(0xfacc15, 2);
        spawnSkyLanterns(6);
        const col = FIREWORK_PALETTE[Math.floor(Math.random() * FIREWORK_PALETTE.length)];
        spawnFireworkBurst(rnd(-3.2, 3.2), rnd(7.2, 9.6), rnd(-15, -21), col, 60);
        if (p >= 5) triggerHudConfetti(p);
      }
    },

    update(dt) {
      clockT += dt;
      const prof = BIOME_AMBIENT_PROFILES[currentBiomeId] || BIOME_AMBIENT_PROFILES.vn_hagiang;

      // 1. Animate Volumetric Sunbeams using Simplex 3D Noise
      for (let i = 0; i < sunbeams.length; i++) {
        const b = sunbeams[i];
        const n = noise3D(i * 0.7, clockT * 0.22, 0);
        b.mesh.position.x = b.baseX + n * 1.1;
        b.mesh.rotation.z = b.baseRotZ + n * 0.06;
        b.mesh.material.opacity = 0.11 + (Math.sin(clockT * 0.9 + b.phase) * 0.5 + 0.5) * 0.08;
      }

      // 2. Update Biome Ambient Particles with 3D Simplex Noise Curl Turbulence
      for (let i = 0; i < maxAmbient; i++) {
        const j = i * 3;
        ambLife[i] -= dt;
        if (ambLife[i] <= 0 || ambPos[j + 1] < 0.2 || ambPos[j + 1] > 10.5 || ambPos[j + 2] > 13) {
          ambPos[j] = rnd(-9.5, 9.5);
          ambPos[j + 1] = prof.speedY < 0 ? rnd(4.5, 9.2) : rnd(0.5, 4.5);
          ambPos[j + 2] = rnd(-34, 6);
          ambLife[i] = rnd(2.8, 5.5);
          continue;
        }
        const nx = noise3D(ambPos[j] * 0.18, ambPos[j + 1] * 0.18, clockT * 0.35);
        const nz = noise3D(ambPos[j + 2] * 0.18, clockT * 0.35, i * 0.1);
        ambPos[j] += nx * prof.wind * dt;
        ambPos[j + 1] += prof.speedY * dt + Math.sin(clockT * 1.8 + i) * 0.08 * dt;
        ambPos[j + 2] += (1.15 + nz * 0.5) * dt;
      }
      ambGeo.attributes.position.needsUpdate = true;

      // 3. Update 3D Firework & Dragon Helix Sparks
      let anySparkActive = false;
      for (let i = 0; i < maxSparks; i++) {
        if (spLife[i] <= 0) continue;
        anySparkActive = true;
        spLife[i] -= dt;
        const j = i * 3;
        if (spLife[i] <= 0) {
          spPos[j + 1] = -200;
          continue;
        }
        spVel[j + 1] += spGravity[i] * dt;
        // Air drag for realistic firework burst deceleration
        spVel[j] *= 1 - 0.85 * dt;
        spVel[j + 2] *= 1 - 0.85 * dt;
        spPos[j] += spVel[j] * dt;
        spPos[j + 1] += spVel[j + 1] * dt;
        spPos[j + 2] += spVel[j + 2] * dt;
      }
      if (anySparkActive) {
        spGeo.attributes.position.needsUpdate = true;
        spGeo.attributes.color.needsUpdate = true;
      }
    },
  };
}
