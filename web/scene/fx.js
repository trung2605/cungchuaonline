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
const smokeTex = canvasTex(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(200,190,180,.18)'); r.addColorStop(1, 'rgba(200,190,180,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});

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
    smoke: pool(scene, { tex: smokeTex, max: 400, size: 0.9, additive: true, sway: 0.15 }),
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
      smokeAcc += dt * (3 + smokePower * 2) * q;
      for (; smokeAcc >= 1; smokeAcc--) P.smoke.emit(smokeOrigin.x + rnd(-0.1, 0.1), smokeOrigin.y, smokeOrigin.z, rnd(-0.08, 0.08), rnd(0.5, 0.8), rnd(-0.05, 0.1), 2.8); // fades before reaching the statue's face
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
