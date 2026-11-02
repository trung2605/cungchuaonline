import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { createWorld, applyMsg, stepWorld } from './scene/reducer.js';
import { buildHall } from './scene/hall.js';
import { createActors } from './scene/actors.js';
import { createFx } from './scene/fx.js';
import { createAudio } from './scene/audio.js';
import { createHud } from './hud.js';

const W = 1080, H = 1920;
const params = new URLSearchParams(location.search);
const low = params.get('quality') === 'low';
const RECONNECT_MS = 2000;

// Fit the fixed 1080x1920 stage into the window and center it horizontally/vertically.
const stage = document.getElementById('stage');
let rot = Number(params.get('rot') || 0);
const fit = () => {
  const swapped = Math.abs(rot) === 90;
  const scale = swapped
    ? Math.min(innerWidth / H, innerHeight / W)
    : Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
};
addEventListener('resize', fit);
fit();

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: !low });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = !low;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const labels = new CSS2DRenderer({ element: document.getElementById('labels') });
labels.setSize(W, H);

const scene = new THREE.Scene();
if (!low) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
}
// BR-07.1: AI Auto-Director Multi-Angle & Special-Target Focus Camera System
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120);
const CAM = new THREE.Vector3(0, 12, 21), LOOK = new THREE.Vector3(0, 1.2, -4);
camera.position.copy(CAM);
camera.lookAt(LOOK);

const coupletL = document.getElementById('couplet-l');
const coupletR = document.getElementById('couplet-r');

const TEMPLE_CAM_MODES = [
  'sanctuary_master',
  'vip_worshipper_focus',
  'front_reverse_worshippers',
  'diag_left_pillars',
  'diag_right_bell',
  'altar_devotion_zoom',
  'buddha_sacred_low',
  'high_crane_mandala',
];

const templeDirector = {
  mode: 'sanctuary_master',
  modeUntil: performance.now() + 7500,
  focusActorId: null,
  focusPriorityUntil: 0,
  sideSign: 1,
  curPos: CAM.clone(),
  curLook: LOOK.clone(),
  curFov: 50,
  curRoll: 0,
  targetPos: CAM.clone(),
  targetLook: LOOK.clone(),
  targetFov: 50,
  targetRoll: 0,
};

function triggerTempleCameraFocus(mode, actorId = null, holdMs = 6000, priority = false) {
  const now = performance.now();
  if (!priority && now < templeDirector.focusPriorityUntil) return;
  templeDirector.mode = mode;
  templeDirector.modeUntil = now + holdMs;
  if (priority) templeDirector.focusPriorityUntil = now + holdMs * 0.85;
  if (actorId) templeDirector.focusActorId = actorId;
  templeDirector.sideSign = Math.random() < 0.5 ? -1 : 1;
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Bloom only on flames and lanterns: high threshold so gilt highlights stay crisp.
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.5, 0.9);
if (params.get('bloom') !== '0') composer.addPass(bloomPass);
// Candlelit interiors fall off toward the frame edge; the vignette keeps the eye on the altar.
const vignette = new ShaderPass(VignetteShader);
// darkness mixes toward (1 - darkness): above 1 that color goes negative and tints the edges cyan.
vignette.uniforms.offset.value = 1.1;
vignette.uniforms.darkness.value = 1;
composer.addPass(vignette);
composer.addPass(new OutputPass());

const hall = buildHall(scene, { low, renderer });
const actors = await createActors(scene);
const fx = createFx(scene, { low, smokeOrigin: hall.smokeOrigin });
const hud = createHud();
const audio = createAudio({ onSpeak: (text, on) => hud.showVoice(text, on) });
const world = createWorld();

const soundBtn = document.getElementById('sound');
if (soundBtn) soundBtn.style.display = 'none';
const commentTtsBtn = document.getElementById('toggle-comment-tts');
const chuaBgmBtn = document.getElementById('toggle-chua-bgm');
let liveWs = null;

function syncChuaBgmBtn() {
  if (chuaBgmBtn && audio.getMusicLabel) {
    chuaBgmBtn.textContent = audio.getMusicLabel();
  }
}
if (chuaBgmBtn) {
  syncChuaBgmBtn();
  chuaBgmBtn.addEventListener('click', e => {
    e.stopPropagation();
    audio.unlock();
    audio.nextMusicTrack?.();
    syncChuaBgmBtn();
  });
  setInterval(syncChuaBgmBtn, 1500);
}

function syncCommentTtsBtn(on) {
  audio.setReadComments(on);
}

// Auto-unlock audio by default on load and on any interaction (mouse move, key, touch, focus)
audio.unlock();
const autoUnlock = () => {
  if (audio.suspended) audio.unlock();
};
for (const ev of ['pointerdown', 'pointermove', 'mousemove', 'touchstart', 'keydown', 'wheel', 'focus']) {
  addEventListener(ev, autoUnlock, { passive: true });
}

function run(cmds, now) {
  for (const c of cmds) {
    switch (c.op) {
      case 'reset': actors.clear(); break;
      case 'add':
        actors.add(c.actor);
        hud.notePrayer(c.actor);
        if (c.actor && !c.idle) {
          const isReal = !String(c.actor.id || '').startsWith('bot_') && !String(c.actor.id || '').startsWith('seed_');
          if (isReal || (c.actor.diamonds || 0) > 0) {
            triggerTempleCameraFocus(
              Math.random() < 0.45 ? 'front_reverse_worshippers' : 'vip_worshipper_focus',
              c.actor.id,
              5400,
              Boolean(c.actor.diamonds)
            );
          }
        }
        if (c.actor && !c.idle && !c.actor.diamonds && (!audio.readComments || !c.actor.prayer)) {
          audio.thankPrayer(c.actor);
        }
        break;
      case 'remove': actors.remove(c.id); break;
      case 'say': {
        actors.say(c.id, c.text, c.ms);
        const isReal = c.id && !String(c.id).startsWith('bot_') && !String(c.id).startsWith('seed_');
        triggerTempleCameraFocus(
          Math.random() < 0.4 ? 'front_reverse_worshippers' : 'vip_worshipper_focus',
          c.id,
          isReal ? 5800 : 4800,
          Boolean(isReal)
        );
        if (audio.readComments) {
          const actor = actors.actor(c.id) || world.actors.get(c.id)?.actor;
          if (actor && c.text) audio.speakComment(actor, c.text);
        }
        break;
      }
      case 'unsay': actors.unsay(c.id); break;
      case 'badge':
        actors.badge(c.id, c.diamonds);
        triggerTempleCameraFocus(
          Math.random() < 0.5 ? 'vip_worshipper_focus' : 'front_reverse_worshippers',
          c.id,
          6500,
          true
        );
        break;
      case 'scene':
        hall.setTheme(c.scene.theme, now);
        audio.setEnabled(c.scene.sound);
        if (c.scene.readComments !== undefined) syncCommentTtsBtn(Boolean(c.scene.readComments));
        if (c.scene.bgmTrack) {
          audio.setMusicTrack?.(c.scene.bgmTrack, c.scene.bgmSeq ?? null);
          syncChuaBgmBtn();
        }
        break;
      case 'hud':
        hud.handle(c.msg);
        if (c.msg.t === 'donor') audio.thankDonor(c.msg);
        break;
      case 'fx':
        if (c.kind === 'halo' && c.id) {
          actors.halo(c.id, now);
          triggerTempleCameraFocus('vip_worshipper_focus', c.id, 6200, true);
        } else {
          fx.spawn(c.kind, c.pos, c.power, now);
          if (c.kind === 'bell') {
            triggerTempleCameraFocus('diag_right_bell', null, 5800, false);
          } else if (c.kind === 'buddha_aura' || c.kind === 'dharma_wheel') {
            triggerTempleCameraFocus('buddha_sacred_low', null, 6200, false);
          } else if (c.kind === 'golden_rain' || c.kind === 'lantern_festival') {
            triggerTempleCameraFocus('high_crane_mandala', null, 6000, false);
          } else if (c.kind === 'lotus' || c.kind === 'lamp') {
            triggerTempleCameraFocus('altar_devotion_zoom', null, 5200, false);
          }
        }
        if (c.kind === 'bell' || c.kind === 'buddha_aura' || c.kind === 'golden_rain' || c.kind === 'dharma_wheel') {
          gsap.fromTo(bloomPass, { strength: 0.82 }, { strength: 0.55, duration: 1.5, ease: 'power2.out' });
          try {
            confetti({
              particleCount: 40,
              spread: 70,
              origin: { x: 0.5, y: 0.25 },
              colors: ['#facc15', '#fef08a', '#f472b6', '#fb923c'],
              disableForReducedMotion: true,
            });
          } catch {}
        }
        // Standalone temple sound resonance when FX is triggered from Admin or Auto-FX
        if (!c.id) {
          if (c.kind === 'bell' || c.kind === 'buddha_aura') audio.bell();
          else if (c.kind === 'dharma_wheel' || c.kind === 'lantern_festival' || c.kind === 'golden_rain') audio.mediumBell();
          else if (c.kind === 'lotus' || c.kind === 'lamp' || c.kind === 'peach_blossom') audio.chime();
          else if (c.kind === 'smoke') audio.softBowl();
        }
        break;
    }
  }
}

const receive = msg => { const now = performance.now(); run(applyMsg(world, msg, now), now); };
// Manual tests (TC-07.15/16) fire StageMsg from the console: stageMsg({t:'fx',kind:'bell',power:1}).
if (params.get('debug') === '1') window.stageMsg = receive;

// BR-07.11: reconnect every 2 s; the server sends a fresh snapshot on connect.
(function connect() {
  const ws = new WebSocket(`ws://${location.host}`);
  liveWs = ws;
  ws.onmessage = e => receive(JSON.parse(e.data));
  ws.onclose = () => setTimeout(connect, RECONNECT_MS);
})();

const fpsEl = document.getElementById('fps');
if (params.get('fps') === '1') fpsEl.style.display = 'block';
let frames = 0, fpsT = performance.now(), last = performance.now();

function updateTempleCamera(poses, now, dt) {
  if (now >= templeDirector.modeUntil) {
    // Pick a new random broadcast angle without repeating the current one
    const candidates = TEMPLE_CAM_MODES.filter(m => m !== templeDirector.mode);
    const nextMode = candidates[Math.floor(Math.random() * candidates.length)] || 'sanctuary_master';
    templeDirector.mode = nextMode;
    templeDirector.modeUntil = now + 7000 + Math.random() * 3200;
    templeDirector.sideSign = Math.random() < 0.5 ? -1 : 1;
    const best = actors.getCameraFocusActor?.(poses, now);
    templeDirector.focusActorId = best ? best.id : null;
  }

  // Resolve special target worshipper position (or fallback to best active worshipper / altar center)
  let focusTarget = templeDirector.focusActorId ? actors.getPos?.(templeDirector.focusActorId) : null;
  if (!focusTarget) {
    focusTarget = actors.getCameraFocusActor?.(poses, now) || { x: 0, y: 0, z: -5.2, tier: 0 };
  }

  const tSec = now / 1000;
  const breathX = Math.sin(tSec * 0.55) * 0.22;
  const breathY = Math.cos(tSec * 0.42) * 0.1;
  const breathZ = Math.sin(tSec * 0.38) * 0.25;
  const side = templeDirector.sideSign || 1;

  const tx = THREE.MathUtils.clamp(focusTarget.x || 0, -5.2, 5.2);
  const tz = THREE.MathUtils.clamp(focusTarget.z ?? -4.5, -7.2, 6.5);

  switch (templeDirector.mode) {
    case 'vip_worshipper_focus': {
      // Dynamic diagonal medium close-up on the special worshipper (donor / speaker / altar devotee)
      const camSide = tx >= 0 ? -1 : 1;
      templeDirector.targetPos.set(
        THREE.MathUtils.clamp(tx + camSide * 2.55 + breathX * 0.6, -5.8, 5.8),
        2.35 + breathY * 0.5,
        THREE.MathUtils.clamp(tz + 4.1 + breathZ * 0.5, -1.5, 13.5)
      );
      templeDirector.targetLook.set(tx * 0.85, 1.18, tz - 1.35);
      templeDirector.targetFov = 39;
      templeDirector.targetRoll = camSide * 0.009;
      break;
    }
    case 'front_reverse_worshippers': {
      // Front-Reverse angle from near the Altar looking back (+Z) at the faces & joined hands of worshippers
      const revX = THREE.MathUtils.clamp(tx * 0.45 + side * 1.9 + breathX * 0.5, -4.2, 4.2);
      const lookZ = THREE.MathUtils.clamp(tz, -4.5, 2.8);
      templeDirector.targetPos.set(revX, 2.65 + breathY * 0.5, -6.15 + breathZ * 0.3);
      templeDirector.targetLook.set(tx * 0.65, 1.08, lookZ);
      templeDirector.targetFov = 42;
      templeDirector.targetRoll = -side * 0.008;
      break;
    }
    case 'diag_left_pillars': {
      // 45° Diagonal Steadicam from the Left Golden Pillars across the congregation toward the Altar
      templeDirector.targetPos.set(-5.6 + breathX, 4.85 + breathY, 9.4 + breathZ);
      templeDirector.targetLook.set(0.35, 2.05, -7.2);
      templeDirector.targetFov = 44;
      templeDirector.targetRoll = 0.012;
      break;
    }
    case 'diag_right_bell': {
      // 45° Diagonal Steadicam from the Right (Đại Hồng Chung side) sweeping across the red carpet
      templeDirector.targetPos.set(5.6 + breathX, 4.65 + breathY, 8.9 + breathZ);
      templeDirector.targetLook.set(-0.35, 2.1, -7.4);
      templeDirector.targetFov = 43;
      templeDirector.targetRoll = -0.012;
      break;
    }
    case 'altar_devotion_zoom': {
      // Telephoto zoom into the Altar, glowing Censer, and the 3 Altar Worshippers bowing
      templeDirector.targetPos.set(breathX * 0.7, 4.8 + breathY * 0.6, 7.6 + breathZ * 0.6);
      templeDirector.targetLook.set(tx * 0.35, 1.85, -7.6);
      templeDirector.targetFov = 38;
      templeDirector.targetRoll = 0;
      break;
    }
    case 'buddha_sacred_low': {
      // Low-angle sacred crane on the red carpet looking up past the censer toward the Golden Buddha
      templeDirector.targetPos.set(side * 0.85 + breathX * 0.5, 2.15 + breathY * 0.4, 2.9 + breathZ * 0.5);
      templeDirector.targetLook.set(0, 3.35, -9.2);
      templeDirector.targetFov = 43;
      templeDirector.targetRoll = 0;
      break;
    }
    case 'high_crane_mandala': {
      // High Drone / Overhead Crane sweeping above the symmetrical temple hall
      templeDirector.targetPos.set(side * 3.1 + breathX, 13.6 + breathY, 15.8 + breathZ);
      templeDirector.targetLook.set(0, 0.95, -4.6);
      templeDirector.targetFov = 52;
      templeDirector.targetRoll = -side * 0.01;
      break;
    }
    case 'sanctuary_master':
    default: {
      // Classic Master Shot with gentle orbit sway
      const sway = Math.sin(now / 14000 * Math.PI * 2) * 1.15;
      templeDirector.targetPos.set(sway, 12 + breathY, 21 + breathZ);
      templeDirector.targetLook.set(0, 1.2, -4);
      templeDirector.targetFov = 50;
      templeDirector.targetRoll = 0;
      break;
    }
  }

  // Smooth spring-like exponential damping for broadcast-grade camera motion
  const posAlpha = Math.min(1, dt * 1.85);
  const lookAlpha = Math.min(1, dt * 2.4);
  const fovAlpha = Math.min(1, dt * 2.1);

  templeDirector.curPos.lerp(templeDirector.targetPos, posAlpha);
  templeDirector.curLook.lerp(templeDirector.targetLook, lookAlpha);
  templeDirector.curFov += (templeDirector.targetFov - templeDirector.curFov) * fovAlpha;
  templeDirector.curRoll += (templeDirector.targetRoll - templeDirector.curRoll) * posAlpha;

  camera.position.copy(templeDirector.curPos);
  camera.lookAt(templeDirector.curLook);
  camera.rotation.z += templeDirector.curRoll + Math.sin(tSec * 0.9) * 0.004;
  if (Math.abs(camera.fov - templeDirector.curFov) > 0.02) {
    camera.fov = templeDirector.curFov;
    camera.updateProjectionMatrix();
  }

  // Fade 2D couplets when camera leaves the master perspective so they never overlap close-up 3D angles
  const showCouplets = templeDirector.mode === 'sanctuary_master' && templeDirector.curPos.distanceTo(CAM) < 4.2;
  const coupletOpacity = showCouplets ? '1' : '0';
  if (coupletL && coupletL.style.opacity !== coupletOpacity) coupletL.style.opacity = coupletOpacity;
  if (coupletR && coupletR.style.opacity !== coupletOpacity) coupletR.style.opacity = coupletOpacity;
}

renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;

  const { poses, removed } = stepWorld(world, now);
  for (const id of removed) actors.remove(id);
  hud.setHallCount(poses.length);
  const altar = [null, null, null];
  for (const [id, p] of poses) if (p.phase === 'altar') altar[p.spot] = actors.actor(id);
  altar.forEach((a, i) => hud.altar(i, a));
  if (actors.update(poses, now, dt) > 0) audio.woodBlock(now);

  hall.update(now);
  fx.update(now, dt);
  updateTempleCamera(poses, now, dt);
  composer.render();
  labels.render(scene, camera);

  frames++;
  if (now - fpsT >= 1000) {
    fpsEl.textContent = `${frames} fps · ${poses.length}`;
    frames = 0;
    fpsT = now;
  }
});
