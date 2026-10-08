# Phase 4 — Interactive Primitives (Links, Buttons, Title Block)

## Objective

Build the interactive building blocks — links, buttons, copy button and the drawing-sheet
title block — with consistent, compositor-friendly hover/focus states and touch support.

## Prerequisites

Phase 3 complete.

## Subtasks

| ID   | Subtask |
|------|---------|
| P4.1 | `Link` (internal/external, underline-draw) |
| P4.2 | `RollText` hover (CSS-only duplicated text roll) |
| P4.3 | `Button` (solid / outline / ghost) |
| P4.4 | `CopyButton` (clipboard + live region feedback) |
| P4.5 | `TitleBlock` (drawing-sheet cell grid) |
| P4.6 | Add all to `/system` page |

## Execution

### P4.1 — Link
- Wraps `next/link` for internal hrefs; `<a target="_blank" rel="noopener noreferrer">` for external,
  with a trailing `↗` glyph (aria-hidden) and visually-hidden "(opens in new tab)".
- Underline: `::after` pseudo, `transform: scaleX(0)` → `scaleX(1)` on hover/focus,
  `transform-origin` left in / right out, `var(--dur-base) var(--ease-out)`. Never animate width
  or `background-size`.
- Variant `inline` (always underlined at 1px, thickens on hover) for links in body copy. It uses
  `text-decoration` (1px → 2px as a cut, no transition) because a pseudo-element underline breaks
  on a link that wraps across lines; inline links are exempt from the 44px target (WCAG 2.5.8).
- Variants (one const record): `draw` (default; standalone, 44×44px min, underline pseudo),
  `inline`, `nav` (44px, no underline; hosts `RollText`), `plain` (no box; used by `Button`).
- External = `http(s)://` or `//` (or `external` prop); `mailto:`/`tel:` render a plain `<a>`
  without a new tab. The ↗ is an aria-hidden text glyph joined by U+202F (an SVG may wrap onto
  its own line). `externalIcon={false}` hides it; the sr-only text is always present.
- Link and Button set the named group `group/control`; inner parts (underline, RollText, icon)
  react with `group-hover/control:` / `group-focus-visible/control:`. Under `(hover: none)` the
  `draw` underline is shown at rest.

### P4.2 — RollText
Server component. Renders text twice stacked inside `overflow: clip` with `aria-hidden` on the
copy; hover / keyboard focus of the parent `Link`/`Button` (`group/control`) translates both
`-100%` on Y. Under `(hover: none)` (copy `display: none`) and reduced motion (`motion-safe:`) it
renders static. `children` must be a string. Used inside `<Link variant="nav">`.

### P4.3 — Button
```ts
type ButtonProps = { variant: "solid" | "outline" | "ghost"; size?: "md" | "lg"; icon?: "arrow-right" | "arrow-up-right" | "copy" | "none"; href?: string } & …
```
- Square corners (radius 0). Mono `data` label, sentence case.
- Min block size 44px (touch target). Padding from spacing tokens.
- Hover/focus fill: `::before` with `bg-wipe` (`--wipe`: lime on ink, signal-deep on paper, ink on
  signal), `scaleX(0)` → `scaleX(1)` in from the left / out to the right, `--dur-base`
  `--ease-wipe`; label switches to `text-on-wipe` (`--on-wipe`: on-signal / paper / signal) as a
  **cut** (`--dur-cut` with a `--dur-fast` delay = the wipe midpoint; no delay under reduced
  motion), so only transform animates. Icon translates 4px on X.
- `solid` (default) = fg background, bg text. `outline` = hairline border `--fg`; its fill overhangs
  the border by one hairline so the border takes the fill colour. `ghost` = no border; `::after`
  underline under the label grows instead of a fill.
- Sizes `md` = `min-h-touch` (44px) + `px-4`, `lg` = `min-h-control-lg` (56px) + `px-5`; `min-w-touch`.
- Disabled: muted label, dashed `--rule` border, no fill/motion. Pressed: `translateY(1px)` as a
  cut while `:active` (no 80ms token exists).
- Default icon: `arrow-right` for internal href, `arrow-up-right` for external, none for `<button>`.
- Renders `Link` when `href` given, else `<button type="button">`.
- Icons: inline SVG components in `components/ui/icons.tsx`, stroke 1.5, `currentColor`.

### P4.4 — CopyButton (client)
- `navigator.clipboard.writeText(value)`; on success label swaps to "Copied" for 1.6s; on failure
  shows "Copy failed — select manually" beside the button in `text-error` (`--fault-c`: fault on
  ink, fault-deep on paper/signal) — never inside a filled button.
- Announces through an always-mounted `role="status" aria-live="polite"` region (success text is
  sr-only, failure text visible).
- Renders `Button` (default `outline`, icon `copy`). Timer cleared and state reset in a
  `useLayoutEffect` cleanup (Activity hide). No browser API during render (ensureStatic-safe).

### P4.5 — TitleBlock
Grid of bordered cells (hairline), each `{ label: string; value: ReactNode; span?: number }`.
Labels in `data` variant + muted (sentence case); values mono `data` in `--fg`. Rendered as a `<dl>`;
`columns` per tier `{ base, md, lg }` (default `{ base: 2, md: 3, lg: 6 }`), spans clamped per tier.
Every cell draws a full hairline box pulled up/left by one hairline so shared edges overlap and a
row left short by a spanning cell is still closed. Used by SheetStrip (Phase 8), Contact footer
(Phase 10) and case-page headers (Phase 11).

## Validation criteria

- [x] Every interactive element shows the signal focus ring on keyboard focus.
- [x] All hover effects animate only `transform`/`opacity` (inspect in DevTools → Rendering → Paint flashing: no repaint of text on hover).
- [x] Buttons ≥ 44×44px at all breakpoints.
- [x] External links announce "opens in new tab" to screen readers.
- [x] CopyButton works and announces success/failure.
- [x] `/system` shows all variants on ink and paper surfaces.

### Validation result — 2026-10-08
- `npm run lint` clean; `npm run build` passes, `/`, `/_not-found`, `/system` all ○ static.
- Focus: 63 non-inline links/buttons across ink/paper/signal focused after a keyboard Tab → all
  match `:focus-visible` with a solid accent outline at 3px offset (lime / `#3F5C00` / `#152000`;
  1.5px renders 1px at DPR 1, as in P2.5). Focus also triggers the wipe.
- Hover (screenshots): ink outline → lime fill + on-signal label; paper solid → signal-deep fill +
  paper label; signal outline → ink fill + lime label; disabled → no fill, muted label, dashed border.
- Transitions: every animating `transition-property` (elements + `::before`/`::after`) is the
  transform family only (`transform, translate, scale, rotate`); label colour is 0ms (a cut).
- Targets: every non-inline link/button ≥ 44×44 at 360 and 1280 (min 44×44, lg = 56px tall); no
  horizontal scroll at 360.
- External links' accessible names end in "(opens in new tab)" (a11y snapshot).
- CopyButton: success → "Copied", sr status "Copied to clipboard", back to label after 1.6s;
  failure (writeText stubbed to reject) → "Copy failed — select manually" in `rgb(255,77,46)` on
  ink and `rgb(179,45,21)` on paper, inside the polite live region.
- `(hover: none)` (touch emulation): RollText copy `display: none`, draw underline at rest. The roll
  rule sits inside `@media (prefers-reduced-motion: no-preference) { @media (hover: hover) }`.
- Console: no errors or hydration warnings.
