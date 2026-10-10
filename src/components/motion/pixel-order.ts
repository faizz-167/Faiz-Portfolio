/**
 * Cell order for PixelField (P11c.5–6). Plain TypeScript, no DOM, so it is
 * unit-tested (`pixel-order.test.ts`).
 */

/** How far a cell's row may be shuffled against its neighbours' when biased upward. */
const ROW_SPREAD = 2.5;

/** Small deterministic PRNG (mulberry32): the same seed gives the same order on every load. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The order cells switch in, as row-major cell indices: scattered, and with
 * `up` biased so lower rows go first within each column, so a boundary
 * dissolves upward.
 */
export function pixelOrder(columns: number, rows: number, seed: number, bias: "up" | "none"): number[] {
  const next = random(seed);
  const cells: { index: number; score: number }[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      const fromBottom = rows - 1 - r;
      const score = bias === "up" ? fromBottom + next() * ROW_SPREAD : next();
      cells.push({ index: r * columns + c, score });
    }
  }
  return cells.sort((a, b) => a.score - b.score).map((cell) => cell.index);
}
