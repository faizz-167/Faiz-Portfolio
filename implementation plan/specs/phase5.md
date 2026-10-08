# Phase 5 — Motion Infrastructure

## Objective

Wire Lenis, GSAP (+ScrollTrigger/SplitText/DrawSVG), Motion and anime.js into one coherent,
reduced-motion-aware runtime with clear ownership boundaries and zero SSR/hydration issues.

## Prerequisites

Phase 2 complete (motion tokens). Read `.claude/skills/gsap-react`, `gsap-scrolltrigger`,
`gsap-performance`, `framer-motion-animator`, `animejs` SKILL.md files before starting.

## Subtasks

| ID   | Subtask |
|------|---------|
| P5.1 | `src/lib/motion/gsap.ts` — single plugin registration module |
| P5.2 | `src/lib/motion/lenis.ts` + Lenis ↔ GSAP ticker bridge |
| P5.3 | `src/lib/motion/reduced-motion.ts` — preference store + hook |
| P5.4 | `src/providers/MotionProvider.tsx` — client provider |
| P5.5 | Mount provider in root layout; anchor-link scrolling via Lenis |
| P5.6 | Hooks: `useMediaQuery`, `usePointerFine`, `useLocalTime` |
| P5.7 | Ownership & usage rules documented in file headers |

## Execution

### P5.1 — gsap.ts (client-only module: `import "client-only"`, not `"use client"`)
```ts
import "client-only";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
gsap.defaults({ ease: gsapEases.out, duration: durationsS.slow }); // "expo.out", 0.64
export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
export function requestRefresh(): void;   // rAF-coalesced ScrollTrigger.refresh()
export function useRefreshOnShow(): void; // refresh on mount + every <Activity> show
```
Every component imports GSAP from here, never from `"gsap"` directly. A Server Component
import is a build error.

### P5.2 — Lenis bridge
```ts
const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1, syncTouch: false,
  autoRaf: false, stopInertiaOnNavigate: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
- Do not create Lenis when reduced motion is on; native scroll then.
- Module singleton (`mountLenis()` returns teardown, `getLenis()`, `subscribeLenis()`), exposed via
  `LenisContext` / `useLenis()` for `scrollTo`, `stop`, `start` (menu open). Teardown restores
  `lagSmoothing(500, 33)`.
- Touch devices: keep `syncTouch: false` (native momentum).

### P5.3 — Reduced motion
`useSyncExternalStore` over `matchMedia("(prefers-reduced-motion: reduce)")`. Export
`useReducedMotion()` and `prefersReducedMotion()` (non-hook, for anime.js callers).

### P5.4 — MotionProvider
- Client component wrapping children in `<MotionConfig reducedMotion="user" transition={springPreset}>`,
  Lenis context, and a `gsap.matchMedia()` root that adds the class `motion-ok` or `motion-reduced`
  on `<html>` for CSS-level fallbacks (in an effect, after hydration). Lenis is mounted inside the
  no-preference branch, so toggling the OS setting live creates/destroys it.
- Calls `ScrollTrigger.refresh()` after `document.fonts.ready` (font swap changes layout).

### P5.5 — Mounting
- `layout.tsx` (server) renders `<MotionProvider>{children}</MotionProvider>` inside `<body>`.
- Global click handler for `a[href^="#"]` (capture phase on `document`, so it also pre-empts
  next/link) → one frame later `lenis.scrollTo(target, { offset: scrollMarginTop - stripHeight })`
  (`--strip-h` read from CSS; Lenis already subtracts scroll-margin). Reduced motion →
  `target.scrollIntoView()`. Modified/non-left clicks, `target`/`download` links and unknown ids
  fall through. Pushes the hash; focuses targets with `tabindex`.
- `globals.css` base: `[id] { scroll-margin-top: var(--strip-h) }` (offset without JS / reduced motion).

### P5.6 — Hooks
- `useMediaQuery(query)` via `useSyncExternalStore` (server snapshot `false`).
- `usePointerFine()` = `useMediaQuery("(pointer: fine)")`.
- `useLocalTime(timeZone)` returns formatted HH:MM (24h) updating each minute (aligned to minute
  boundary, resynced on `visibilitychange`); server snapshot `"--:--"`.

### P5.7 — Ownership rules (in the comment header of `src/lib/motion/gsap.ts`)
| Library | Owns | Never |
|---|---|---|
| GSAP | scroll-linked, timelines, pinning, SplitText, DrawSVG | React-state-driven UI toggles |
| Motion | state-driven UI (expand/collapse, presence, springs, layout) | scroll scrubbing |
| anime.js | SVG diagram + dimension-line drawing | anything GSAP already animates |
| Lenis | scroll position only | — |
An element is animated by exactly one library.

## Validation criteria

- [x] No hydration warnings in console.
- [x] Smooth scroll on desktop; native scroll with reduced motion (verify via DevTools → Rendering → emulate `prefers-reduced-motion`).
- [x] A test ScrollTrigger marker aligns correctly after fonts load and after resize.
- [x] Anchor links scroll smoothly with correct offset.
- [x] Unmounting a component using `useGSAP` leaves no ScrollTriggers (`ScrollTrigger.getAll().length` returns to baseline).
- [x] Performance trace: idle page has no continuous long tasks; ticker only.

### Validation result — 2026-10-08 (all criteria met)
Temporary harness on `/system` (probe ScrollTrigger with markers, anchors, hook readout), removed afterwards.
- Console empty on load, after reloads and after hash navigation (no hydration warnings). Server HTML shows `--:--`; client shows IST time.
- `html.motion-ok.lenis`; a 600px wheel delta eases over ~40 frames (55 → 594). Reduced motion (CDP `Emulation.setEmulatedMedia`, separate headless Chrome — MCP `emulate` lacks media features): `motion-reduced`, `getLenis()` null, anchor jumps instantly; toggling the preference live creates/destroys Lenis.
- Probe start/end equal the measured trigger positions after load, after a fonts.ready refresh (Slow 3G: refresh at 41.5s while fonts loading, second refresh at 44.0s right after the last woff2 at 43.97s), after resize to 500px and back to 1280px; markers drawn at the probe top/bottom at viewport centre; scrubbed x = 100 at progress 0.5.
- Plain `<a href="#grid">` and next/link `#layout` scroll over several frames and land with the target 44px (`--strip-h`) below the top, Lenis and reduced motion alike; ctrl-click not intercepted; `#` scrolls to 0.
- `ScrollTrigger.getAll().length`: 1 → 0 on unmount (markers removed) → 1 on remount → 0. <Activity>: navigating `/system` → `/` keeps the probe in the DOM with 0 triggers; back → 1 trigger, one coalesced refresh, start aligned; Lenis persists.
- Idle 6s trace: only GSAP ticker `_tick` per rAF (~0.3ms), max task 1.7ms, no long tasks (one 97ms task is `CpuProfiler::StartProfiling` at trace start).
- `npm run lint` clean; `npm run build` passes, `/`, `/_not-found`, `/system` all ○. `client-only` guard verified (Server Component import → build error).
