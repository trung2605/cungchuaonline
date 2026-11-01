export function createPipeline({
  stage, dedupe, lists = { couplets: [] }, blocked = new Set(), rules = [], counters = null,
  scene = { theme: 'night', sound: true },
}) {
  return {
    blocked,
    // Blocked uids are dropped before dedupe so they never occupy a dedupe slot (BR-04.13).
    handle(e) {
      if (e.uid !== undefined && blocked.has(e.uid)) return [];
      if (dedupe.seen(e)) return [];
      return rules.flatMap(r => r.handle(e));
    },
    tick: () => [...stage.tick(), ...rules.flatMap(r => r.tick?.() ?? [])],
    snapshot: () => ({
      t: 'snapshot',
      actors: stage.snapshot(),
      counters: counters?.state() ?? { namo: 0, viewers: 0 },
      scene,
      board: counters?.board() ?? [],
      couplets: lists.couplets,
    }),
    setScene(s) {
      scene = { ...scene, ...s };
      return [{ t: 'scene', scene }];
    },
  };
}
