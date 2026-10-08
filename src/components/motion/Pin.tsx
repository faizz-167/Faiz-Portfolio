"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";

/* Horizontal pinning is desktop-only (design.md §7 Revisions). */
const DESKTOP_QUERY = "(min-width: 1024px)";

const pinClasses = {
  /* The pinned element; ScrollTrigger wraps it in a pin-spacer inside `outer`. */
  section: "overflow-clip",
  /*
   * Default: a vertical stack (no JS, reduced motion, < 1024px). The row layout
   * only exists while the pin is live (`data-pinned`, set from the effect), so
   * the server HTML never depends on JS to be readable.
   */
  track: "flex flex-col gap-gutter data-pinned:w-max data-pinned:flex-row",
} as const;

export type PinProps = {
  children: ReactNode;
  className?: string;
  /** Classes for the track (e.g. item widths, gap). */
  trackClassName?: string;
};

/**
 * Pinned horizontal track (P6.6). On desktop with motion allowed, the section
 * pins at the top of the viewport and vertical scroll moves the track left by
 * `trackWidth − viewportWidth`, `scrub: 1`, re-measured on every refresh.
 * Children are the track items; give them a width (e.g. via `trackClassName`
 * `*:w-…`) for the row layout.
 * < 1024px or reduced motion: a plain vertical stack, nothing pinned.
 */
export function Pin({ children, className, trackClassName }: PinProps) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const sectionEl = section.current;
      const trackEl = track.current;
      if (!sectionEl || !trackEl) return;
      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP_QUERY} and ${MOTION_OK_QUERY}`, () => {
        trackEl.setAttribute("data-pinned", "");
        const distance = () => Math.max(0, trackEl.scrollWidth - sectionEl.clientWidth);
        gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
            // will-change only while the track is moving.
            onToggle: (self) =>
              gsap.set(trackEl, self.isActive ? { willChange: "transform" } : { clearProps: "willChange" }),
          },
        });
        return () => trackEl.removeAttribute("data-pinned");
      });
    },
    { scope: section },
  );

  return (
    <div>
      <div ref={section} className={cn(pinClasses.section, className)}>
        <div ref={track} className={cn(pinClasses.track, trackClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
