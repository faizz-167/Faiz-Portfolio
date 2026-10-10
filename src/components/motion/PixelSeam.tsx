"use client";

import type { Surface } from "@/components/layout/Scene";
import { PixelField, type PixelColumns } from "@/components/motion/PixelField";

/* paulkalkbrenner.net's grid: 25 × 4 on desktop, 6 columns on phones (phase11c.md P11c.6). */
const SEAM_COLUMNS: PixelColumns = { base: 6, md: 12, lg: 25 };
const SEAM_ROWS = 4;
/** The seam is solid when its top reaches 40% of the viewport… */
const END_AT = 0.4;
/** …but never over less than a quarter viewport of scrolling (tall seams on short screens). */
const MIN_RANGE = 0.25;

/**
 * Scroll range from "seam bottom at viewport bottom" to "seam top at 40%".
 * Every seam is full-bleed with square cells, so its height follows from the
 * page width and the tier's column count.
 */
function seamEnd() {
  const vh = window.innerHeight;
  const width = document.documentElement.clientWidth;
  // Tiers follow the media queries, which measure the viewport including the scrollbar.
  const tier = window.innerWidth;
  const columns = tier >= 1024 ? SEAM_COLUMNS.lg : tier >= 640 ? SEAM_COLUMNS.md : SEAM_COLUMNS.base;
  const height = (width / columns) * SEAM_ROWS;
  return `+=${Math.max(vh * (1 - END_AT) - height, vh * MIN_RANGE)}`;
}

/**
 * The pixel seam at the bottom edge of a scene (P11c.6): cells in the next
 * scene's surface colour dissolve the boundary upward as it scrolls away.
 * Place it as the last child of the scene; it overlays the scene's bottom
 * padding and content (above them, below the trace), adding no height.
 */
export function PixelSeam({ to, seed }: { to: Surface; seed: number }) {
  return (
    <PixelField
      mode="fill"
      columns={SEAM_COLUMNS}
      rows={SEAM_ROWS}
      surface={to}
      seed={seed}
      bias="up"
      start="bottom bottom"
      end={seamEnd}
      className="absolute inset-x-0 bottom-0 z-base"
    />
  );
}
