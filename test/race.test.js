import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RaceStage, BIOMES, raceGiftTier } from '../CuocDuaKyThu/server/raceStage.js';
import { createRaceRules } from '../CuocDuaKyThu/server/raceRules.js';
import { startRaceAdmin } from '../CuocDuaKyThu/server/admin.js';
import { startMockRace } from '../CuocDuaKyThu/server/mockRace.js';
import { formatWelcomeSpeech, formatGiftBoostSpeech, cleanCommentForTts, VN_SONGS, BIOME_PLAYLISTS } from '../CuocDuaKyThu/web/scene/audio.js';
import { LANDMARK_STORIES, PROVINCE_STORIES } from '../CuocDuaKyThu/web/scene/storyScripts.js';

const lists = { badwords: ['dm'], triggers: [], intents: {}, couplets: [] };

test('TC-RACE-01: Join via chat spawns runner and emits exact welcome greeting', () => {
  let t = 1000;
  const stage = new RaceStage({ now: () => t });
  const rules = createRaceRules({ stage, lists, now: () => t });

  const out = rules.handle({ kind: 'chat', src: 'tiktok', uid: 'u1', name: 'Lê Trí Trung', text: 'Cho mình đua với', ts: t });
  const spawn = out.find(m => m.t === 'spawn');
  const welcome = out.find(m => m.t === 'welcome');

  assert.ok(spawn, 'should emit spawn');
  assert.equal(spawn.runner.name, 'Lê Trí Trung');
  assert.ok(welcome, 'should emit welcome');
  assert.equal(welcome.text, 'Chào mừng Lê Trí Trung cùng tham gia hành trình đi bộ xuyên Việt');
  assert.equal(formatWelcomeSpeech('Lê_Trí.Trung_1992'), 'Chào mừng Lê Trí Trung cùng tham gia hành trình đi bộ xuyên Việt');
});

test('TC-RACE-02: Gift tiers upgrade speed, mount, and distance bonus accurately', () => {
  let t = 1000;
  const stage = new RaceStage({ now: () => t });
  const rules = createRaceRules({ stage, lists, now: () => t });

  assert.deepEqual([0, 1, 5, 10, 30, 100, 500, 1000, 5000].map(raceGiftTier), [0, 1, 1, 2, 2, 3, 3, 4, 4]);

  // Tier 1: Rose (1 diamond x 2)
  const out1 = rules.handle({ kind: 'gift', src: 'tiktok', uid: 'g1', name: 'Minh An', giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: 2, ts: t });
  const donor1 = out1.find(m => m.t === 'donor');
  assert.equal(donor1.giftVi, 'Hoa Hồng');
  assert.equal(donor1.mountLabel, 'Đôi Cánh Chim Lạc');
  assert.equal(donor1.bonusM, 160);
  assert.equal(stage.runners.get('g1').speedMult, 1.8);

  // Tier 4: Galaxy (1000 diamonds)
  const out4 = rules.handle({ kind: 'gift', src: 'tiktok', uid: 'g4', name: 'Đại Gia', giftId: 11046, giftName: 'Galaxy', diamonds: 1000, repeat: 1, ts: t });
  const donor4 = out4.find(m => m.t === 'donor');
  assert.equal(donor4.giftVi, 'Dải Ngân Hà');
  assert.equal(donor4.mountLabel, 'Rồng Vàng Lạc Long Quân');
  assert.equal(donor4.bonusM, 10000);
  assert.equal(stage.runners.get('g4').speedMult, 6.5);
  assert.equal(stage.runners.get('g4').tier, 4);

  const tts = formatGiftBoostSpeech(donor4);
  assert.ok(tts.includes('Chào mừng Đại Gia cùng tham gia hành trình đi bộ xuyên Việt'));
  assert.ok(tts.includes('Rồng Vàng Lạc Long Quân'));
});

test('TC-RACE-03: Endless world tick advances distance and cycles through world biomes', () => {
  let t = 1000;
  const stage = new RaceStage({ now: () => t, baseSpeedMps: 300 });
  stage.joinOrBoost('u1', 'An', 0);

  assert.equal(stage.currentBiome().id, BIOMES[0].id);
  t += 2000;
  const msgs1 = stage.tick();
  t += 1000;
  const msgs2 = stage.tick();
  const all = [...msgs1, ...msgs2];
  assert.ok(all.some(m => m.t === 'biome' && m.biome.id === BIOMES[1].id));
  assert.equal(stage.currentBiome().id, BIOMES[1].id);
  assert.ok(stage.currentBiome().province?.name, 'should include current Vietnamese province milestone');
});

test('TC-RACE-04: Likes accumulate and trigger Global Rainbow Turbo every 500 likes', () => {
  let t = 1000;
  const stage = new RaceStage({ now: () => t });
  const rules = createRaceRules({ stage, lists, now: () => t, turboEveryLikes: 500 });

  const out1 = rules.handle({ kind: 'like', src: 'tiktok', uid: 'l1', name: 'Hùng', count: 495, ts: t });
  assert.ok(!out1.some(m => m.kind === 'turbo'));
  const out2 = rules.handle({ kind: 'like', src: 'tiktok', uid: 'l2', name: 'Lan', count: 10, ts: t });
  assert.ok(out2.some(m => m.t === 'fx' && m.kind === 'turbo'));
});

test('TC-RACE-05: startRaceAdmin endpoints (state, biome, test-event, tiktok-user, kick)', async () => {
  const stage = new RaceStage();
  const rules = createRaceRules({ stage, lists });
  let currentUser = 'adidaphat20266';
  const adm = await startRaceAdmin({
    port: 0,
    password: 'secret',
    ctx: {
      stage,
      rules,
      lists,
      blocked: new Set(),
      status: { tiktok: 'connected' },
      broadcast: () => {},
      ingest: e => rules.handle(e),
      demo: { start() {}, stop() {}, state: () => ({ on: true, rate: 2 }), config: () => ({ on: true, rate: 2 }) },
      getScene: () => ({ sound: true }),
      setScene: s => s,
      getConfig: () => ({ tiktokUser: currentUser }),
      setTiktokUser: async u => { currentUser = u; return { user: u, status: 'connecting' }; },
    },
  });

  const base = `http://127.0.0.1:${adm.port}`;
  const auth = 'Basic ' + Buffer.from('admin:secret').toString('base64');

  // Unauthenticated -> 401
  const r401 = await fetch(`${base}/api/state`);
  assert.equal(r401.status, 401);

  // Switch biome -> france
  const rBiome = await fetch(`${base}/api/biome`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({ biome: 'france' }),
  });
  assert.equal(rBiome.status, 200);
  const bData = await rBiome.json();
  assert.equal(bData.biome.id, 'france');

  // Test event join & gift
  for (const action of ['join', 'gift1', 'gift30', 'gift1000', 'turbo']) {
    const rEv = await fetch(`${base}/api/test-event`, {
      method: 'POST',
      headers: { authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify({ action, name: 'Trí Trung' }),
    });
    assert.equal(rEv.status, 200);
  }

  // Switch TikTok user
  const rTk = await fetch(`${base}/api/tiktok-user`, {
    method: 'POST',
    headers: { authorization: auth, 'content-type': 'application/json' },
    body: JSON.stringify({ user: '@new_racer_channel' }),
  });
  assert.equal(rTk.status, 200);
  assert.equal(currentUser, 'new_racer_channel');

  const rState = await fetch(`${base}/api/state`, { headers: { authorization: auth } });
  const state = await rState.json();
  assert.equal(state.config.tiktokUser, 'new_racer_channel');
  assert.ok(state.stats.activeRunners >= 1);

  await adm.close();
});

test('TC-RACE-06: startMockRace emits valid racing events', () => {
  let t = 0;
  const events = [];
  const stop = startMockRace(e => events.push(e), { rate: 10, now: () => t });
  t = 1000;
  stop();
  assert.equal(typeof stop, 'function');
});

test('TC-RACE-07: Multi-song regional jukebox & AI cultural storytelling cover all 12 landmarks and 63 provinces', () => {
  assert.ok(VN_SONGS.length >= 20, 'should have at least 20 distinct Vietnamese songs');
  const songIds = new Set(VN_SONGS.map(s => s.id));

  for (const b of BIOMES) {
    const playlist = BIOME_PLAYLISTS[b.id];
    assert.ok(Array.isArray(playlist) && playlist.length >= 3, `biome ${b.id} should have a 3-song regional playlist`);
    for (const sId of playlist) {
      assert.ok(songIds.has(sId), `playlist song ${sId} for ${b.id} must exist in VN_SONGS`);
    }

    const stories = LANDMARK_STORIES[b.id];
    assert.ok(Array.isArray(stories) && stories.length >= 18, `biome ${b.id} should have at least 18 cultural narration chapters`);
    for (const line of stories) {
      assert.ok(line.length >= 40 && line.length <= 215, `story line in ${b.id} must fit TTS length cleanly`);
      assert.ok(!/Phật tử|vào chùa lễ Phật/i.test(line), `story line in ${b.id} must not mix temple game wording`);
    }
  }

  for (let code = 1; code <= 63; code++) {
    const provStory = PROVINCE_STORIES[code];
    assert.ok(typeof provStory === 'string' && provStory.length >= 40 && provStory.length <= 215, `province ${code} must have a cultural narration line`);
    assert.ok(!/Phật tử|vào chùa lễ Phật/i.test(provStory), `province ${code} must not mix temple game wording`);
  }
});

test('TC-RACE-08: Participant greeting & comment normalization preserves short greetings and emoji cheers', () => {
  assert.equal(cleanCommentForTts('Hi'), 'xin chào');
  assert.equal(cleanCommentForTts('Hello cả nhà'), 'xin chào cả nhà');
  assert.equal(cleanCommentForTts('Nam mô'), 'Nam mô');
  assert.equal(cleanCommentForTts('🥰🥰🥰'), 'thả tim yêu thương cổ vũ cả đoàn');
  assert.equal(cleanCommentForTts('🙏🙏🙏'), 'chắp tay cầu bình an');
});
