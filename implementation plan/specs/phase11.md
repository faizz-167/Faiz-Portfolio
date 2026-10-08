# Phase 11 — Case Study Pages & Architecture Diagram Engine

## Objective

Generate static `/work/[slug]` pages whose centrepiece is an interactive system architecture
diagram rendered from typed project data — the proof that "this person builds systems".

## Prerequisites

Phases 7 and 10.

## Subtasks

| ID    | Subtask |
|-------|---------|
| P11.1 | Route, `generateStaticParams`, metadata per project |
| P11.2 | Diagram layout engine (`diagram/layout.ts`) |
| P11.3 | `ArchitectureDiagram` SVG renderer (+ `variant: "full" | "thumb"`) |
| P11.4 | anime.js draw sequence + node callouts |
| P11.5 | Accessible text alternative for the diagram |
| P11.6 | Case page layout (title block header, body, metrics, next project) |
| P11.7 | Page transition between index and case |

## Execution

### P11.1 — Route
- `src/app/work/[slug]/page.tsx`; read the Next 16 docs for `generateStaticParams`, params typing
  (`PageProps<"/work/[slug]">` style global helpers, params may be a Promise) and `notFound()`.
- `generateMetadata` → title, description from `summary`, OG image (Phase 13).
- `export const dynamicParams = false`; `generateStaticParams` returns every non-in-progress slug (must be ≥ 1).
- See status.md "Next 16.4 differences" items 2–5 (Activity, template remount, params Promise, ensureStatic).

### P11.2 — Layout engine (pure TS, unit-testable)
- Input: nodes with `col`/`row` grid coordinates. Output: node rects + edge polylines.
- Edges are orthogonal (Manhattan) routes with 45° chamfered corners (matches Trace language);
  exits from the side facing the target; parallel edges offset by 6px.
- Grid cell size derived from viewBox; whole diagram scales via `viewBox` (no re-layout on resize).

### P11.3 — Renderer (server component for markup, client wrapper for interaction)
- Node shapes by kind (all square-cornered): service = rect; db = rect with double top rule;
  queue = rect with internal ticks; cache = dashed rect; external = rect with hairline offset frame;
  client/edge = rect with open side. Labels in mono.
- Edge labels (protocol) on the longest segment; async edges dashed.
- Colours: strokes `--fg`, rules `--rule`, active path `--color-signal`.
- **Ownership:** nodes with `owned: true` get a signal corner mark and a legend entry "Built by me";
  when a project has `team`, the legend also reads e.g. "Team of 2". This keeps team projects
  honest while still showing the whole system.

### P11.4 — Animation (anime.js only)
- On scroll into view: nodes stagger in (opacity + 4px y), edges draw via `svg.createDrawable`
  in topological order, protocol labels fade last.
- Hover/focus a node: connected edges switch to signal and draw a travelling dash (anime.js
  `strokeDashoffset` loop); callout shows `note`. Unrelated nodes dim.
- Nodes are focusable (`<g tabIndex=0 role="button" aria-describedby>`).

### P11.5 — Text alternative
Below the diagram, a `<details>` "Read the diagram as text" listing each edge:
"Client → API gateway (HTTPS)". SVG has `role="img"` + `<title>`/`<desc>` summary.

### P11.6 — Case layout
- Header: TitleBlock (Project, Year, Role, Stack, Status) + title in `h1` display.
- Diagram scene (ink), then body sections (paper) with `Text` body at 62ch, metrics as a `Spec` grid
  (no giant-number stat cliché), links, and "Next drawing →" link to the next project.

### P11.7 — Transition
Motion `AnimatePresence` wipe in `template.tsx` for `/work/*` (signal panel `scaleY` wipe, 0.6s),
reduced motion → instant. Ensure Lenis scrolls to top on route change and ScrollTrigger refreshes.

## Validation criteria

- [ ] `npm run build` statically generates every project slug; unknown slug returns 404.
- [ ] Diagram renders without JS (static SVG) and is legible at 360px (horizontal scroll inside a
      labelled scroll container is acceptable for very wide diagrams).
- [ ] Every edge in data appears; layout engine has unit tests for routing (node built-in `node:test`).
- [ ] Keyboard can reach every node; callouts announced.
- [ ] Text alternative lists all edges.
- [ ] Route transition runs at 60fps and leaves no orphan ScrollTriggers.
