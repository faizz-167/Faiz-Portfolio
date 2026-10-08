/**
 * Shared between the pre-hydration guard script and the compile sequence, so
 * both make the same first-visit / return-visit call (P9.7).
 * sessionStorage can throw (privacy modes, blocked storage): every access is
 * wrapped and failure reads as a first visit.
 */
export const HERO_SESSION_KEY = "hero-compiled";

/** Attribute the guard sets on the hero section: "first" or "return". */
export const HERO_GUARD_ATTR = "data-hero-guard";

export type HeroVisit = "first" | "return";

export function readHeroVisit(): HeroVisit {
  try {
    return window.sessionStorage.getItem(HERO_SESSION_KEY) === "1" ? "return" : "first";
  } catch {
    return "first";
  }
}

export function markHeroCompiled() {
  try {
    window.sessionStorage.setItem(HERO_SESSION_KEY, "1");
  } catch {
    // Storage unavailable: the next load plays the first-visit sequence again.
  }
}
