import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
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

const world3d = buildRaceWorld(scene);
const runners = createRunners(scene);
const fx = createRaceFx(scene);
const hud = createRaceHud();
const audio = createRaceAudio({
  onSpeak: (text, on) => hud.showVoice(text, on),
});

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.14, 0.28, 0.93);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const soundBtn = document.getElementById('sound');
if (soundBtn) soundBtn.style.display = 'none';
const commentTtsBtn = document.getElementById('toggle-comment-tts');
const bgmBtn = document.getElementById('toggle-bgm');
let liveWs = null;

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
const autoUnlock = () => {
  if (audio.suspended) audio.unlock();
};
for (const ev of ['pointerdown', 'pointermove', 'mousemove', 'touchstart', 'keydown', 'wheel', 'focus']) {
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
    audio.setBiomeMusic?.(bId);
    syncBgmBtn();
    // Smooth GSAP cinematic FOV breath on landmark change
    gsap.fromTo(
      camera,
      { fov: 50.8 },
      { fov: 48, duration: 1.35, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }
    );
  }
}

function handleMsg(msg) {
  switch (msg.t) {
    case 'snapshot':
      runners.clear();
      for (const r of msg.runners || []) runners.addOrUpdate(r);
      applyBiomeChange(msg.biome, msg.worldDistanceM || 0);
      hud.updateBoard(msg.board || []);
      hud.setActiveCount(runners.count());
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      if (msg.scene?.readComments !== undefined) syncCommentTtsBtn(Boolean(msg.scene.readComments));
      break;
    case 'spawn':
      runners.addOrUpdate(msg.runner);
      hud.setActiveCount(runners.count());
      break;
    case 'welcome':
      hud.showWelcome(msg);
      if (!msg.fromGift) audio.greetJoin(msg);
      break;
    case 'boost':
      runners.addOrUpdate(msg.runner);
      break;
    case 'leave':
      runners.remove(msg.id);
      hud.setActiveCount(runners.count());
      break;
    case 'say':
      runners.say(msg.id, msg.text, msg.ms);
      if (audio.readComments && msg.text) {
        audio.speakComment({ id: msg.id, name: msg.name, src: msg.src }, msg.text);
      }
      break;
    case 'donor':
      hud.showDonor(msg);
      audio.announceGift(msg);
      break;
    case 'fx':
      fx.spawn(msg.kind, msg.power);
      gsap.fromTo(bloomPass, { strength: 0.42 }, { strength: 0.22, duration: 1.4, ease: 'power2.out' });
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
      runners.syncTick(msg.runners || [], msg.board || []);
      hud.setActiveCount(runners.count());
      break;
    case 'scene':
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      if (msg.scene?.readComments !== undefined) syncCommentTtsBtn(Boolean(msg.scene.readComments));
      break;
  }
}

function connect() {
  const ws = new WebSocket(`ws://${location.host}`);
  liveWs = ws;
  ws.onmessage = e => handleMsg(JSON.parse(e.data));
  ws.onclose = () => setTimeout(connect, 2000);
}
connect();

let prev = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - prev) / 1000, 0.1);
  prev = now;

  const packSpeed = runners.update(now, dt);
  world3d.update(dt, Math.min(1.38, 0.85 + (packSpeed - 1) * 0.1));
  fx.update(dt);

  // 3D Steadicam Trail Tracking: camera smoothly glides along the foreground road curve with subtle banking roll
  const nearPose = getTrailPose(10);
  const lookPose = getTrailPose(-14);
  const targetCamX = nearPose.x * 0.34 + Math.sin(now / 3200) * 0.32;
  const targetCamY = 4.35 + nearPose.y * 0.25 + Math.cos(now / 2300) * 0.09;
  camera.position.x += (targetCamX - camera.position.x) * Math.min(1, dt * 3.5);
  camera.position.y += (targetCamY - camera.position.y) * Math.min(1, dt * 3.5);
  camera.lookAt(lookPose.x * 0.28, 1.75 + lookPose.y * 0.18, -14);
  camera.rotation.z = -nearPose.angleY * 0.045 + Math.sin(now / 4100) * 0.008;

  composer.render();
  labelRenderer.render(scene, camera);
}
requestAnimationFrame(frame);
