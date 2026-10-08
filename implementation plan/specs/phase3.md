# Phase 3 — Layout & Typography Primitives

## Objective

Build the composable, server-compatible building blocks every scene uses, plus a `/system`
specimen page that renders all tokens and primitives for visual QA.

## Prerequisites

Phase 2 complete.

## Subtasks

| ID   | Subtask |
|------|---------|
| P3.1 | `Container` and `Grid` (named-line grid with span/start props) |
| P3.2 | `Scene` (section with surface + sheet metadata) |
| P3.3 | `Stack`, `Cluster` |
| P3.4 | `Rule` (static hairline; animatable hook point) |
| P3.5 | `Text` (polymorphic, variant-driven) |
| P3.6 | `Spec` (definition list for key/value data) |
| P3.7 | `/system` specimen page |

## Execution

General rules:
- Server components by default (no `"use client"`). Accept `className` and spread rest props.
- Variants map to token-based classes in one `const` record per component — no inline magic numbers.
- Polymorphism via `as` prop typed with `React.ElementType` + `ComponentPropsWithoutRef`.

### P3.1 — Container / Grid
- `Container`: `.page-grid`; children default to `grid-column: content`. Prop `bleed` → `full`.
- `Grid`: props `span?: {base?, md?, lg?}` and `start?` mapped to `col-end-[span_N]` /
  `col-start-*` (end-span, not the `grid-column` shorthand, so tiers don't reset each other).
  Tier keys follow the column tiers: `base` 4 cols, `md` 8 cols from 640px (Tailwind `sm:`),
  `lg` 12 cols from 1024px. Supports `subgrid` boolean (`grid-template-columns: subgrid`);
  without it the Grid lays out `repeat(var(--cols), 1fr)` with `--gutter`.
- `GridCell` (same file): leaf item with the same `span` / `start` props.
- Polymorphic props helper: `src/lib/polymorphic.ts` (`ComponentPropsWithRef`, React 19 ref-as-prop).

### P3.2 — Scene
```tsx
type SceneProps = {
  id: string;               // anchor + nav target
  sheet: string;            // human label shown in SheetStrip, e.g. "Bill of materials"
  surface: "ink" | "paper" | "signal";
  children: React.ReactNode;
};
```
Optional `labelledBy?: string`; default is `sceneTitleId(id)` = `${id}-title`, which the scene
heading must carry. Renders `<section id data-sheet data-surface aria-labelledby>` (plus `relative`), applies `padding-block: var(--section-y)`
(block only, never shorthand — see Inspo note), background `var(--bg)`.

### P3.3 — Stack / Cluster
- `Stack gap="1..12"` vertical flex using `--space-*`.
- `Cluster gap align justify wrap` horizontal flex.

### P3.4 — Rule
`<hr>` with `border-top: var(--border-hair) solid var(--rule)`. Props: `orientation`, `emphasis`
("hair" = 1px `--rule` | "active" = 1.5px `--accent`). Exposes `data-rule` (= orientation) so the
motion layer can draw it in (Phase 6). Vertical rules stretch in a flex/grid parent.

### P3.5 — Text
```ts
type Variant = "mega" | "h1" | "h2" | "h3" | "lede" | "body" | "small" | "data";
```
Default element per variant (`mega`/`h1` → `h1`, `h2` → `h2`, `h3` → `h3`, `lede`/`body`/`small` → `p`,
`data` → `span`). Applies family, size, line-height, tracking tokens. Prop `tone: "fg" | "muted" | "signal"`
(`signal` → `text-accent`, the surface-correct signal; omitted = inherit).
Body variants cap width at `--measure`. Display variants expose `--wdth` default 100.

### P3.6 — Spec
```tsx
<Spec items={[{ term: "Role", detail: "Lead engineer" }, …]} columns={{ base: 2, lg: 4 }} />
```
Renders `<dl>` with its own `repeat(k, 1fr)` tracks and `--gutter` gap (not a subgrid: k equal
tracks land on the page column lines whenever k divides `--cols`, and also work inside padded
containers); default columns `{ base: 2, lg: 4 }`. `dt` in `data` variant + `fg-muted`
(sentence case), `dd` in `small`.

### P3.7 — `/system` page
Sections: colour swatches per surface, full type scale with sample text, spacing scale bars,
grid overlay toggle (12/8/4 columns visualised; CSS-only checkbox + `:has()`, no client JS),
Rule, Spec, every Text variant on every surface.
`robots: { index: false }` in metadata.

## Validation criteria

Validated 2026-10-08: lint + build pass (`/system` ○ static); Chrome at 360/768/1280/1600 —
scrollWidth = clientWidth, overlay first/last column edges = content edges and every grid/Spec
cell on a column line, body measure 61.9–62ch, console free of errors/hydration warnings;
`grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src/components` empty.

- [x] All primitives are server components (no `"use client"` in `components/layout|type`).
- [x] `/system` renders correctly at 360, 768, 1280, 1600 widths with no horizontal scroll.
- [x] Grid overlay aligns content edges with `content` lines on every breakpoint.
- [x] Body text never exceeds 62ch.
- [x] Every primitive accepts `className` and forwards native props.
- [x] Build passes.
