# Chùa Online LIVE — MVP Implementation Plan

> **ĐÃ ĐƯỢC THAY THẾ (31/10/2026).** Dùng bộ tài liệu theo FR ở [`docs/fr/`](../../fr/README.md). Bộ đó cập nhật luật lạy (D-01), dùng render 3D (D-04) và có thêm FR-09, FR-10. File này chỉ giữ lại để tham khảo.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TikTok LIVE interactive scene: viewers who comment a chanting phrase or like get a named character that walks into a virtual temple hall and bows; gifts only add decorative effects.

**Architecture:** One Node process. An event-source adapter (tiktok-live-connector, or a mock generator) feeds a pure pipeline (map → dedupe → filter → stage rules). The pipeline holds all state and pushes `StageMsg` over WebSocket to a PixiJS page. The page only draws. That page is added as a Browser Source / Link Source in OBS or TikTok LIVE Studio.

**Tech Stack:** Node ≥ 20 (ESM), `node:test` + `node:assert`, `ws`, `tiktok-live-connector@2.5.0` (pinned), `pixi.js@8` (served from `node_modules`), `dotenv`.

**Spec:** `research/07-ba-phan-tich-nghiep-vu.md` (business rules BR-01..BR-10, MVP scope §9) and `research/08-ky-thuat-chi-tiet.md` (architecture, schemas, state machine, filter, render).

## Global Constraints

- Never ask for or store TikTok account credentials. The connector takes only `@uniqueId`.
- `EULER_KEY` is read from `.env`. `.env` is git-ignored. Ship `.env.example`.
- Quà không phải điều kiện để được lạy (BR-01). A trigger chat or a first like spawns an actor.
- Max actors on screen: **150**. Front-row slots (tier 2 only): **20**.
- Actor TTL: tier 0 = **60 s**, tier 1 = **120 s**, tier 2 = **300 s**. Every new event from the same user refreshes the TTL.
- Gift tier by total coins (`diamonds × repeat`): **< 10 → 0**, **10–999 → 1**, **≥ 1000 → 2**.
- Bows added: trigger chat **+1**. Gift **+min(repeat, 10)**. Bow count per actor capped at **50**.
- Bubble text: max **40** characters, shown **6000 ms**. No URLs, phone numbers or `@mentions`.
- Display name: max **16** characters, filtered.
- Dedupe window: **5000 ms** on key `kind|uid|payload`.
- Trigger phrases (matched accent-free, case-insensitive, as substrings): `nam mo`, `a di da phat`, `quan the am`, `adida`.
- On-screen copy never says "tặng … để được phù hộ/giải hạn" (BR-08). The allowed footer copy is exactly: `Gõ "Nam mô A Di Đà Phật" để vào lễ Phật`.
- Ports: WebSocket + static on **8787**, bound to `127.0.0.1`.
- Render canvas: **1080 × 1920**, target **30 fps**.
- Combo gifts: only process when `giftType === 1 && repeatEnd`, or when `giftType !== 1`.

## Review Focus

1. **Vietnamese text in NFD or with stacked diacritics.** Some keyboards send decomposed text. "Nam mô" typed this way must still match the trigger, and the name must render correctly (NFC). → Task 1 test `trigger matches NFD input`.
2. **Same user spamming the trigger.** One user must stay one actor with bows capped at 50, not 200 actors. → Task 3 test `one actor per uid, bows capped`.
3. **Hall full (151st viewer) while tier-2 donors are present.** A tier-0 newcomer must evict the oldest tier-0 actor, never a donor. → Task 3 test `evicts lowest tier oldest first`.
4. **Render page reloaded mid-stream** (OBS refresh). The page must get a full `snapshot` and redraw everyone. → Task 5 test `new client receives snapshot`.
5. **Reconnect after a drop.** TikTok may resend recent events. Duplicates inside 5 s must not double-bow. → Task 4 test `duplicate within window dropped`.

---

## File Structure

```
package.json            # type: module, scripts: start, demo, test
.env.example            # EULER_KEY=, TIKTOK_USER=
.gitignore              # node_modules, .env, logs/
server/
  filter.js             # text normalize, trigger match, bubble/name cleaning
  mapTiktok.js          # tiktok-live-connector event → NormEvent | null
  stage.js              # Stage: actors, slots, tiers, TTL → StageMsg[]
  pipeline.js           # dedupe + routing NormEvent → Stage, counters
  index.js              # http static + ws server + adapter wiring + reconnect
  adapters/tiktok.js    # wraps TikTokLiveConnection, emits NormEvent
  adapters/mock.js      # random NormEvent generator (demo + load test)
  data/badwords.json    # string[] accent-free
  data/blocked.json     # string[] uid
test/
  filter.test.js  mapTiktok.test.js  stage.test.js  pipeline.test.js  server.test.js
web/
  index.html            # loads stage.js as module
  stage.js              # PixiJS scene, ws client, actor animation
  assets/               # placeholder now, final atlas later (Task 7)
docs/runbook.md         # how to go live with OBS / LIVE Studio
```

## Shared Types (referenced by every task)

```ts
type NormEvent =
  | { kind: 'chat';   uid: string; name: string; text: string; ts: number }
  | { kind: 'like';   uid: string; name: string; count: number; ts: number }
  | { kind: 'gift';   uid: string; name: string; giftId: number; giftName: string; diamonds: number; repeat: number; ts: number }
  | { kind: 'join';   uid: string; name: string; ts: number }
  | { kind: 'viewers'; count: number; ts: number };

type Actor = { id: string; name: string; tier: 0|1|2; slot: number; skin: number; bows: number; expiresAt: number; joinedAt: number };

type StageMsg =
  | { t: 'snapshot'; actors: Actor[]; counters: { namo: number; viewers: number } }
  | { t: 'spawn'; actor: Actor }
  | { t: 'bow'; id: string; times: number }
  | { t: 'say'; id: string; text: string; ms: number }
  | { t: 'fx'; kind: 'flower'|'lamp'|'bell'|'halo'|'smoke'; at?: string; power: number }
  | { t: 'leave'; id: string }
  | { t: 'counter'; key: 'namo'|'viewers'; value: number }
  | { t: 'banner'; text: string; ms: number };
```

---

### Task 1: Project scaffold + text filter

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`, `server/filter.js`, `server/data/badwords.json`, `test/filter.test.js`

**Interfaces:**
- Produces:
  - `fold(s: string): string`: NFC, lowercase, strip diacritics (đ→d), collapse runs of the same letter, drop `.`/`_`/`-`/spaces between single letters.
  - `isTrigger(text: string): boolean`
  - `cleanBubble(text: string, badwords: string[]): string | null`: null if it contains a bad word, URL, phone number (≥ 8 digits) or `@mention`; otherwise NFC trimmed to 40 chars.
  - `cleanName(name: string, badwords: string[]): string`: NFC, strip emoji/control characters, trim to 16 chars; returns `"Phật tử"` if empty or bad.

- [ ] **Step 1: Init repo and package**

Run: `git init && npm init -y && npm i ws tiktok-live-connector@2.5.0 pixi.js@8 dotenv`
Then set `"type": "module"` and scripts `{"start":"node server/index.js","demo":"node server/index.js --mock","test":"node --test test/"}`. Write `.gitignore` (`node_modules`, `.env`, `logs/`) and `.env.example` (`EULER_KEY=` and `TIKTOK_USER=`).
Seed `badwords.json` from the `vietnamese-offensive-words` list (accent-free, lowercase). Its license is unclear, so copy only the word list (see research/08 §5).

- [ ] **Step 2: Write failing tests**

```js
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { fold, isTrigger, cleanBubble, cleanName } from '../server/filter.js';
const bad = ['dm', 'vcl'];
test('fold strips accents and repeats', () => assert.equal(fold('Nam Môôô  A Di Đà'), 'nam mo a di da'));
test('trigger matches NFD input', () => assert.ok(isTrigger('Nam mô A Di Đà Phật'.normalize('NFD'))));
test('trigger ignores plain chat', () => assert.equal(isTrigger('xin chào'), false));
test('bubble rejects bad word with dots', () => assert.equal(cleanBubble('v.c.l luôn', bad), null));
test('bubble rejects url and phone', () => { assert.equal(cleanBubble('vào abc.com', bad), null); assert.equal(cleanBubble('0912345678', bad), null); });
test('bubble trims to 40', () => assert.equal(cleanBubble('a'.repeat(60), bad).length, 40));
test('name strips emoji and trims 16', () => assert.equal(cleanName('🙏Minh Anh Nguyễn Thị Lan', bad), 'Minh Anh Nguyễn'));
test('no false positive across words', () => assert.equal(cleanBubble('ad mình ơi nam mô', bad), 'ad mình ơi nam mô'));
test('bad name falls back', () => assert.equal(cleanName('dm', bad), 'Phật tử'));
```

- [ ] **Step 3: Run** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 4: Implement `server/filter.js`.**
  - `fold` also collapses whitespace runs to one space.
  - The bad-word check is whole-token: `` ` ${fold(text)} `.includes(` ${bad} `) ``. Do not strip spaces: "ad mình" would become "adminh" and falsely match "dm". `fold` already joins dotted single letters, so `v.c.l` becomes `vcl`.
  - URL regex: `/\b[\w-]+\.(com|vn|net|org|me|io|xyz)\b|https?:\/\//i`.
  - `cleanName` trims trailing whitespace after cutting to 16 chars.
- [ ] **Step 5: Run** `npm test`. Expected: all 9 PASS.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: scaffold and Vietnamese text filter"`

---

### Task 2: Map tiktok-live-connector events to NormEvent

**Files:**
- Create: `server/mapTiktok.js`, `test/mapTiktok.test.js`

**Interfaces:**
- Consumes: raw payloads as emitted by `tiktok-live-connector@2.5.0`. Field names to read: `user.uniqueId`, `user.nickname`, `comment`, `likeCount`, `giftId`, `giftName` (or `giftDetails.giftName`), `diamondCount`, `repeatCount`, `repeatEnd`, `giftType`, `viewerCount`.
- Produces: `mapTiktok(eventName: 'chat'|'like'|'gift'|'member'|'roomUser', data: object, now?: number): NormEvent | null`

- [ ] **Step 1: Verify field names against the installed version.** Open `node_modules/tiktok-live-connector/dist/types/` and confirm the `WebcastEvent` enum values and the payload field names above. If a name differs, use the installed one and update this task's test fixtures (the README for 2.x is inconsistent, see research/06).
- [ ] **Step 2: Write failing tests**

```js
test('chat maps', () => assert.deepEqual(
  mapTiktok('chat', { user: { uniqueId: 'u1', nickname: 'Lan' }, comment: 'nam mo' }, 1),
  { kind: 'chat', uid: 'u1', name: 'Lan', text: 'nam mo', ts: 1 }));
test('streak gift mid-combo ignored', () =>
  assert.equal(mapTiktok('gift', { user: { uniqueId: 'u1', nickname: 'L' }, giftType: 1, repeatEnd: false, repeatCount: 3, diamondCount: 1, giftId: 5655, giftName: 'Rose' }), null));
test('streak gift end maps repeat', () =>
  assert.equal(mapTiktok('gift', { user: { uniqueId: 'u1', nickname: 'L' }, giftType: 1, repeatEnd: true, repeatCount: 7, diamondCount: 1, giftId: 5655, giftName: 'Rose' }, 1).repeat, 7));
test('non-streak gift maps immediately', () =>
  assert.equal(mapTiktok('gift', { user: { uniqueId: 'u1', nickname: 'L' }, giftType: 2, repeatCount: 1, diamondCount: 1000, giftId: 1, giftName: 'Galaxy' }, 1).diamonds, 1000));
test('roomUser maps viewers', () => assert.deepEqual(mapTiktok('roomUser', { viewerCount: 3500 }, 1), { kind: 'viewers', count: 3500, ts: 1 }));
test('unknown event null', () => assert.equal(mapTiktok('emote', {}), null));
```

- [ ] **Step 3: Run** `npm test`. Expected: FAIL.
- [ ] **Step 4: Implement `mapTiktok`.** It is a pure function. `ts` defaults to `Date.now()`. `member` maps to `join`.
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `git commit -am "feat: map TikTok events to NormEvent"` (add new files first).

---

### Task 3: Stage — actors, slots, tiers, TTL

**Files:**
- Create: `server/stage.js`, `test/stage.test.js`

**Interfaces:**
- Consumes: Global Constraints values.
- Produces: `class Stage` with
  - `constructor({ max = 150, front = 20, now = () => Date.now() })`
  - `enter(uid: string, name: string, tier: 0|1|2, bows: number): StageMsg[]`: spawns, or refreshes an existing actor (raises the tier to the max of old and new, adds bows capped at 50, extends TTL). Returns `spawn` or `bow` messages, plus `leave` if a victim was evicted.
  - `say(uid: string, text: string): StageMsg[]`: a `say` message if the actor exists, else `[]`.
  - `tick(): StageMsg[]`: `leave` for every expired actor.
  - `snapshot(): Actor[]`
  - `has(uid: string): boolean`
- Slot layout: slots `0..front-1` are front row (tier 2 only). Slots `front..max-1` are for everyone, and tier 2 also falls back to them. A new actor takes the lowest free slot of its allowed range. `skin` is `hash(uid) % 4`.

- [ ] **Step 1: Write failing tests** (inject `now` with a mutable `let t = 0`)

```js
test('one actor per uid, bows capped', () => {
  const s = new Stage({ now: () => 0 });
  s.enter('u1', 'A', 0, 1);
  for (let i = 0; i < 100; i++) s.enter('u1', 'A', 0, 1);
  assert.equal(s.snapshot().length, 1); assert.equal(s.snapshot()[0].bows, 50);
});
test('tier 2 gets front slot, tier 0 does not', () => {
  const s = new Stage({ now: () => 0 });
  s.enter('a', 'A', 0, 1); s.enter('b', 'B', 2, 1);
  const [a, b] = s.snapshot(); assert.ok(a.slot >= 20); assert.ok(b.slot < 20);
});
test('evicts lowest tier oldest first', () => {
  let t = 0; const s = new Stage({ max: 23, front: 20, now: () => t });
  s.enter('d', 'D', 2, 1); t = 1; s.enter('o1', 'O1', 0, 1); t = 2; s.enter('o2', 'O2', 0, 1); t = 3;
  s.enter('o3', 'O3', 0, 1); t = 4;
  const msgs = s.enter('new', 'N', 0, 1);
  assert.deepEqual(msgs.find(m => m.t === 'leave'), { t: 'leave', id: 'o1' });
  assert.ok(s.has('d'));
});
test('ttl by tier and refresh', () => {
  let t = 0; const s = new Stage({ now: () => t });
  s.enter('a', 'A', 0, 1); s.enter('b', 'B', 1, 1);
  t = 61_000; assert.deepEqual(s.tick(), [{ t: 'leave', id: 'a' }]);
  t = 100_000; s.enter('b', 'B', 0, 1); t = 200_000; assert.deepEqual(s.tick(), []);
});
test('say only for existing actor', () => {
  const s = new Stage({ now: () => 0 }); assert.deepEqual(s.say('x', 'hi'), []);
  s.enter('x', 'X', 0, 1); assert.deepEqual(s.say('x', 'hi'), [{ t: 'say', id: 'x', text: 'hi', ms: 6000 }]);
});
```

Note on the eviction test: `max: 23, front: 20` leaves 3 general slots. Tier 2 `d` takes a front slot, `o1`–`o3` fill the general slots, so `new` must evict `o1`.

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `Stage`.** Store actors in a `Map<uid, Actor>`. Pick the eviction victim with a linear scan: lowest tier first, then oldest `joinedAt`, and only among actors whose slot range the newcomer may use. Add a `// ponytail: O(n) scan, n ≤ 150` comment. Actor `id` = `uid`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `git add server/stage.js test/stage.test.js && git commit -m "feat: stage slots, tiers, ttl"`

---

### Task 4: Pipeline — dedupe, rules, counters

**Files:**
- Create: `server/pipeline.js`, `server/data/blocked.json` (`[]`), `test/pipeline.test.js`

**Interfaces:**
- Consumes: `Stage` (Task 3), `isTrigger`/`cleanBubble`/`cleanName` (Task 1).
- Produces:
  - `createPipeline({ stage: Stage, badwords: string[], blocked: Set<string>, now?: () => number }): { handle(e: NormEvent): StageMsg[], counters: { namo: number, viewers: number } }`
  - `giftTier(totalCoins: number): 0|1|2`
- Rules:
  - **Blocked uid:** return `[]`.
  - **Dedupe:** key `kind|uid|text` for chat, `kind|uid|giftId|repeat` for gift, `kind|uid` for like. Drop the event if the same key was seen ≤ 5000 ms ago.
  - **Chat with trigger:** `stage.enter(uid, cleanName, 0, 1)`, `namo++`, a `counter` message, then `say` if `cleanBubble` is non-null.
  - **Chat without trigger:** `say` only, which is a no-op if there is no actor.
  - **Like:** `enter` with tier 0 and 1 bow on the user's first like this session only. Every like batch also emits `fx smoke` with `power = min(count, 20)`, at most once per 500 ms globally.
  - **Gift:** `total = diamonds × repeat`. `enter(uid, name, giftTier(total), min(repeat, 10))`, then fx:
    - tier 0 → `flower`
    - tier 1 → `lamp`
    - tier 2 → `bell` and `halo` with `at = uid`
    - `power = min(repeat, 10)`
  - **Join:** a `banner` "`{name} vừa vào chùa`" for 3000 ms, at most once per 2000 ms globally.
  - **Viewers:** update `counters.viewers` and send a `counter` message.

- [ ] **Step 1: Write failing tests**

```js
const mk = (t0 = 0) => { let t = t0; const stage = new Stage({ now: () => t });
  const p = createPipeline({ stage, badwords: ['dm'], blocked: new Set(['bad']), now: () => t });
  return { p, stage, at: v => { t = v; } }; };
test('trigger chat spawns and counts', () => { const { p, stage } = mk();
  const m = p.handle({ kind: 'chat', uid: 'u', name: 'Lan', text: 'Nam mô A Di Đà Phật', ts: 0 });
  assert.ok(stage.has('u')); assert.equal(p.counters.namo, 1); assert.ok(m.some(x => x.t === 'say')); });
test('duplicate within window dropped', () => { const { p, at } = mk();
  const e = { kind: 'chat', uid: 'u', name: 'L', text: 'nam mo', ts: 0 };
  p.handle(e); at(4000); assert.deepEqual(p.handle(e), []); at(5001); assert.notDeepEqual(p.handle(e), []); });
test('gift is not required to bow', () => { const { p, stage } = mk();
  p.handle({ kind: 'like', uid: 'u', name: 'L', count: 3, ts: 0 }); assert.ok(stage.has('u')); });
test('gift tiers', () => { assert.equal(giftTier(9), 0); assert.equal(giftTier(10), 1); assert.equal(giftTier(999), 1); assert.equal(giftTier(1000), 2); });
test('blocked uid ignored', () => { const { p, stage } = mk();
  assert.deepEqual(p.handle({ kind: 'chat', uid: 'bad', name: 'x', text: 'nam mo', ts: 0 }), []); assert.equal(stage.has('bad'), false); });
test('bad bubble hidden but bow kept', () => { const { p, stage } = mk();
  const m = p.handle({ kind: 'chat', uid: 'u', name: 'L', text: 'nam mo dm', ts: 0 });
  assert.ok(stage.has('u')); assert.equal(m.some(x => x.t === 'say'), false); });
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `server/pipeline.js`.** Prune the dedupe `Map` entries older than 5000 ms on each `handle` call.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: event pipeline with dedupe and business rules"` (add files first).

---

### Task 5: Server — WebSocket, static, adapters, reconnect

**Files:**
- Create: `server/index.js`, `server/adapters/tiktok.js`, `server/adapters/mock.js`, `test/server.test.js`

**Interfaces:**
- Consumes: `createPipeline` (Task 4), `Stage` (Task 3), `mapTiktok` (Task 2).
- Produces:
  - `startServer({ port = 8787, host = '127.0.0.1', pipeline, stage }): Promise<{ close(): Promise<void>, ingest(e: NormEvent): void }>`
    - Serves `web/` at `/` and `node_modules/pixi.js/dist/` at `/vendor/`.
    - On a new WS client, sends `{ t: 'snapshot', actors: stage.snapshot(), counters }`.
    - `ingest` runs `pipeline.handle` and broadcasts each message.
    - A 1000 ms interval broadcasts `stage.tick()`.
  - `startMock(ingest: (e: NormEvent) => void, rate = 5): () => void`. Use the generator from research/08 §9, returning a stop function.
  - `startTiktok(user: string, ingest, { signApiKey }): { stop(): void }`
    - Wraps `TikTokLiveConnection` with `{ enableExtendedGiftInfo: true, signApiKey }`.
    - Maps events via `mapTiktok`.
    - On `disconnected`, reconnects with backoff `min(60_000, 2000 × 2^n) + rand(0..1000)` ms.
    - Stops reconnecting after `streamEnd`.
- CLI in `index.js`:
  - `--mock` → mock adapter.
  - Otherwise `TIKTOK_USER` from `.env`, and the process exits with a clear message if it is missing.
  - Loads `badwords.json` and `blocked.json`.
  - Appends every `NormEvent` to `logs/events-YYYYMMDD.jsonl`.

- [ ] **Step 1: Write failing test**

```js
import WebSocket from 'ws';
test('new client receives snapshot', async () => {
  const stage = new Stage({}); const pipeline = createPipeline({ stage, badwords: [], blocked: new Set() });
  const srv = await startServer({ port: 18787, pipeline, stage });
  srv.ingest({ kind: 'chat', uid: 'u', name: 'Lan', text: 'nam mo', ts: Date.now() });
  const ws = new WebSocket('ws://127.0.0.1:18787');
  const first = await new Promise(r => ws.once('message', d => r(JSON.parse(d))));
  assert.equal(first.t, 'snapshot'); assert.equal(first.actors[0].name, 'Lan');
  ws.close(); await srv.close();
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `startServer`, `startMock`, `startTiktok` and the CLI.** Use `node:http` with a minimal static handler (map extension → content type for `.html`, `.js`, `.mjs`, `.json`, `.png`, `.fnt`). Reject `..` in paths.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Manual check.** Run `npm run demo`, then `node -e "const W=require('ws');new W('ws://127.0.0.1:8787').on('message',d=>console.log(String(d)))"`. Expected: a snapshot, then a stream of spawn/bow/say/fx messages.
- [ ] **Step 6: Commit** `git commit -m "feat: ws server, mock and tiktok adapters with reconnect"` (add files first).

---

### Task 6: Render page (PixiJS) with placeholder art

**Files:**
- Create: `web/index.html`, `web/stage.js`, `web/assets/placeholder.png` (generated, see Step 1)

**Interfaces:**
- Consumes: the `StageMsg` stream from `ws://<location.host>`.
- Produces: a 1080×1920 canvas.
  - Background: a gradient plus a gold Buddha silhouette placeholder at the top center.
  - Slot grid, from the top: front row of 20 slots in 2 rows below the altar, then the general slots in rows of 13.
  - Each actor is a placeholder monk sprite (circle head plus robe rectangle, tinted by `skin`) with a `BitmapText` name.
  - Animations, client-side, timings from research/08 §4:
    - ENTERING: walk from the bottom center gate to the slot, 2 s.
    - KNEELING: 0.5 s.
    - BOWING: ×`bows`, 0.8 s each, scale-y dip.
    - IDLE.
    - LEAVING: 2 s back to the gate, then remove.
  - A `bow` message queues more bows.
  - `say` shows a rounded bubble above the actor for `ms`.
  - `fx` emits particles from one shared `ParticleContainer` (single texture).
  - `counter` updates the top-right text "Đã niệm: N".
  - `banner` shows a top text strip.
  - Footer copy is exactly as in Global Constraints.
  - On `snapshot`, clear everything and place actors directly in IDLE.
  - On WS close, retry every 2 s.
  - `?fps=1` shows an FPS counter.

- [ ] **Step 1: Bitmap font.** Call `BitmapFont.install({ name: 'vn', style: { fontFamily: 'Arial', fontSize: 28, fill: '#fff', stroke: { color: '#000', width: 4 } }, chars: [[' ', '~'], 'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ'] })` so all Vietnamese precomposed letters (U+1EA0–U+1EF9) are included.
- [ ] **Step 2: Implement `web/stage.js`.**
  - `import { Application, Container, Graphics, BitmapText, BitmapFont, ParticleContainer, Particle, Texture } from '/vendor/pixi.mjs'`.
  - Set `app.stage.eventMode = 'none'`.
  - Pool actor containers: pre-create 150 and toggle `visible`.
- [ ] **Step 3: Manual check.** Run `npm run demo`, open `http://127.0.0.1:8787/?fps=1`. Expected:
  - Monks walk in and bow, names show Vietnamese diacritics, bubbles appear.
  - Counter rises.
  - Reloading the page restores all actors.
  - FPS ≥ 30.
- [ ] **Step 4: Load check.** Run `node server/index.js --mock --rate 50` for 10 minutes. Expected: the actor count stays ≤ 150 and FPS stays ≥ 30 in a Chrome window sized 1080×1920.
  - This needs a `--rate` flag in the CLI (Task 5's `startMock` already takes `rate`). Add parsing here if Task 5 did not.
- [ ] **Step 5: Commit** `git add web && git commit -m "feat: PixiJS temple scene with placeholder art"`

---

### Task 7: Final art swap (non-code, owner: artist)

**Files:**
- Create: `web/assets/atlas.png`, `web/assets/atlas.json`, `web/assets/hall.png`
- Modify: `web/stage.js` (texture loading only)

**Interfaces:**
- Atlas frame names: `monk_{skin}_walk_{0..3}`, `monk_{skin}_kneel`, `monk_{skin}_bow_{0..2}`, `monk_{skin}_idle`, `fx_flower`, `fx_lamp`, `fx_smoke`, `fx_halo`.
  - `skin` is 0–3.
  - All particle frames must come from the same atlas source (ParticleContainer constraint).
- `hall.png`: 1080×1920. Buddha statue, altar and floor are original artwork. No real temple photos and no real monastics (research/05).

- [ ] **Step 1: Artist delivers the assets and their license.** The commission confirms that the license grants commercial streaming rights.
- [ ] **Step 2: Swap Graphics placeholders for `Assets.load('/assets/atlas.json')` frames.** Run the Task 6 Step 3 check again.
- [ ] **Step 3: Commit** `git commit -am "feat: final art"` (add assets first).

---

### Task 8: Soak test + go-live runbook

**Files:**
- Create: `docs/runbook.md`

- [ ] **Step 1: Soak.** Run `node server/index.js --mock --rate 20` for 8 hours with the page loaded as an OBS Browser Source (1080×1920, 30 fps, hardware acceleration on). Record the Node RSS and the OBS browser-source memory every hour. Pass: neither grows more than 30% after hour 1.
- [ ] **Step 2: Write `docs/runbook.md`.** Sections:
  1. Account prerequisites: 18+, LIVE Studio eligibility (≈1,000 followers, varies by region; check in the app).
  2. `.env` setup.
  3. `npm start`.
  4. LIVE Studio → Link Source → `http://127.0.0.1:8787`, or OBS Browser Source with the same URL at 1080×1920.
  5. Host checklist:
     - A real host is on camera or mic at all times (BR-10).
     - Never say "tặng … để được …".
     - Read donor names.
  6. If events stop: check the log. Reconnect is automatic. If the library is broken, switch to `npm run demo` and talk to chat manually.
  7. How to block a user: add the uid to `server/data/blocked.json` and restart. The Admin UI comes in V1.
- [ ] **Step 3: Private test stream** on a secondary account for 30 minutes. Verify that real chat, like and gift events appear on screen.
- [ ] **Step 4: Commit** `git add docs/runbook.md && git commit -m "docs: go-live runbook"`

---

## Out of scope (later plans)

- **V1:** Admin UI (live block, word list editing, session stats), TikFinity fallback adapter, sounds (bell, wooden fish), day/night/Rằm themes.
- **V2:** multi-channel license, per-channel config, skins.
- **Separate:** a Sansa-style web version. No Douyin version (prohibited by Art. 17).
