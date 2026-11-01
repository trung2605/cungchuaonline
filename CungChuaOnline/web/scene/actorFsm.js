// Pure actor state machine (BR-07.17). No three import: tested with node:test.
import { DOOR, ALTAR_SPOTS, CARPET_X, FACE_ALTAR, slotPosition, queuePosition } from './layout.js';

export const DUR = { enter: 2500, bow: 800, toSeat: 1500, kneel: 500, standUp: 500, move: 2000, leave: 2000, shuffle: 600 };
const SEATED = new Set(['idle', 'bow', 'kneel']);
const WALKING = new Set(['enter', 'queue', 'toSeat', 'leave', 'move']);

// 3 altar spots, FIFO waiting line.
export class AltarQueue {
  constructor(n = ALTAR_SPOTS.length) {
    this.spots = new Array(n).fill(null);
    this.waiting = [];
  }
  request(id) {
    if (!this.spots.includes(id) && !this.waiting.includes(id)) this.waiting.push(id);
    return this.poll(id);
  }
  // Spot index if id holds or just got one, else -1. Only the head of the line may take a spot.
  poll(id) {
    const held = this.spots.indexOf(id);
    if (held !== -1) return held;
    const free = this.spots.indexOf(null);
    if (this.waiting[0] !== id || free === -1) return -1;
    this.waiting.shift();
    this.spots[free] = id;
    return free;
  }
  release(id) {
    const s = this.spots.indexOf(id);
    if (s !== -1) this.spots[s] = null;
    this.waiting = this.waiting.filter(x => x !== id);
  }
  position(id) {
    return this.waiting.indexOf(id);
  }
}

const xz = p => ({ x: p.x, z: p.z });
const seatOf = st => xz(slotPosition(st.slot));

function go(st, phase, t0, dur, path) {
  Object.assign(st, { phase, t0, dur, path });
}

// Position and heading at fraction f along a polyline (zero-length segments allowed).
function along(path, f) {
  const lens = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    lens.push(Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z));
    total += lens[i - 1];
  }
  if (total === 0) return { ...xz(path[path.length - 1]), rotY: FACE_ALTAR };
  let d = Math.min(1, Math.max(0, f)) * total;
  let last;
  for (let i = 0; i < lens.length; i++) {
    if (lens[i] === 0) continue;
    const a = path[i], b = path[i + 1];
    const rotY = Math.atan2(b.x - a.x, b.z - a.z);
    last = { ...xz(b), rotY };
    if (d <= lens[i]) {
      const u = d / lens[i];
      return { x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, rotY };
    }
    d -= lens[i];
  }
  return last;
}

function toAltar(st, t0, queue, from) {
  const s = queue.request(st.id);
  if (s !== -1) {
    st.spot = s;
    const spot = ALTAR_SPOTS[s];
    return go(st, 'enter', t0, DUR.enter, [from, { x: CARPET_X, z: from.z }, { x: CARPET_X, z: spot.z + 1.2 }, spot]);
  }
  st.qi = queue.position(st.id);
  go(st, 'queue', t0, DUR.enter, [from, { x: CARPET_X, z: from.z }, queuePosition(st.qi)]);
}

function seatBowsOrIdle(st, t0) {
  if (st.visit) {
    st.visit = false;
    return go(st, 'standUp', t0, DUR.standUp, [seatOf(st)]);
  }
  if (st.bows > 0) {
    const n = st.bows;
    st.bows = 0;
    return go(st, 'bow', t0, n * DUR.bow, [seatOf(st)]);
  }
  go(st, 'idle', t0, Infinity, [seatOf(st)]);
}

export function createActorState(actor, { idle = false, now, queue }) {
  // A snapshot actor is already seated: its pending bows are not replayed.
  const st = { id: actor.id, slot: actor.slot, bows: idle ? 0 : actor.bows ?? 0, spot: -1, visit: false };
  if (idle) go(st, 'idle', now, Infinity, [seatOf(st)]);
  else toAltar(st, now, queue, xz(DOOR));
  return st;
}

export function pose(st, now) {
  const t = now - st.t0;
  const t01 = st.dur === Infinity ? 0 : Math.min(1, t / st.dur);
  // 'move' stands up in place first, then walks.
  const p = along(st.path, st.phase === 'move' ? (t - DUR.standUp) / (DUR.move - DUR.standUp) : t01);
  const bowing = st.phase === 'altar' || st.phase === 'bow';
  return {
    phase: st.phase,
    t01,
    ms: t,
    spot: st.spot,
    pos: xz(p),
    rotY: WALKING.has(st.phase) && t01 < 1 ? p.rotY : FACE_ALTAR,
    bowT01: bowing ? (t % DUR.bow) / DUR.bow : 0,
  };
}

// Advance phases; loops so a large time jump cascades through several phases.
export function step(st, now, queue) {
  for (;;) {
    const end = st.t0 + st.dur;
    if (st.phase === 'queue') {
      const s = queue.poll(st.id);
      if (s !== -1) {
        st.spot = s;
        const spot = ALTAR_SPOTS[s];
        go(st, 'enter', now, DUR.shuffle * 2, [pose(st, now).pos, { x: CARPET_X, z: spot.z + 1.2 }, spot]);
        continue;
      }
      const qi = queue.position(st.id);
      if (qi !== st.qi && now >= end) {
        st.qi = qi;
        go(st, 'queue', now, DUR.shuffle, [pose(st, now).pos, queuePosition(qi)]);
      }
      break;
    }
    if (now < end) break;
    if (st.phase === 'enter') {
      const n = Math.max(1, st.bows);
      st.bows = 0;
      go(st, 'altar', end, n * DUR.bow, [ALTAR_SPOTS[st.spot]]);
    } else if (st.phase === 'altar') {
      queue.release(st.id);
      const spot = ALTAR_SPOTS[st.spot], seat = seatOf(st);
      st.spot = -1;
      go(st, 'toSeat', end, DUR.toSeat, [spot, { x: CARPET_X, z: spot.z + 1.2 }, { x: CARPET_X, z: seat.z }, seat]);
    } else if (st.phase === 'toSeat' || st.phase === 'move') {
      go(st, 'kneel', end, DUR.kneel, [seatOf(st)]);
    } else if (st.phase === 'kneel' || st.phase === 'bow') {
      seatBowsOrIdle(st, end);
    } else if (st.phase === 'standUp') {
      toAltar(st, end, queue, seatOf(st));
    } else if (st.phase === 'leave') {
      go(st, 'done', end, Infinity, st.path.slice(-1));
    }
  }
  return pose(st, now);
}

// Bows left in a running seat-bow phase, so they survive an interruption.
const remainingBows = (st, now) => Math.ceil((st.t0 + st.dur - now) / DUR.bow);

export function addBows(st, n, now, { visit = false } = {}) {
  if (st.phase === 'leave' || st.phase === 'done') return;
  if (st.phase === 'altar') { st.dur += n * DUR.bow; return; }
  if (visit && SEATED.has(st.phase)) {
    st.bows += n + (st.phase === 'bow' ? remainingBows(st, now) : 0);
    return go(st, 'standUp', now, DUR.standUp, [seatOf(st)]);
  }
  if (st.phase === 'bow') { st.dur += n * DUR.bow; return; }
  if (st.phase === 'idle') return go(st, 'bow', now, n * DUR.bow, [seatOf(st)]);
  st.bows += n;
  // Still walking back to the seat: go up again once seated.
  if (visit && (st.phase === 'toSeat' || st.phase === 'move')) st.visit = true;
}

export function leave(st, now, queue) {
  if (st.phase === 'leave' || st.phase === 'done') return;
  const from = pose(st, now).pos;
  queue.release(st.id);
  st.spot = -1;
  go(st, 'leave', now, DUR.leave, [from, { x: CARPET_X, z: from.z }, xz(DOOR)]);
}

export function move(st, slot, now) {
  const from = pose(st, now).pos;
  if (st.phase === 'bow') st.bows += remainingBows(st, now);
  st.slot = slot;
  const seat = seatOf(st);
  if (SEATED.has(st.phase)) go(st, 'move', now, DUR.move, [from, seat]);
  else if (st.phase === 'toSeat') go(st, 'toSeat', now, DUR.toSeat, [from, { x: CARPET_X, z: from.z }, { x: CARPET_X, z: seat.z }, seat]);
}
