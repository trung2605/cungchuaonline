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
    size: 0.42,
    color: 0xffd166,
    transparent: true,
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
      const count = Math.min(80, power * 10);
      for (let i = 0; i < count; i++) {
        emit(
          rnd(-4.2, 4.2),
          rnd(0.5, 4.5),
          rnd(0, 9),
          rnd(-1.2, 1.2),
          rnd(0.8, 3.2),
          rnd(3.0, 9.0),
          rnd(1.2, 2.6)
        );
      }
    },
    update(dt) {
      // Ambient speed motes streaming past the camera
      if (Math.random() < 0.65) {
        emit(rnd(-5.5, 5.5), rnd(0.3, 4.2), rnd(-25, 2), 0, 0, rnd(14, 24), 1.6);
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
