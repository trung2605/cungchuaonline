// Pure: StageMsg -> world state + draw commands. No three import.
import { ALTAR } from './layout.js';
import { AltarQueue, createActorState, step, pose, addBows, leave, move } from './actorFsm.js';

export const MAX_BUBBLES = 12;

export function createWorld() {
  return { actors: new Map(), queue: new AltarQueue(), bubbles: [] }; // actors: id -> { actor, st }
}

function add(world, actor, now, idle) {
  world.actors.set(actor.id, { actor: { ...actor }, st: createActorState(actor, { idle, now, queue: world.queue }) });
  return { op: 'add', actor: { ...actor }, idle };
}

export function applyMsg(world, msg, now) {
  const a = msg.id !== undefined ? world.actors.get(msg.id) : undefined;
  switch (msg.t) {
    case 'snapshot': {
      Object.assign(world, createWorld());
      return [
        { op: 'reset' },
        ...msg.actors.map(x => add(world, x, now, true)),
        { op: 'hud', msg: { t: 'counter', key: 'namo', value: msg.counters.namo } },
        { op: 'hud', msg: { t: 'counter', key: 'viewers', value: msg.counters.viewers } },
        { op: 'scene', scene: msg.scene },
        { op: 'hud', msg: { t: 'board', top: msg.board ?? [] } },
        { op: 'hud', msg: { t: 'couplets', pairs: msg.couplets ?? [] } },
      ];
    }
    case 'spawn': {
      const out = [];
      if (world.actors.has(msg.actor.id)) {
        world.queue.release(msg.actor.id);
        world.actors.delete(msg.actor.id);
        out.push({ op: 'remove', id: msg.actor.id });
      }
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
