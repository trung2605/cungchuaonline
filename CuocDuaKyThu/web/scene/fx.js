import * as THREE from 'three';
import { glowTex } from './world3d.js';

export function createRaceFx(scene) {
  const max = 450;
  const pos = new Float32Array(max * 3).fill(-100);
  const vel = new Float32Array(max * 3);
  const life = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    map: glowTex,
    size: 0.14,
    color: 0xf4dec0,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  let next = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function emit(x, y, z, vx, vy, vz, ttl) {
    const i = next;
    next = (next + 1) % max;
    pos.set([x, y, z], i * 3);
    vel.set([vx, vy, vz], i * 3);
    life[i] = ttl;
  }

  return {
    spawn(kind, power = 5) {
      const count = Math.min(45, power * 6);
      for (let i = 0; i < count; i++) {
        emit(
          rnd(-4.0, 4.0),
          rnd(0.5, 4.2),
          rnd(-4, 8),
          rnd(-0.8, 0.8),
          rnd(0.6, 2.2),
          rnd(1.5, 4.5),
          rnd(1.4, 2.8)
        );
      }
    },
    update(dt) {
      // Subtle atmospheric dust motes floating softly outside the trail
      if (Math.random() < 0.08) {
        const side = Math.random() < 0.5 ? -1 : 1;
        emit(side * rnd(5.2, 11.5), rnd(0.8, 5.5), rnd(-30, 4), rnd(-0.18, 0.18), rnd(0.12, 0.35), rnd(1.2, 2.4), 2.4);
      }
      for (let i = 0; i < max; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        const j = i * 3;
        if (life[i] <= 0) {
          pos[j + 1] = -100;
          continue;
        }
        pos[j] += vel[j] * dt;
        pos[j + 1] += vel[j + 1] * dt;
        pos[j + 2] += vel[j + 2] * dt;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
