"use client";

import { useRef, type ElementType } from "react";
import { SplitSource } from "@/components/motion/SplitSource";
import { gsap, SplitText, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import type { PolymorphicProps } from "@/lib/polymorphic";

/** Starting ink of each word (design.md §7 Statement: 20% → 100%). */
const START_OPACITY = 0.2;
/* Scrub range (phase6.md P6.2). */
const SCRUB_START = "top 75%";
const SCRUB_END = "bottom 40%";
/* Words ink in one after another: each word's share of the scrub, in timeline units. */
const WORD_STAGGER = 0.1;

/*
 * Accent band (phase11c.md P11c.4, after the produx.design hero reveal). Each
 * word passes 20% ink → accent → full ink. The accent copy arrives and leaves
 * in pixels: it is drawn as BAND_LAYERS stacked copies, each masked to a
 * disjoint quarter of a square-cell pattern, switched on (and later off) one
 * layer at a time. Opacity cuts only — no transform, no blur.
 */
const BAND_LAYERS = 4;
/** Pattern tile, in cells per side. */
const TILE_CELLS = 6;
/** Cell size: about a serif stroke at the statement's size. */
const CELL_EM = 0.1;
/** Word i is fully accent from i·S + S until i·S + 2S, so about three words are in the band. */
const BAND_HOLD = 2 * WORD_STAGGER;
/** One layer every quarter word. */
const LAYER_STEP = WORD_STAGGER / BAND_LAYERS;
/** Seed of the cell → layer assignment: the same pattern on every load. */
const PATTERN_SEED = 0x51a7;

const scrubClasses = {
  overlay: "pointer-events-none absolute top-0 left-0 whitespace-nowrap text-accent",
} as const;

/** One mask image per layer: that layer's cells opaque, the rest transparent. */
function bandMasks(): string[] {
  let a = PATTERN_SEED;
  const next = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  // Shuffle the tile's cells, then deal them round-robin to the layers.
  const cells = Array.from({ length: TILE_CELLS * TILE_CELLS }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [cells[i], cells[j]] = [cells[j] ?? 0, cells[i] ?? 0];
  }
  return Array.from({ length: BAND_LAYERS }, (_, layer) => {
    const rects = cells
      .filter((_, n) => n % BAND_LAYERS === layer)
      .map((cell) => `<rect x='${cell % TILE_CELLS}' y='${Math.floor(cell / TILE_CELLS)}' width='1' height='1'/>`)
      .join("");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE_CELLS}' height='${TILE_CELLS}' shape-rendering='crispEdges'>${rects}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  });
}

function maskLayer(overlay: HTMLElement, image: string) {
  const size = `${TILE_CELLS * CELL_EM}em`;
  for (const prefix of ["", "-webkit-"]) {
    overlay.style.setProperty(`${prefix}mask-image`, image);
    overlay.style.setProperty(`${prefix}mask-size`, `${size} ${size}`);
    overlay.style.setProperty(`${prefix}mask-repeat`, "repeat");
  }
}

type ScrubTextOwnProps = {
  /** Plain text only (rendered twice: visible + screen-reader copy). */
  children: string;
  className?: string;
};

export type ScrubTextProps<E extends ElementType = "p"> = PolymorphicProps<E, ScrubTextOwnProps>;

/**
 * Scrub (design.md §7): words ink in from 20% to 100% opacity, linked to
 * scroll, through a pixelated accent band at the leading edge (P11c.4). At
 * either end of the scrub no word shows the accent. Words are split without
 * lines, so no re-split is needed on resize.
 *
 * Server HTML is the full-ink text. Reduced motion: no split, full ink, no band.
 */
export function ScrubText<E extends ElementType = "p">({
  as,
  children,
  className,
  ...rest
}: ScrubTextProps<E>) {
  const Component: ElementType = as ?? "p";
  const root = useRef<HTMLElement>(null);
  const target = useRef<HTMLSpanElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const { words } = SplitText.create(el, { type: "words", tag: "span", aria: "none" });
        const masks = bandMasks();
        // Each word becomes an ink span plus the stacked accent copies over it.
        // SplitText's revert restores the original markup, overlays included.
        const parts = words.map((word) => {
          const ink = document.createElement("span");
          ink.append(...Array.from(word.childNodes));
          const overlays = masks.map((mask) => {
            const overlay = document.createElement("span");
            overlay.className = scrubClasses.overlay;
            overlay.textContent = ink.textContent;
            maskLayer(overlay, mask);
            return overlay;
          });
          word.classList.add("relative");
          word.replaceChildren(ink, ...overlays);
          return { ink, overlays };
        });

        gsap.set(
          parts.map((part) => part.ink),
          { opacity: START_OPACITY },
        );
        gsap.set(
          parts.flatMap((part) => part.overlays),
          { autoAlpha: 0 },
        );

        const scrub = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: SCRUB_START, end: SCRUB_END, scrub: true },
        });
        parts.forEach(({ ink, overlays }, i) => {
          const at = i * WORD_STAGGER;
          overlays.forEach((overlay, k) => {
            scrub.set(overlay, { autoAlpha: 1 }, at + k * LAYER_STEP);
            scrub.set(overlay, { autoAlpha: 0 }, at + BAND_HOLD + WORD_STAGGER * 0.5 + k * LAYER_STEP);
          });
          // Under full accent cover, the ink underneath cuts to 100%.
          scrub.set(ink, { opacity: 1 }, at + WORD_STAGGER);
        });
        // Nudge every set past time 0 so progress 0 is the untouched state.
        scrub.shiftChildren(LAYER_STEP / 2);
      });
    },
    { scope: root },
  );

  return (
    <Component {...rest} ref={root} className={className}>
      <SplitSource text={children} targetRef={target} />
    </Component>
  );
}
