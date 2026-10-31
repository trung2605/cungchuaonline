// Particle effects (BR-07.7). One fixed-size THREE.Points pool per look, recycled round-robin.
import * as THREE from 'three';
import { canvasTex, glowTex } from './hall.js';
import { ALTAR } from './layout.js';

const petalTex = canvasTex(64, 64, g => {
  g.fillStyle = '#f7a9c4'; g.beginPath(); g.ellipse(32, 32, 13, 25, 0.6, 0, Math.PI * 2); g.fill();
});
const lotusTex = canvasTex(64, 64, g => {
  const r = g.createLinearGradient(0, 0, 0, 64);
  r.addColorStop(0, '#ffffff'); r.addColorStop(1, '#f08cb0');
  g.fillStyle = r;
  g.beginPath(); g.moveTo(32, 4); g.quadraticCurveTo(60, 40, 32, 60); g.quadraticCurveTo(4, 40, 32, 4); g.fill();
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
// Normal blending so it veils what is behind it instead of glowing.
function smokeSystem(scene, max) {
  const pos = new Float32Array(max * 3).fill(-100), vel = new Float32Array(max * 3);
  const age = new Float32Array(max), life = new Float32Array(max).fill(1), seed = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('age', new THREE.BufferAttribute(age, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: smokeTex }, tint: { value: new THREE.Color(0x8c7a68) }, alpha: { value: 0.11 } },
    vertexShader: `
      attribute float age; attribute float seed;
      varying float vAge; varying float vRot;
      void main() {
        vAge = age; vRot = seed * 6.28 + age * (seed - 0.5) * 3.0;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = mix(0.25, 1.9, sqrt(age)) * 1100.0 / -mv.z;
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
        float a = t.a * alpha * smoothstep(0.0, 0.12, vAge) * pow(1.0 - vAge, 1.6);
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
        // Rises fast at first, slows and spreads as it cools.
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
        // Additive pools fade by darkening; normal ones just pop out at end of life.
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
    petal: pool(scene, { tex: petalTex, max: 1200, size: 0.22, floor: true, gravity: -0.15, sway: 0.5 }),
    lotus: pool(scene, { tex: lotusTex, max: 1000, size: 0.4, floor: true, gravity: -0.1, sway: 0.7 }),
    smoke: smokeSystem(scene, 260),
    lamp: pool(scene, { tex: glowTex, max: 60, size: 0.9, additive: true, sway: 0.2 }),
    glow: pool(scene, { tex: glowTex, max: 8, size: 6, additive: true }),
  };
  const rings = Array.from({ length: 3 }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({
      color: 0xffd66b, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(ALTAR.x, 0.05, ALTAR.z + 1);
    m.visible = false;
    scene.add(m);
    return Object.assign(m, { t0: -Infinity });
  });
  let ring = 0, smokeUntil = 0, smokePower = 0, lotusUntil = 0, smokeAcc = 0, lotusAcc = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  return {
    spawn(kind, pos, power, now) {
      const { x, z } = pos;
      if (kind === 'flower') {
        for (let i = 0; i < 6 * power * q; i++) P.petal.emit(x + rnd(-0.7, 0.7), rnd(2.2, 3), z + rnd(-0.7, 0.7), 0, rnd(-0.6, -0.2), 0, 6);
      } else if (kind === 'lamp') {
        P.lamp.emit(x, 1.4, z, rnd(-0.1, 0.1), 0.7, rnd(-0.1, 0.1), 9);
      } else if (kind === 'bell') {
        const r = rings[ring++ % rings.length];
        r.t0 = now;
      } else if (kind === 'halo') {
        P.glow.emit(x, 4.6, z - 0.6, 0, 0, 0, 5); // no actor: glow at the statue
      } else if (kind === 'smoke') {
        smokeUntil = now + 3000;
        smokePower = Math.max(smokePower, power);
      } else if (kind === 'lotus') {
        lotusUntil = now + 6000;
      }
    },
    update(now, dt) {
      // Incense always smokes a little; 'smoke' thickens it for 3 s, scaled by power.
      if (now > smokeUntil) smokePower = 0;
      smokeAcc += dt * (9 + smokePower * 6) * q;
      // Fades out around 1.8 m above the censer, below the statue's face.
      for (; smokeAcc >= 1; smokeAcc--) P.smoke.emit(smokeOrigin.x + rnd(-0.08, 0.08), smokeOrigin.y, smokeOrigin.z, rnd(-0.04, 0.04), rnd(0.55, 0.75), rnd(0, 0.06), rnd(3.2, 4.2));
      if (now < lotusUntil) {
        lotusAcc += dt * 50 * q;
        for (; lotusAcc >= 1; lotusAcc--) P.lotus.emit(rnd(-7, 7), rnd(9, 11), rnd(-8, 9), 0, rnd(-1.4, -0.8), 0, 12);
      }
      for (const r of rings) {
        const u = (now - r.t0) / 2500;
        r.visible = u < 1;
        if (u < 1) { r.scale.setScalar(0.5 + u * 14); r.material.opacity = 1 - u; }
      }
      const t = now / 1000;
      for (const p of Object.values(P)) p.update(dt, t);
    },
  };
}
