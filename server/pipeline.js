// Stub for FR-01. FR-04 replaces the internals; keep this shape.
export function createPipeline(opts = {}) {
  return {
    handle: e => [],
    tick: () => [],
    snapshot: () => ({ t: 'snapshot', actors: [], counters: { namo: 0, viewers: 0 }, scene: { theme: 'night', sound: true }, board: [], couplets: [] }),
  };
}
