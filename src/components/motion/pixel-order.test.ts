// Unit tests for the pixel cell order (P11c.6). Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pixelOrder } from "./pixel-order.ts";

describe("pixelOrder", () => {
  it("visits every cell exactly once", () => {
    const order = pixelOrder(25, 4, 23, "up");
    assert.equal(order.length, 100);
    assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length: 100 }, (_, i) => i));
  });

  it("is identical for the same seed and differs for another", () => {
    assert.deepEqual(pixelOrder(25, 4, 11, "up"), pixelOrder(25, 4, 11, "up"));
    assert.notDeepEqual(pixelOrder(25, 4, 11, "up"), pixelOrder(25, 4, 37, "up"));
  });

  it("biased up: the bottom row starts before the top row on average", () => {
    const columns = 25;
    const rows = 4;
    const order = pixelOrder(columns, rows, 37, "up");
    const meanRank = (row: number) => {
      const ranks = order.flatMap((cell, rank) => (Math.floor(cell / columns) === row ? [rank] : []));
      return ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
    };
    assert.ok(meanRank(rows - 1) < meanRank(0));
  });
});
