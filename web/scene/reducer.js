// Pure: StageMsg -> world state + draw commands. No three import.
import { ALTAR } from './layout.js';
import { AltarQueue, createActorState, step, pose, addBows, leave, move } from './actorFsm.js';

export const MAX_BUBBLES = 12;
export const MAX_CLIENT_ACTORS = 60;

export function createWorld() {
  return { actors: new Map(), queue: new AltarQueue(), bubbles: [], wishes: [] }; // actors: id -> { actor, st }
}

function add(world, actor, now, idle) {
  world.actors.set(actor.id, {
    actor: { ...actor },
    spawnedAt: now,
    st: createActorState(actor, { idle, now, queue: world.queue }),
  });
  return { op: 'add', actor: { ...actor }, idle };
}

function evictOverflowActors(world, out, incomingSlot) {
  // 1. Evict any stale occupant still sitting on the same slot
  if (incomingSlot !== undefined && incomingSlot !== null) {
    for (const [id, entry] of world.actors) {
      if (entry.actor.slot === incomingSlot) {
        world.queue.release(id);
        world.actors.delete(id);
        out.push({ op: 'remove', id });
      }
    }
  }
  // 2. Hard cap client-side 3D actors to MAX_CLIENT_ACTORS so long live streams never accumulate 300+ actors
  while (world.actors.size >= MAX_CLIENT_ACTORS) {
    let victimId = null;
    let lowestScore = Infinity;
    for (const [id, entry] of world.actors) {
      const isMock = String(id).startsWith('bot_') || String(id).startsWith('seed_') || entry.actor.src === 'mock';
      const isIdle = entry.st?.phase === 'idle';
      const score = (isMock ? 0 : 1000) + (isIdle ? 0 : 300) + (entry.actor.tier || 0) * 200 + (entry.actor.diamonds || 0) * 5;
      if (score < lowestScore) {
        lowestScore = score;
        victimId = id;
      }
    }
    if (!victimId) break;
    world.queue.release(victimId);
    world.actors.delete(victimId);
    out.push({ op: 'remove', id: victimId });
  }
}

export function applyMsg(world, msg, now) {
  const a = msg.id !== undefined ? world.actors.get(msg.id) : undefined;
  switch (msg.t) {
    case 'snapshot': {
      Object.assign(world, createWorld());
      if (Array.isArray(msg.wishes)) {
        world.wishes = msg.wishes.slice(-50);
      }
      const cappedActors = (msg.actors || []).slice(-MAX_CLIENT_ACTORS);
      return [
        { op: 'reset' },
        ...cappedActors.map(x => add(world, x, now, true)),
        { op: 'hud', msg: { t: 'counter', key: 'namo', value: msg.counters.namo } },
        { op: 'hud', msg: { t: 'counter', key: 'viewers', value: msg.counters.viewers } },
        { op: 'scene', scene: msg.scene },
        { op: 'hud', msg: { t: 'board', top: msg.board ?? [] } },
        { op: 'hud', msg: { t: 'couplets', pairs: msg.couplets ?? [] } },
        ...(Array.isArray(msg.wishes) ? [{ op: 'wishes_snapshot', wishes: world.wishes }] : []),
      ];
    }
    case 'spawn': {
      const out = [];
      if (world.actors.has(msg.actor.id)) {
        world.queue.release(msg.actor.id);
        world.actors.delete(msg.actor.id);
        out.push({ op: 'remove', id: msg.actor.id });
      }
      evictOverflowActors(world, out, msg.actor.slot);
      return [...out, add(world, msg.actor, now, false)];
    }
    case 'bow':
      if (a) addBows(a.st, msg.times, now, { visit: msg.visit });
      return [];
    case 'leave':
      if (a) leave(a.st, now, world.queue);
      return [];
    case 'move':
      if (a) { a.actor.slot = msg.slot; move(a.st, msg.slot, now); }
      return [];
    case 'badge':
      if (!a) return [];
      a.actor.diamonds = msg.diamonds;
      return [{ op: 'badge', id: msg.id, diamonds: msg.diamonds }];
    case 'say': {
      if (!a) return [];
      world.bubbles = world.bubbles.filter(b => b.until > now && b.id !== msg.id);
      world.bubbles.push({ id: msg.id, until: now + msg.ms });
      const out = [{ op: 'say', id: msg.id, text: msg.text, ms: msg.ms }];
      while (world.bubbles.length > MAX_BUBBLES) out.push({ op: 'unsay', id: world.bubbles.shift().id });
      return out;
    }
    case 'fx': {
      const at = msg.at !== undefined ? world.actors.get(msg.at) : undefined;
      return [{ op: 'fx', kind: msg.kind, power: msg.power, id: at ? msg.at : null, pos: at ? pose(at.st, now).pos : { x: ALTAR.x, z: ALTAR.z } }];
    }
    case 'scene':
      return [{ op: 'scene', scene: msg.scene }];
    case 'demoPurged':
      return [{ op: 'demoPurged' }];
    case 'wish_ribbon': {
      if (msg.wish) {
        world.wishes.push(msg.wish);
        if (world.wishes.length > 50) world.wishes.shift();
      }
      const uid = msg.wish?.uid;
      const actorEntry = uid !== undefined ? world.actors.get(uid) : undefined;
      const fromPos = actorEntry ? pose(actorEntry.st, now).pos : { x: 0, z: -5.5 };
      return [{ op: 'wish_ribbon', wish: msg.wish, fromPos }];
    }
    case 'clear_wishes':
      world.wishes = [];
      return [{ op: 'clear_wishes' }];
    case 'counter':
    case 'banner':
    case 'donor':
    case 'board':
    case 'couplets':
      return [{ op: 'hud', msg }];
    default:
      return [];
  }
}

// Advance every actor; drops those that finished leaving.
export function stepWorld(world, now) {
  const poses = [], removed = [];
  for (const [id, a] of world.actors) {
    const p = step(a.st, now, world.queue);
    if (p.phase === 'done') {
      world.actors.delete(id);
      removed.push(id);
    } else poses.push([id, p]);
  }
  return { poses, removed };
}
