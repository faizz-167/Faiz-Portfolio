"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";

/** Drift only where hover exists too: a fine pointer with motion allowed (phase11c.md P11c.3). */
const DRIFT_QUERY = `${MOTION_OK_QUERY} and (pointer: fine)`;
/** The layer is 110% of the frame, so ±4.5% of its own height keeps the frame covered. */
const DRIFT_PERCENT = 4.5;

const driftClasses = {
  /* 5% overhang top and bottom; centred when nothing drifts. */
  layer: "absolute inset-x-0 -top-[5%] h-[110%]",
} as const;

/**
 * Plate parallax (P11c.3): the media layer drifts vertically inside its fixed
 * frame while the frame crosses the viewport, scrubbed. Transform only.
 * Touch and coarse pointers get the still, centred layer unless `anyPointer`
 * (the full-bleed portrait, which has no hover to pair with); reduced motion
 * always does.
 */
export function PlateDrift({ children, anyPointer = false }: { children: ReactNode; anyPointer?: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const el = layer.current;
      const frame = el?.parentElement;
      if (!el || !frame) return;
      const mm = gsap.matchMedia();
      mm.add(anyPointer ? MOTION_OK_QUERY : DRIFT_QUERY, () => {
        gsap.fromTo(
          el,
          { yPercent: DRIFT_PERCENT },
          {
            yPercent: -DRIFT_PERCENT,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: layer, dependencies: [anyPointer] },
  );

  return (
    <div ref={layer} className={driftClasses.layer}>
      {children}
    </div>
  );
}
