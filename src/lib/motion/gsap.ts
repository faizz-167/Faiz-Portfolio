/**
 * GSAP entry point — the only module that imports from "gsap" / "@gsap/react".
 * Every component imports `gsap`, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`
 * and `useGSAP` from "@/lib/motion/gsap", never from the packages directly, so
 * plugins are registered exactly once before first use.
 *
 * Client-only: `import "client-only"` makes a Server Component import of this
 * file a build error. Import it from client components ("use client") only.
 * Plugin registration is SSR-safe, so client components that import it still
 * prerender under `ensureStatic`; never call gsap.* during render, only inside
 * `useGSAP` / effects / event handlers.
 *
 * ── Ownership (P5.7) ───────────────────────────────────────────────────────
 * | Library  | Owns                                                      | Never                               |
 * |----------|-----------------------------------------------------------|-------------------------------------|
 * | GSAP     | scroll-linked, timelines, pinning, SplitText, DrawSVG     | React-state-driven UI toggles       |
 * | Motion   | state-driven UI (expand/collapse, presence, springs, layout) | scroll scrubbing                 |
 * | anime.js | SVG diagram + dimension-line drawing                      | anything GSAP already animates      |
 * | Lenis    | scroll position only                                      | —                                   |
 * An element is animated by exactly one library. GSAP writes `transform`; do
 * not put Tailwind `translate-*` / `scale-*` transitions on a GSAP target.
 *
 * ── Usage rules ─────────────────────────────────────────────────────────────
 * - Use `useGSAP(fn, { scope: ref })`; it reverts tweens, SplitText and
 *   ScrollTriggers on unmount. Wrap handlers created later in `contextSafe`.
 * - Reduced motion: branch with `gsap.matchMedia()` inside useGSAP (conditions
 *   "(prefers-reduced-motion: no-preference)" / "reduce") or `useReducedMotion()`
 *   from "@/lib/motion/reduced-motion"; the reduced branch shows the final
 *   state with `gsap.set` (a cut). `<html>` carries `motion-ok` /
 *   `motion-reduced` (set by MotionProvider after hydration) for CSS fallbacks.
 * - Smooth scroll: Lenis (see ./lenis.ts) is driven by `gsap.ticker` and feeds
 *   `ScrollTrigger.update` on every scroll, so ScrollTriggers need no
 *   scrollerProxy — the scroller stays the window.
 * - Fonts: MotionProvider calls `ScrollTrigger.refresh()` after
 *   `document.fonts.ready`. SplitText must split after fonts load
 *   (`autoSplit: true` + `onSplit`, or wait for `document.fonts.ready`).
 *
 * ── Next 16 <Activity>: routes are hidden, not unmounted ───────────────────
 * Up to 3 visited routes stay in the DOM with `display: none`. Effect cleanup
 * runs on hide (useGSAP reverts its ScrollTriggers) and effects re-run on show
 * (triggers are recreated). Other triggers measured while the route was hidden
 * are stale, so any component that owns ScrollTriggers calls
 * `useRefreshOnShow()` (or `requestRefresh()` itself). Calls in the same frame
 * coalesce into one `ScrollTrigger.refresh()`. The MotionProvider lives in the
 * root layout and is never hidden, so Lenis persists across routes.
 */
import "client-only";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { useLayoutEffect } from "react";
import { durationsS, gsapEases } from "./tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
gsap.defaults({ ease: gsapEases.out, duration: durationsS.slow });

let refreshFrame = 0;

/**
 * Schedules one `ScrollTrigger.refresh()` on the next animation frame. Safe to
 * call many times per frame (calls coalesce) and during SSR (no-op).
 */
export function requestRefresh() {
  if (typeof window === "undefined" || refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}

/**
 * Refreshes all ScrollTriggers when the calling component mounts and every time
 * its route becomes visible again under <Activity> (layout effects re-run on
 * show). Call it once in any component that creates ScrollTriggers.
 */
export function useRefreshOnShow() {
  useLayoutEffect(() => {
    requestRefresh();
  }, []);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
