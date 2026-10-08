# Phase 10 — Home Scenes II: Work Index, Bill of Materials, Revisions, Contact

## Objective

Build the remaining home scenes that carry the substance: projects, capabilities, experience,
and the **"Call me, Baby — for your new website."** contact title block.

## Prerequisites

Phase 9 complete.

## Subtasks

| ID    | Subtask |
|-------|---------|
| P10.1 | Work index rows (static structure) |
| P10.2 | Row expand → spec sheet (Motion layout) |
| P10.3 | Cursor-follow preview (desktop) / tap expand (touch) |
| P10.4 | Bill of Materials table |
| P10.5 | Revisions (pinned horizontal on desktop) |
| P10.6 | Contact title block — "Call me, Baby" |
| P10.7 | Scene seams: surface cuts + trace vias across all scenes |

## Execution

### P10.1 — Work index (`Scene id="work" sheet="Sheet 03 — Assemblies" surface="ink"`)
- Scene heading in `h2`: "Selected assemblies" (no eyebrow).
- One row per project: hairline top rule (RuleDraw), project title in `h1` display (WidthFlex hover),
  year (omit when absent) + role + team in `data` aligned right, Link to `/work/[slug]`.
- `status: "in-progress"` rows (IAM backend) read "On the drawing board", have no case page link
  and no expand content beyond summary + repo link.
- Rows are `<li>` in an `<ol>` only if order matters; otherwise `<ul>`.

### P10.2 — Expand
- Active row (hover-intent 120ms on desktop, tap on touch, Enter/Space on keyboard via a
  disclosure `<button aria-expanded aria-controls>`) expands with Motion `layout` + `AnimatePresence`.
- Expanded content: `Spec` (Role, Stack — capability names, Year, Scale/metric), one-line summary,
  `Button variant="outline" icon="arrow-right"` "Open the drawing".
- Only one row expanded at a time. Non-active titles dim to `--fg-muted` (opacity only).

### P10.3 — Preview
- Desktop (pointer-fine): `HoverPreview` showing `project.cover`; if no cover, render a miniature
  `ArchitectureDiagram` (Phase 11 component, `variant="thumb"`, static).
- Touch: preview appears inside the expanded row instead.

### P10.4 — Bill of Materials (`Scene id="materials" sheet="Sheet 04 — Bill of materials" surface="paper"`)
- Real `<table>` with `<caption>` (visually styled as the scene heading).
- Columns: Item (capability name), Qty (years since `since`, tabular nums),
  Category, Used in (comma-separated Links to projects via `capabilityUsage`).
- Grouped by category with hairline group rules; rows draw in via RuleDraw.
- Mobile: each row becomes a stacked `Spec` card (still a table semantically using
  `display: block` + `data-label` pseudo-content, or a separate `<dl>` list rendered at < 640px).

### P10.5 — Revisions (`Scene id="revisions" sheet="Sheet 05 — Revision history" surface="ink"`)
- Revision table semantics; each revision a column-card: `Rev. A` letter in `h1` display,
  org + title in `lede`, dates in `data`, `changes[]` as list.
- ≥ 1024px: wrap in `Pin` (horizontal track); vias on each revision connect to the trace.
- < 1024px: vertical list with RuleDraw separators.

### P10.6 — Contact (`Scene id="contact" sheet="Sheet 06 — Approval" surface="signal"`)
- Display lines from `profile.copy.contactLines`:
  "Call me, Baby" / "for your new website." in `mega`, set flush-left, SplitReveal on scroll.
- Email in `h2` display with WidthFlex hover + `CopyButton`; mailto Link as fallback.
- Footer TitleBlock: Drawn by (name), Location + local time, Availability (`copy.availability`),
  Links (GitHub, LinkedIn, resume PDF), "Approved for build" stamp cell with current year.
- Trace terminates at a final via inside the stamp cell.

### P10.7 — Seams
- Surface change between scenes is a hard cut (no gradient transitions).
- Each scene has exactly one `data-via`; confirm the Trace path visits them in order.

## Validation criteria

- [ ] Work rows fully operable by keyboard (disclosure pattern) and touch.
- [ ] Only one row open at a time; layout animation has no jank (trace check).
- [ ] BOM "Used in" links are generated from data, none hard-coded.
- [ ] BOM is a semantic table with caption; readable on 360px.
- [ ] Revisions pin works on desktop and degrades to vertical list on mobile/reduced motion.
- [ ] Contact shows both signature lines verbatim from `profile.ts`.
- [ ] Contrast of on-signal text on the signal surface ≥ 7:1.
