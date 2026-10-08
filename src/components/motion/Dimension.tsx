"use client";

import { animate, createDrawable, type JSAnimation } from "animejs";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { readPxToken } from "@/lib/motion/css-tokens";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { animeEases, durationsMs } from "@/lib/motion/tokens";

export type DimensionAxis = "x" | "y";
export type DimensionSide = "top" | "bottom" | "left" | "right";

type Point = { x: number; y: number };

type DimensionGeometry = {
  /** Measured size in px (unrounded). */
  value: number;
  line: string;
  extensions: [string, string];
  arrows: [string, string];
  label: Point & { anchor: "start" | "middle" | "end"; baseline: "auto" | "middle" | "hanging" };
};

/** Drawing tokens (read at runtime from globals.css). */
const dimensionTokens = {
  /** Target edge → dimension line. */
  offset: "--space-5",
  /** Gap between the target and the start of an extension line. */
  gap: "--space-1",
  /** Extension line overshoot past the dimension line; also the arrowhead length. */
  overshoot: "--space-2",
  /** Dimension line → label. */
  labelGap: "--space-2",
} as const;

const dimensionClasses = {
  svg: "pointer-events-none absolute inset-0 size-full overflow-visible text-fg-muted",
  stroke: "fill-none stroke-current [stroke-width:var(--border-hair)] [vector-effect:non-scaling-stroke]",
  label: "fill-current font-mono text-data",
} as const;

const path = (points: Point[]) =>
  points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

function sameGeometry(a: DimensionGeometry | null, b: DimensionGeometry) {
  return a !== null && a.value === b.value && a.line === b.line && a.extensions[0] === b.extensions[0];
}

/**
 * All reads, no writes: target and host rects plus the drawing tokens.
 * Coordinates are relative to the host's padding box (the SVG's containing block).
 */
function measure(target: HTMLElement, host: HTMLElement, axis: DimensionAxis, side: DimensionSide) {
  const t = target.getBoundingClientRect();
  const h = host.getBoundingClientRect();
  const offset = readPxToken(dimensionTokens.offset);
  const gap = readPxToken(dimensionTokens.gap);
  const over = readPxToken(dimensionTokens.overshoot);
  const labelGap = readPxToken(dimensionTokens.labelGap);
  const left = t.left - h.left - host.clientLeft;
  const top = t.top - h.top - host.clientTop;
  const right = left + t.width;
  const bottom = top + t.height;

  let a: Point;
  let b: Point;
  let ext: [Point, Point, Point, Point];
  let label: DimensionGeometry["label"];
  if (axis === "x") {
    const below = side === "bottom";
    const y = below ? bottom + offset : top - offset;
    const dir = below ? 1 : -1;
    const from = below ? bottom + gap : top - gap;
    a = { x: left, y };
    b = { x: right, y };
    ext = [{ x: left, y: from }, { x: left, y: y + dir * over }, { x: right, y: from }, { x: right, y: y + dir * over }];
    label = { x: (left + right) / 2, y: y + dir * labelGap, anchor: "middle", baseline: below ? "hanging" : "auto" };
  } else {
    const after = side === "right";
    const x = after ? right + offset : left - offset;
    const dir = after ? 1 : -1;
    const from = after ? right + gap : left - gap;
    a = { x, y: top };
    b = { x, y: bottom };
    ext = [{ x: from, y: top }, { x: x + dir * over, y: top }, { x: from, y: bottom }, { x: x + dir * over, y: bottom }];
    label = { x: x + dir * labelGap, y: (top + bottom) / 2, anchor: after ? "start" : "end", baseline: "middle" };
  }

  // Arrowheads: tips on the extension lines, wings back along the line.
  const along = axis === "x" ? { x: 1, y: 0 } : { x: 0, y: 1 };
  const across = { x: along.y, y: along.x };
  const wing = (tip: Point, sign: 1 | -1): Point[] => [
    { x: tip.x + sign * along.x * over + (across.x * over) / 2, y: tip.y + sign * along.y * over + (across.y * over) / 2 },
    tip,
    { x: tip.x + sign * along.x * over - (across.x * over) / 2, y: tip.y + sign * along.y * over - (across.y * over) / 2 },
  ];

  return {
    value: axis === "x" ? t.width : t.height,
    line: path([a, b]),
    extensions: [path([ext[0], ext[1]]), path([ext[2], ext[3]])],
    arrows: [path(wing(a, 1)), path(wing(b, -1))],
    label,
  } satisfies DimensionGeometry;
}

export type DimensionProps = {
  /** Element to measure. It and this component must share a positioned ancestor (the SVG's parent). */
  targetRef: RefObject<HTMLElement | null>;
  /** "x" measures width, "y" height. */
  axis: DimensionAxis;
  /** Where the dimension line sits. Default "top" for x, "left" for y. */
  side?: DimensionSide;
  /** true draws the lines in and counts the label up; false retracts them. Default true. */
  play?: boolean;
  className?: string;
};

/**
 * Dimension line (P6.10), drawn by anime.js: extension lines, arrowheads and a
 * dimension line drawn with `createDrawable`, and a centred mono label that
 * counts up to the measured size in px (`Math.round`). A ResizeObserver keeps
 * the measurement real: geometry and label follow every resize.
 *
 * Absolutely positioned over its parent (which must be positioned); renders an
 * empty SVG on the server (nothing is measured during render, so it is
 * ensureStatic-safe) and never affects layout. Reduced motion: the final
 * drawing appears at once. Decorative: aria-hidden.
 */
export function Dimension({ targetRef, axis, side, play = true, className }: DimensionProps) {
  const resolvedSide: DimensionSide = side ?? (axis === "x" ? "top" : "left");
  const svg = useRef<SVGSVGElement>(null);
  const label = useRef<SVGTextElement>(null);
  const [geometry, setGeometry] = useState<DimensionGeometry | null>(null);
  const value = useRef(0);
  const counting = useRef(false);
  const shown = useRef(false);

  // Measure: ResizeObserver callbacks run after layout, so these reads never force one.
  useEffect(() => {
    const target = targetRef.current;
    const host = svg.current?.parentElement;
    if (!target || !host) return;
    const observer = new ResizeObserver(() => {
      if (!target.isConnected || target.getClientRects().length === 0) return; // hidden route
      const next = measure(target, host, axis, resolvedSide);
      setGeometry((prev) => (sameGeometry(prev, next) ? prev : next));
    });
    observer.observe(target);
    observer.observe(host);
    return () => observer.disconnect();
  }, [targetRef, axis, resolvedSide]);

  // Keep the label equal to the measurement after resizes (unless it is counting).
  useLayoutEffect(() => {
    if (!geometry) return;
    value.current = geometry.value;
    if (shown.current && !counting.current && label.current) {
      label.current.textContent = String(Math.round(geometry.value));
    }
  }, [geometry]);

  // Draw / retract. Layout effect: the lines are hidden before the first paint.
  const ready = geometry !== null;
  useLayoutEffect(() => {
    const svgEl = svg.current;
    const text = label.current;
    if (!ready || !svgEl || !text) return;
    const strokes = createDrawable(svgEl.querySelectorAll("[data-dimension-stroke]"));
    const duration = prefersReducedMotion() ? 0 : durationsMs.slow;
    const running: JSAnimation[] = [];

    if (play) {
      const counter = { value: 0 };
      counting.current = true;
      shown.current = true;
      running.push(
        animate(strokes, { draw: ["0 0", "0 1"], duration, ease: animeEases.wipe }),
        animate(text, { opacity: [0, 1], duration, ease: animeEases.out }),
        animate(counter, {
          value: [0, value.current],
          duration,
          ease: animeEases.out,
          onUpdate: () => {
            text.textContent = String(Math.round(counter.value));
          },
          onComplete: () => {
            counting.current = false;
            text.textContent = String(Math.round(value.current));
          },
        }),
      );
    } else {
      counting.current = false;
      if (!shown.current) {
        // Never drawn: stay hidden without animating.
        text.style.opacity = "0";
        return;
      }
      shown.current = false;
      running.push(
        animate(strokes, { draw: "0 0", duration, ease: animeEases.wipe }),
        animate(text, { opacity: 0, duration, ease: animeEases.out }),
      );
    }
    return () => {
      for (const animation of running) animation.cancel();
    };
  }, [play, ready]);

  return (
    <svg ref={svg} aria-hidden="true" focusable="false" className={cn(dimensionClasses.svg, className)}>
      {geometry && (
        <>
          <path data-dimension-stroke="" d={geometry.extensions[0]} className={dimensionClasses.stroke} />
          <path data-dimension-stroke="" d={geometry.extensions[1]} className={dimensionClasses.stroke} />
          <path data-dimension-stroke="" d={geometry.line} className={dimensionClasses.stroke} />
          <path data-dimension-stroke="" d={geometry.arrows[0]} className={dimensionClasses.stroke} />
          <path data-dimension-stroke="" d={geometry.arrows[1]} className={dimensionClasses.stroke} />
        </>
      )}
      <text
        ref={label}
        x={geometry?.label.x ?? 0}
        y={geometry?.label.y ?? 0}
        textAnchor={geometry?.label.anchor}
        dominantBaseline={geometry?.label.baseline}
        className={dimensionClasses.label}
      />
    </svg>
  );
}
