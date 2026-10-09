// Unit tests for the diagram layout engine (P11.2). Run with `npm test` (Node's built-in
// runner with type stripping, so imports carry `.ts` and stay relative).
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { projects } from "../../content/projects.ts";
import type { ArchEdge, ArchNode, Project } from "../../content/types.ts";
import { diagramMetrics, layoutDiagram, wrapText, type Point, type Rect } from "./layout.ts";

const EPS = 0.01;
const casePages = (projects as readonly Project[]).filter((p) => p.architecture.nodes.length > 0);

/** Vertices of a path made only of M/L commands. */
function vertices(d: string): Point[] {
  return [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

function onSide(p: Point, r: Rect) {
  const onX = p.x >= r.x - EPS && p.x <= r.x + r.width + EPS;
  const onY = p.y >= r.y - EPS && p.y <= r.y + r.height + EPS;
  if (Math.abs(p.x - r.x) < EPS && onY) return "left";
  if (Math.abs(p.x - (r.x + r.width)) < EPS && onY) return "right";
  if (Math.abs(p.y - r.y) < EPS && onX) return "top";
  if (Math.abs(p.y - (r.y + r.height)) < EPS && onX) return "bottom";
  return null;
}

/** Strict interior overlap of a segment with a rect (touching an edge is fine). */
function crosses(a: Point, b: Point, r: Rect) {
  return (
    Math.max(a.x, b.x) > r.x + EPS &&
    Math.min(a.x, b.x) < r.x + r.width - EPS &&
    Math.max(a.y, b.y) > r.y + EPS &&
    Math.min(a.y, b.y) < r.y + r.height - EPS
  );
}

/** Two axis-aligned segments lying on the same line and sharing more than a point. */
function overlapCollinear(a1: Point, a2: Point, b1: Point, b2: Point) {
  const aV = Math.abs(a1.x - a2.x) < EPS;
  const bV = Math.abs(b1.x - b2.x) < EPS;
  const aH = Math.abs(a1.y - a2.y) < EPS;
  const bH = Math.abs(b1.y - b2.y) < EPS;
  const shared = (lo1: number, hi1: number, lo2: number, hi2: number) => Math.min(hi1, hi2) - Math.max(lo1, lo2) > EPS;
  if (aV && bV && Math.abs(a1.x - b1.x) < EPS) {
    return shared(Math.min(a1.y, a2.y), Math.max(a1.y, a2.y), Math.min(b1.y, b2.y), Math.max(b1.y, b2.y));
  }
  if (aH && bH && Math.abs(a1.y - b1.y) < EPS) {
    return shared(Math.min(a1.x, a2.x), Math.max(a1.x, a2.x), Math.min(b1.x, b2.x), Math.max(b1.x, b2.x));
  }
  return false;
}

describe("layoutDiagram on every project with a diagram", () => {
  assert.ok(casePages.length >= 1, "no project has a diagram to test");

  for (const project of casePages) {
    const { nodes, edges } = project.architecture;
    const layout = layoutDiagram(nodes, edges);
    const rectOf = (id: string) => layout.nodes.find((n) => n.node.id === id)!.rect;

    describe(project.slug, () => {
      it("lays out every node and every edge", () => {
        assert.equal(layout.nodes.length, nodes.length);
        assert.equal(layout.edges.length, edges.length);
        assert.deepEqual(
          layout.edges.map((e) => e.index).sort((a, b) => a - b),
          edges.map((_, i) => i),
        );
      });

      it("routes are orthogonal and corners are cut at 45°", () => {
        for (const e of layout.edges) {
          e.route.slice(1).forEach((p, i) => {
            const prev = e.route[i]!;
            assert.ok(Math.abs(p.x - prev.x) < EPS || Math.abs(p.y - prev.y) < EPS, `${e.edge.from}→${e.edge.to} has a diagonal run`);
          });
          const drawn = vertices(e.d);
          drawn.slice(1).forEach((p, i) => {
            const dx = Math.abs(p.x - drawn[i]!.x);
            const dy = Math.abs(p.y - drawn[i]!.y);
            assert.ok(dx < EPS || dy < EPS || Math.abs(dx - dy) < 0.05, `${e.edge.from}→${e.edge.to} has a non-45° cut`);
          });
        }
      });

      it("leaves the source from the side facing the target, and enters the target facing the source", () => {
        for (const e of layout.edges) {
          const from = nodes.find((n) => n.id === e.edge.from)!;
          const to = nodes.find((n) => n.id === e.edge.to)!;
          const start = e.route[0]!;
          const end = e.route[e.route.length - 1]!;
          const dc = to.col - from.col;
          const dr = to.row - from.row;
          const expected = dc > 0 ? ["right", "left"] : dc < 0 ? ["left", "right"] : dr > 0 ? ["bottom", "top"] : ["top", "bottom"];
          assert.deepEqual([onSide(start, rectOf(from.id)), onSide(end, rectOf(to.id))], expected, `${from.id}→${to.id}`);
        }
      });

      it("never runs through a node it does not connect", () => {
        for (const e of layout.edges) {
          for (const n of layout.nodes) {
            if (n.node.id === e.edge.from || n.node.id === e.edge.to) continue;
            e.route.slice(1).forEach((p, i) => {
              assert.ok(!crosses(e.route[i]!, p, n.rect), `${e.edge.from}→${e.edge.to} crosses ${n.node.id}`);
            });
          }
        }
      });

      it("never draws two edges on top of each other", () => {
        const all = layout.edges;
        for (let i = 0; i < all.length; i++) {
          for (let j = i + 1; j < all.length; j++) {
            const a = all[i]!.route;
            const b = all[j]!.route;
            for (let s = 1; s < a.length; s++) {
              for (let t = 1; t < b.length; t++) {
                assert.ok(
                  !overlapCollinear(a[s - 1]!, a[s]!, b[t - 1]!, b[t]!),
                  `${all[i]!.edge.from}→${all[i]!.edge.to} overlaps ${all[j]!.edge.from}→${all[j]!.edge.to}`,
                );
              }
            }
          }
        }
      });

      it("keeps protocol labels apart", () => {
        const labels = layout.edges.flatMap((e) => (e.label ? [e.label] : []));
        const size = (t: string) => t.length * diagramMetrics.smallSize * diagramMetrics.monoAdvance;
        for (let i = 0; i < labels.length; i++) {
          for (let j = i + 1; j < labels.length; j++) {
            const a = labels[i]!;
            const b = labels[j]!;
            if (a.vertical !== b.vertical) continue;
            const [along, across] = a.vertical ? ["y", "x"] as const : ["x", "y"] as const;
            const clashAlong = Math.abs(a[along] - b[along]) < (size(a.text) + size(b.text)) / 2;
            const clashAcross = Math.abs(a[across] - b[across]) < diagramMetrics.smallLineHeight;
            assert.ok(!(clashAlong && clashAcross), `labels "${a.text}" and "${b.text}" overlap`);
          }
        }
      });

      it("draws edges in topological order", () => {
        const steps = layout.edges.map((e) => e.step);
        assert.deepEqual(steps, [...steps].sort((a, b) => a - b));
        assert.equal(steps[0], 0);
      });

      it("places each protocol label on the route's longest segment", () => {
        for (const e of layout.edges) {
          if (!e.edge.protocol) {
            assert.equal(e.label, undefined);
            continue;
          }
          const lengths = e.route.slice(1).map((p, i) => Math.hypot(p.x - e.route[i]!.x, p.y - e.route[i]!.y));
          const longest = lengths.indexOf(Math.max(...lengths));
          const a = e.route[longest]!;
          const b = e.route[longest + 1]!;
          // Centred along the segment; it may sit beside it when a parallel edge's label is there.
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const vertical = Math.abs(a.x - b.x) < EPS;
          assert.equal(e.label!.vertical, vertical);
          const [along, across] = vertical ? ["y", "x"] as const : ["x", "y"] as const;
          assert.ok(Math.abs(e.label![along] - mid[along]) < EPS, `${e.edge.from}→${e.edge.to} label off-centre`);
          assert.ok(Math.abs(e.label![across] - mid[across]) <= diagramMetrics.smallLineHeight, `${e.edge.from}→${e.edge.to} label off its edge`);
        }
      });
    });
  }
});

describe("layoutDiagram geometry", () => {
  const nodes: ArchNode[] = [
    { id: "a", label: "A", kind: "service", col: 0, row: 0 },
    { id: "b", label: "B", kind: "service", col: 0, row: 1 },
    { id: "c", label: "C", kind: "service", col: 1, row: 0 },
  ];

  it("derives the cell size from the viewBox width and keeps a fixed viewBox", () => {
    const layout = layoutDiagram(nodes, []);
    assert.equal(layout.viewBox, `0 0 ${diagramMetrics.viewWidth} ${layout.height}`);
    assert.equal(layout.cellWidth, (diagramMetrics.viewWidth - 2 * diagramMetrics.padding) / 2);
    const narrow = layoutDiagram(nodes, [], 600);
    assert.equal(narrow.cellWidth, (600 - 2 * diagramMetrics.padding) / 2);
  });

  it("offsets a pair of opposite edges between the same nodes by 6", () => {
    const pair: ArchEdge[] = [
      { from: "a", to: "b" },
      { from: "b", to: "a" },
    ];
    const [down, up] = layoutDiagram(nodes, pair).edges.sort((x, y) => x.index - y.index);
    assert.equal(down!.route.length, 2, "a straight run");
    assert.equal(up!.route.length, 2, "a straight run");
    assert.equal(Math.abs(down!.route[0]!.x - up!.route[0]!.x), diagramMetrics.edgeGap);
  });

  it("spreads edges sharing a gutter into separate channels 6 apart", () => {
    const fan: ArchNode[] = [
      { id: "s", label: "S", kind: "service", col: 0, row: 1 },
      { id: "t0", label: "T0", kind: "service", col: 1, row: 0 },
      { id: "t2", label: "T2", kind: "service", col: 1, row: 2 },
    ];
    const layout = layoutDiagram(fan, [
      { from: "s", to: "t0" },
      { from: "s", to: "t2" },
    ]);
    const channels = layout.edges.map((e) => e.route[1]!.x).sort((a, b) => a - b);
    assert.equal(channels[1]! - channels[0]!, diagramMetrics.edgeGap);
  });

  it("throws on an edge to an unknown node", () => {
    assert.throws(() => layoutDiagram(nodes, [{ from: "a", to: "zz" }]), /unknown node/);
  });
});

describe("wrapText", () => {
  it("wraps greedily on spaces", () => {
    assert.deepEqual(wrapText("Neon Postgres + pgvector", 15), ["Neon Postgres +", "pgvector"]);
  });
  it("keeps an over-long word on its own line", () => {
    assert.deepEqual(wrapText("a supercalifragilistic b", 6), ["a", "supercalifragilistic", "b"]);
  });
});
