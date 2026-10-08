/**
 * Reduced-motion preference (P5.3).
 *
 * `useReducedMotion()` — hook over `matchMedia` via `useSyncExternalStore`.
 * Server/hydration snapshot is `false` (motion allowed) so the server HTML is
 * stable; components must render their final, readable state first and only
 * animate from effects, so the brief `false` never shows motion to a user who
 * asked for none.
 * `prefersReducedMotion()` — non-hook read for imperative callers (anime.js,
 * event handlers). False on the server.
 *
 * Inside GSAP code prefer `gsap.matchMedia()` conditions; Motion components
 * are already covered by `<MotionConfig reducedMotion="user">`.
 */
import { matchesMediaQuery, useMediaQuery } from "@/lib/hooks/useMediaQuery";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const MOTION_OK_QUERY = "(prefers-reduced-motion: no-preference)";

export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

export function prefersReducedMotion() {
  return matchesMediaQuery(REDUCED_MOTION_QUERY);
}
