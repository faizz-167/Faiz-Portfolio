# Phase 2 — Design Tokens & Global Styles

> Visual source of truth: `implementation plan/design.md`. This spec implements it.

## Objective

Centralise every design decision (fonts, colour, type scale, spacing, grid, borders, radii,
motion) as tokens in `src/app/globals.css` (`@theme`) and mirror motion tokens in TypeScript.
After this phase, no component may introduce a raw colour, size, duration or easing.

## Prerequisites

Phase 1 complete.

## Subtasks

| ID   | Subtask |
|------|---------|
| P2.1 | Load fonts with `next/font/google` |
| P2.2 | Colour tokens + surface system |
| P2.3 | Fluid type scale with size-linked tracking |
| P2.4 | Spacing, section rhythm, grid tokens |
| P2.5 | Borders, radii, z-index, focus tokens |
| P2.6 | Motion tokens (CSS + `src/lib/motion/tokens.ts`) |
| P2.7 | Base / reset layer |
| P2.8 | Reduced-motion and pointer media hooks in CSS |

## Execution

### P2.1 — Fonts (`src/app/layout.tsx`)
```ts
import { Anybody, Newsreader, Martian_Mono } from "next/font/google";
const display = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const text    = Newsreader({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-text", display: "swap" });
const mono    = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-mono", display: "swap", preload: false });
```
Confirm exact axis support against `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`
and the font's metadata; adjust if an axis is unavailable. Apply the three variables on `<html>`.
Each call also passes `fallback:` with the design.md §3.1 fallback stack. All three axes are
supported (verified in `font-data.json` and the generated `@font-face` `font-stretch` ranges).
Because next/font owns `--font-display/--font-text/--font-mono`, the `font-display`, `font-text`
and `font-mono` classes are `@utility` rules (not `@theme --font-*` keys); `font-display` also sets
`font-variation-settings: "wdth" var(--wdth)`, `font-mono` sets `tabular-nums`.

### P2.2 — Colour (canonical values and contrast in `implementation plan/design.md` §2)
```css
@theme {
  --color-ink:         #0D0E0B;
  --color-ink-2:       #1A1B16;
  --color-ink-3:       #2A2B24;
  --color-paper:       #ECEBE4;
  --color-paper-2:     #E0DED5;
  --color-signal:      #C6F432;  /* acid lime: on ink only */
  --color-signal-deep: #3F5C00;  /* signal on paper (lime is 1.07:1 there) */
  --color-on-signal:   #152000;
  --color-fault:       #FF4D2E;  /* errors on ink */
  --color-fault-deep:  #B32D15;  /* errors on paper */
}
```
Surface system — semantic variables switched by `data-surface` on `Scene`:
```css
[data-surface="ink"]    { --bg: var(--color-ink);    --fg: var(--color-paper);     --raised: var(--color-ink-2);   --accent: var(--color-signal);      --fault-c: var(--color-fault);      --muted-mix: 62%; }
[data-surface="paper"]  { --bg: var(--color-paper);  --fg: var(--color-ink);       --raised: var(--color-paper-2); --accent: var(--color-signal-deep); --fault-c: var(--color-fault-deep); --muted-mix: 62%; }
[data-surface="signal"] { --bg: var(--color-signal); --fg: var(--color-on-signal); --raised: var(--color-signal);    --accent: var(--color-on-signal);   --fault-c: var(--color-fault-deep); --muted-mix: 72%; }
[data-surface] {
  --fg-muted: color-mix(in srgb, var(--fg) var(--muted-mix), var(--bg));
  --rule:     color-mix(in srgb, var(--fg) 16%, var(--bg));
  --focus:    var(--accent);
}
```
Expose `--bg/--fg/--fg-muted/--rule/--raised/--accent` to Tailwind via `@theme inline` as
`bg-surface`, `text-fg`, `text-fg-muted`, `border-rule`, `bg-raised`, `text-accent` (plus `text-error`
for `--fault-c`). `[data-surface]` also paints `background-color: var(--bg); color: var(--fg)` and
sets `color-scheme` (dark on ink, light on paper/signal). Tailwind's default palette is cleared
(`--color-*: initial`). Lime is used
only through `--accent` (trace, focus, active, cursor) and as the signal scene surface.

### P2.3 — Type scale
Fluid `clamp()` between 360px and 1600px viewports; ratio 1.25 → 1.333.

| Token | Min → Max (px) | Line-height | Tracking | Family |
|---|---|---|---|---|
| `--text-data` | 11.5 → 12.5 | 1.4 | +0.01em | mono |
| `--text-small` | 14 → 15 | 1.45 | 0 | text |
| `--text-body` | 17 → 19 | 1.5 | 0 | text |
| `--text-lede` | 21 → 26 | 1.35 | −0.005em | text |
| `--text-h3` | 26 → 36 | 1.1 | −0.01em | display |
| `--text-h2` | 34 → 64 | 1.0 | −0.015em | display |
| `--text-h1` | 44 → 112 | 0.9 | −0.025em | display |
| `--text-mega` | 64 → 220 | 0.82 | −0.03em | display |

Exposed as Tailwind `text-data … text-mega`, each carrying line-height, tracking and the
design.md §3.2 weight (`--text-*--font-weight`); Tailwind's default sizes are cleared.
Also: `--measure: 62ch` (`max-w-measure`), `--measure-lede: 48ch` (`max-w-lede`); `font-variant-numeric: tabular-nums` on mono; Newsreader `font-optical-sizing: auto`.
Display default `font-variation-settings: "wdth" 100` exposed as `--wdth` so WidthFlex can animate it.

### P2.4 — Spacing & grid
- Base 4px: `--space-1..12` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256. Tailwind's
  `--spacing-*` namespace (including the numeric multiplier) is replaced by the same values, so
  `p-5` = 24px and `p-7.5` does not exist. Named spacing: `section`, `margin`, `gutter`, `touch`
  (44px), `strip` (44px), `dock` (56px) → e.g. `py-section`, `px-margin`, `size-touch`.
- `--section-y: clamp(96px, 12vw, 192px)` — the only vertical rhythm between scenes.
- `--margin-x: clamp(16px, 4vw, 64px)`, `--gutter: clamp(12px, 1.5vw, 24px)`.
- Columns: 4 (<640px), 8 (640–1023px), 12 (≥1024px) via `--cols`.
- Named-line page grid utility `.page-grid`:
  `grid-template-columns: [full-start] var(--margin-x) [content-start] repeat(var(--cols), minmax(0,1fr)) [content-end] var(--margin-x) [full-end]; column-gap: var(--gutter);`
  Note: margins are columns, so column-gap applies between them — compensate by using
  `calc(var(--margin-x) - var(--gutter))` for margin tracks. Helpers: `col-content`, `col-full`.

### P2.5 — Borders, radii, layers, focus
- `--border-hair: 1px`, `--border-active: 1.5px`.
- `--radius-none: 0`, `--radius-dot: 999px` (status dots only).
- No shadow tokens (deliberate): Tailwind `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`,
  `--text-shadow-*`, `--blur-*` are cleared. Utilities `border-hair`, `border-active`, `rounded-dot`,
  `z-base … z-overlay`.
- `--z-base 0, --z-trace 1, --z-content 2, --z-chrome 50, --z-cursor 100, --z-overlay 200`.
- Focus: `outline: var(--border-active) solid var(--focus); outline-offset: 3px;` on `:focus-visible` globally.

### P2.6 — Motion tokens
CSS:
```css
--ease-out:  cubic-bezier(.16, 1, .3, 1);
--ease-wipe: cubic-bezier(.76, 0, .24, 1);
--dur-cut: 0ms; --dur-fast: 160ms; --dur-base: 320ms; --dur-slow: 640ms; --dur-scene: 1100ms;
```
`src/lib/motion/tokens.ts` mirrors these as typed constants for GSAP (`"expo.out"`,
custom ease string for wipe via `CustomEase` is NOT used — use `"power4.inOut"` as GSAP equivalent),
Motion (`[0.16, 1, 0.3, 1]` arrays, spring preset `{ stiffness: 320, damping: 32, mass: 0.6 }`),
and anime.js (`'outExpo'`, `'inOutQuart'`). "Cut" = duration 0. Export `durations` in seconds and ms.

### P2.7 — Base layer
`@layer base`: box-sizing, margin reset, `html { color-scheme: dark light; }`,
`body { background: var(--bg); color: var(--fg); font-family: var(--font-text); }` with
`data-surface="ink"` on `<body>`, `text-wrap: balance` for headings, `pretty` for paragraphs,
`::selection { background: var(--color-signal); color: var(--color-on-signal); }`,
media elements `display:block; max-width:100%`, `-webkit-font-smoothing: antialiased`.
Lenis required CSS via `@import "lenis/dist/lenis.css"` (stays in sync with the installed version).
`@source not` excludes `implementation plan/`, `.agents/`, `.claude/` from Tailwind scanning.

### P2.8 — Media in CSS
- `@media (prefers-reduced-motion: reduce)` → `*{ transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; scroll-behavior:auto; }`.
- `@custom-variant pointer-fine (@media (pointer: fine));` for Tailwind.

## Validation criteria

- [x] `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src/components` returns nothing (no raw colours).
- [x] Toggling `data-surface` on an element swaps bg/fg/rule correctly.
- [x] Type tokens scale smoothly from 360px to 1600px with no jumps (check at 360/768/1280/1600).
- [x] Contrast matches `design.md` §2 (fg/bg ≥ 14:1, fg-muted ≥ 5:1, accent ≥ 6.4:1 on every surface).
- [x] `tokens.ts` values equal CSS values (single table in file header comment).
- [x] `npm run build` passes.

Validation result (2026-10-08): `src/components` does not exist yet (grep: no such directory → no
raw colours); toggling `data-surface` ink→paper swapped bg/fg/rule to the paper values; type sizes
measured at 360/768/1280/1600 hit min, linear midpoints and max with no jumps; contrast script
reproduced every design.md §2 ratio; tokens.ts header table matches CSS; `npm run lint` and
`npm run build` pass (both routes ○ static).
