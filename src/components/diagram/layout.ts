/**
 * Architecture diagram layout (P11.2). Pure geometry, no DOM: data in, viewBox coordinates out,
 * so the renderer stays a dumb Server Component and this file is unit-tested on its own
 * (`npm test`, Node's built-in runner + type stripping — hence type-only imports here).
 *
 * - Nodes sit on the data's `col`/`row` grid. Cell size is derived from a fixed viewBox width,
 *   and the SVG scales through `viewBox`, so nothing re-lays-out on resize.
 * - Edges are orthogonal (Manhattan) routes with 45° chamfered corners, the same drawing
 *   language as the site trace. An edge leaves its source from the side facing the target and
 *   enters the target from the side facing the source.
 * - Edges sharing a node side get separate ports, and edges sharing a column gutter get
 *   separate channels, both `EDGE_GAP` (6) apart, so parallel edges never draw on top of
 *   each other.
 */
import type { ArchEdge, ArchNode } from "@/content";

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Side = "left" | "right" | "top" | "bottom";

/** Geometry constants, in viewBox units. Exported for the renderer and the tests. */
export const diagramMetrics = {
  /** Full-variant viewBox width. Height follows from the row count. */
  viewWidth: 1200,
  /** Outer padding around the grid. */
  padding: 24,
  cellHeight: 136,
  nodeHeight: 64,
  /** Widest a node gets when there are few columns. */
  maxNodeWidth: 208,
  /** Narrowest gap between two columns of nodes: room for a protocol label. */
  minGutter: 128,
  /** Distance between parallel edges (spec: 6px). */
  edgeGap: 6,
  /** Corner cut per side. */
  chamfer: 8,
  /** Arrowhead length / half-width. */
  arrowLength: 7,
  arrowWidth: 4,
  /** Node label: mono font size, line height and inner padding. */
  labelSize: 13,
  labelLineHeight: 17,
  labelPadding: 14,
  /** Protocol label and callout text size. */
  smallSize: 11,
  smallLineHeight: 15,
  /** Martian Mono advance width per em (wdth 100), measured in Chrome. */
  monoAdvance: 0.7,
  calloutWidth: 248,
  calloutPadding: 10,
  /** Gap between a node and its callout. */
  calloutOffset: 10,
} as const;

export type LayoutNode = {
  node: ArchNode;
  rect: Rect;
  /** Label wrapped to the node width. */
  lines: string[];
  /** Breadth-first distance from the nearest source node (draw order). */
  depth: number;
  /** Note callout box, placed below the node (above it on the last row). */
  callout?: { rect: Rect; lines: string[] };
};

export type EdgeLabel = Point & { text: string; vertical: boolean };

export type LayoutEdge = {
  edge: ArchEdge;
  /** Index in the data's edge array (stable id). */
  index: number;
  /** Orthogonal route, before chamfering. */
  route: Point[];
  /** Path data (chamfered). */
  d: string;
  length: number;
  /** Arrowhead at the target end. */
  arrow: string;
  label?: EdgeLabel;
  /** Draw step: the source node's depth. Equal steps draw together. */
  step: number;
};

export type DiagramLayout = {
  width: number;
  height: number;
  viewBox: string;
  cellWidth: number;
  nodeWidth: number;
  nodes: LayoutNode[];
  /** In draw order (topological by source depth, then data order). */
  edges: LayoutEdge[];
};

const EPSILON = 0.01;

const round = (n: number) => Math.round(n * 100) / 100;

const centre = (r: Rect): Point => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

/** Greedy word wrap to `maxChars` per line; a single longer word keeps its own line. */
export function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= maxChars) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function charsThatFit(width: number, fontSize: number) {
  return Math.max(1, Math.floor(width / (fontSize * diagramMetrics.monoAdvance)));
}

/** Breadth-first depth from source nodes (no incoming edges); cycles fall back to data order. */
function depths(nodes: readonly ArchNode[], edges: readonly ArchEdge[]): Map<string, number> {
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges) incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
  const depth = new Map<string, number>();
  let queue = nodes.filter((n) => incoming.get(n.id) === 0).map((n) => n.id);
  // A graph that is all cycle still starts somewhere: the first node.
  if (queue.length === 0 && nodes[0]) queue = [nodes[0].id];
  for (const id of queue) depth.set(id, 0);
  while (queue.length > 0) {
    const next: string[] = [];
    for (const id of queue) {
      for (const e of edges) {
        if (e.from === id && !depth.has(e.to)) {
          depth.set(e.to, (depth.get(id) ?? 0) + 1);
          next.push(e.to);
        }
      }
    }
    queue = next;
    // Unreached islands start a new wave after everything reachable.
    if (queue.length === 0) {
      const rest = nodes.find((n) => !depth.has(n.id));
      if (rest) {
        depth.set(rest.id, Math.max(0, ...depth.values()) + 1);
        queue = [rest.id];
      }
    }
  }
  return depth;
}

function segmentHitsRect(a: Point, b: Point, r: Rect) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return maxX > r.x + EPSILON && minX < r.x + r.width - EPSILON && maxY > r.y + EPSILON && minY < r.y + r.height - EPSILON;
}

function routeHits(points: readonly Point[], rects: readonly Rect[]) {
  for (let i = 1; i < points.length; i++) {
    for (const r of rects) if (segmentHitsRect(points[i - 1]!, points[i]!, r)) return true;
  }
  return false;
}

/** Drops repeated points and points in the middle of a straight run. */
function simplify(points: readonly Point[]): Point[] {
  const deduped: Point[] = [];
  for (const p of points) {
    const last = deduped[deduped.length - 1];
    if (!last || Math.abs(last.x - p.x) > EPSILON || Math.abs(last.y - p.y) > EPSILON) deduped.push(p);
  }
  return deduped.filter((p, i) => {
    const prev = deduped[i - 1];
    const next = deduped[i + 1];
    if (!prev || !next) return true;
    const straight = (Math.abs(prev.x - p.x) < EPSILON && Math.abs(p.x - next.x) < EPSILON) ||
      (Math.abs(prev.y - p.y) < EPSILON && Math.abs(p.y - next.y) < EPSILON);
    return !straight;
  });
}

/** Replaces each 90° corner with a 45° cut of up to `chamfer` per side (half a segment at most). */
function chamfer(points: readonly Point[], size: number): Point[] {
  const out: Point[] = [];
  points.forEach((p, i) => {
    const prev = points[i - 1];
    const next = points[i + 1];
    if (!prev || !next) {
      out.push(p);
      return;
    }
    const inLength = Math.hypot(p.x - prev.x, p.y - prev.y);
    const outLength = Math.hypot(next.x - p.x, next.y - p.y);
    const cut = Math.min(size, inLength / 2, outLength / 2);
    out.push(
      { x: p.x - ((p.x - prev.x) / inLength) * cut, y: p.y - ((p.y - prev.y) / inLength) * cut },
      { x: p.x + ((next.x - p.x) / outLength) * cut, y: p.y + ((next.y - p.y) / outLength) * cut },
    );
  });
  return out;
}

function pathData(points: readonly Point[]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join(" ");
}

function polylineLength(points: readonly Point[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  return length;
}

function arrowhead(points: readonly Point[]) {
  const tip = points[points.length - 1]!;
  const from = points[points.length - 2]!;
  const length = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const ux = (tip.x - from.x) / length;
  const uy = (tip.y - from.y) / length;
  const { arrowLength: l, arrowWidth: w } = diagramMetrics;
  const back = { x: tip.x - ux * l, y: tip.y - uy * l };
  return pathData([
    { x: back.x - uy * w, y: back.y + ux * w },
    tip,
    { x: back.x + uy * w, y: back.y - ux * w },
  ]);
}

/** Midpoint of the longest orthogonal segment (first one on a tie). */
function labelOn(route: readonly Point[], text: string): EdgeLabel {
  let best = 0;
  let bestLength = -1;
  for (let i = 1; i < route.length; i++) {
    const length = Math.hypot(route[i]!.x - route[i - 1]!.x, route[i]!.y - route[i - 1]!.y);
    if (length > bestLength + EPSILON) {
      bestLength = length;
      best = i;
    }
  }
  const a = route[best - 1] ?? route[0]!;
  const b = route[best] ?? route[0]!;
  return { x: round((a.x + b.x) / 2), y: round((a.y + b.y) / 2), text, vertical: Math.abs(a.x - b.x) < EPSILON };
}


/**
 * How an edge gets from its source port to its target port:
 * - `straight`: same row or same column, nothing in between;
 * - `one`: one vertical run in a column gutter;
 * - `two`: when every single-gutter route would cross a node, a vertical run in the gutter next
 *   to the source, a horizontal run along a row gutter, and a vertical run in the gutter next
 *   to the target.
 */
type Turn =
  | { kind: "straight" }
  | { kind: "one"; gutter: number }
  | { kind: "two"; near: number; far: number; rowY: number };

function labelBox(label: EdgeLabel): Rect {
  const { smallSize, smallLineHeight, monoAdvance } = diagramMetrics;
  const along = label.text.length * smallSize * monoAdvance + 6;
  const [width, height] = label.vertical ? [smallLineHeight, along] : [along, smallLineHeight];
  return { x: label.x - width / 2, y: label.y - height / 2, width, height };
}

/**
 * Labels of parallel edges land on top of each other (same segment midpoint, 6 apart). When two
 * label boxes overlap, each moves half a line sideways off its edge, so they sit either side.
 */
function separateLabels(labels: EdgeLabel[]) {
  const nudge = diagramMetrics.smallLineHeight / 2 + 2;
  labels.forEach((b, j) => {
    for (const a of labels.slice(0, j)) {
      const ra = labelBox(a);
      const rb = labelBox(b);
      const overlap = ra.x < rb.x + rb.width && rb.x < ra.x + ra.width && ra.y < rb.y + rb.height && rb.y < ra.y + ra.height;
      if (!overlap || a.vertical !== b.vertical) continue;
      const axis = a.vertical ? "x" : "y";
      const sign = b[axis] >= a[axis] ? 1 : -1;
      a[axis] = round(a[axis] - sign * nudge);
      b[axis] = round(b[axis] + sign * nudge);
    }
  });
}

type Draft = {
  edge: ArchEdge;
  index: number;
  from: ArchNode;
  to: ArchNode;
  fromSide: Side;
  toSide: Side;
  turn: Turn;
  start: Point;
  end: Point;
};

type Port = { draft: Draft; end: "start" | "end" };

const sidePoint = (r: Rect, side: Side, offset: number): Point => {
  switch (side) {
    case "left":
      return { x: r.x, y: r.y + r.height / 2 + offset };
    case "right":
      return { x: r.x + r.width, y: r.y + r.height / 2 + offset };
    case "top":
      return { x: r.x + r.width / 2 + offset, y: r.y };
    case "bottom":
      return { x: r.x + r.width / 2 + offset, y: r.y + r.height };
  }
};

/** Lays out a diagram from typed project data. Throws on edges that name unknown nodes. */
export function layoutDiagram(
  nodes: readonly ArchNode[],
  edges: readonly ArchEdge[],
  viewWidth: number = diagramMetrics.viewWidth,
): DiagramLayout {
  const m = diagramMetrics;
  const cols = Math.max(1, ...nodes.map((n) => n.col + 1));
  const rows = Math.max(1, ...nodes.map((n) => n.row + 1));
  const cellWidth = (viewWidth - 2 * m.padding) / cols;
  const nodeWidth = Math.min(m.maxNodeWidth, cellWidth - m.minGutter);
  const height = 2 * m.padding + rows * m.cellHeight;

  const rectOf = (n: ArchNode): Rect => ({
    x: round(m.padding + n.col * cellWidth + (cellWidth - nodeWidth) / 2),
    y: round(m.padding + n.row * m.cellHeight + (m.cellHeight - m.nodeHeight) / 2),
    width: round(nodeWidth),
    height: m.nodeHeight,
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rects = new Map(nodes.map((n) => [n.id, rectOf(n)]));
  const rect = (id: string) => rects.get(id)!;
  /** x of the centre line between column g and g + 1. */
  const gutterX = (g: number) => m.padding + (g + 1) * cellWidth;
  /** y of the line between row b - 1 and row b. */
  const rowGutterY = (b: number) => m.padding + b * m.cellHeight;
  const othersThan = (...ids: string[]) => nodes.filter((n) => !ids.includes(n.id)).map((n) => rect(n.id));

  // 1. Sides: horizontal sides whenever the columns differ, vertical sides within a column.
  // 2. Turns, decided on node centres (port offsets of a few units never change the outcome).
  const drafts: Draft[] = edges.map((edge, index) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) throw new Error(`Edge ${edge.from} → ${edge.to} names an unknown node`);
    if (from.col === to.col && from.row === to.row) throw new Error(`Edge ${edge.from} → ${edge.to} joins one cell`);
    const dc = to.col - from.col;
    const dr = to.row - from.row;
    const [fromSide, toSide]: [Side, Side] =
      dc > 0 ? ["right", "left"] : dc < 0 ? ["left", "right"] : dr > 0 ? ["bottom", "top"] : ["top", "bottom"];
    const a = sidePoint(rect(from.id), fromSide, 0);
    const b = sidePoint(rect(to.id), toSide, 0);
    const others = othersThan(from.id, to.id);

    let turn: Turn = { kind: "straight" };
    if (dc !== 0 && !(dr === 0 && !routeHits([a, b], others))) {
      // Single gutter: prefer the one next to the target.
      const step = dc > 0 ? 1 : -1;
      const gutters: number[] = [];
      for (let c = to.col; c !== from.col; c -= step) gutters.push(step > 0 ? c - 1 : c);
      const one = gutters.find((g) => {
        const x = gutterX(g);
        return dr !== 0 && !routeHits([a, { x, y: a.y }, { x, y: b.y }, b], others);
      });
      const near = dc > 0 ? from.col : from.col - 1;
      const far = dc > 0 ? to.col - 1 : to.col;
      // Row gutters between the two rows first, then the ones just outside them.
      const low = Math.min(from.row, to.row);
      const high = Math.max(from.row, to.row);
      const boundaries = [...Array.from({ length: high - low }, (_, i) => low + 1 + i), low, high + 1];
      const rowY = one === undefined && near !== far
        ? boundaries.map(rowGutterY).find((y) => {
            const nx = gutterX(near);
            const fx = gutterX(far);
            return !routeHits([a, { x: nx, y: a.y }, { x: nx, y }, { x: fx, y }, { x: fx, y: b.y }, b], others);
          })
        : undefined;
      turn = one !== undefined
        ? { kind: "one", gutter: one }
        : rowY !== undefined
          ? { kind: "two", near, far, rowY }
          : { kind: "one", gutter: gutters[0]! };
    }
    return { edge, index, from, to, fromSide, toSide, turn, start: a, end: b };
  });

  // 3. Ports. Straight edges take the middle of a side (offsets centred on 0, in data order, so
  //    both ends agree and the run stays straight). Bent edges stack outward from them on the
  //    side they head towards, nearest first, so fans leave without crossing.
  const heading = (port: Port): Point => {
    const { draft } = port;
    if (draft.turn.kind === "two") {
      return { x: gutterX(port.end === "start" ? draft.turn.near : draft.turn.far), y: draft.turn.rowY };
    }
    return centre(rect(port.end === "start" ? draft.to.id : draft.from.id));
  };
  const sides = new Map<string, Port[]>();
  for (const draft of drafts) {
    for (const [end, node, side] of [
      ["start", draft.from, draft.fromSide],
      ["end", draft.to, draft.toSide],
    ] as const) {
      const key = `${node.id}\u0000${side}`;
      sides.set(key, [...(sides.get(key) ?? []), { draft, end }]);
    }
  }
  for (const [key, ports] of sides) {
    const [nodeId, sideName] = key.split("\u0000") as [string, Side];
    const r = rect(nodeId);
    const axis = sideName === "left" || sideName === "right" ? "y" : "x";
    const middle = centre(r)[axis];
    const straight = ports.filter((p) => p.draft.turn.kind === "straight").sort((a, b) => a.draft.index - b.draft.index);
    const bent = ports.filter((p) => p.draft.turn.kind !== "straight");
    const before = bent.filter((p) => heading(p)[axis] < middle).sort((a, b) => heading(b)[axis] - heading(a)[axis] || a.draft.index - b.draft.index);
    const after = bent.filter((p) => heading(p)[axis] >= middle).sort((a, b) => heading(a)[axis] - heading(b)[axis] || a.draft.index - b.draft.index);
    const set = (p: Port, offset: number) => {
      p.draft[p.end] = sidePoint(r, sideName, offset);
    };
    if (straight.length === 0) {
      // No straight run to keep central: centre the whole stack.
      const all = [...before.reverse(), ...after];
      all.forEach((p, i) => set(p, (i - (all.length - 1) / 2) * m.edgeGap));
      continue;
    }
    const half = ((straight.length - 1) / 2) * m.edgeGap;
    straight.forEach((p, i) => set(p, -half + i * m.edgeGap));
    before.forEach((p, i) => set(p, -half - (i + 1) * m.edgeGap));
    after.forEach((p, i) => set(p, half + (i + 1) * m.edgeGap));
  }

  // 4. Channels: edges with a vertical run in one gutter spread EDGE_GAP apart. The longer run
  //    turns nearer its source, which untangles fans out of (and into) one node.
  type Run = { draft: Draft; span: number };
  const runs = new Map<number, Run[]>();
  const addRun = (g: number, draft: Draft, span: number) => runs.set(g, [...(runs.get(g) ?? []), { draft, span }]);
  for (const d of drafts) {
    if (d.turn.kind === "one") addRun(d.turn.gutter, d, Math.abs(d.end.y - d.start.y));
    if (d.turn.kind === "two") {
      addRun(d.turn.near, d, Math.abs(d.turn.rowY - d.start.y));
      addRun(d.turn.far, d, Math.abs(d.end.y - d.turn.rowY));
    }
  }
  const channel = new Map<string, number>();
  for (const [g, list] of runs) {
    const key = (run: Run) => (run.draft.to.col > run.draft.from.col ? -1 : 1) * run.span;
    list.sort((a, b) => key(a) - key(b) || a.draft.index - b.draft.index);
    list.forEach((run, i) => channel.set(`${run.draft.index}:${g}`, gutterX(g) + (i - (list.length - 1) / 2) * m.edgeGap));
  }
  const channelX = (d: Draft, g: number) => channel.get(`${d.index}:${g}`) ?? gutterX(g);

  // 5. Routes, paths, labels, arrowheads.
  const depth = depths(nodes, edges);
  const laidEdges: LayoutEdge[] = drafts.map((d) => {
    const { start, end, turn } = d;
    let points: Point[];
    if (turn.kind === "straight") {
      points = [start, end];
    } else if (turn.kind === "one") {
      const x = channelX(d, turn.gutter);
      points = [start, { x, y: start.y }, { x, y: end.y }, end];
    } else {
      const nx = channelX(d, turn.near);
      const fx = channelX(d, turn.far);
      points = [start, { x: nx, y: start.y }, { x: nx, y: turn.rowY }, { x: fx, y: turn.rowY }, { x: fx, y: end.y }, end];
    }
    const route = simplify(points);
    const drawn = chamfer(route, m.chamfer);
    return {
      edge: d.edge,
      index: d.index,
      route,
      d: pathData(drawn),
      length: round(polylineLength(drawn)),
      arrow: arrowhead(drawn),
      label: d.edge.protocol ? labelOn(route, d.edge.protocol) : undefined,
      step: depth.get(d.from.id) ?? 0,
    };
  });
  laidEdges.sort((a, b) => a.step - b.step || a.index - b.index);
  separateLabels(laidEdges.flatMap((e) => (e.label ? [e.label] : [])));

  const labelChars = charsThatFit(nodeWidth - 2 * m.labelPadding, m.labelSize);
  const calloutChars = charsThatFit(m.calloutWidth - 2 * m.calloutPadding, m.smallSize);
  const laidNodes: LayoutNode[] = nodes.map((node) => {
    const r = rect(node.id);
    let callout: LayoutNode["callout"];
    if (node.note) {
      const lines = wrapText(node.note, calloutChars);
      const boxHeight = 2 * m.calloutPadding + lines.length * m.smallLineHeight;
      // Below the node, except on the last row where it would leave the viewBox.
      const above = node.row === rows - 1;
      const x = Math.min(viewWidth - m.calloutWidth, Math.max(0, r.x + r.width / 2 - m.calloutWidth / 2));
      const y = above ? r.y - m.calloutOffset - boxHeight : r.y + r.height + m.calloutOffset;
      callout = { rect: { x: round(x), y: round(y), width: m.calloutWidth, height: boxHeight }, lines };
    }
    return { node, rect: r, lines: wrapText(node.label, labelChars), depth: depth.get(node.id) ?? 0, callout };
  });

  return {
    width: viewWidth,
    height,
    viewBox: `0 0 ${viewWidth} ${height}`,
    cellWidth: round(cellWidth),
    nodeWidth: round(nodeWidth),
    nodes: laidNodes,
    edges: laidEdges,
  };
}
