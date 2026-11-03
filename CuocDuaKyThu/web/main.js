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
const urlParams = new URLSearchParams(location.search);
const RENDER_SCALE = urlParams.get('hd') === '1' ? 1.0 : 0.67;
const ENABLE_BLOOM = urlParams.get('bloom') === '1';
const ENABLE_SHADOWS = urlParams.get('shadows') === '1';

const stageEl = document.getElementById('stage');
const fit = () => {
  const scale = Math.min(innerWidth / W, innerHeight / H);
  stageEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
};
addEventListener('resize', fit);
fit();

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  powerPreference: 'high-performance',
  antialias: false,
  stencil: false,
});
renderer.setPixelRatio(RENDER_SCALE);
renderer.setSize(W, H, true);
renderer.shadowMap.enabled = ENABLE_SHADOWS;
if (ENABLE_SHADOWS) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(W, H);

const scene = new THREE.Scene();
// PBR Image-Based Lighting (RoomEnvironment) calibrated so metallic landmarks gleam without overexposing the road
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();
scene.environmentIntensity = 0.24;

const camera = new THREE.PerspectiveCamera(48, W / H, 0.2, 120);
const RACE_CAM_POS = new THREE.Vector3(0, 4.4, 15.5);
const RACE_CAM_LOOK = new THREE.Vector3(0, 1.8, -12);
camera.position.copy(RACE_CAM_POS);
camera.lookAt(RACE_CAM_LOOK);

const raceDirector = {
  mode: 'rear_chase_master',
  focusRunnerId: null,
};

function triggerRaceCameraFocus() {
  // Camera panning disabled — keep steady rear chase master perspective
}

const world3d = buildRaceWorld(scene);
const runners = createRunners(scene);
const fx = createRaceFx(scene);
const hud = createRaceHud();
const audio = createRaceAudio({
  onSpeak: (text, on, kind, gender) => hud.showVoice(text, on, kind, gender),
});

let composer = null;
let bloomPass = null;
if (ENABLE_BLOOM) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.14, 0.28, 0.93);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
}

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
    case 'demoPurged':
      audio.purgeMockSpeech?.();
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
      if (bloomPass) {
        gsap.fromTo(bloomPass, { strength: 0.42 }, { strength: 0.22, duration: 1.4, ease: 'power2.out' });
      }
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
const seenDuaCloudEvents = new Set();

async function pollDuaCloud() {
  try {
    const res = await fetch(`/api/dua/poll?since=${duaCloudSeq}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.snapshot) handleMsg(data.snapshot);
      if (Array.isArray(data.messages)) {
        for (const m of data.messages) {
          if (m?._eid) {
            if (seenDuaCloudEvents.has(m._eid)) continue;
            seenDuaCloudEvents.add(m._eid);
            if (seenDuaCloudEvents.size > 400) {
              seenDuaCloudEvents.delete(seenDuaCloudEvents.values().next().value);
            }
          }
          handleMsg(m);
        }
      }
      if (typeof data.seq === 'number' && data.seq > duaCloudSeq) {
        duaCloudSeq = data.seq;
      }
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

function updateRaceCamera() {
  camera.position.copy(RACE_CAM_POS);
  camera.lookAt(RACE_CAM_LOOK);
  camera.rotation.z = 0;
  if (Math.abs(camera.fov - 48) > 0.02) {
    camera.fov = 48;
    camera.updateProjectionMatrix();
  }
}

let prev = performance.now();
const FRAME_INTERVAL_MS = 1000 / 30;
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) {
    prev = now;
    return;
  }
  const elapsedMs = now - prev;
  if (elapsedMs < FRAME_INTERVAL_MS) return;
  const dt = Math.min(elapsedMs / 1000, 0.1);
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

  if (composer) composer.render();
  else renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
requestAnimationFrame(frame);
