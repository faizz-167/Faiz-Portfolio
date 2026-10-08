/**
 * Lenis smooth scroll, bridged to GSAP (P5.2).
 *
 * - One instance for the whole app, created and destroyed by MotionProvider
 *   (root layout, never hidden by <Activity>). Pages never create Lenis.
 * - Driven by `gsap.ticker` (`autoRaf: false`, `lagSmoothing(0)`) so Lenis and
 *   ScrollTrigger read the same frame; every Lenis scroll calls
 *   `ScrollTrigger.update`.
 * - Not created at all under `prefers-reduced-motion: reduce` → native scroll.
 * - `syncTouch: false`: touch keeps native momentum; Lenis only smooths wheel.
 *
 * Read the instance with `useLenis()` (null on the server, before mount, and
 * under reduced motion — always null-check). Use it for `scrollTo`, and
 * `stop()` / `start()` while an overlay such as the menu is open.
 * Non-React callers use `getLenis()`.
 *
 * Client-only.
 */
import "client-only";
import Lenis from "lenis";
import { createContext, useContext } from "react";
import { gsap, ScrollTrigger } from "./gsap";

let instance: Lenis | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Current Lenis instance, or null (server, reduced motion, not mounted). */
export function getLenis() {
  return instance;
}

/** Store subscription for `useSyncExternalStore` (used by MotionProvider). */
export function subscribeLenis(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server / hydration snapshot: no Lenis. */
export function getServerLenis() {
  return null;
}

/**
 * Creates the singleton and wires it to the GSAP ticker. Returns the teardown.
 * Called by MotionProvider only, inside a `gsap.matchMedia()` branch for
 * `(prefers-reduced-motion: no-preference)`.
 */
export function mountLenis(): () => void {
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    syncTouch: false,
    autoRaf: false,
    stopInertiaOnNavigate: true,
  });

  const unsubscribe = lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  instance = lenis;
  emit();

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33); // GSAP default
    unsubscribe();
    lenis.destroy();
    if (instance === lenis) instance = null;
    emit();
  };
}

export const LenisContext = createContext<Lenis | null>(null);

/** The app's Lenis instance, or null when scrolling is native. */
export function useLenis() {
  return useContext(LenisContext);
}

export type { Lenis };
