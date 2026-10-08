"use client";

import { AnimatePresence, motion } from "motion/react";
import Image, { getImageProps } from "next/image";
import { useRef } from "react";
import type { Surface } from "@/components/layout/Scene";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { cubicBeziers, durationsS, gsapEases } from "@/lib/motion/tokens";

/*
 * The panel is 28vw wide (class `w-[28vw]` below); `sizes` must say the same so
 * the browser picks the right srcset candidate, and touch devices fetch nothing.
 */
const PREVIEW_SIZES = "(pointer: fine) 28vw, 0px";

export type PreviewImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

const hoverPreviewClasses = {
  /* Moved by GSAP (transform). Never interactive. */
  follower: "pointer-events-none fixed top-0 left-0 z-chrome",
  /* Overlaid level (design.md §4): opposite surface + 1px --fg border. Motion owns opacity. */
  panel: "absolute top-5 left-5 w-[28vw] border-hair border-fg",
  image: "block h-auto w-full",
} as const;

const preloaded = new Set<string>();

/**
 * Warms the browser cache with the exact srcset candidate the panel will use.
 * Call it on hover-intent (pointerenter of a row), before the row activates.
 * No-op on the server and for already-requested images.
 */
export function preloadPreview(item: PreviewImage) {
  if (typeof window === "undefined" || preloaded.has(item.src)) return;
  preloaded.add(item.src);
  const { props } = getImageProps({
    src: item.src,
    alt: item.alt,
    width: item.width,
    height: item.height,
    sizes: PREVIEW_SIZES,
  });
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

export type HoverPreviewProps = {
  items: readonly PreviewImage[];
  /** Item to show, or null for none. The parent decides (e.g. after 120ms hover-intent). */
  activeId: string | null;
  /** Panel surface: the opposite of the scene it floats over. Default "paper". */
  surface?: Surface;
};

/**
 * Cursor-follow media panel (P6.9). The panel trails the pointer with
 * `gsap.quickTo` (`--dur-base` lag); images swap with Motion `AnimatePresence`,
 * opacity only, keyed by the active item. Images go through next/image with
 * `sizes="(pointer: fine) 28vw, 0px"`.
 * Renders nothing on the server, on touch/coarse pointers or with reduced
 * motion — touch layouts show the image inline instead (Phase 10).
 */
export function HoverPreview(props: HoverPreviewProps) {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotion();
  if (!pointerFine || reduced) return null;
  return <HoverPreviewPanel {...props} />;
}

function HoverPreviewPanel({ items, activeId, surface = "paper" }: HoverPreviewProps) {
  const follower = useRef<HTMLDivElement>(null);
  const active = activeId ? items.find((item) => item.id === activeId) : undefined;

  useGSAP(
    () => {
      const el = follower.current;
      if (!el) return;
      const lag = { duration: durationsS.base, ease: gsapEases.out };
      const xTo = gsap.quickTo(el, "x", lag);
      const yTo = gsap.quickTo(el, "y", lag);
      let placed = false;
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (!placed) {
          placed = true;
          gsap.set(el, { x: event.clientX, y: event.clientY });
        }
        xTo(event.clientX);
        yTo(event.clientY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: follower },
  );

  return (
    <div ref={follower} aria-hidden="true" className={hoverPreviewClasses.follower}>
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key={active.id}
            data-surface={surface}
            className={hoverPreviewClasses.panel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durationsS.fast, ease: cubicBeziers.out }}
          >
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes={PREVIEW_SIZES}
              loading="eager"
              className={hoverPreviewClasses.image}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
