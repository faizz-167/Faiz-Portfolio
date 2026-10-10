"use client";

import { useEffect, useRef, useState } from "react";
import type { Surface } from "@/components/layout/Scene";
import { cn } from "@/lib/cn";
import { gsap, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { pixelOrder } from "./pixel-order";

/** Column count per grid tier (design.md §5: <640, 640–1023, ≥1024). */
export type PixelColumns = { base: number; md: number; lg: number };

const TIER_QUERIES = {
  base: "(max-width: 639.98px)",
  md: "(min-width: 640px) and (max-width: 1023.98px)",
  lg: "(min-width: 1024px)",
} as const;

const pixelClasses = {
  /* `[data-surface]` paints a background; the field itself must stay transparent. */
  root: "pointer-events-none grid bg-transparent grid-cols-[repeat(var(--pixel-cols),minmax(0,1fr))]",
  cell: "aspect-square bg-surface",
  /* The last row may overhang; the field clips it and keeps its own height. */
  cover: "content-start overflow-hidden",
} as const;

export type PixelFieldProps = {
  /** `fill`: cells switch on in order (a seam). `clear`: they start on and switch off (a reveal). */
  mode: "fill" | "clear";
  columns: PixelColumns;
  /** Row count, or `cover`: as many square rows as it takes to cover the field's height. */
  rows: number | "cover";
  /** Surface whose background colours the cells. */
  surface: Surface;
  seed: number;
  bias?: "up" | "none";
  /** ScrollTrigger start, relative to this field. */
  start: string;
  /** ScrollTrigger end, relative to this field (a function is re-read on every refresh). */
  end: string | (() => string);
  /** Positioning; the field sizes itself from its width (square cells), except with `rows="cover"`. */
  className?: string;
};

/**
 * A grid of square cells in one surface colour, switched cell by cell (hard
 * cuts, `visibility` + opacity) by a scrubbed ScrollTrigger: the pixel seam
 * and the portrait reveal (P11c.5–6), after paulkalkbrenner.net.
 * Cells are built on the client only with motion allowed, so the server HTML,
 * no-JS and reduced motion all show nothing here: a hard edge, a plain photo.
 * Its triggers refresh after pins (`refreshPriority: -1`), so a pin above or
 * around it never shifts its range.
 */
export function PixelField({
  mode,
  columns,
  rows,
  surface,
  seed,
  bias = "none",
  start,
  end,
  className,
}: PixelFieldProps) {
  const root = useRef<HTMLDivElement>(null);
  const [coverRows, setCoverRows] = useState(0);
  const rowCount = rows === "cover" ? coverRows : rows;
  useRefreshOnShow();

  // `cover`: re-count rows whenever the field's size changes; a new count rebuilds the cells.
  useEffect(() => {
    const field = root.current;
    if (rows !== "cover" || !field) return;
    const observer = new ResizeObserver(() => {
      const tier = window.innerWidth;
      const cols = tier >= 1024 ? columns.lg : tier >= 640 ? columns.md : columns.base;
      const cell = field.clientWidth / cols;
      setCoverRows(cell > 0 ? Math.ceil(field.clientHeight / cell) : 0);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [rows, columns.base, columns.md, columns.lg]);

  useGSAP(
    () => {
      const field = root.current;
      if (!field) return;
      const mm = gsap.matchMedia();
      mm.add({ ...TIER_QUERIES, motion: MOTION_OK_QUERY }, (context) => {
        const { motion, md, lg } = context.conditions ?? {};
        if (!motion || rowCount === 0) return;
        const cols = lg ? columns.lg : md ? columns.md : columns.base;
        field.style.setProperty("--pixel-cols", String(cols));
        const cells = Array.from({ length: cols * rowCount }, () => {
          const cell = document.createElement("div");
          cell.className = pixelClasses.cell;
          return cell;
        });
        field.replaceChildren(...cells);
        const on = mode === "fill";
        gsap.set(cells, { autoAlpha: on ? 0 : 1 });

        const order = pixelOrder(cols, rowCount, seed, bias);
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: field, start, end, scrub: true, refreshPriority: -1 },
        });
        // Cut n of N lands at n/(N+1): nothing has switched at progress 0, everything by 1.
        order.forEach((index, n) => {
          const cell = cells[index];
          if (cell) timeline.set(cell, { autoAlpha: on ? 1 : 0 }, (n + 1) / (order.length + 1));
        });
        timeline.set({}, {}, 1);

        return () => {
          field.replaceChildren();
        };
      });
    },
    { scope: root, dependencies: [mode, columns.base, columns.md, columns.lg, rowCount, seed, bias, start, end] },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-surface={surface}
      className={cn(pixelClasses.root, rows === "cover" && pixelClasses.cover, className)}
    />
  );
}
