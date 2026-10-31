// Laypeople in blue áo tràng (BR-07.15). Uses assets/models/layman_{skin}.vrm when present,
// otherwise a primitive placeholder rig. Both expose VRM normalized humanoid bones
// (identity rest, facing +Z, arms in T-pose), so one pose function drives either.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRMHumanoid } from '@pixiv/three-vrm';
import { glowTex } from './hall.js';

const ROBE = [0x7f93ad, 0x9db0c8, 0x7f93ad, 0x9db0c8]; // skins 0-1 male, 2-3 female
const WALKING = new Set(['enter', 'queue', 'toSeat', 'leave', 'move']);
const HALO_MS = 5000;

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const skinMat = std(0xe8c4a0);
const hairMat = std(0x1c1410);
const pantsMat = std(0x2d3340);
const robeMats = ROBE.map(c => std(c, { roughness: 0.85, side: THREE.DoubleSide }));

function part(geo, mat, parent, x = 0, y = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, 0);
  m.castShadow = true;
  parent.add(m);
  return m;
}

function placeholderRig(skin) {
  const root = new THREE.Group();
  const b = {};
  const bone = (name, parent, x, y) => {
    const o = new THREE.Group();
    o.position.set(x, y, 0);
    parent.add((b[name] = o));
    return o;
  };
  const robe = robeMats[skin];
  bone('hips', root, 0, 0.9);
  bone('spine', b.hips, 0, 0.08);
  bone('chest', b.spine, 0, 0.22);
  bone('neck', b.chest, 0, 0.26);
  bone('head', b.neck, 0, 0.07);
  part(new THREE.CylinderGeometry(0.16, 0.19, 0.56, 14), robe, b.spine, 0, 0.2);
  part(new THREE.SphereGeometry(0.115, 16, 12), skinMat, b.head, 0, 0.1);
  part(new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), hairMat, b.head, 0, 0.115);
  if (skin >= 2) part(new THREE.SphereGeometry(0.07, 12, 8), hairMat, b.head, 0, 0.17).position.z = -0.11; // bun
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const up = bone(side + 'UpperArm', b.chest, 0.17 * sx, 0.2);
    const lo = bone(side + 'LowerArm', up, 0.27 * sx, 0);
    part(new THREE.CylinderGeometry(0.055, 0.075, 0.27, 10), robe, up, 0.135 * sx).rotation.z = Math.PI / 2;
    part(new THREE.CylinderGeometry(0.075, 0.1, 0.27, 10), robe, lo, 0.135 * sx).rotation.z = Math.PI / 2; // wide sleeve
    part(new THREE.SphereGeometry(0.042, 10, 8), skinMat, lo, 0.29 * sx);
    const ul = bone(side + 'UpperLeg', b.hips, 0.09 * sx, -0.04);
    const ll = bone(side + 'LowerLeg', ul, 0, -0.42);
    part(new THREE.CylinderGeometry(0.065, 0.06, 0.42, 10), pantsMat, ul, 0, -0.21);
    part(new THREE.CylinderGeometry(0.055, 0.05, 0.42, 10), pantsMat, ll, 0, -0.21);
  }
  // Robe skirt down to the ankles; squashed when kneeling so it stays above the floor.
  const skirt = part(new THREE.CylinderGeometry(0.2, 0.34, 0.8, 16, 1, true), robe, b.hips, 0, -0.4);
  return { root, bones: b, skirt, update() {} };
}

function vrmRig(vrm) {
  const scene = SkeletonUtils.clone(vrm.scene);
  const human = {};
  for (const name of Object.keys(vrm.humanoid.humanBones)) {
    const node = scene.getObjectByName(vrm.humanoid.getRawBoneNode(name)?.name);
    if (node) human[name] = { node };
  }
  // A clone needs its own humanoid so its normalized bones drive its own raw bones.
  const humanoid = new VRMHumanoid(human);
  scene.add(humanoid.normalizedHumanBonesRoot);
  scene.traverse(o => { o.castShadow = true; o.frustumCulled = false; });
  const bones = {};
  for (const name of Object.keys(human)) bones[name] = humanoid.getNormalizedBoneNode(name);
  return { root: scene, bones, update: () => humanoid.update() };
}

async function loadTemplates() {
  const loader = new GLTFLoader();
  loader.register(p => new VRMLoaderPlugin(p));
  return Promise.all([0, 1, 2, 3].map(skin => loader.loadAsync(`assets/models/layman_${skin}.vrm`).then(g => {
    const vrm = g.userData.vrm;
    VRMUtils.rotateVRM0(vrm);
    VRMUtils.removeUnnecessaryVertices(g.scene);
    VRMUtils.combineSkeletons(g.scene);
    return vrm;
  }).catch(() => null)));
}

// Arm chain aiming. Directions are in the chest frame.
const REST = { 1: new THREE.Vector3(1, 0, 0), [-1]: new THREE.Vector3(-1, 0, 0) };
const PRAY = {};
for (const sx of [1, -1]) PRAY[sx] = [new THREE.Vector3(0.35 * sx, -0.8, 0.45), new THREE.Vector3(-0.8 * sx, 0.5, 0.35)].map(d => d.normalize());
// Lạy: joined hands rise to the forehead, then reach forward to the floor as the torso folds.
const FORE = {}, PALM = {};
for (const sx of [1, -1]) {
  FORE[sx] = [new THREE.Vector3(0.35 * sx, 0.1, 0.9), new THREE.Vector3(-0.8 * sx, 0.55, 0.3)].map(d => d.normalize());
  PALM[sx] = [new THREE.Vector3(0.3 * sx, 0.3, 0.9), new THREE.Vector3(-0.15 * sx, 0.8, 0.5)].map(d => d.normalize());
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const tmp = new THREE.Vector3(), down = new THREE.Vector3(), qi = new THREE.Quaternion();
const armU = new THREE.Vector3(), armL = new THREE.Vector3();
function aim(upper, lower, rest, upDir, loDir) {
  if (!upper || !lower) return;
  upper.quaternion.setFromUnitVectors(rest, upDir);
  tmp.copy(loDir).applyQuaternion(qi.copy(upper.quaternion).invert());
  lower.quaternion.setFromUnitVectors(rest, tmp);
}

function applyPose(rig, p, now, seed) {
  const b = rig.bones;
  const walking = WALKING.has(p.phase) && p.t01 < 1 && !(p.phase === 'move' && p.ms < 500);
  let k = 0; // 0 standing .. 1 kneeling
  if (p.phase === 'kneel') k = p.t01;
  else if (p.phase === 'standUp') k = 1 - p.t01;
  else if (p.phase === 'move') k = Math.max(0, 1 - p.ms / 500);
  else if (p.phase === 'altar') k = Math.min(1, p.ms / 400);
  else if (p.phase === 'idle' || p.phase === 'bow') k = 1;

  // One 0.8 s bow (BR-07.3): hands to forehead, fold down, short hold, slower rise.
  const u = p.bowT01;
  const raise = u > 0 ? smooth(0, 0.18, u) * (1 - smooth(0.3, 0.42, u)) : 0;
  const fold = u > 0 ? smooth(0.12, 0.48, u) * (1 - smooth(0.64, 1, u)) : 0;
  const bow = fold * 1.3;
  const breathe = p.phase === 'idle' ? 0.03 * Math.sin(now / 1300 + seed) : 0;
  b.hips?.rotation.set(fold * 0.35 * k, 0, 0);
  b.spine?.rotation.set(bow * 0.5, 0, 0);
  b.chest?.rotation.set(bow * 0.45 + breathe, 0, 0);
  b.neck?.rotation.set(bow * 0.15 - raise * 0.15, 0, 0);

  const swing = walking ? Math.sin(now / 160 + seed) : 0;
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const s = swing * sx;
    if (walking) {
      down.set(0.12 * sx, -1, -0.35 * s).normalize();
      aim(b[side + 'UpperArm'], b[side + 'LowerArm'], REST[sx], down, down);
    } else {
      armU.copy(PRAY[sx][0]).lerp(FORE[sx][0], raise).lerp(PALM[sx][0], fold).normalize();
      armL.copy(PRAY[sx][1]).lerp(FORE[sx][1], raise).lerp(PALM[sx][1], fold).normalize();
      aim(b[side + 'UpperArm'], b[side + 'LowerArm'], REST[sx], armU, armL);
    }
    // Hip pitch is cancelled at the thighs so the knees stay planted while the torso folds.
    b[side + 'UpperLeg']?.rotation.set(-1.45 * k + 0.45 * s - fold * 0.35 * k, 0, 0);
    b[side + 'LowerLeg']?.rotation.set(2.9 * k + 0.5 * Math.max(0, -s), 0, 0);
  }
  rig.restHipY ??= b.hips.position.y;
  b.hips.position.y = rig.restHipY - k * (rig.restHipY - 0.42);
  if (rig.skirt) {
    rig.skirt.scale.y = 1 - 0.55 * k;
    rig.skirt.position.y = -0.4 * rig.skirt.scale.y;
  }
  return k;
}

export async function createActors(scene) {
  const templates = await loadTemplates();
  const live = new Map(); // id -> entry
  const haloMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffd66b, blending: THREE.AdditiveBlending, depthWrite: false });
  const nameText = a => a.name + (a.diamonds > 0 ? ` 💎${a.diamonds}` : '');

  function remove(id) {
    const e = live.get(id);
    if (!e) return;
    clearTimeout(e.bubbleTimer);
    e.label.element.remove();
    e.holder.removeFromParent();
    live.delete(id);
  }

  return {
    add(actor) {
      remove(actor.id);
      const holder = new THREE.Group();
      const rig = templates[actor.skin] ? vrmRig(templates[actor.skin]) : placeholderRig(actor.skin);
      holder.add(rig.root);
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center';
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'label bubble';
      bubbleEl.style.display = 'none';
      const nameEl = document.createElement('div');
      nameEl.className = 'label' + (actor.tier === 2 ? ' gold' : '');
      nameEl.textContent = nameText(actor);
      el.append(bubbleEl, nameEl);
      const label = new CSS2DObject(el);
      label.center.set(0.5, 1);
      const halo = new THREE.Sprite(haloMat.clone());
      halo.scale.setScalar(1.6);
      halo.visible = false;
      holder.add(label, halo);
      scene.add(holder);
      live.set(actor.id, { actor: { ...actor }, holder, rig, label, nameEl, bubbleEl, halo, haloUntil: 0, prevBow: 0, seed: Math.random() * 10 });
    },
    remove,
    clear() {
      for (const id of [...live.keys()]) remove(id);
    },
    say(id, text, ms) {
      const e = live.get(id);
      if (!e) return;
      clearTimeout(e.bubbleTimer);
      Object.assign(e.bubbleEl.style, { display: '', opacity: 1 });
      e.bubbleEl.textContent = text;
      e.bubbleTimer = setTimeout(() => {
        e.bubbleEl.style.opacity = 0;
        e.bubbleTimer = setTimeout(() => { e.bubbleEl.style.display = 'none'; }, 600);
      }, ms);
    },
    unsay(id) {
      const e = live.get(id);
      if (e) { clearTimeout(e.bubbleTimer); e.bubbleEl.style.display = 'none'; }
    },
    badge(id, diamonds) {
      const e = live.get(id);
      if (e) { e.actor.diamonds = diamonds; e.nameEl.textContent = nameText(e.actor); }
    },
    halo(id, now) {
      const e = live.get(id);
      if (e) e.haloUntil = now + HALO_MS;
    },
    actor: id => live.get(id)?.actor,
    // Applies poses; returns how many bows started this frame (wood block sound).
    update(poses, now, dt) {
      let bowsStarted = 0;
      for (const [id, p] of poses) {
        const e = live.get(id);
        if (!e) continue;
        e.holder.position.set(p.pos.x, 0, p.pos.z);
        const r = e.holder.rotation;
        r.y += Math.atan2(Math.sin(p.rotY - r.y), Math.cos(p.rotY - r.y)) * Math.min(1, dt * 10);
        const k = applyPose(e.rig, p, now, e.seed);
        e.rig.update();
        if (p.bowT01 > 0 && (p.bowT01 < e.prevBow || e.prevBow === 0)) bowsStarted++;
        e.prevBow = p.bowT01;
        // At the altar the big altar card shows the name instead (BR-07.18).
        e.label.visible = p.phase !== 'altar';
        e.label.position.y = 1.95 - 0.6 * k;
        const left = e.haloUntil - now;
        e.halo.visible = left > 0;
        if (left > 0) {
          e.halo.position.set(0, 1.25 - 0.45 * k, -0.25);
          e.halo.material.opacity = Math.min(1, left / 800);
        }
      }
      return bowsStarted;
    },
  };
}
