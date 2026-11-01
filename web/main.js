import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
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
// BR-07.1: from the gate, raised, looking at the altar; statue in the top third.
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120);
const CAM = new THREE.Vector3(0, 12, 21), LOOK = new THREE.Vector3(0, 1.2, -4);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Bloom only on flames and lanterns: high threshold so gilt highlights stay crisp.
if (params.get('bloom') !== '0') composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.5, 0.9));
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
        if (c.actor && !c.idle && !c.actor.diamonds) audio.thankPrayer(c.actor);
        break;
      case 'remove': actors.remove(c.id); break;
      case 'say': actors.say(c.id, c.text, c.ms); break;
      case 'unsay': actors.unsay(c.id); break;
      case 'badge': actors.badge(c.id, c.diamonds); break;
      case 'scene':
        hall.setTheme(c.scene.theme, now);
        audio.setEnabled(c.scene.sound);
        break;
      case 'hud':
        hud.handle(c.msg);
        if (c.msg.t === 'donor') audio.thankDonor(c.msg);
        break;
      case 'fx':
        if (c.kind === 'halo' && c.id) actors.halo(c.id, now);
        else fx.spawn(c.kind, c.pos, c.power, now);
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
  ws.onmessage = e => receive(JSON.parse(e.data));
  ws.onclose = () => setTimeout(connect, RECONNECT_MS);
})();

const fpsEl = document.getElementById('fps');
if (params.get('fps') === '1') fpsEl.style.display = 'block';
let frames = 0, fpsT = performance.now(), last = performance.now();

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
  // Very slow sway: ≤ 1°, 24 s period.
  const sway = Math.sin(now / 24000 * Math.PI * 2) * THREE.MathUtils.degToRad(1);
  camera.position.copy(CAM).applyAxisAngle(THREE.Object3D.DEFAULT_UP, sway);
  camera.lookAt(LOOK);
  composer.render();
  labels.render(scene, camera);

  frames++;
  if (now - fpsT >= 1000) {
    fpsEl.textContent = `${frames} fps · ${poses.length}`;
    frames = 0;
    fpsT = now;
  }
});
