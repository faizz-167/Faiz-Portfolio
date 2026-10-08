# Phase 9 — Home Scenes I: Hero "Daddy's Home." & Statement

## Objective

Build the opening two scenes: the "compile" hero that resolves into **"Daddy's Home."**, and the
scroll-scrubbed statement. The hero is the site's first impression and must feel like a precise,
edited sequence.

## Prerequisites

Phases 6, 7, 8.

## Subtasks

| ID   | Subtask |
|------|---------|
| P9.1 | Hero static layout (server-rendered, complete without JS) |
| P9.2 | Build-log sequence (mono lines) |
| P9.3 | Outline → fill "compile" timeline with Dimension annotations |
| P9.4 | Width-axis hard cuts and trace start |
| P9.5 | Hero reduced-motion + mobile variants |
| P9.6 | Statement scene with ScrubText |
| P9.7 | First-visit vs. return-visit timing |

## Execution

### P9.1 — Layout (`Scene id="top" sheet="Sheet 01 — General arrangement" surface="ink"`)
Fits within `100svh` at 1280×800 and 390×844:
- Display line `profile.copy.heroLine` ("Daddy's Home.") in `mega`, spanning content columns,
  bottom-aligned in the viewport (editorial tension: heavy bottom, sparse top). From 640px the size
  is capped to the content width (`min(mega, 100cqi / 7.7)`: the line sets 7.62em, wider than the
  content area at mega). Hero-only line-height `leading-hero` (0.9) clears the "y" descender.
- Below/aside: name + role in `lede` (serif), short one-sentence positioning in `body`
  (`profile.copy.availability`).
- Pre-hydration guard (motion allowed only): an inline script marks the section before first paint
  so outline glyphs show and the fill (and on a first visit the log) wait for the sequence; a CSS
  fail-safe releases it after 3s. Without JS the server HTML (finished hero) stands.
- Top-right: TitleBlock with `Drawn by: <name>`, `Location`, `Status: Available` (signal dot).
- One `data-via` anchor at the end of the display line (trace origin).
- Primary action: `Button variant="outline" href="#work"` "See the work", secondary text link
  "Get in touch" → `#contact` (both scenes arrive in Phase 10).

### P9.2 — Build log
4–6 mono lines in `data` variant, top-left, e.g. `resolving dependencies… ok`,
`compiling 412 components… ok`, `linking signal trace… ok`, `ready in 0.84s`.
Lines appear as hard cuts (duration 0, 90–140ms apart). The final line triggers P9.3.
Content lives in `profile.ts` (`copy.buildLog: string[]`).

### P9.3 — Compile timeline (GSAP master timeline)
1. Display text rendered twice: an outline layer (`-webkit-text-stroke: 1px var(--fg)`, transparent
   fill) and a fill layer clipped by per-char masks (SplitText chars).
2. `Dimension` components (anime.js) measure 2–3 glyph groups and the full line width; they draw in
   during the log (`play` prop driven by the timeline via `onStart` callbacks).
3. On "ready": fill chars reveal with `yPercent 125 → 0` masks, stagger 0.025, `expo.out`
   (masks bleed 0.1em past the 0.9em line box so landed glyphs are never clipped; 125 keeps the
   ascender out of sight at the start).
4. Dimension lines retract (anime.js reverse) as fill completes. Words on top, full line below;
   their host is the line's positioned wrapper, the targets are the outline words.
5. When filled the split is reverted (one text node again) before the width cuts, so the cuts
   move no element boxes (CLS 0). The hero line sets no kerning so split and unsplit text match.

### P9.4 — Width cuts
After fill: `--wdth` jumps 50 → 140 → 100 in three **instant** sets 80ms apart (cut, not ease), then
WidthFlex switches to `velocity` mode. Trace's first segment starts drawing from the hero via:
the home scenes sit in `TracedScenes`, whose `Trace armed` gate opens one frame after the last cut
(nothing is measured or drawn before; the vias already reached pop in).

### P9.5 — Variants
- Reduced motion: no log animation (all lines visible), outline layer hidden, fill visible, no dims.
- < 640px: log trimmed to 3 lines (first + last two), one Dimension (full line width), display breaks
  "Daddy's / Home." on two lines (`text-wrap: balance` + explicit `<br className="sm:hidden">` avoided —
  use `max-inline-size` to force balance: `w-min`, so it breaks at every space at any `--wdth`).
- Total sequence ≤ 2.4s first visit.

### P9.6 — Statement (`Scene id="statement" sheet="Sheet 02 — Notes" surface="paper"`)
- `profile.statement` (2–4 sentences) in `lede`/`h3` serif at large size, columns 2–10 on desktop
  (`text-h3` size at the lede's weight 500; sr-only `h2` "Notes" names the scene).
- ScrubText applied. Margin note (mono, muted) to the right: location + "Rev. current".
- `data-via` anchor in the left margin.

### P9.7 — Return visits
`sessionStorage` flag (wrapped in try/catch): second load in the same session shortens the hero
to ≤ 0.8s (skip log and Dimensions, keep fill at `--dur-base` + cuts).

## Validation criteria

- [x] With JS disabled, hero shows "Daddy's Home.", name, role and actions — fully usable.
- [x] Hero fits first viewport at 1280×800, 1440×900, 390×844 (no overflow, CTA visible).
- [x] LCP element is the display text; LCP < 2.0s on fast 4G emulation.
- [x] Sequence runs at 60fps in a performance trace (no long tasks > 50ms during it).
- [x] Dimension labels show real measured px values that update on resize.
- [x] Statement words ink in when scrolling down and reverse when scrolling up.

### Validation result — 2026-10-08

Production build (`npm run build && npm run start`), Chrome DevTools MCP + a separate headless
Chrome over CDP. `npm run lint` (incl. content validator) and `npm run build` pass; all routes ○.

- **No JS** (CDP `setScriptExecutionDisabled` + curl): line, name, role, both actions, all log lines
  (3 below 640px), filled line, outline hidden, no guard attribute in the HTML.
- **Viewport fit** (scene height = viewport, `scrollWidth = clientWidth`): 1280×800 CTA bottom 646;
  1440×900 CTA bottom 727; 390×844 CTA bottom 748 (dock top at 788).
- **LCP** (fast 4G trace): 1280 → 344ms, 390 → 325ms; element = the display line's outline span
  (whole line, one candidate). FCP = LCP.
- **Sequence** (start = guard lifted, end = last cut): first visit 1.67–1.68s desktop, 1.42s mobile
  (≈2.0s from navigation start); return visit 0.71–0.74s (≤ 0.8s). Log lines 116–133ms apart.
- **60fps**: no dropped frame between the first log line and the trace start at 1280/1440/390
  (worst gap 16.8ms); one 33–50ms frame at the start (the hydration frame). Long tasks: none during
  the sequence without the profiler; with the DevTools profiler on, the trace hand-off shows one
  46–74ms task (DrawSVG length reads, after the last cut has painted).
- **Dimensions**: labels 705/552/1297 = rects at 1440; after a mid-sequence resize to 1240px
  606/474/1114 = rects.
- **Scrub**: words 0.2 → 1 scrolling down, back to 0.2 scrolling up. Until the Phase 10 scenes
  follow, the page ends before the scrub end (max ≈ 45% inked at the bottom of the page).
- **Reduced motion** (CDP `setEmulatedMedia`, 1280 + 390): no guard, no split, all log lines, outline
  hidden, no Dimensions, finished trace.
- **CLS**: 0 from the hero sequence and statement. Whole page 0.0004–0.0027, all from the Martian
  Mono font swap before the sequence starts (strip cells + CTA label; mono is not preloaded, Phase 2).
- **Descender**: at 0.9 the "y" clears "Home." (390 crop). Guard fail-safe with JS bundles blocked:
  outline only at 1s, finished hero at 4s. Activity hide/show and soft navigation: no replay after
  completion, sequence plays on a first soft visit. No console errors or hydration warnings (dev
  and prod).
