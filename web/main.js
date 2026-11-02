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
// Fixed Sanctuary Master Camera (no panning / angle switching)
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120);
const CAM = new THREE.Vector3(0, 12, 21), LOOK = new THREE.Vector3(0, 1.2, -4);
camera.position.copy(CAM);
camera.lookAt(LOOK);

const coupletL = document.getElementById('couplet-l');
const coupletR = document.getElementById('couplet-r');

function triggerTempleCameraFocus() {
  // Camera panning disabled — keep steady sanctuary master perspective
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
      case 'demoPurged': audio.purgeMockSpeech?.(); break;
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
        if (c.scene.bgmVocal !== undefined || c.scene.bgmVocalVolume !== undefined) {
          audio.setBgmVocal?.(c.scene.bgmVocal, c.scene.bgmVocalVolume);
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

// Hybrid Real-Time Transport: Local WebSocket (:8787) + Vercel Cloud HTTP Polling (/api/chua/poll)
let cloudPollingActive = false;
let cloudSeq = 0;
const seenChuaCloudEvents = new Set();

async function pollChuaCloud() {
  try {
    const res = await fetch(`/api/chua/poll?since=${cloudSeq}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.snapshot) receive(data.snapshot);
      if (Array.isArray(data.messages)) {
        for (const m of data.messages) {
          if (m?._eid) {
            if (seenChuaCloudEvents.has(m._eid)) continue;
            seenChuaCloudEvents.add(m._eid);
            if (seenChuaCloudEvents.size > 400) {
              seenChuaCloudEvents.delete(seenChuaCloudEvents.values().next().value);
            }
          }
          receive(m);
        }
      }
      if (typeof data.seq === 'number' && data.seq > cloudSeq) {
        cloudSeq = data.seq;
      }
    }
  } catch {}
  if (cloudPollingActive) setTimeout(pollChuaCloud, 1200);
}

function startChuaCloudPolling() {
  if (cloudPollingActive) return;
  cloudPollingActive = true;
  pollChuaCloud();
}

(function connect() {
  if (location.protocol === 'https:' || location.pathname.startsWith('/chua')) {
    startChuaCloudPolling();
    return;
  }
  let opened = false;
  const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${wsProto}//${location.host}`);
  liveWs = ws;
  ws.onopen = () => { opened = true; };
  ws.onmessage = e => receive(JSON.parse(e.data));
  ws.onclose = () => {
    if (!opened && location.port !== '8787') {
      startChuaCloudPolling();
      return;
    }
    setTimeout(connect, RECONNECT_MS);
  };
})();

const fpsEl = document.getElementById('fps');
if (params.get('fps') === '1') fpsEl.style.display = 'block';
let frames = 0, fpsT = performance.now(), last = performance.now();

function updateTempleCamera() {
  camera.position.copy(CAM);
  camera.lookAt(LOOK);
  camera.rotation.z = 0;
  if (Math.abs(camera.fov - 50) > 0.02) {
    camera.fov = 50;
    camera.updateProjectionMatrix();
  }
  if (coupletL && coupletL.style.opacity !== '1') coupletL.style.opacity = '1';
  if (coupletR && coupletR.style.opacity !== '1') coupletR.style.opacity = '1';
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
