// Laypeople in blue áo tràng (BR-07.15). Uses assets/models/layman_{skin}.vrm when present,
// otherwise a primitive placeholder rig. Both expose VRM normalized humanoid bones
// (identity rest, facing +Z, arms in T-pose), so one pose function drives either.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRMHumanoid } from '@pixiv/three-vrm';
import { glowTex } from './hall.js';

const ROBE = [0x7f93ad, 0x9db0c8, 0x7f93ad, 0x9db0c8]; // skins 0-1 male, 2-3 female (Tier 0: Áo tràng lam)
const ROBE_TIER1 = [0xd4962a, 0xe0a538, 0xd4962a, 0xe0a538]; // Tier 1 (10-999💎): Áo tràng vàng
const ROBE_TIER2 = [0xf5c242, 0xffcf56, 0xf5c242, 0xffcf56]; // Tier 2 (1000+💎): Áo tràng hoàng kim đại công đức
const WALKING = new Set(['enter', 'queue', 'toSeat', 'leave', 'move']);
const HALO_MS = 5000;

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const skinMat = std(0xe8c4a0);
const hairMat = std(0x1c1410);
const pantsMat = std(0x2d3340);
const robeMats = ROBE.map(c => std(c, { roughness: 0.85, side: THREE.DoubleSide }));
const robeTier1Mats = ROBE_TIER1.map(c => std(c, { roughness: 0.55, metalness: 0.18, emissive: 0x261602, side: THREE.DoubleSide }));
const robeTier2Mats = ROBE_TIER2.map(c => std(c, { roughness: 0.38, metalness: 0.35, emissive: 0x422805, side: THREE.DoubleSide }));
const getRobeMat = (skin = 0, tier = 0) => (tier >= 2 ? robeTier2Mats : tier >= 1 ? robeTier1Mats : robeMats)[skin % 4];
const stickMat = std(0x6a2a14, { roughness: 0.9 });
const emberMat = new THREE.MeshBasicMaterial({ color: 0xff6a1a });
const trayMat = std(0xb8862e, { metalness: 0.8, roughness: 0.35 });
const lotusMat = std(0xf49ac0, { emissive: 0x3a0c1e, roughness: 0.5 });

function part(geo, mat, parent, x = 0, y = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, 0);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// Held offering prop between joined hands (3 glowing incense sticks + golden lotus bud)
function createOfferingProp() {
  const g = new THREE.Group();
  // Small golden lotus tray/bud held between palms
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.035, 0.04, 12), trayMat);
  g.add(tray);
  const bud = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), lotusMat);
  bud.scale.set(0.85, 1.35, 0.85);
  bud.position.y = 0.05;
  g.add(bud);
  // Three incense sticks rising from the hands with glowing ember tips
  for (const dx of [-0.025, 0, 0.025]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.34, 6), stickMat);
    s.position.set(dx, 0.18, 0.02);
    s.rotation.z = dx * 1.6;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), emberMat);
    tip.position.y = 0.17;
    s.add(tip);
    g.add(s);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffa640, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.65,
  }));
  glow.scale.setScalar(0.32);
  glow.position.set(0, 0.34, 0.02);
  g.add(glow);
  return g;
}

function placeholderRig(skin, tier = 0) {
  const root = new THREE.Group();
  const b = {};
  const robeParts = [];
  const bone = (name, parent, x, y) => {
    const o = new THREE.Group();
    o.position.set(x, y, 0);
    parent.add((b[name] = o));
    return o;
  };
  const robe = getRobeMat(skin, tier);
  bone('hips', root, 0, 0.9);
  bone('spine', b.hips, 0, 0.08);
  bone('chest', b.spine, 0, 0.22);
  bone('neck', b.chest, 0, 0.26);
  bone('head', b.neck, 0, 0.07);
  robeParts.push(part(new THREE.CylinderGeometry(0.16, 0.19, 0.56, 14), robe, b.spine, 0, 0.2));
  part(new THREE.SphereGeometry(0.115, 16, 12), skinMat, b.head, 0, 0.1);
  part(new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), hairMat, b.head, 0, 0.115);
  if (skin >= 2) part(new THREE.SphereGeometry(0.07, 12, 8), hairMat, b.head, 0, 0.17).position.z = -0.11; // bun
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const up = bone(side + 'UpperArm', b.chest, 0.17 * sx, 0.2);
    const lo = bone(side + 'LowerArm', up, 0.27 * sx, 0);
    const uMesh = part(new THREE.CylinderGeometry(0.055, 0.075, 0.27, 10), robe, up, 0.135 * sx);
    uMesh.rotation.z = Math.PI / 2;
    const lMesh = part(new THREE.CylinderGeometry(0.075, 0.1, 0.27, 10), robe, lo, 0.135 * sx); // wide sleeve
    lMesh.rotation.z = Math.PI / 2;
    robeParts.push(uMesh, lMesh);
    part(new THREE.SphereGeometry(0.042, 10, 8), skinMat, lo, 0.29 * sx);
    const ul = bone(side + 'UpperLeg', b.hips, 0.09 * sx, -0.04);
    const ll = bone(side + 'LowerLeg', ul, 0, -0.42);
    part(new THREE.CylinderGeometry(0.065, 0.06, 0.42, 10), pantsMat, ul, 0, -0.21);
    part(new THREE.CylinderGeometry(0.055, 0.05, 0.42, 10), pantsMat, ll, 0, -0.21);
  }
  // Robe skirt down to the ankles; squashed when kneeling so it stays above the floor.
  const skirt = part(new THREE.CylinderGeometry(0.2, 0.34, 0.8, 16, 1, true), robe, b.hips, 0, -0.4);
  robeParts.push(skirt);
  const offering = createOfferingProp();
  b.chest.add(offering);
  return {
    root,
    bones: b,
    skirt,
    offering,
    setTier(newTier) {
      const m = getRobeMat(skin, newTier);
      for (const p of robeParts) p.material = m;
    },
    update() {},
  };
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
  const offering = createOfferingProp();
  bones.chest?.add(offering);
  return { root: scene, bones, offering, update: () => humanoid.update() };
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

  // One 0.8 s bow (BR-07.3): hands + offering rise high to forehead (dâng lễ), deep bow & head kowtow, short hold, slower rise.
  const u = p.bowT01;
  const raise = u > 0 ? smooth(0, 0.22, u) * (1 - smooth(0.32, 0.46, u)) : 0;
  const fold = u > 0 ? smooth(0.16, 0.50, u) * (1 - smooth(0.66, 1, u)) : 0;
  const bow = fold * 1.48;
  // Idle worshippers also do a gentle periodic head nod / prayer bow every ~7 s
  const idleNod = p.phase === 'idle' ? Math.max(0, Math.sin(now / 1100 + seed * 2.3) - 0.55) * 0.55 : 0;
  const breathe = p.phase === 'idle' ? 0.035 * Math.sin(now / 1300 + seed) : 0;
  b.hips?.rotation.set(fold * 0.42 * k, 0, 0);
  b.spine?.rotation.set(bow * 0.52 + idleNod * 0.35, 0, 0);
  b.chest?.rotation.set(bow * 0.48 + breathe + idleNod * 0.3, 0, 0);
  b.neck?.rotation.set(bow * 0.28 - raise * 0.22 + idleNod * 0.45, 0, 0);
  b.head?.rotation.set(bow * 0.25 - raise * 0.15 + idleNod * 0.35, 0, 0);

  const swing = walking ? Math.sin(now / 160 + seed) : 0;
  const carryAltar = p.phase === 'enter' || p.phase === 'queue' || p.phase === 'altar';
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const s = swing * sx;
    if (walking && !carryAltar) {
      down.set(0.12 * sx, -1, -0.35 * s).normalize();
      aim(b[side + 'UpperArm'], b[side + 'LowerArm'], REST[sx], down, down);
    } else {
      // When walking up the red carpet to the altar, hands stay joined holding the incense/lotus offering!
      armU.copy(PRAY[sx][0]).lerp(FORE[sx][0], raise).lerp(PALM[sx][0], fold).normalize();
      armL.copy(PRAY[sx][1]).lerp(FORE[sx][1], raise).lerp(PALM[sx][1], fold).normalize();
      aim(b[side + 'UpperArm'], b[side + 'LowerArm'], REST[sx], armU, armL);
    }
    // Hip pitch is cancelled at the thighs so the knees stay planted while the torso folds.
    b[side + 'UpperLeg']?.rotation.set(-1.45 * k + 0.45 * s - fold * 0.42 * k, 0, 0);
    b[side + 'LowerLeg']?.rotation.set(2.9 * k + 0.5 * Math.max(0, -s), 0, 0);
  }
  if (rig.offering) {
    // Show the incense + lotus offering when walking up to the altar, at the altar, or actively bowing
    rig.offering.visible = carryAltar || p.phase === 'bow' || idleNod > 0.05;
    rig.offering.position.set(0, 0.14 + raise * 0.24 - fold * 0.08, 0.24 + raise * 0.08 + fold * 0.18);
    rig.offering.rotation.set(-0.2 + raise * 0.35 - fold * 0.75, 0, 0);
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
      const visualTier = (actor.diamonds >= 20 || actor.tier === 2) ? 2 : (actor.diamonds >= 5 || actor.tier === 1) ? 1 : 0;
      const rig = templates[actor.skin] ? vrmRig(templates[actor.skin]) : placeholderRig(actor.skin, visualTier);
      holder.add(rig.root);
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center';
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'label bubble';
      bubbleEl.style.display = 'none';
      const nameEl = document.createElement('div');
      nameEl.className = 'label' + (visualTier === 2 ? ' gold' : visualTier === 1 ? ' tier1' : '');
      nameEl.textContent = nameText(actor);
      el.append(bubbleEl, nameEl);
      const label = new CSS2DObject(el);
      label.center.set(0.5, 1);
      const halo = new THREE.Sprite(haloMat.clone());
      halo.scale.setScalar(1.65);
      halo.visible = visualTier === 2;
      holder.add(label, halo);
      scene.add(holder);
      const isReal = Boolean(actor.src && actor.src !== 'mock');
      const activeUntil = performance.now() + (isReal ? 12_000 : 4000);
      live.set(actor.id, { actor: { ...actor, tier: visualTier }, holder, rig, label, nameEl, bubbleEl, halo, haloUntil: 0, activeUntil, isReal, prevBow: 0, seed: Math.random() * 10 });
    },
    remove,
    clear() {
      for (const id of [...live.keys()]) remove(id);
    },
    say(id, text, ms) {
      const e = live.get(id);
      if (!e) return;
      // Keep at most 1 active speech bubble in the hall to avoid overlapping text at the altar
      for (const [otherId, other] of live) {
        if (otherId !== id && other.bubbleEl.style.display !== 'none') {
          clearTimeout(other.bubbleTimer);
          other.bubbleEl.style.display = 'none';
        }
      }
      clearTimeout(e.bubbleTimer);
      e.activeUntil = performance.now() + ms + 1500;
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
      if (e) {
        e.actor.diamonds = diamonds;
        e.activeUntil = performance.now() + 6000;
        const newTier = diamonds >= 20 ? 2 : diamonds >= 5 ? 1 : 0;
        if (newTier > (e.actor.tier ?? 0)) {
          e.actor.tier = newTier;
          e.rig.setTier?.(newTier);
          e.nameEl.className = 'label' + (newTier === 2 ? ' gold' : newTier === 1 ? ' tier1' : '');
        }
        e.nameEl.textContent = nameText(e.actor);
      }
    },
    halo(id, now) {
      const e = live.get(id);
      if (e) {
        e.haloUntil = now + HALO_MS;
        e.activeUntil = now + 6000;
      }
    },
    actor: id => live.get(id)?.actor,
    getPos(id) {
      const e = live.get(id);
      if (!e) return null;
      return {
        id,
        x: e.holder.position.x,
        y: e.holder.position.y,
        z: e.holder.position.z,
        rotY: e.holder.rotation.y,
        tier: e.actor.tier || 0,
        diamonds: e.actor.diamonds || 0,
        name: e.actor.name || '',
        hasBubble: e.bubbleEl.style.display !== 'none',
      };
    },
    getCameraFocusActor(poses, now) {
      let best = null;
      let bestScore = -1;
      for (const [id, p] of poses) {
        const e = live.get(id);
        if (!e) continue;
        const hasBubble = e.bubbleEl.style.display !== 'none';
        const hasHalo = (e.haloUntil || 0) > now;
        const isRecent = (e.activeUntil || 0) > now;
        const tier = e.actor.tier || 0;
        const isReal = id && !String(id).startsWith('bot_') && !String(id).startsWith('seed_');
        let score = 0;
        if (hasBubble) score += 120;
        if (hasHalo) score += 100;
        if (p.phase === 'altar') score += 75;
        else if (p.phase === 'enter') score += 65;
        if (isRecent) score += 50;
        score += tier * 30;
        if (isReal) score += 20;
        // Slight deterministic jitter so different worshippers get spotlighted over time
        score += (Math.sin(now / 4500 + e.seed) + 1) * 8;
        if (score > bestScore) {
          bestScore = score;
          best = {
            id,
            phase: p.phase,
            spot: p.spot,
            x: e.holder.position.x,
            y: e.holder.position.y,
            z: e.holder.position.z,
            rotY: e.holder.rotation.y,
            tier,
            hasBubble,
            hasHalo,
          };
        }
      }
      return best;
    },
    // Applies poses; returns how many bows started this frame (wood block sound).
    update(poses, now, dt) {
      let bowsStarted = 0;
      let idleLabelsShown = 0;
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
        // Progressive disclosure (/impeccable distill):
        // Never show 40+ static name pills on seated idle actors simultaneously.
        // Only show overhead label when walking/entering, bowing, speaking, or just gifted (capped to 2 idle labels).
        const hasBubble = e.bubbleEl.style.display !== 'none';
        const isMoving = p.phase !== 'idle' && p.phase !== 'altar';
        const isBowing = p.bowT01 > 0;
        const isRecentIdle = p.phase === 'idle' && now < (e.activeUntil || 0) && idleLabelsShown < 2;
        if (isRecentIdle && !isBowing && !hasBubble) idleLabelsShown++;
        if (p.phase === 'altar') {
          // At the altar, the dedicated altar card shows their name & prayer (BR-07.18).
          e.label.visible = false;
        } else {
          e.nameEl.style.display = '';
          e.label.visible = isMoving || isBowing || hasBubble || isRecentIdle;
        }
        e.label.position.y = 1.95 - 0.6 * k;
        const left = e.haloUntil - now;
        const isTier2 = e.actor.tier === 2;
        e.halo.visible = left > 0 || isTier2;
        if (left > 0 || isTier2) {
          e.halo.position.set(0, 1.25 - 0.45 * k, -0.25);
          e.halo.material.opacity = left > 0 ? Math.min(1, left / 800) : 0.48 + 0.14 * Math.sin(now / 600 + e.seed);
        }
      }
      return bowsStarted;
    },
  };
}
