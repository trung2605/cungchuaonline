import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRaceWorld } from './scene/world3d.js';
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
renderer.toneMappingExposure = 1.15;

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(W, H);

const scene = new THREE.Scene();
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
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.16, 0.25, 0.92));
composer.addPass(new OutputPass());

const soundBtn = document.getElementById('sound');
if (soundBtn) soundBtn.style.display = 'none';
// Auto-unlock audio by default on load and on any interaction
audio.unlock();
const autoUnlock = () => {
  if (audio.suspended) audio.unlock();
};
for (const ev of ['pointerdown', 'pointermove', 'mousemove', 'touchstart', 'keydown', 'wheel', 'focus']) {
  addEventListener(ev, autoUnlock, { passive: true });
}

function handleMsg(msg) {
  switch (msg.t) {
    case 'snapshot':
      runners.clear();
      for (const r of msg.runners || []) runners.addOrUpdate(r);
      world3d.setBiome(msg.biome?.id);
      hud.setBiome(msg.biome, msg.worldDistanceM || 0);
      hud.updateBoard(msg.board || []);
      hud.setActiveCount(runners.count());
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      break;
    case 'spawn':
      runners.addOrUpdate(msg.runner);
      hud.setActiveCount(runners.count());
      break;
    case 'welcome':
      hud.showWelcome(msg);
      audio.greetJoin(msg);
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
      break;
    case 'donor':
      hud.showDonor(msg);
      audio.announceGift(msg);
      break;
    case 'fx':
      fx.spawn(msg.kind, msg.power);
      break;
    case 'biome':
      world3d.setBiome(msg.biome?.id);
      hud.setBiome(msg.biome, msg.worldDistanceM);
      break;
    case 'banner':
      hud.showBanner(msg.text, msg.ms);
      break;
    case 'worldTick':
      world3d.setBiome(msg.biome?.id);
      hud.setBiome(msg.biome, msg.worldDistanceM);
      hud.updateBoard(msg.board || []);
      runners.syncTick(msg.runners || [], msg.board || []);
      hud.setActiveCount(runners.count());
      break;
    case 'scene':
      if (msg.scene?.sound !== undefined) audio.setEnabled(msg.scene.sound);
      break;
  }
}

function connect() {
  const ws = new WebSocket(`ws://${location.host}`);
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

  // Subtle dynamic camera sway for a cinematic walking trek feel
  camera.position.x = Math.sin(now / 3600) * 0.28;
  camera.position.y = 4.3 + Math.cos(now / 2400) * 0.08;
  camera.lookAt(0, 1.75, -12);

  composer.render();
  labelRenderer.render(scene, camera);
}
requestAnimationFrame(frame);
