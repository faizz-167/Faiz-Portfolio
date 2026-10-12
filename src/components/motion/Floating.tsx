"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { isHardLoadView } from "@/lib/motion/arrival";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { staggersS } from "@/lib/motion/tokens";

/*
 * Cursor parallax after Fancy Components' "Parallax Floating" (P12c.4), written
 * here on a plain rAF loop instead of installing it. Same idea: every element
 * with `data-depth` eases towards an offset proportional to the cursor and its
 * depth. Changed: the offset is measured from the band's centre (no jump when
 * the cursor enters), it moves against the cursor, easing is time-based, and
 * the loop sleeps when the plates have settled or the band is off screen.
 */

/** Parallax needs a pointer to follow and is motion; below 640px the plates stack, so they stay put. */
const FINE_MOTION_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 640px)";
/** Max travel per axis, in px, at depth 1 with the cursor on the band's edge. */
const TRAVEL = 24;
/** Seconds for a plate to close most of the gap to its target. */
const EASE_S = 0.3;
/** Below this (px) a plate counts as settled. */
const SETTLED = 0.1;

const approach = (current: number, target: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / EASE_S));

export type FloatingProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The band wrapper. Children carrying `data-depth="<number>"` float;
 * `data-float-cut` children cut in one by one on arrival. Server HTML is the
 * resting state: touch, reduced motion and no JS keep everything still.
 */
export function Floating({ children, className }: FloatingProps) {
  const root = useRef<HTMLDivElement>(null);
  const fineMotion = useMediaQuery(FINE_MOTION_QUERY);

  // Arrival: the title is already there; the plates cut in after it (hard cuts).
  // Not on a hard load (P12f): the plates have already painted, so hiding them would flash.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || isHardLoadView()) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-float-cut]", el);
        if (items.length === 0) return;
        // Hidden now, in this layout effect; only the reveal waits for the title.
        gsap.set(items, { autoAlpha: 0 });
        gsap
          .timeline({ delay: staggersS.lines * 2 })
          .set(items, { autoAlpha: 1, stagger: staggersS.lines })
          .set(items, { clearProps: "opacity,visibility" });
      });
    },
    { scope: root },
  );

  useEffect(() => {
    const el = root.current;
    if (!el || !fineMotion) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]")).map((node) => ({
      node,
      depth: Number(node.dataset.depth) || 0,
      x: 0,
      y: 0,
    }));
    // -1…1 from the band's centre; 0 when the pointer is outside.
    const pointer = { x: 0, y: 0 };
    let visible = true;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      let moving = false;
      for (const item of items) {
        // Against the cursor: negative of the pointer's side.
        const tx = -pointer.x * TRAVEL * item.depth;
        const ty = -pointer.y * TRAVEL * item.depth;
        item.x = approach(item.x, tx, dt);
        item.y = approach(item.y, ty, dt);
        if (Math.abs(item.x - tx) < SETTLED && Math.abs(item.y - ty) < SETTLED) {
          item.x = tx;
          item.y = ty;
        } else {
          moving = true;
        }
        item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      }
      if (moving && visible) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      pointer.y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      wake();
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      wake();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) wake();
    });

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      for (const item of items) item.node.style.transform = "";
    };
  }, [fineMotion]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
