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
  bottom-aligned in the viewport (editorial tension: heavy bottom, sparse top).
- Below/aside: name + role in `lede` (serif), short one-sentence positioning in `body`.
- Top-right: TitleBlock with `Drawn by: <name>`, `Location`, `Status: Available` (signal dot).
- One `data-via` anchor at the end of the display line (trace origin).
- Primary action: `Button variant="outline" href="#work"` "See the work", secondary text link to contact.

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
3. On "ready": fill chars reveal with `yPercent 100 → 0` masks, stagger 0.025, `expo.out`.
4. Dimension lines retract (anime.js reverse) as fill completes.

### P9.4 — Width cuts
After fill: `--wdth` jumps 50 → 140 → 100 in three **instant** sets 80ms apart (cut, not ease), then
WidthFlex switches to `velocity` mode. Trace's first segment starts drawing from the hero via.

### P9.5 — Variants
- Reduced motion: no log animation (all lines visible), outline layer hidden, fill visible, no dims.
- < 640px: log trimmed to 3 lines, one Dimension (full line width), display breaks
  "Daddy's / Home." on two lines (`text-wrap: balance` + explicit `<br className="sm:hidden">` avoided —
  use `max-inline-size` to force balance).
- Total sequence ≤ 2.4s first visit.

### P9.6 — Statement (`Scene id="statement" sheet="Sheet 02 — Notes" surface="paper"`)
- `profile.statement` (2–4 sentences) in `lede`/`h3` serif at large size, columns 2–10 on desktop.
- ScrubText applied. Margin note (mono, muted) to the right: location + "Rev. current".
- `data-via` anchor in the left margin.

### P9.7 — Return visits
`sessionStorage` flag (wrapped in try/catch): second load in the same session shortens the hero
to ≤ 0.8s (skip log, keep fill + cuts).

## Validation criteria

- [ ] With JS disabled, hero shows "Daddy's Home.", name, role and actions — fully usable.
- [ ] Hero fits first viewport at 1280×800, 1440×900, 390×844 (no overflow, CTA visible).
- [ ] LCP element is the display text; LCP < 2.0s on fast 4G emulation.
- [ ] Sequence runs at 60fps in a performance trace (no long tasks > 50ms during it).
- [ ] Dimension labels show real measured px values that update on resize.
- [ ] Statement words ink in when scrolling down and reverse when scrolling up.
