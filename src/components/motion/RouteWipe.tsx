"use client";

import { animate } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { requestRefresh } from "@/lib/motion/gsap";
import { getLenis } from "@/lib/motion/lenis";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { cubicBeziers } from "@/lib/motion/tokens";

/** Spec P11.7: 0.6s signal-panel wipe. */
const WIPE_S = 0.6;

/*
 * A hard load straight onto a case page must not wipe or reset the scroll:
 * there was no previous page. The document's navigation entry holds the URL
 * the browser actually loaded, whenever this module happens to evaluate.
 */
function documentPath() {
  const entry = performance.getEntriesByType("navigation")[0];
  return entry ? new URL(entry.name).pathname : null;
}
let mountedOnce = false;

/**
 * Page transition for /work/* (P11.7), mounted by `app/work/template.tsx`,
 * which remounts on every case-page navigation.
 *
 * Arrival is detected in a layout effect, not at mount: Next prerenders a
 * prefetched route hidden under <Activity>, so a mount can happen long before
 * the user navigates, but layout effects only run when the route is shown.
 * On arrival (not a hard load) the page scrolls to the top (Lenis keeps its
 * own position, so it is told directly), ScrollTriggers re-measure, and a
 * signal panel covers the viewport and wipes away with `scaleY` (0.6s).
 * The panel is started imperatively with Motion's `animate()` from that
 * layout effect, so it already covers the first painted frame; a state-driven
 * AnimatePresence would show the page for a frame first. Reduced motion: no
 * panel.
 */
export function RouteWipe({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // A hard load keeps the browser's own scroll (e.g. a #drawing anchor) and gets no wipe.
    const arrival = mountedOnce || window.location.pathname !== documentPath();
    mountedOnce = true;
    requestRefresh();
    if (!arrival) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);

    const el = panel.current;
    if (!el || prefersReducedMotion()) return;
    el.style.visibility = "visible";
    const wipe = animate(el, { scaleY: [1, 0] }, { duration: WIPE_S, ease: cubicBeziers.wipe });
    wipe.then(() => {
      el.style.visibility = "hidden";
    });
    return () => {
      wipe.stop();
      el.style.visibility = "hidden";
    };
  }, []);

  return (
    <>
      {children}
      <div
        ref={panel}
        aria-hidden="true"
        data-surface="signal"
        // Fixed over the page and the chrome (same z-index, later in the DOM); never interactive.
        className="pointer-events-none invisible fixed inset-0 z-chrome origin-top bg-surface"
      />
    </>
  );
}
