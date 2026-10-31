// Pure layout (no three import) so node:test can cover it.
export const DOOR = { x: 0, z: 14 };
export const ALTAR = { x: 0, z: -9 };
export const CARPET_X = 0;
export const ALTAR_SPOTS = [{ x: -1.6, z: -6.8 }, { x: 0, z: -6.8 }, { x: 1.6, z: -6.8 }];
export const FACE_ALTAR = Math.PI; // heading toward -z

// BR-04.17: 2 front rows of 10 (5|5), then rows of 12 (6|6), carpet in the middle.
// Sides alternate within a row so a partial last row stays balanced (75/75).
export function slotPosition(i) {
  const front = i < 20;
  const per = front ? 10 : 12;
  const j = front ? i : i - 20;
  const r = Math.floor(j / per), k = j % per;
  const sign = k % 2 ? 1 : -1, col = Math.floor(k / 2);
  return front
    ? { x: sign * (1.6 + col * 1.1), z: -5 + r * 1.2, rotY: FACE_ALTAR }
    : { x: sign * (1.6 + col * 1.0), z: -2.6 + r * 1.1, rotY: FACE_ALTAR };
}

// Where the n-th person waiting for an altar spot stands on the carpet.
export const queuePosition = n => ({ x: CARPET_X, z: -5 + n * 0.7 });
