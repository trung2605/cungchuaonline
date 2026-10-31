import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
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

// Fit the fixed 1080x1920 stage into the window.
const stage = document.getElementById('stage');
const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / W, innerHeight / H)})`; };
addEventListener('resize', fit);
fit();

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: !low });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = !low;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const labels = new CSS2DRenderer({ element: document.getElementById('labels') });
labels.setSize(W, H);

const scene = new THREE.Scene();
// BR-07.1: from the gate, raised, looking at the altar; statue in the top third.
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120);
const CAM = new THREE.Vector3(0, 12, 21), LOOK = new THREE.Vector3(0, 1.2, -4);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
if (params.get('bloom') !== '0') composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.4, 0.85));
composer.addPass(new OutputPass());

const hall = buildHall(scene, { low });
const actors = await createActors(scene);
const fx = createFx(scene, { low, smokeOrigin: hall.smokeOrigin });
const audio = createAudio();
const hud = createHud();
const world = createWorld();

const soundBtn = document.getElementById('sound');
soundBtn.onclick = () => { audio.unlock(); soundBtn.style.display = 'none'; };
// LIVE Studio autoplays; a plain Chrome tab needs one click.
setTimeout(() => { if (audio.suspended) soundBtn.style.display = 'block'; }, 1500);

function run(cmds, now) {
  for (const c of cmds) {
    switch (c.op) {
      case 'reset': actors.clear(); break;
      case 'add': actors.add(c.actor); break;
      case 'remove': actors.remove(c.id); break;
      case 'say': actors.say(c.id, c.text, c.ms); break;
      case 'unsay': actors.unsay(c.id); break;
      case 'badge': actors.badge(c.id, c.diamonds); break;
      case 'scene':
        hall.setTheme(c.scene.theme, now);
        audio.setEnabled(c.scene.sound);
        break;
      case 'hud': hud.handle(c.msg); break;
      case 'fx':
        if (c.kind === 'halo' && c.id) actors.halo(c.id, now);
        else fx.spawn(c.kind, c.pos, c.power, now);
        if (c.kind === 'bell') audio.bell();
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
