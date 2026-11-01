import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { glowTex } from './world3d.js';

const OUTFIT_COLORS = [0x2ec4b6, 0xff6b6b, 0x4cc9f0, 0xf77f00];
const TIER_SUITS = {
  1: 0x38bdf8, // Tier 1 (1-9💎): Energy Cyan-Gold
  2: 0xf59e0b, // Tier 2 (10-99💎): Golden Hoverboard Suit
  3: 0xf43f5e, // Tier 3 (100-999💎): Lightning Crimson Jet Suit
  4: 0xffd700, // Tier 4 (1000+💎): Imperial Cosmic Gold
};

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...o });
const skinMat = std(0xf2c9a6);
const hairMat = std(0x1f1612);
const shortsMat = std(0x1e293b);
const wingMat = new THREE.MeshBasicMaterial({ color: 0x58f5ff, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
const hoverMat = std(0xf5c242, { metalness: 0.7, roughness: 0.25, emissive: 0x4a3006 });
const jetMat = std(0xe11d48, { metalness: 0.65, roughness: 0.3, emissive: 0x4c0519 });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9f1c });
const crownMat = std(0xffdd44, { metalness: 0.85, roughness: 0.2, emissive: 0x5c4200 });

function buildRunnerRig(skin = 0, tier = 0) {
  const root = new THREE.Group();
  // Face -Z (into the horizon along the highway)
  root.rotation.y = Math.PI;

  const b = {};
  const bone = (name, parent, x, y, z = 0) => {
    const o = new THREE.Group();
    o.position.set(x, y, z);
    parent.add((b[name] = o));
    return o;
  };

  const baseColor = TIER_SUITS[tier] || OUTFIT_COLORS[skin % OUTFIT_COLORS.length];
  const suitMat = std(baseColor, {
    metalness: tier >= 2 ? 0.45 : 0.1,
    roughness: tier >= 2 ? 0.32 : 0.6,
    emissive: tier >= 4 ? 0x4a3200 : tier >= 2 ? 0x261500 : 0x000000,
  });

  bone('hips', root, 0, 0.92, 0);
  bone('torso', b.hips, 0, 0.25, 0);
  bone('head', b.torso, 0, 0.38, 0);

  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.5, 12), suitMat);
  torsoMesh.castShadow = true;
  b.torso.add(torsoMesh);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), skinMat);
  headMesh.position.y = 0.08;
  headMesh.castShadow = true;
  b.head.add(headMesh);

  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  hairMesh.position.y = 0.095;
  b.head.add(hairMesh);

  // Arms & Legs
  for (const [side, sx] of [['left', 1], ['right', -1]]) {
    const arm = bone(side + 'Arm', b.torso, 0.2 * sx, 0.16, 0);
    const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.44, 8), suitMat);
    armMesh.position.y = -0.2;
    arm.add(armMesh);

    const leg = bone(side + 'Leg', b.hips, 0.09 * sx, -0.02, 0);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.45, 8), shortsMat);
    thigh.position.y = -0.22;
    leg.add(thigh);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.42, 8), skinMat);
    shin.position.y = -0.62;
    leg.add(shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.2), suitMat);
    shoe.position.set(0, -0.84, 0.04);
    leg.add(shoe);
  }

  // Tier 1+: Energy Wings on back
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 0.1, -0.15);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.85, 4), wingMat);
    w.rotation.z = sx * 1.1;
    w.position.set(sx * 0.36, 0.12, 0);
    wingsGroup.add(w);
  }
  wingsGroup.visible = tier >= 1;
  b.torso.add(wingsGroup);

  // Tier 2+: Golden Hoverboard under feet
  const hoverGroup = new THREE.Group();
  hoverGroup.position.set(0, 0.08, 0);
  const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 1.15), hoverMat);
  const glowUnder = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x00f5d4, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glowUnder.scale.set(1.2, 1.2, 1);
  glowUnder.position.y = -0.04;
  hoverGroup.add(boardMesh, glowUnder);
  hoverGroup.visible = tier >= 2;
  root.add(hoverGroup);

  // Tier 3+: Twin Rocket Jetpack on back
  const jetGroup = new THREE.Group();
  jetGroup.position.set(0, 0.05, -0.18);
  for (const sx of [-0.11, 0.11]) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.42, 10), jetMat);
    cyl.position.x = sx;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 8), flameMat);
    flame.rotation.x = Math.PI;
    flame.position.set(sx, -0.34, 0);
    jetGroup.add(cyl, flame);
  }
  jetGroup.visible = tier >= 3;
  b.torso.add(jetGroup);

  // Tier 4: Champion Crown on head + Cosmic Aura Ring
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.12, 8, 1, true), crownMat);
  crown.position.y = 0.23;
  crown.visible = tier >= 4;
  b.head.add(crown);

  const cosmicRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.82, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  cosmicRing.rotation.x = Math.PI / 2;
  cosmicRing.position.y = 0.12;
  cosmicRing.visible = tier >= 4;
  root.add(cosmicRing);

  return {
    root,
    bones: b,
    torsoMesh,
    wingsGroup,
    hoverGroup,
    jetGroup,
    crown,
    cosmicRing,
    setVisualTier(newTier, boostTier = 0) {
      const activeTier = Math.max(newTier, boostTier);
      const col = TIER_SUITS[activeTier] || OUTFIT_COLORS[skin % OUTFIT_COLORS.length];
      suitMat.color.setHex(col);
      wingsGroup.visible = activeTier === 1 || activeTier === 4;
      hoverGroup.visible = activeTier >= 2;
      jetGroup.visible = activeTier >= 3;
      crown.visible = activeTier >= 4;
      cosmicRing.visible = activeTier >= 4;
    },
  };
}

export function createRunners(scene) {
  const live = new Map(); // id -> entry

  const formatDist = m => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

  function updateLabelText(e) {
    const r = e.runner;
    const rankStr = e.rank && e.rank <= 8 ? `🏆#${e.rank} ` : '';
    const dStr = r.diamonds > 0 ? ` · 💎${r.diamonds}` : '';
    e.nameEl.textContent = `${rankStr}${r.name} · ${formatDist(r.distanceM || 0)}${dStr}`;
    const activeTier = Math.max(r.tier || 0, r.boostTier || 0);
    e.nameEl.className = 'label' + (activeTier >= 4 ? ' tier4' : activeTier === 3 ? ' tier3' : activeTier === 2 ? ' tier2' : activeTier === 1 ? ' tier1' : '');
  }

  function remove(id) {
    const e = live.get(id);
    if (!e) return;
    clearTimeout(e.bubbleTimer);
    e.label.element.remove();
    e.holder.removeFromParent();
    live.delete(id);
  }

  return {
    addOrUpdate(runner) {
      let e = live.get(runner.id);
      if (!e) {
        const holder = new THREE.Group();
        const rig = buildRunnerRig(runner.skin, Math.max(runner.tier || 0, runner.boostTier || 0));
        holder.add(rig.root);

        const el = document.createElement('div');
        el.style.cssText = 'display:flex;flex-direction:column;align-items:center';
        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'label bubble';
        bubbleEl.style.display = 'none';
        const nameEl = document.createElement('div');
        nameEl.className = 'label';
        el.append(bubbleEl, nameEl);

        const label = new CSS2DObject(el);
        label.center.set(0.5, 1);
        label.position.set(0, 2.25, 0);
        holder.add(label);

        const targetX = (runner.lane || 0) * 1.12;
        const targetZ = 7.5 - Math.min(4.5, (runner.tier || 0) * 1.1);
        holder.position.set(targetX, 0, targetZ + 4);
        scene.add(holder);

        e = {
          runner: { ...runner },
          holder,
          rig,
          label,
          nameEl,
          bubbleEl,
          targetX,
          targetZ,
          phase: Math.random() * Math.PI * 2,
          rank: null,
          activeUntil: performance.now() + 5000,
        };
        live.set(runner.id, e);
      } else {
        if ((runner.diamonds || 0) > (e.runner.diamonds || 0) || (runner.boostTier || 0) > 0) {
          e.activeUntil = performance.now() + 6000;
        }
        Object.assign(e.runner, runner);
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
      }
      updateLabelText(e);
    },
    remove,
    clear() {
      for (const id of [...live.keys()]) remove(id);
    },
    say(id, text, ms = 6000) {
      const e = live.get(id);
      if (!e) return;
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
        e.bubbleTimer = setTimeout(() => { e.bubbleEl.style.display = 'none'; }, 500);
      }, ms);
    },
    syncTick(runnersList = [], board = []) {
      const rankMap = new Map();
      board.forEach((b, i) => rankMap.set(b.uid, i + 1));

      for (const item of runnersList) {
        const e = live.get(item.id);
        if (!e) continue;
        Object.assign(e.runner, item);
        e.rank = rankMap.get(item.id) || null;
        e.rig.setVisualTier(e.runner.tier || 0, e.runner.boostTier || 0);
        // Position leaders closer to the front of the pack (-1.5 .. 9.5)
        const rankBonus = e.rank ? Math.max(0, (9 - e.rank) * 0.65) : 0;
        const boostBonus = (e.runner.boostTier || 0) * 0.9;
        e.targetZ = Math.max(1.2, 9.2 - rankBonus - boostBonus);
        updateLabelText(e);
      }
    },
    count: () => live.size,
    update(now, dt) {
      let maxSpeed = 1.0;
      let shownLabels = 0;
      for (const e of live.values()) {
        const spd = e.runner.speedMult || 1.0;
        if (spd > maxSpeed) maxSpeed = spd;

        const hasBubble = e.bubbleEl.style.display !== 'none';
        const isTop3 = e.rank && e.rank <= 3;
        const isBoosted = (e.runner.boostTier || 0) > 0;
        const isRecent = now < (e.activeUntil || 0);
        const shouldShow = hasBubble || isTop3 || isBoosted || (isRecent && shownLabels < 4);
        if (shouldShow) shownLabels++;
        e.label.visible = Boolean(shouldShow);

        e.phase += dt * (7.5 + spd * 3.2);
        const s = Math.sin(e.phase);
        const c = Math.cos(e.phase);

        // Smooth position interpolation on the highway
        const swayX = Math.sin(now / 900 + e.phase * 0.1) * 0.14;
        e.holder.position.x += (e.targetX + swayX - e.holder.position.x) * Math.min(1, dt * 4);
        e.holder.position.z += (e.targetZ - e.holder.position.z) * Math.min(1, dt * 3);

        const activeTier = Math.max(e.runner.tier || 0, e.runner.boostTier || 0);
        const b = e.rig.bones;
        if (activeTier >= 2) {
          // Surfing pose on Golden Hoverboard / Rocket Jet
          b.hips.position.y = 1.06 + Math.sin(e.phase * 0.6) * 0.06;
          b.torso.rotation.x = 0.24;
          b.leftLeg.rotation.x = -0.25;
          b.rightLeg.rotation.x = 0.25;
          b.leftArm.rotation.x = -0.45 + s * 0.15;
          b.rightArm.rotation.x = -0.45 - s * 0.15;
        } else {
          // Energetic running stride
          b.hips.position.y = 0.92 + Math.abs(c) * 0.09;
          b.torso.rotation.x = 0.18 + Math.abs(s) * 0.05;
          b.leftLeg.rotation.x = s * 0.85;
          b.rightLeg.rotation.x = -s * 0.85;
          b.leftArm.rotation.x = -s * 0.75;
          b.rightArm.rotation.x = s * 0.75;
        }

        if (e.rig.wingsGroup.visible) {
          e.rig.wingsGroup.children[0].rotation.y = Math.sin(e.phase * 1.5) * 0.35;
          e.rig.wingsGroup.children[1].rotation.y = -Math.sin(e.phase * 1.5) * 0.35;
        }
        if (e.rig.cosmicRing.visible) {
          e.rig.cosmicRing.rotation.z += dt * 2.5;
        }
      }
      return maxSpeed;
    },
  };
}
