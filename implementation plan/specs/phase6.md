# Phase 6 — Motion Components

## Objective

Build the reusable motion vocabulary — each component maps to an editing term (cut, wipe,
scrub, trace) — so scenes compose motion declaratively instead of writing one-off timelines.

## Prerequisites

Phases 4 and 5 complete.

## Subtasks

| ID    | Subtask |
|-------|---------|
| P6.1  | `SplitReveal` (GSAP SplitText line/word mask reveal) |
| P6.2  | `ScrubText` (word ink-in scrubbed to scroll) |
| P6.3  | `Trace` (scroll-drawn signal path with vias) |
| P6.4  | `RuleDraw` (hairlines draw on enter) |
| P6.5  | `WidthFlex` (animate `wdth` axis: on hover / on scroll velocity) |
| P6.6  | `Pin` (pinned horizontal track wrapper) |
| P6.7  | `Magnetic` (Motion spring follow on pointer-fine) |
| P6.8  | `Crosshair` cursor with coordinate readout |
| P6.9  | `HoverPreview` (cursor-follow media panel) |
| P6.10 | `Dimension` (anime.js dimension line measuring an element) |
| P6.11 | Demo every component on `/system` |

## Execution

Shared rules:
- All are client components using `useGSAP({ scope })` (GSAP ones) with automatic cleanup.
- Each has a **static fallback** under reduced motion: final state, no transforms.
- Set `will-change` only during the tween (`onStart` add / `onComplete` clear) — never in static CSS.
- Durations/eases come from `src/lib/motion/tokens.ts`.

### P6.1 — SplitReveal
Props: `as`, `split: "lines" | "words" | "chars"`, `trigger: "mount" | "scroll"`, `delay`, `stagger`.
SplitText with `mask: "lines"`, `autoSplit: true` (re-splits on resize/font load), `yPercent: 110 → 0`.
Content stays readable without JS (SSR renders plain text). Children are a plain string, rendered
twice: an aria-hidden visual copy (the only thing SplitText touches, `aria: "none"`) and an `sr-only`
twin, so assistive tech reads the whole sentence on any element (SplitText's `aria-label` is ignored
on generic `<p>`/`<div>`). The visual copy sets `text-wrap: wrap` (overrides heading `balance`).
Hidden state is a `gsap.set(yPercent: 110)` at split time + `to(0)` (pre-parses transforms).
Default staggers come from `staggersS` in tokens.ts (lines 0.08 / words 0.04 / chars 0.025).

### P6.2 — ScrubText
Words split; `opacity: 0.2 → 1` with `stagger`, `scrollTrigger: { scrub: true, start: "top 75%", end: "bottom 40%" }`.
Opacity only — no blur. Same sr-only twin markup as SplitReveal. Staggered children are
initialised at split time (`progress(1).progress(0)`), not lazily mid-scroll.

### P6.3 — Trace
- Single absolutely positioned SVG layer behind content (`--z-trace`) spanning the home page.
- Path is generated, not hand-drawn: `buildTracePath(anchors)` reads the bounding boxes of elements
  marked `data-via` and produces orthogonal segments with 45° chamfers (radius from token).
  Rebuild on resize (debounced) and after `document.fonts.ready`; then `ScrollTrigger.refresh()`.
- `drawSVG: "0% 0%" → "0% 100%"` scrubbed over the whole page; vias (circles) pop with `scale` when
  the draw head passes their y.
- Stroke `var(--accent)` per surface, 1.5px (`--border-active`), `vector-effect: non-scaling-stroke`.
  Colour switching: the route is drawn three times, each copy in `<g data-surface="ink|paper|signal">`
  clipped to the scenes (`[data-sheet][data-surface]`) of that surface; one DrawSVG tween drives all
  three, so it reads as one line that changes colour at each seam (lime → signal-deep → on-signal).
- Routing: vertical runs only on a margin rail (middle of `--margin-x`) or down a via already in a
  margin; horizontal runs only at a via's own y or at a *seam* (middle of the top padding of the next
  via's scene). Corners at vias are never chamfered. `data-via="left|right"` forces a rail.
  Chamfer `--space-4`, via radius `--space-1`.
- Draw schedule: the head tracks the viewport centre (vertical runs drawn as their y passes it,
  seam crossings cost 0.25px of scroll per px). Implemented as the ease of one scrubbed tween
  (`drawnFractionAt`), so it is one tween whatever the vertex count.
- Hidden under 640px except a short local lead (`--space-8`) per via, drawn as the via scrolls to
  the centre (mobile simplification).
- The Trace must be a child of a positioned element; it routes through every `[data-via]` inside
  that element in document order.

### P6.4 — RuleDraw
Uses `ScrollTrigger.batch("[data-rule]")` to `scaleX: 0 → 1` from left, `--ease-wipe`
(vertical rules `scaleY` from the top), `--dur-base`, once. Wrapper component around any markup.

### P6.5 — WidthFlex
- Modes: `hover` (wdth 100 → 130, `--dur-base`), `velocity` (maps `ScrollTrigger` velocity to
  wdth 85–115 with `gsap.quickTo`, returns to 100 when idle), `compile` (timeline-controlled by parent).
- Animates the CSS custom property `--wdth` (font-variation-settings reads it). This causes text
  re-layout, so: use only on single display lines with fixed-width containers (`contain: layout`),
  never on paragraphs. Verify cost in a performance trace.

### P6.6 — Pin
Pins a section and translates an inner track horizontally (`x: -(trackWidth - viewport)`),
`scrub: 1`, `invalidateOnRefresh: true`, `pinType: "transform"` (fixed pinning scored 0.24 + 0.21
CLS on each fixed↔static switch). Under 1024px or reduced motion: renders as vertical stack; the row
layout only exists while the pin is live (`data-pinned`, set from the effect).

### P6.7 — Magnetic
Motion `useMotionValue` + `useSpring` (spring preset); translates child up to 12px toward pointer
within its bounds (`--space-3`). Disabled when `!usePointerFine()` or reduced motion.

### P6.8 — Crosshair
- Fixed full-viewport lines (1px, `--rule`) intersecting at pointer, plus a mono readout
  `x 0412 · y 0288` (zero-padded). Uses `gsap.quickTo` on `x/y` transforms.
- Hides the native cursor while mounted via `html.has-crosshair` (unlayered rule in globals.css,
  `(pointer: fine)` only); text inputs/textareas/contenteditable keep the I-beam. Over interactive
  elements the intersection shows a small accent square. The layer copies the `data-surface` under
  the pointer, so lines/readout use that surface's `--rule` / `--fg-muted`.
- Phase 6 demos it on `/system` only; P8.6 mounts it in the provider tree.
- Not rendered on touch or reduced motion.

### P6.9 — HoverPreview
Fixed panel following the pointer with `quickTo` (lag `--dur-base` 0.32s; no 400ms token); image swaps via Motion
`AnimatePresence` (opacity only) keyed by active item. Images through `next/image` with
`sizes="(pointer: fine) 28vw, 0px"`, preloaded on row hover-intent via
the exported `preloadPreview(item)`. The parent owns `activeId`. Panel: opposite surface
(`surface`, default paper) + 1px `--fg` border, `z-chrome`.

### P6.10 — Dimension
- Measures a target via `ResizeObserver`; renders SVG: extension lines, arrowheads, centred mono
  label with the measured px value (`Math.round`).
- anime.js `svg.createDrawable` draws lines; label counts up with `animate({ value })`.
- Props: `targetRef`, `axis: "x" | "y"`, `side`, `play: boolean` (false retracts).
- Lines and label in `--fg-muted`; label sits beside the line (above/below/left/right). Offsets from
  `--space-1/2/5`. No `vector-effect` (unscaled SVG; anime.js would call getCTM() every frame).
- Must share a positioned parent with the target; renders an empty SVG on the server.

## Validation criteria

- [x] Every component has a visible demo on `/system` and a reduced-motion fallback verified.
- [x] Performance trace while scrolling `/system`: no frame > 16.7ms caused by these components on a mid-range laptop profile (4× CPU throttle: no frame > 33ms).
- [x] No layout shift (CLS 0) from SplitText or Trace initialisation.
- [x] Trace rebuilds correctly after resize; vias align with `data-via` anchors.
- [x] Crosshair absent on touch emulation.
- [x] Screen reader reads split text as whole sentences.

## Validation result — 2026-10-08

All six criteria met. `npm run lint` clean; `npm run build` passes, routes `/`, `/_not-found`,
`/system` all ○ (static). `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src/components` → no matches.
Verified on `next dev` in Chrome (DevTools MCP) at 1280×800 unless noted.

- **Demos + reduced motion.** Every component has a demo on `/system` (scenes `motion-text`,
  `motion-scrub`, `motion-pointer`, `motion-pin`; Trace spans the whole page, 15 vias; Crosshair
  mounted on the page). Motion on: SplitReveal lines/words/chars rise (will-change set during, cleared
  after), ScrubText inks 0.2 → 1, RuleDraw draws, WidthFlex hover 100 → 130 → 100, velocity peaks
  ~112 and settles to 100, compile cuts 50 → 140 → 100, Magnetic pulls 11.8px at the corner and
  springs back, HoverPreview panel shows the 28vw srcset (384w), Dimension draws 721/128/256 and the
  label follows a resize (173.39 → "173", 301.59 → "302"), Pin moves the track to −1861px
  (= 3024 − 1163) with will-change only while active. Reduced motion (separate headless Chrome,
  CDP `Emulation.setEmulatedMedia`, 1280 and 390 wide): `motion-reduced`, no Lenis, no crosshair, no
  hover preview, no split wrappers, no rule/via transforms, Pin a column (no spacer), wdth 100, trace
  fully drawn without dashes (desktop route / 15 local leads at 390), dimensions final at opacity 1.
- **Scroll performance** (Lenis wheel scroll over the whole 21.6k px page, dev build):
  1×: rAF frame interval max 16.9ms (p95 16.8), 0 dropped frames, longest main-thread task in the
  scroll window 10.1ms. 4× CPU: rAF max 16.8ms (p95 16.7), 0 dropped frames, longest task 19.3ms,
  none > 33ms. (Each trace also shows one 190ms / 690ms task at trace start, before scrolling, inside
  `V8.HandleInterrupts` — the profiler attaching.) Fixed on the way: Trace's 60 per-segment tweens
  (~60ms lazy init) → one eased tween; SplitReveal/ScrubText lazy child init moved to split time.
  WidthFlex velocity: layout ≈ 2.5–3.8ms per frame at 4× while it flexes.
- **CLS 0**: page load trace CLS 0.00 (SplitText split + Trace init), both scroll traces CLS 0.00
  (after switching Pin to `pinType: "transform"`; fixed pinning had scored 0.47).
- **Trace rebuild**: via circles match their `data-via` centres to 0px at 1280 and after resizing to
  900 (viewBox 1265×21610 → 885×19380), path end on the last via (0, 0); draw head stays within
  ~100px of the viewport centre (e.g. scroll 12000 → head y 12393, centre 12400); all 15 vias popped
  at the end. < 640px: route empty, 15 local leads.
- **Crosshair absent on touch** (390×844, mobile, touch): no `has-crosshair`, no `.z-cursor` node,
  `(pointer: fine)` false. With a mouse: native cursor `none` on controls, `text` on the text input,
  accent square over buttons, readout `x 0633 · y 0653`.
- **Screen readers**: the a11y snapshot shows each split element as one whole sentence
  (heading "Motion on text: reveal, scrub and width", StaticText "Every page is a sheet, …",
  "Call me, Baby — for your new website.", the full ScrubText paragraph).
- **Cleanup / Activity** (temporary harness route, deleted): ScrollTrigger count 0 when the
  `<Activity>` is hidden and after unmount (baseline 0), recreated on show; pin-spacer removed,
  `has-crosshair` removed, trace vias removed. Console: no errors or hydration warnings (under
  reduced motion `motion` logs its dev-only "Reduced Motion enabled" warning).
