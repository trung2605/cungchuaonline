import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { buildRaceWorld, getTrailPose } from './scene/world3d.js';
import { createRunners } from './scene/runners.js';
import { createRaceFx } from './scene/fx.js';
import { createRaceAudio } from './scene/audio.js';
import { createRaceHud } from './hud.js';

const W = 1080, H = 1920;
const stageEl = document.getElementById('stage');
const fit = () => {
  const scale = Math.min(innerWidth / W, innerHeight / H);
  stageEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
};
addEventListener('resize', fit);
fit();

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, powerPreference: 'high-performance', antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(W, H);

const scene = new THREE.Scene();
// PBR Image-Based Lighting (RoomEnvironment) calibrated so metallic landmarks gleam without overexposing the road
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.24;

const camera = new THREE.PerspectiveCamera(48, W / H, 0.2, 120);
camera.position.set(0, 4.4, 15.5);
camera.lookAt(0, 1.8, -12);

const RACE_CAM_MODES = [
  'rear_chase_master',
  'vip_target_zoom',
  'front_lead_closeup',
  'diag_left_sweep',
  'diag_right_sweep',
  'low_hero_landmark',
  'side_dolly_glide',
  'drone_high_crane',
];

const raceDirector = {
  mode: 'rear_chase_master',
  modeUntil: performance.now() + 7000,
  focusRunnerId: null,
  focusPriorityUntil: 0,
  sideSign: 1,
  curPos: new THREE.Vector3(0, 4.4, 15.5),
  curLook: new THREE.Vector3(0, 1.8, -12),
  curFov: 48,
  curRoll: 0,
  targetPos: new THREE.Vector3(0, 4.4, 15.5),
  targetLook: new THREE.Vector3(0, 1.8, -12),
  targetFov: 48,
  targetRoll: 0,
};

function triggerRaceCameraFocus(mode, runnerId = null, holdMs = 5800, priority = false) {
  const now = performance.now();
  if (!priority && now < raceDirector.focusPriorityUntil) return;
  raceDirector.mode = mode;
  raceDirector.modeUntil = now + holdMs;
  if (priority) raceDirector.focusPriorityUntil = now + holdMs * 0.85;
  if (runnerId) raceDirector.focusRunnerId = runnerId;
  raceDirector.sideSign = Math.random() < 0.5 ? -1 : 1;
}

const world3d = buildRaceWorld(scene);
const runners = createRunners(scene);
const fx = createRaceFx(scene);
const hud = createRaceHud();
const audio = createRaceAudio({
  onSpeak: (text, on, kind, gender) => hud.showVoice(text, on, kind, gender),
});

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.14, 0.28, 0.93);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const soundBtn = document.getElementById('sound');
const commentTtsBtn = document.getElementById('toggle-comment-tts');
const bgmBtn = document.getElementById('toggle-bgm');
let liveWs = null;

function syncSoundBtn() {
  if (!soundBtn) return;
  soundBtn.style.display = audio.needsInteraction ? 'block' : 'none';
}
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    audio.unlock();
    syncSoundBtn();
  });
}
setInterval(syncSoundBtn, 600);

function syncBgmBtn() {
  if (!bgmBtn || !audio.getBgmLabel) return;
  bgmBtn.textContent = audio.getBgmLabel();
  bgmBtn.classList.remove('off');
}
setInterval(syncBgmBtn, 2000);

function syncCommentTtsBtn(on) {
  audio.setReadComments(on);
}

// Auto-unlock audio by default on load and on any interaction
audio.unlock();
setTimeout(syncSoundBtn, 900);
const autoUnlock = () => {
  audio.unlock();
  syncSoundBtn();
};
for (const ev of ['pointerdown', 'pointermove', 'mousemove', 'touchstart', 'keydown', 'wheel', 'focus', 'click']) {
  addEventListener(ev, autoUnlock, { passive: true });
}

let lastBiomeId = '';
function applyBiomeChange(biome, distM = 0) {
  const bId = biome?.id || '';
  world3d.setBiome(bId);
  hud.setBiome(biome, distM);
  if (bId && bId !== lastBiomeId) {
    lastBiomeId = bId;
    fx.setBiome?.(bId);
    audio.setBiomeMusic?.(bId, biome);
    syncBgmBtn();
    // Smooth GSAP cinematic FOV breath on landmark change
    gsap.fromTo(
      camera,
      { fov: 50.8 },
      { fov: 48, duration: 1.35, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }
    );
  } else if (biome) {
    audio.syncProvinceMilestone?.(biome);
  }
}

function handleMsg(msg) {
  switch (msg.t) {
    case 'snapshot':
      runners.clear();
      for (const r of msg.runners || []) runners.addOrUpdate(r);
      applyBiomeChange(msg.biome, msg.worldDistanceM || 0);
      hud.updateBoard(msg.board || []);
      if (msg.giftChest) hud.updateGiftChest?.(msg.giftChest, false);
      hud.setActiveCount(runners.count());
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      if (msg.scene?.readComments !== undefined) syncCommentTtsBtn(Boolean(msg.scene.readComments));
      if (msg.scene?.bgmVocal !== undefined || msg.scene?.bgmVocalVolume !== undefined) {
        audio.setBgmVocal?.(msg.scene.bgmVocal, msg.scene.bgmVocalVolume);
      }
      break;
    case 'spawn':
      runners.addOrUpdate(msg.runner);
      hud.setActiveCount(runners.count());
      if (msg.runner && !String(msg.runner.id || '').startsWith('bot_') && !String(msg.runner.id || '').startsWith('seed_')) {
        triggerRaceCameraFocus(
          Math.random() < 0.5 ? 'front_lead_closeup' : 'vip_target_zoom',
          msg.runner.id,
          5200,
          Boolean(msg.runner.diamonds)
        );
      }
      break;
    case 'welcome':
      hud.showWelcome(msg);
      if (msg.id && !String(msg.id).startsWith('bot_') && !String(msg.id).startsWith('seed_')) {
        triggerRaceCameraFocus('front_lead_closeup', msg.id, 5200, false);
      }
      if (!msg.fromGift) audio.greetJoin(msg);
      break;
    case 'boost':
      runners.addOrUpdate(msg.runner);
      if (msg.runner?.id) {
        triggerRaceCameraFocus(
          Math.random() < 0.55 ? 'vip_target_zoom' : 'front_lead_closeup',
          msg.runner.id,
          6400,
          true
        );
      }
      break;
    case 'leave':
      runners.remove(msg.id);
      hud.setActiveCount(runners.count());
      break;
    case 'say': {
      runners.say(msg.id, msg.text, msg.ms);
      const isReal = msg.id && !String(msg.id).startsWith('bot_') && !String(msg.id).startsWith('seed_');
      triggerRaceCameraFocus(
        Math.random() < 0.45 ? 'front_lead_closeup' : 'vip_target_zoom',
        msg.id,
        isReal ? 5600 : 4500,
        Boolean(isReal)
      );
      if (audio.readComments && msg.text) {
        audio.speakComment({ id: msg.id, name: msg.name, src: msg.src }, msg.text);
      }
      break;
    }
    case 'donor':
      hud.showDonor(msg);
      audio.announceGift(msg);
      if (msg.id) {
        triggerRaceCameraFocus(
          Math.random() < 0.5 ? 'vip_target_zoom' : 'front_lead_closeup',
          msg.id,
          6800,
          true
        );
      }
      try {
        const isBig = msg.overtookKing || msg.chestUnlocked || (msg.tier || 1) >= 2;
        confetti({
          particleCount: isBig ? 65 : 28,
          spread: isBig ? 85 : 55,
          origin: { x: 0.5, y: 0.26 },
          colors: ['#fbbf24', '#fde047', '#ef4444', '#38bdf8', '#f472b6'],
          disableForReducedMotion: true,
        });
      } catch {}
      break;
    case 'fx':
      fx.spawn(msg.kind, msg.power);
      gsap.fromTo(bloomPass, { strength: 0.42 }, { strength: 0.22, duration: 1.4, ease: 'power2.out' });
      if (msg.kind === 'warp' || msg.kind === 'turbo') {
        triggerRaceCameraFocus('low_hero_landmark', null, 5500, false);
      }
      break;
    case 'biome':
      applyBiomeChange(msg.biome, msg.worldDistanceM);
      break;
    case 'banner':
      hud.showBanner(msg.text, msg.ms);
      break;
    case 'worldTick':
      applyBiomeChange(msg.biome, msg.worldDistanceM);
      hud.updateBoard(msg.board || []);
      if (msg.giftChest) hud.updateGiftChest?.(msg.giftChest, false);
      runners.syncTick(msg.runners || [], msg.board || []);
      hud.setActiveCount(runners.count());
      break;
    case 'scene':
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      if (msg.scene?.readComments !== undefined) syncCommentTtsBtn(Boolean(msg.scene.readComments));
      if (msg.scene?.bgmVocal !== undefined || msg.scene?.bgmVocalVolume !== undefined) {
        audio.setBgmVocal?.(msg.scene.bgmVocal, msg.scene.bgmVocalVolume);
      }
      break;
  }
}

// Hybrid Real-Time Transport: Local WebSocket (:8789) + Vercel Cloud HTTP Polling (/api/dua/poll)
let duaCloudPollingActive = false;
let duaCloudSeq = 0;

async function pollDuaCloud() {
  try {
    const res = await fetch(`/api/dua/poll?since=${duaCloudSeq}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.snapshot) handleMsg(data.snapshot);
      if (Array.isArray(data.messages)) {
        for (const m of data.messages) handleMsg(m);
      }
      if (typeof data.seq === 'number') duaCloudSeq = data.seq;
    }
  } catch {}
  if (duaCloudPollingActive) setTimeout(pollDuaCloud, 1200);
}

function startDuaCloudPolling() {
  if (duaCloudPollingActive) return;
  duaCloudPollingActive = true;
  pollDuaCloud();
}

function connect() {
  if (location.protocol === 'https:' || location.pathname.startsWith('/dua')) {
    startDuaCloudPolling();
    return;
  }
  let opened = false;
  const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${wsProto}//${location.host}`);
  liveWs = ws;
  ws.onopen = () => { opened = true; };
  ws.onmessage = e => handleMsg(JSON.parse(e.data));
  ws.onclose = () => {
    if (!opened && location.port !== '8789') {
      startDuaCloudPolling();
      return;
    }
    setTimeout(connect, 2000);
  };
}
connect();

function updateRaceCamera(now, dt) {
  if (now >= raceDirector.modeUntil) {
    const candidates = RACE_CAM_MODES.filter(m => m !== raceDirector.mode);
    const nextMode = candidates[Math.floor(Math.random() * candidates.length)] || 'rear_chase_master';
    raceDirector.mode = nextMode;
    raceDirector.modeUntil = now + 6500 + Math.random() * 3200;
    raceDirector.sideSign = Math.random() < 0.5 ? -1 : 1;
    const best = runners.getCameraSpotlightTarget?.(now);
    raceDirector.focusRunnerId = best ? best.id : null;
  }

  let focusRunner = raceDirector.focusRunnerId ? runners.getRunnerPose?.(raceDirector.focusRunnerId) : null;
  if (!focusRunner) {
    focusRunner = runners.getCameraSpotlightTarget?.(now);
    if (focusRunner) raceDirector.focusRunnerId = focusRunner.id;
  }

  const nearPose = getTrailPose(10);
  const midPose = getTrailPose(-3.5);
  const lookPose = getTrailPose(-15);

  const tSec = now / 1000;
  const breathX = Math.sin(tSec * 0.68) * 0.24;
  const breathY = Math.cos(tSec * 0.52) * 0.08;
  const breathZ = Math.sin(tSec * 0.45) * 0.25;
  const side = raceDirector.sideSign || 1;

  const rx = focusRunner ? focusRunner.x : midPose.x;
  const ry = focusRunner ? focusRunner.y : midPose.y;
  const rz = focusRunner ? THREE.MathUtils.clamp(focusRunner.z, -8.5, -0.8) : -2.2;

  switch (raceDirector.mode) {
    case 'vip_target_zoom': {
      // Dynamic Zoom & Tracking on Special Target (VIP Donor / Mount / Top #1 / Commenter)
      const camSide = rx >= midPose.x ? -1 : 1;
      raceDirector.targetPos.set(
        rx + camSide * 2.15 + breathX * 0.5,
        ry + 1.65 + breathY * 0.4,
        rz + 4.8 + breathZ * 0.4
      );
      raceDirector.targetLook.set(
        rx * 0.85 + lookPose.x * 0.15,
        ry + 0.88,
        rz - 5.5
      );
      raceDirector.targetFov = 37;
      raceDirector.targetRoll = camSide * 0.012 - nearPose.angleY * 0.03;
      break;
    }
    case 'front_lead_closeup': {
      // Front-Lead Hero Shot: Camera moves in front of the pack while spotlight walkers turn & wave toward the lens!
      const camSide = rx >= 0 ? -1 : 1;
      raceDirector.targetPos.set(
        rx + camSide * 1.75 + breathX * 0.45,
        ry + 1.52 + breathY * 0.35,
        rz + 3.65 + breathZ * 0.35
      );
      raceDirector.targetLook.set(
        rx * 0.82 + lookPose.x * 0.18,
        ry + 0.82,
        rz - 6.2
      );
      raceDirector.targetFov = 38;
      raceDirector.targetRoll = camSide * 0.01;
      break;
    }
    case 'diag_left_sweep': {
      // 45° Left Diagonal Broadcast Camera sweeping across the walkers & 3D landmark
      raceDirector.targetPos.set(
        midPose.x - 3.9 + breathX,
        midPose.y + 2.65 + breathY,
        7.8 + breathZ
      );
      raceDirector.targetLook.set(
        lookPose.x * 0.38 + 0.65,
        1.65 + lookPose.y * 0.2,
        -14.5
      );
      raceDirector.targetFov = 42;
      raceDirector.targetRoll = 0.016 - nearPose.angleY * 0.035;
      break;
    }
    case 'diag_right_sweep': {
      // 45° Right Diagonal Broadcast Camera sweeping across the walkers & 3D landmark
      raceDirector.targetPos.set(
        midPose.x + 3.9 + breathX,
        midPose.y + 2.65 + breathY,
        7.8 + breathZ
      );
      raceDirector.targetLook.set(
        lookPose.x * 0.38 - 0.65,
        1.65 + lookPose.y * 0.2,
        -14.5
      );
      raceDirector.targetFov = 42;
      raceDirector.targetRoll = -0.016 - nearPose.angleY * 0.035;
      break;
    }
    case 'low_hero_landmark': {
      // Low-angle Hero Shot near the road surface looking up past the striding walkers toward the towering 3D landmark
      raceDirector.targetPos.set(
        midPose.x * 0.4 + side * 1.35 + breathX * 0.6,
        nearPose.y + 1.42 + breathY * 0.35,
        9.4 + breathZ * 0.6
      );
      raceDirector.targetLook.set(
        lookPose.x * 0.32,
        2.55 + lookPose.y * 0.25,
        -18.0
      );
      raceDirector.targetFov = 45;
      raceDirector.targetRoll = -side * 0.01;
      break;
    }
    case 'side_dolly_glide': {
      // Side Dolly Glide tracking parallel alongside the walking pack
      raceDirector.targetPos.set(
        rx * 0.5 + side * 3.45 + breathX * 0.6,
        ry + 2.1 + breathY * 0.4,
        rz + 6.2 + breathZ * 0.5
      );
      raceDirector.targetLook.set(
        rx * 0.55 - side * 0.5,
        ry + 1.15,
        rz - 8.5
      );
      raceDirector.targetFov = 41;
      raceDirector.targetRoll = -side * 0.014;
      break;
    }
    case 'drone_high_crane': {
      // High Drone / Flycam Crane overlooking the entire cross-Vietnam expedition & valley/bay terrain
      raceDirector.targetPos.set(
        nearPose.x * 0.35 + side * 2.6 + breathX,
        6.95 + nearPose.y * 0.25 + breathY,
        17.8 + breathZ
      );
      raceDirector.targetLook.set(
        lookPose.x * 0.3,
        1.25 + lookPose.y * 0.18,
        -13.5
      );
      raceDirector.targetFov = 52;
      raceDirector.targetRoll = -side * 0.012 - nearPose.angleY * 0.04;
      break;
    }
    case 'rear_chase_master':
    default: {
      // Balanced Rear Steadicam Chase
      raceDirector.targetPos.set(
        nearPose.x * 0.34 + breathX,
        4.35 + nearPose.y * 0.25 + breathY,
        15.2 + breathZ
      );
      raceDirector.targetLook.set(
        lookPose.x * 0.28,
        1.75 + lookPose.y * 0.18,
        -14.0
      );
      raceDirector.targetFov = 48;
      raceDirector.targetRoll = -nearPose.angleY * 0.045;
      break;
    }
  }

  const posAlpha = Math.min(1, dt * 2.1);
  const lookAlpha = Math.min(1, dt * 2.6);
  const fovAlpha = Math.min(1, dt * 2.2);

  raceDirector.curPos.lerp(raceDirector.targetPos, posAlpha);
  raceDirector.curLook.lerp(raceDirector.targetLook, lookAlpha);
  raceDirector.curFov += (raceDirector.targetFov - raceDirector.curFov) * fovAlpha;
  raceDirector.curRoll += (raceDirector.targetRoll - raceDirector.curRoll) * posAlpha;

  camera.position.copy(raceDirector.curPos);
  camera.lookAt(raceDirector.curLook);
  camera.rotation.z += raceDirector.curRoll + Math.sin(tSec * 0.85) * 0.006;
  if (Math.abs(camera.fov - raceDirector.curFov) > 0.02) {
    camera.fov = raceDirector.curFov;
    camera.updateProjectionMatrix();
  }
}

let prev = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - prev) / 1000, 0.1);
  prev = now;

  updateRaceCamera(now, dt);
  const packSpeed = runners.update(now, dt, {
    focusId: raceDirector.focusRunnerId,
    mode: raceDirector.mode,
    camX: camera.position.x,
    camZ: camera.position.z,
  });
  world3d.update(dt, Math.min(1.38, 0.85 + (packSpeed - 1) * 0.1));
  fx.update(dt);

  composer.render();
  labelRenderer.render(scene, camera);
}
requestAnimationFrame(frame);
