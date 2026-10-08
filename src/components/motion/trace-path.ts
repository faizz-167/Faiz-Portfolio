/**
 * Pure geometry for the signal trace (P6.3). No DOM access: Trace measures the
 * page and passes plain numbers in, so this file can be reasoned about (and
 * tested) on its own.
 *
 * Routing (design.md §7 "Signal trace"): the trace is a PCB track. It never
 * crosses running text, so it only runs
 * - vertically on a margin rail (left or right page margin, at its centre), or
 *   down the via's own x when the via already sits in a margin;
 * - horizontally at a via's own y (from the via out to its rail), or at a
 *   *seam* — a y inside the empty block padding at the top of the next via's
 *   scene — when it has to cross from one rail to the other.
 * Corners are cut at 45° (chamfer). Corners *at* a via are never cut: the
 * track meets the pad exactly.
 */

export type Point = { x: number; y: number };
export type RailSide = "left" | "right";

export type TraceAnchor = Point & {
  /** Force the rail this via connects to. Default: the nearer page side. */
  rail?: RailSide;
  /** y where the trace may cross the page to reach this via (scene top padding). */
  seamY?: number;
};

export type TraceBounds = {
  /** Width of the trace layer (px). */
  width: number;
  /** Page side margin (`--margin-x`, px). Rails run down the middle of each margin. */
  marginX: number;
};

export type TracePath = {
  /** SVG path data ("" when there are fewer than two anchors). */
  d: string;
  /** Total length in px. */
  length: number;
  /** For each anchor, the progress (0–1) of the scheduled draw at which the head reaches it. */
  viaProgress: number[];
  /** Final vertices (after chamfering). */
  points: Point[];
  /** Length along the path at each vertex (px), parallel to `points`. */
  along: number[];
  /**
   * Draw schedule, parallel to `points`: the layer y that the viewport centre
   * must reach for the draw head to arrive at each vertex (see `scheduleDraw`).
   */
  schedule: number[];
};

/**
 * Horizontal runs cost this many px of scroll per px of length. Vertical runs
 * are drawn exactly as their y passes the viewport centre; a seam crossing has
 * no y extent, so it gets a short scroll budget of its own (a fast wipe rather
 * than a 1000px cut) and the head catches up on the next vertical run.
 */
export const CROSSING_SCROLL_RATIO = 0.25;

/**
 * When (as a layer y under the viewport centre) the head reaches each vertex:
 * never before the vertex's own y, never before the previous vertex, and
 * horizontal runs take `CROSSING_SCROLL_RATIO` × their length.
 */
function scheduleDraw(points: Point[]): number[] {
  const out: number[] = [];
  points.forEach((p, i) => {
    const prev = points[i - 1];
    const prevTime = out[i - 1];
    if (!prev || prevTime === undefined) {
      out.push(p.y);
      return;
    }
    const crossing = Math.abs(p.x - prev.x) * CROSSING_SCROLL_RATIO;
    out.push(Math.max(p.y, prevTime + crossing));
  });
  return out;
}

type Vertex = Point & { anchor: number | null };

const EPSILON = 0.5;

function same(a: Point, b: Point) {
  return Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
}

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function railSide(anchor: TraceAnchor, bounds: TraceBounds): RailSide {
  return anchor.rail ?? (anchor.x < bounds.width / 2 ? "left" : "right");
}

/** x of the vertical run serving this anchor. */
function railX(anchor: TraceAnchor, bounds: TraceBounds) {
  const { width, marginX } = bounds;
  const inMargin = anchor.x <= marginX || anchor.x >= width - marginX;
  if (inMargin) return anchor.x;
  return railSide(anchor, bounds) === "left" ? marginX / 2 : width - marginX / 2;
}

/** Orthogonal route through every anchor, in order. */
function route(anchors: TraceAnchor[], bounds: TraceBounds): Vertex[] {
  const out: Vertex[] = [];
  anchors.forEach((b, index) => {
    if (index === 0) {
      out.push({ x: b.x, y: b.y, anchor: 0 });
      return;
    }
    const a = anchors[index - 1]!;
    const ra = railX(a, bounds);
    const rb = railX(b, bounds);
    out.push({ x: ra, y: a.y, anchor: null });
    if (Math.abs(ra - rb) >= EPSILON) {
      const low = Math.min(a.y, b.y);
      const high = Math.max(a.y, b.y);
      const seam = Math.min(high, Math.max(low, b.seamY ?? (a.y + b.y) / 2));
      out.push({ x: ra, y: seam, anchor: null }, { x: rb, y: seam, anchor: null });
    }
    out.push({ x: rb, y: b.y, anchor: null }, { x: b.x, y: b.y, anchor: index });
  });
  return out;
}

/** Drops repeated points (keeping anchor tags) and straight-through non-anchor points. */
function simplify(vertices: Vertex[]): Vertex[] {
  const deduped: Vertex[] = [];
  for (const v of vertices) {
    const last = deduped[deduped.length - 1];
    if (last && same(last, v)) {
      if (v.anchor !== null) last.anchor = v.anchor;
      continue;
    }
    deduped.push({ ...v });
  }
  const out: Vertex[] = [];
  deduped.forEach((v, i) => {
    const prev = out[out.length - 1];
    const next = deduped[i + 1];
    if (prev && next && v.anchor === null) {
      const cross = (v.x - prev.x) * (next.y - v.y) - (v.y - prev.y) * (next.x - v.x);
      const dot = (v.x - prev.x) * (next.x - v.x) + (v.y - prev.y) * (next.y - v.y);
      if (Math.abs(cross) < EPSILON && dot > 0) return; // collinear, same direction
    }
    out.push(v);
  });
  return out;
}

/** Replaces each 90° non-anchor corner with a 45° cut of up to `chamfer` px per side. */
function chamferCorners(vertices: Vertex[], chamfer: number): Vertex[] {
  const out: Vertex[] = [];
  vertices.forEach((v, i) => {
    const prev = vertices[i - 1];
    const next = vertices[i + 1];
    if (!prev || !next || v.anchor !== null || chamfer <= 0) {
      out.push(v);
      return;
    }
    const cross = (v.x - prev.x) * (next.y - v.y) - (v.y - prev.y) * (next.x - v.x);
    if (Math.abs(cross) < EPSILON) {
      out.push(v); // reversal: no corner to cut
      return;
    }
    const inLength = distance(prev, v);
    const outLength = distance(v, next);
    // Half of each neighbour at most, so adjacent cuts never overlap.
    const cut = Math.min(chamfer, inLength / 2, outLength / 2);
    out.push(
      { x: v.x - ((v.x - prev.x) / inLength) * cut, y: v.y - ((v.y - prev.y) / inLength) * cut, anchor: null },
      { x: v.x + ((next.x - v.x) / outLength) * cut, y: v.y + ((next.y - v.y) / outLength) * cut, anchor: null },
    );
  });
  return out;
}

/**
 * Builds the trace through `anchors` (in document order) inside `bounds`,
 * with 45° corners of `chamfer` px.
 */
export function buildTracePath(
  anchors: TraceAnchor[],
  bounds: TraceBounds,
  chamfer: number,
): TracePath {
  if (anchors.length < 2) {
    const points = anchors.map(({ x, y }) => ({ x, y }));
    return { d: "", length: 0, viaProgress: anchors.map(() => 0), points, along: points.map(() => 0), schedule: points.map((p) => p.y) };
  }
  const vertices = chamferCorners(simplify(route(anchors, bounds)), chamfer);

  const along: number[] = [];
  let length = 0;
  vertices.forEach((v, i) => {
    if (i > 0) length += distance(vertices[i - 1]!, v);
    along.push(length);
  });

  const points = vertices.map(({ x, y }) => ({ x, y }));
  const schedule = scheduleDraw(points);
  const start = schedule[0] ?? 0;
  const span = (schedule[schedule.length - 1] ?? start) - start;
  // Fraction of the scrubbed range (= draw timeline progress) at which each via is reached.
  const viaProgress = anchors.map((_, index) => {
    const at = vertices.findIndex((v) => v.anchor === index);
    return span > 0 && at >= 0 ? (schedule[at]! - start) / span : 0;
  });

  const d = vertices
    .map((v, i) => `${i === 0 ? "M" : "L"}${round(v.x)} ${round(v.y)}`)
    .join(" ");

  return { d, length, viaProgress, points, along, schedule };
}

/**
 * Drawn fraction of the path (0–1) at scrub progress `p` (0–1 between the first
 * and last scheduled vertex). Piecewise linear over `schedule`; used as the
 * ease of a single DrawSVG tween, so the whole draw is one tween whatever the
 * vertex count.
 */
export function drawnFractionAt(route: Pick<TracePath, "schedule" | "along" | "length">, p: number) {
  const { schedule, along, length } = route;
  const first = schedule[0] ?? 0;
  const last = schedule[schedule.length - 1] ?? first;
  if (length <= 0 || last <= first) return p >= 1 ? 1 : 0;
  const t = first + Math.min(1, Math.max(0, p)) * (last - first);
  for (let k = 1; k < schedule.length; k++) {
    const s0 = schedule[k - 1]!;
    const s1 = schedule[k]!;
    if (t > s1) continue;
    const a0 = along[k - 1]!;
    const a1 = along[k]!;
    const local = s1 > s0 ? (t - s0) / (s1 - s0) : 1; // zero-span run: drawn whole
    return (a0 + (a1 - a0) * local) / length;
  }
  return 1;
}

/** A short vertical lead of `length` px arriving at the anchor from above (mobile). */
export function buildLocalSegment(anchor: Point, length: number) {
  return `M${round(anchor.x)} ${round(anchor.y - length)} L${round(anchor.x)} ${round(anchor.y)}`;
}

/** Path data for a set of rectangles (clip regions). */
export function rectsPath(rects: Array<{ x: number; y: number; width: number; height: number }>) {
  return rects
    .map((r) => `M${round(r.x)} ${round(r.y)}h${round(r.width)}v${round(r.height)}h${round(-r.width)}Z`)
    .join(" ");
}
