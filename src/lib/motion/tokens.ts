/**
 * Motion tokens — typed mirror of the CSS motion tokens in `src/app/globals.css`.
 * Constants only: this file must never import gsap, motion or animejs.
 *
 * | Token        | CSS (globals.css)                   | ms   | s     | GSAP           | Motion                   | anime.js     |
 * |--------------|-------------------------------------|------|-------|----------------|--------------------------|--------------|
 * | --ease-out   | cubic-bezier(0.16, 1, 0.3, 1)        | —    | —     | "expo.out"     | [0.16, 1, 0.3, 1]        | "outExpo"    |
 * | --ease-wipe  | cubic-bezier(0.76, 0, 0.24, 1)       | —    | —     | "power4.inOut" | [0.76, 0, 0.24, 1]       | "inOutQuart" |
 * | --dur-cut    | 0ms                                 | 0    | 0     |                |                          |              |
 * | --dur-fast   | 160ms                               | 160  | 0.16  |                |                          |              |
 * | --dur-base   | 320ms                               | 320  | 0.32  |                |                          |              |
 * | --dur-slow   | 640ms                               | 640  | 0.64  |                |                          |              |
 * | --dur-scene  | 1100ms                              | 1100 | 1.1   |                |                          |              |
 * | spring       | — (JS only)                         | —    | —     | —              | stiffness 320, damping 32, mass 0.6 | — |
 *
 * GSAP and anime.js names are the closest named equivalents of the CSS curves
 * (CustomEase is deliberately not used). "Cut" = duration 0 (`gsap.set`).
 */

export const cssEases = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  wipe: "cubic-bezier(0.76, 0, 0.24, 1)",
} as const;

export const cubicBeziers = {
  out: [0.16, 1, 0.3, 1],
  wipe: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export const gsapEases = {
  out: "expo.out",
  wipe: "power4.inOut",
} as const;

export const animeEases = {
  out: "outExpo",
  wipe: "inOutQuart",
} as const;

export const durationsMs = {
  cut: 0,
  fast: 160,
  base: 320,
  slow: 640,
  scene: 1100,
} as const;

export const durationsS = {
  cut: 0,
  fast: 0.16,
  base: 0.32,
  slow: 0.64,
  scene: 1.1,
} as const;

/**
 * Stagger between split units, in seconds (Phase 6). Finer units stagger
 * faster so a line, a sentence of words and a word of chars take similar time.
 * chars = 0.025 is the hero fill stagger (phase9.md P9.3).
 */
export const staggersS = {
  lines: 0.08,
  words: 0.04,
  chars: 0.025,
} as const;

/** Both units, keyed by token name. */
export const durations = { ms: durationsMs, s: durationsS } as const;

export const spring = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.6,
} as const;

/** CSS custom-property names, for reading tokens at runtime if ever needed. */
export const cssVars = {
  easeOut: "--ease-out",
  easeWipe: "--ease-wipe",
  durCut: "--dur-cut",
  durFast: "--dur-fast",
  durBase: "--dur-base",
  durSlow: "--dur-slow",
  durScene: "--dur-scene",
} as const;

export type EaseName = keyof typeof cubicBeziers;
export type DurationName = keyof typeof durationsMs;
export type StaggerName = keyof typeof staggersS;
