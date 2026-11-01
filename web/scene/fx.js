// Sacred 3D Temple Particle & Light Effects (BR-07.7).
// Includes: Incense Smoke, Pink Lotus Rain, Golden Apricot/Nectar Rain, Sky Lantern Festival,
// Dharma Wheel 3D Mandala, Buddha Light Pillars, and Great Bell Golden Shockwaves.
import * as THREE from 'three';
import { canvasTex, glowTex } from './hall.js';
import { ALTAR } from './layout.js';

const petalTex = canvasTex(64, 64, g => {
  const r = g.createRadialGradient(28, 28, 2, 32, 32, 26);
  r.addColorStop(0, '#ffeef5');
  r.addColorStop(0.55, '#f7a4c2');
  r.addColorStop(1, 'rgba(232, 112, 156, 0)');
  g.fillStyle = r;
  g.beginPath();
  g.ellipse(32, 32, 14, 26, 0.55, 0, Math.PI * 2);
  g.fill();
});

const lotusTex = canvasTex(96, 96, g => {
  g.translate(48, 48);
  for (let i = 0; i < 8; i++) {
    g.save();
    g.rotate((i * Math.PI) / 4);
    const r = g.createLinearGradient(0, -40, 0, 10);
    r.addColorStop(0, '#ffffff');
    r.addColorStop(0.55, '#f8a8c6');
    r.addColorStop(1, '#d96b96');
    g.fillStyle = r;
    g.beginPath();
    g.moveTo(0, -40);
    g.quadraticCurveTo(16, -16, 0, 4);
    g.quadraticCurveTo(-16, -16, 0, -40);
    g.fill();
    g.restore();
  }
  const core = g.createRadialGradient(0, 0, 0, 0, 0, 12);
  core.addColorStop(0, '#fff7c2');
  core.addColorStop(1, '#e6a832');
  g.fillStyle = core;
  g.beginPath();
  g.arc(0, 0, 10, 0, Math.PI * 2);
  g.fill();
});

const goldLotusTex = canvasTex(96, 96, g => {
  g.translate(48, 48);
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i * Math.PI * 2) / 5);
    const r = g.createLinearGradient(0, -38, 0, 8);
    r.addColorStop(0, '#fffbe0');
    r.addColorStop(0.5, '#ffd466');
    r.addColorStop(1, '#c98a1e');
    g.fillStyle = r;
    g.beginPath();
    g.arc(0, -20, 13, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#fff5cc';
  g.beginPath();
  g.arc(0, 0, 8, 0, Math.PI * 2);
  g.fill();
});

const lanternTex = canvasTex(96, 96, g => {
  // Soft outer golden aura
  const aura = g.createRadialGradient(48, 50, 4, 48, 50, 46);
  aura.addColorStop(0, 'rgba(255, 245, 200, 1)');
  aura.addColorStop(0.45, 'rgba(255, 190, 75, 0.72)');
  aura.addColorStop(1, 'rgba(255, 120, 20, 0)');
  g.fillStyle = aura;
  g.fillRect(0, 0, 96, 96);

  // Warm paper sky-lantern body
  const bodyGrad = g.createLinearGradient(48, 18, 48, 74);
  bodyGrad.addColorStop(0, '#ffdf8e');
  bodyGrad.addColorStop(0.5, '#ffae42');
  bodyGrad.addColorStop(1, '#d9531e');
  g.fillStyle = bodyGrad;
  g.beginPath();
  g.moveTo(30, 24);
  g.quadraticCurveTo(48, 14, 66, 24);
  g.lineTo(60, 68);
  g.quadraticCurveTo(48, 74, 36, 68);
  g.closePath();
  g.fill();

  // Bright inner flame heart
  const flame = g.createRadialGradient(48, 56, 0, 48, 56, 16);
  flame.addColorStop(0, '#ffffff');
  flame.addColorStop(0.6, '#ffe89c');
  flame.addColorStop(1, 'rgba(255, 180, 50, 0)');
  g.fillStyle = flame;
  g.beginPath();
  g.arc(48, 56, 16, 0, Math.PI * 2);
  g.fill();
});

const goldSparkTex = canvasTex(64, 64, g => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  r.addColorStop(0, 'rgba(255, 252, 225, 1)');
  r.addColorStop(0.32, 'rgba(255, 212, 105, 0.9)');
  r.addColorStop(1, 'rgba(255, 160, 30, 0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  // Subtle 4-point star cross
  g.fillStyle = 'rgba(255, 250, 220, 0.85)';
  g.fillRect(30, 6, 4, 52);
  g.fillRect(6, 30, 52, 4);
});

const mandalaTex = canvasTex(256, 256, g => {
  g.translate(128, 128);
  const outer = g.createRadialGradient(0, 0, 20, 0, 0, 124);
  outer.addColorStop(0, 'rgba(255, 230, 150, 0.35)');
  outer.addColorStop(0.65, 'rgba(245, 195, 85, 0.48)');
  outer.addColorStop(0.92, 'rgba(255, 215, 100, 0.75)');
  outer.addColorStop(1, 'rgba(255, 200, 80, 0)');
  g.fillStyle = outer;
  g.beginPath();
  g.arc(0, 0, 124, 0, Math.PI * 2);
  g.fill();

  g.strokeStyle = 'rgba(255, 232, 156, 0.88)';
  g.lineWidth = 3;
  for (const rad of [36, 68, 96, 114]) {
    g.beginPath();
    g.arc(0, 0, rad, 0, Math.PI * 2);
    g.stroke();
  }
  // 12 Dharma spokes & lotus petals
  for (let i = 0; i < 12; i++) {
    g.save();
    g.rotate((i * Math.PI) / 6);
    g.beginPath();
    g.moveTo(0, -34);
    g.quadraticCurveTo(18, -74, 0, -110);
    g.quadraticCurveTo(-18, -74, 0, -34);
    g.stroke();
    g.restore();
  }
});

// Lumpy puff: several offset soft blobs, so overlapping particles read as a wisp, not as dots.
const smokeTex = canvasTex(128, 128, (g, w) => {
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, d = i ? 18 + (i % 3) * 8 : 0;
    const x = w / 2 + Math.cos(a) * d, y = w / 2 + Math.sin(a) * d, r = 34 - (i % 3) * 6;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  }
});

// Incense smoke: each puff grows, fades in then out, drifts sideways on a slow curl.
function smokeSystem(scene, max) {
  const pos = new Float32Array(max * 3).fill(-100), vel = new Float32Array(max * 3);
  const age = new Float32Array(max), life = new Float32Array(max).fill(1), seed = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('age', new THREE.BufferAttribute(age, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: smokeTex }, tint: { value: new THREE.Color(0xc8b49c) }, alpha: { value: 0.24 } },
    vertexShader: `
      attribute float age; attribute float seed;
      varying float vAge; varying float vRot;
      void main() {
        vAge = age; vRot = seed * 6.28 + age * (seed - 0.5) * 3.5;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = mix(0.32, 2.35, sqrt(age)) * 1150.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D map; uniform vec3 tint; uniform float alpha;
      varying float vAge; varying float vRot;
      void main() {
        if (vAge <= 0.0 || vAge >= 1.0) discard;
        vec2 p = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        vec4 t = texture2D(map, vec2(c * p.x - s * p.y, s * p.x + c * p.y) + 0.5);
        float a = t.a * alpha * smoothstep(0.0, 0.14, vAge) * pow(1.0 - vAge, 1.35);
        gl_FragColor = vec4(tint, a);
      }`,
    transparent: true, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  let next = 0;
  return {
    emit(x, y, z, vx, vy, vz, seconds) {
      const i = next;
      next = (next + 1) % max;
      pos.set([x, y, z], i * 3);
      vel.set([vx, vy, vz], i * 3);
      age[i] = 0.0001;
      life[i] = seconds;
      seed[i] = Math.random();
    },
    update(dt, t) {
      for (let i = 0; i < max; i++) {
        if (age[i] <= 0) continue;
        age[i] += dt / life[i];
        if (age[i] >= 1) { age[i] = 0; pos[i * 3 + 1] = -100; continue; }
        const j = i * 3, a = age[i];
        const curl = Math.sin(t * 0.9 + seed[i] * 9 + a * 5) * 0.12 * a;
        pos[j] += (vel[j] + curl) * dt;
        pos[j + 1] += vel[j + 1] * (1 - 0.6 * a) * dt;
        pos[j + 2] += (vel[j + 2] + Math.cos(t * 0.7 + seed[i] * 5) * 0.05 * a) * dt;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.age.needsUpdate = true;
      geo.attributes.seed.needsUpdate = true;
    },
  };
}

function pool(scene, { tex, max, size, additive = false, floor = false, gravity = 0, sway = 0 }) {
  const pos = new Float32Array(max * 3).fill(-100), vel = new Float32Array(max * 3), col = new Float32Array(max * 3).fill(1);
  const life = new Float32Array(max), ttl = new Float32Array(max).fill(1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    map: tex, size, transparent: true, depthWrite: false, vertexColors: true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  }));
  points.frustumCulled = false;
  scene.add(points);
  let next = 0;
  return {
    emit(x, y, z, vx, vy, vz, seconds) {
      const i = next;
      next = (next + 1) % max;
      pos.set([x, y, z], i * 3);
      vel.set([vx, vy, vz], i * 3);
      life[i] = ttl[i] = seconds;
    },
    update(dt, t) {
      for (let i = 0; i < max; i++) {
        if (life[i] <= 0) continue;
        const j = i * 3;
        life[i] -= dt;
        if (life[i] <= 0) { pos[j + 1] = -100; continue; }
        vel[j + 1] += gravity * dt;
        pos[j] += (vel[j] + Math.sin(t * 1.7 + i) * sway) * dt;
        pos[j + 1] += vel[j + 1] * dt;
        pos[j + 2] += vel[j + 2] * dt;
        if (floor && pos[j + 1] < 0.03) { pos[j + 1] = 0.03; vel[j] = vel[j + 1] = vel[j + 2] = 0; }
        if (additive) col.fill(Math.min(1, life[i] / 1.2, (ttl[i] - life[i]) * 3), j, j + 3);
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = additive;
    },
  };
}

export function createFx(scene, { low = false, smokeOrigin }) {
  const q = low ? 0.5 : 1;
  const P = {
    petal: pool(scene, { tex: petalTex, max: 1400, size: 0.26, floor: true, gravity: -0.14, sway: 0.65 }),
    lotus: pool(scene, { tex: lotusTex, max: 1100, size: 0.44, floor: true, gravity: -0.09, sway: 0.78 }),
    goldLotus: pool(scene, { tex: goldLotusTex, max: 900, size: 0.38, floor: true, gravity: -0.12, sway: 0.68 }),
    smoke: smokeSystem(scene, 560),
    lamp: pool(scene, { tex: lanternTex, max: 240, size: 1.05, additive: true, sway: 0.32 }),
    glow: pool(scene, { tex: glowTex, max: 20, size: 6.4, additive: true }),
    spark: pool(scene, { tex: goldSparkTex, max: 900, size: 0.32, additive: true, sway: 0.52 }),
  };

  // 1. Expanding Golden Soundwave Rings on Hall Floor
  const rings = Array.from({ length: 8 }, () => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.0, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffd86b,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(ALTAR.x, 0.05, ALTAR.z + 1.2);
    m.visible = false;
    scene.add(m);
    return Object.assign(m, { t0: -Infinity });
  });

  // 2. Sacred Rotating 3D Dharma Wheel Mandala (Floor & Behind-Buddha Halo)
  const floorMandalaMat = new THREE.MeshBasicMaterial({
    map: mandalaTex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const floorMandala = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 7.6), floorMandalaMat);
  floorMandala.rotation.x = -Math.PI / 2;
  floorMandala.position.set(0, 0.04, 2.2);
  floorMandala.visible = false;
  scene.add(floorMandala);

  const buddhaMandalaMat = new THREE.MeshBasicMaterial({
    map: mandalaTex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const buddhaMandala = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), buddhaMandalaMat);
  buddhaMandala.position.set(ALTAR.x, 4.65, ALTAR.z - 0.55);
  buddhaMandala.visible = false;
  scene.add(buddhaMandala);

  // 3. Divine Golden Light Pillars descending from Temple Roof
  const lightPillars = [-3.2, -1.6, 0, 1.6, 3.2].map((px, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      color: idx === 2 ? 0xffe694 : 0xffcc66,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 1.05, 10.5, 20, 1, true), mat);
    cyl.position.set(px, 5.2, idx === 2 ? ALTAR.z + 0.5 : 1.2 + (idx % 2) * 2.2);
    cyl.visible = false;
    scene.add(cyl);
    return { mesh: cyl, mat, phase: idx * 1.1 };
  });

  let ring = 0;
  let smokeUntil = 0, smokePower = 0;
  let lotusUntil = 0, goldRainUntil = 0, blossomUntil = 0, lanternUntil = 0;
  let mandalaUntil = 0, buddhaAuraUntil = 0;
  let smokeAcc = 0, lotusAcc = 0, goldRainAcc = 0, blossomAcc = 0, lanternAcc = 0, sparkAcc = 0, spiralAngle = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);

  function triggerFloorRipples(now, count = 3, spacingMs = 340) {
    for (let i = 0; i < count; i++) {
      const r = rings[ring++ % rings.length];
      r.t0 = now + i * spacingMs;
    }
  }

  return {
    spawn(kind, pos = { x: ALTAR.x, z: ALTAR.z }, power = 5, now = performance.now()) {
      const { x = ALTAR.x, z = ALTAR.z } = pos || {};
      if (kind === 'flower' || kind === 'peach_blossom') {
        blossomUntil = Math.max(blossomUntil, now + (kind === 'peach_blossom' ? 7000 : 3500));
        for (let i = 0; i < 16 * power * q; i++) {
          P.petal.emit(x + rnd(-2.2, 2.2), rnd(2.2, 5.5), z + rnd(-2.2, 2.2), rnd(-0.2, 0.2), rnd(-0.65, -0.25), rnd(-0.2, 0.2), 6.5);
        }
        for (let i = 0; i < 10 * power * q; i++) {
          P.goldLotus.emit(x + rnd(-2.4, 2.4), rnd(2.5, 6.2), z + rnd(-2.0, 2.0), rnd(-0.18, 0.18), rnd(-0.58, -0.22), rnd(-0.15, 0.15), 6.5);
          P.spark.emit(x + rnd(-1.4, 1.4), rnd(0.5, 3.0), z + rnd(-1.4, 1.4), rnd(-0.12, 0.12), rnd(0.3, 0.7), rnd(-0.12, 0.12), 4.2);
        }
      } else if (kind === 'lamp' || kind === 'lantern_festival') {
        const isFestival = kind === 'lantern_festival' || power >= 8;
        if (isFestival) lanternUntil = Math.max(lanternUntil, now + 7500);
        const count = Math.min(28, Math.max(6, power * 3));
        for (let i = 0; i < count; i++) {
          const lx = isFestival ? rnd(-5.5, 5.5) : x + rnd(-1.4, 1.4);
          const lz = isFestival ? rnd(-3.5, 9.5) : z + rnd(-1.4, 1.4);
          P.lamp.emit(lx, rnd(0.8, 2.4), lz, rnd(-0.14, 0.14), rnd(0.65, 1.18), rnd(-0.14, 0.14), rnd(8.5, 11.5));
        }
        for (let i = 0; i < 28 * q; i++) {
          P.spark.emit(rnd(-4.5, 4.5), rnd(0.4, 3.2), rnd(-2.5, 8.5), rnd(-0.12, 0.12), rnd(0.4, 0.9), rnd(-0.12, 0.12), 4.8);
        }
      } else if (kind === 'bell') {
        triggerFloorRipples(now, 3, 360);
        lotusUntil = Math.max(lotusUntil, now + 4500);
        buddhaAuraUntil = Math.max(buddhaAuraUntil, now + 5500);
        for (let i = 0; i < 55 * q; i++) {
          P.spark.emit(ALTAR.x + rnd(-3.6, 3.6), rnd(0.8, 6.0), ALTAR.z + rnd(-2.0, 4.0), rnd(-0.2, 0.2), rnd(0.35, 1.05), rnd(-0.2, 0.2), 5.5);
        }
      } else if (kind === 'halo' || kind === 'buddha_aura') {
        P.glow.emit(x, 4.6, z - 0.6, 0, 0, 0, 6.5);
        buddhaAuraUntil = Math.max(buddhaAuraUntil, now + 7500);
        triggerFloorRipples(now, 2, 420);
        for (let i = 0; i < 45 * q; i++) {
          P.spark.emit(x + rnd(-2.8, 2.8), rnd(0.4, 5.4), z + rnd(-1.8, 3.8), rnd(-0.14, 0.14), rnd(0.35, 0.95), rnd(-0.14, 0.14), 5.0);
        }
      } else if (kind === 'dharma_wheel') {
        mandalaUntil = Math.max(mandalaUntil, now + 8500);
        buddhaAuraUntil = Math.max(buddhaAuraUntil, now + 6500);
        triggerFloorRipples(now, 4, 300);
        for (let i = 0; i < 60 * q; i++) {
          const ang = (i / 60) * Math.PI * 4;
          const rad = 1.2 + (i % 5) * 0.55;
          P.spark.emit(Math.cos(ang) * rad, rnd(0.2, 2.5), 2.2 + Math.sin(ang) * rad, rnd(-0.1, 0.1), rnd(0.55, 1.15), rnd(-0.1, 0.1), 5.2);
        }
      } else if (kind === 'golden_rain') {
        goldRainUntil = Math.max(goldRainUntil, now + 7500);
        triggerFloorRipples(now, 2, 450);
        for (let i = 0; i < 50 * q; i++) {
          P.goldLotus.emit(rnd(-6.2, 6.2), rnd(7.5, 11.5), rnd(-6.0, 9.5), rnd(-0.15, 0.15), rnd(-1.45, -0.85), rnd(-0.15, 0.15), 9.0);
          P.spark.emit(rnd(-6.0, 6.0), rnd(5.5, 10.8), rnd(-5.5, 9.0), rnd(-0.1, 0.1), rnd(-1.2, -0.6), rnd(-0.1, 0.1), 6.0);
        }
      } else if (kind === 'smoke') {
        smokeUntil = now + 6500;
        smokePower = Math.max(smokePower, power);
        for (let i = 0; i < Math.min(40, 12 + power * 4) * q; i++) {
          P.smoke.emit(
            smokeOrigin.x + rnd(-0.22, 0.22), smokeOrigin.y + rnd(0, 0.2), smokeOrigin.z + rnd(-0.16, 0.16),
            rnd(-0.12, 0.12), rnd(0.68, 1.05), rnd(-0.06, 0.1), rnd(4.2, 5.8)
          );
          if (Math.hypot(x - smokeOrigin.x, z - smokeOrigin.z) > 0.5) {
            P.smoke.emit(x + rnd(-0.2, 0.2), 1.1, z + rnd(-0.2, 0.2), rnd(-0.08, 0.08), rnd(0.48, 0.78), rnd(-0.05, 0.08), rnd(3.0, 4.2));
          }
        }
        for (let i = 0; i < Math.min(28, 8 + power * 3) * q; i++) {
          P.spark.emit(smokeOrigin.x + rnd(-0.8, 0.8), smokeOrigin.y + rnd(0.1, 1.2), smokeOrigin.z + rnd(-0.6, 0.6), rnd(-0.1, 0.1), rnd(0.38, 0.82), rnd(-0.08, 0.1), 4.0);
        }
      } else if (kind === 'lotus') {
        lotusUntil = Math.max(lotusUntil, now + 7500);
        for (let i = 0; i < 35 * q; i++) {
          P.lotus.emit(rnd(-6.5, 6.5), rnd(7.5, 11.2), rnd(-6.5, 9.2), rnd(-0.2, 0.2), rnd(-1.35, -0.75), rnd(-0.15, 0.15), 10.0);
        }
      }
    },
    update(now, dt) {
      const t = now / 1000;

      // 1. Continuous & Boosted Incense Smoke
      if (now > smokeUntil) smokePower = 0;
      smokeAcc += dt * (18 + smokePower * 11) * q;
      for (; smokeAcc >= 1; smokeAcc--) {
        P.smoke.emit(smokeOrigin.x + rnd(-0.09, 0.09), smokeOrigin.y, smokeOrigin.z, rnd(-0.05, 0.05), rnd(0.58, 0.82), rnd(0, 0.06), rnd(3.8, 5.0));
        if (Math.random() < 0.45) {
          const sx = Math.random() < 0.5 ? -2.6 : 2.6;
          P.smoke.emit(sx + rnd(-0.1, 0.1), smokeOrigin.y - 0.35, smokeOrigin.z - 0.3, rnd(-0.06, 0.06), rnd(0.45, 0.68), rnd(-0.03, 0.05), rnd(3.5, 4.6));
        }
      }

      // 2. Ambient Golden Dharma Motes
      sparkAcc += dt * 10 * q;
      for (; sparkAcc >= 1; sparkAcc--) {
        if (Math.random() < 0.55) {
          P.spark.emit(ALTAR.x + rnd(-2.8, 2.8), rnd(0.8, 5.0), ALTAR.z + rnd(-1.5, 2.0), rnd(-0.04, 0.04), rnd(0.18, 0.38), rnd(-0.04, 0.04), rnd(3.8, 5.8));
        } else {
          P.spark.emit(rnd(-4.8, 4.8), rnd(0.3, 2.8), rnd(-2.0, 12.0), rnd(-0.03, 0.03), rnd(0.15, 0.32), rnd(-0.03, 0.03), rnd(3.5, 5.2));
        }
      }

      // 3. Pink & White Lotus Rain (`lotus`)
      if (now < lotusUntil) {
        lotusAcc += dt * 62 * q;
        for (; lotusAcc >= 1; lotusAcc--) {
          P.lotus.emit(rnd(-7, 7), rnd(9, 11.5), rnd(-8, 9.5), rnd(-0.15, 0.15), rnd(-1.4, -0.8), rnd(-0.1, 0.1), 11);
          if (Math.random() < 0.45) {
            P.petal.emit(rnd(-6.5, 6.5), rnd(8.5, 11), rnd(-7, 9.5), rnd(-0.2, 0.2), rnd(-1.2, -0.7), rnd(-0.15, 0.15), 9);
          }
        }
      }

      // 4. Golden Nectar & Gold-Leaf Rain (`golden_rain`)
      if (now < goldRainUntil) {
        goldRainAcc += dt * 68 * q;
        for (; goldRainAcc >= 1; goldRainAcc--) {
          P.goldLotus.emit(rnd(-6.8, 6.8), rnd(8.8, 11.5), rnd(-7.5, 9.5), rnd(-0.15, 0.15), rnd(-1.5, -0.85), rnd(-0.12, 0.12), 10);
          P.spark.emit(rnd(-6.5, 6.5), rnd(6.0, 11.2), rnd(-6.5, 9.5), rnd(-0.08, 0.08), rnd(-1.3, -0.65), rnd(-0.08, 0.08), 5.5);
        }
      }

      // 5. Spring Peach & Apricot Blossom Shower (`peach_blossom`)
      if (now < blossomUntil) {
        blossomAcc += dt * 56 * q;
        for (; blossomAcc >= 1; blossomAcc--) {
          P.petal.emit(rnd(-6.8, 6.8), rnd(8.5, 11.2), rnd(-7.5, 9.5), rnd(0.18, 0.45), rnd(-1.25, -0.7), rnd(-0.15, 0.15), 10);
          if (Math.random() < 0.5) {
            P.goldLotus.emit(rnd(-6.5, 6.5), rnd(8.5, 11.2), rnd(-7.5, 9.5), rnd(-0.35, -0.1), rnd(-1.25, -0.7), rnd(-0.15, 0.15), 10);
          }
        }
      }

      // 6. Grand Sky Lantern Festival (`lantern_festival`)
      if (now < lanternUntil) {
        lanternAcc += dt * 11 * q;
        for (; lanternAcc >= 1; lanternAcc--) {
          const sideX = Math.random() < 0.5 ? rnd(-5.8, -1.8) : rnd(1.8, 5.8);
          P.lamp.emit(sideX, rnd(0.5, 1.6), rnd(-3.5, 9.5), rnd(-0.1, 0.1), rnd(0.72, 1.15), rnd(-0.08, 0.08), rnd(9.0, 12.0));
          P.spark.emit(sideX + rnd(-0.4, 0.4), rnd(0.6, 2.2), rnd(-3.5, 9.5), rnd(-0.08, 0.08), rnd(0.45, 0.85), rnd(-0.08, 0.08), 4.5);
        }
      }

      // 7. Rotating 3D Floor Dharma Wheel Mandala & Double-Helix Spiral (`dharma_wheel`)
      const mandalaRem = mandalaUntil - now;
      if (mandalaRem > 0) {
        floorMandala.visible = true;
        const fade = Math.min(1, mandalaRem / 1200) * 0.72;
        floorMandalaMat.opacity = fade * (0.85 + 0.15 * Math.sin(t * 3.2));
        floorMandala.rotation.z = t * 0.65;
        const pulse = 1 + 0.04 * Math.sin(t * 2.5);
        floorMandala.scale.setScalar(pulse);

        spiralAngle += dt * 5.2;
        const rad = 2.65;
        for (let arm = 0; arm < 2; arm++) {
          const a = spiralAngle + arm * Math.PI;
          P.spark.emit(Math.cos(a) * rad, 0.15, 2.2 + Math.sin(a) * rad, -Math.sin(a) * 0.35, rnd(0.85, 1.35), Math.cos(a) * 0.35, 3.8);
        }
      } else {
        floorMandala.visible = false;
      }

      // 8. Behind-Buddha Radiant Mandala & Descending Light Pillars (`buddha_aura` / `bell`)
      const auraRem = buddhaAuraUntil - now;
      if (auraRem > 0) {
        const fade = Math.min(1, auraRem / 1200);
        buddhaMandala.visible = true;
        buddhaMandalaMat.opacity = fade * (0.68 + 0.18 * Math.sin(t * 2.8));
        buddhaMandala.rotation.z = -t * 0.48;

        for (const lp of lightPillars) {
          lp.mesh.visible = true;
          lp.mat.opacity = fade * (0.11 + 0.05 * Math.sin(t * 2.4 + lp.phase));
          lp.mesh.rotation.y = t * 0.3;
        }
      } else {
        buddhaMandala.visible = false;
        for (const lp of lightPillars) lp.mesh.visible = false;
      }

      // 9. Expanding Golden Shockwave Rings
      for (const r of rings) {
        const u = (now - r.t0) / 2600;
        r.visible = u >= 0 && u < 1;
        if (u >= 0 && u < 1) {
          r.scale.setScalar(0.55 + u * 14.5);
          r.material.opacity = (1 - u) * 0.9;
        }
      }

      for (const p of Object.values(P)) p.update(dt, t);
    },
  };
}
