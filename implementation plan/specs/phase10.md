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
- One row per project: hairline top rule (RuleDraw), project title in `h1` display (wraps; no WidthFlex —
  long titles don't fit one line, Decisions log 2026-10-09),
  year (omit when absent) + role + team in `data` aligned right, Link to `/work/[slug]`.
- `status: "in-progress"` rows (IAM backend) read "On the drawing board", have no case page link
  and no expand content beyond summary + repo link.
- Rows are `<li>` in an `<ol>` only if order matters; otherwise `<ul>`.

### P10.2 — Expand
- Active row (hover-intent 120ms on desktop, tap on touch, Enter/Space on keyboard via a
  disclosure `<button aria-expanded aria-controls>`) expands with Motion `layout` + `AnimatePresence`.
- Expanded content: `Spec` (Role, Stack — capability names, Year, the first metric under its own label;
  omitted when there are no metrics), one-line summary,
  `Button variant="outline" icon="arrow-right"` "Open the drawing".
- Only one row expanded at a time. Non-active titles dim to `--fg-muted` (opacity only).
- Without JS each row prints its panel in a `<noscript>`.

### P10.3 — Preview
- Desktop (pointer-fine): `HoverPreview` showing `project.cover`. No project has a cover yet, so no
  preview renders; the miniature `ArchitectureDiagram` fallback is a Phase 11 decision (Decisions log 2026-10-09).
- Touch: preview appears inside the expanded row instead.

### P10.4 — Bill of Materials (`Scene id="materials" sheet="Sheet 04 — Bill of materials" surface="paper"`)
- Real `<table>` with `<caption>` (visually styled as the scene heading).
- Columns: Item (capability name), Qty (build year − `since` + 1, tabular nums),
  Category, Used in (comma-separated Links to projects via `capabilityUsage`).
- Grouped by category with hairline group rules that draw in via RuleDraw; rows alternate `--raised`.
- Mobile: each row becomes a stacked `Spec` card (still a table semantically using
  `display: block` + `data-label` pseudo-content, or a separate `<dl>` list rendered at < 640px).

### P10.5 — Revisions (`Scene id="revisions" sheet="Sheet 05 — Revision history" surface="ink"`)
- Revision table semantics; each revision a column-card: `Rev. A` letter in `h1` display,
  org + title in `lede`, dates in `data`, `changes[]` as list.
- ≥ 1024px: wrap in `Pin` (horizontal track); one via for the scene, outside the moving track.
- < 1024px: vertical list with RuleDraw separators.

### P10.6 — Contact (`Scene id="contact" sheet="Sheet 06 — Approval" surface="signal"`)
- Display lines from `profile.copy.contactLines`:
  "Call me, Baby" / "for your new website." in `mega`, set flush-left, SplitReveal on scroll.
- From 640px the size is capped so "Call me, Baby" holds one line (globals.css "P10.6").
- Email in `h2` display with WidthFlex hover + `CopyButton`; mailto Link as fallback. Its size is capped
  so the stretched line fits the content width (per-character, from the address length).
- All text on the signal sheet ≥ 7:1: `--fg-muted` resolves to `--fg` in this scene.
- Footer TitleBlock: Drawn by (name), Location + local time, Availability (`copy.availability`),
  Links (GitHub, LinkedIn, resume PDF), "Approved for build" stamp cell with the build year
  (`BUILD_YEAR`, a next.config `env` constant).
- Trace terminates at a final via inside the stamp cell (Trace scroll ends are `clamp()`ed so it completes).
- **Footer fold (owner decision 2026-10-08):** on `/` the Contact title block absorbs the Phase 8
  root `Footer` — the name plus the plain-HTML section links (no-JS navigation on phones) and the
  dock-height + safe-area reserve below 1024px. Nothing may render after the signal Contact scene on
  the home page, so the root layout's separate `Footer` must not appear there; keep it on every other
  route. Keep a single `<footer>` landmark per page.

### P10.7 — Seams
- Surface change between scenes is a hard cut (no gradient transitions).
- Each scene has exactly one `data-via`; confirm the Trace path visits them in order.

## Validation criteria

- [x] Work rows fully operable by keyboard (disclosure pattern) and touch.
- [x] Only one row open at a time; layout animation has no jank (trace check).
- [x] BOM "Used in" links are generated from data, none hard-coded.
- [x] BOM is a semantic table with caption; readable on 360px.
- [x] Revisions pin works on desktop and degrades to vertical list on mobile/reduced motion.
- [x] Contact shows both signature lines verbatim from `profile.ts`.
- [x] Contrast of on-signal text on the signal surface ≥ 7:1.

## Validation result — 2026-10-09 (all criteria met)

Production build (`next start`), headless Chrome over CDP from Node (scratchpad scripts). Desktop runs emulate a mouse; mobile runs use touch emulation.

- **Work rows: keyboard + touch.** Enter opens row 1, Tab enters its panel ("Open the drawing") and then reaches row 2, Space opens row 2 and closes row 1, Enter closes it. Touch at 390: tap opens, tapping another switches, tapping again closes, IAM opens. Mouse: closed at 60ms, open after 120ms hover-intent; a click on a hover-opened row closes it and it stays closed while the pointer moves in it.
- **One open + no jank.** At most one `aria-expanded="true"` in every state. Hover-open, click-open and hover-switch each sampled for 900ms: 55 frames, max 17ms, 0 frames over 20ms, 0 long tasks, layout shift 0. Inactive titles at opacity 0.62, open row `rgb(26,27,22)` (ink-2). IAM: "2026 · Solo build · On the drawing board", dashed rule, 0 case links, repo link.
- **BOM data.** 46/46 rows; "Used in" equals the value computed from `projects.ts` stacks for every row (0 mismatches, 43 links, IAM unlinked); Qty 0 mismatches; no hard-coded `/work/` paths.
- **BOM semantics + 360.** Table with caption "Bill of materials" (the scene's `aria-labelledby` h2), 7 row groups. AX roles stay table/row/cell at 360 (`display: block`). At 360: scrollWidth 360, widest visible row 344 (content edge), cells 14px, column names printed from `data-label`. The sr-only `thead` row measures 12px past the edge but is clipped to 1×1px.
- **Revisions.** At 1280 with motion: pinned (pin-spacer), cards in a row at 51/795/1539. While pinned, the track slides until the last card's right edge = the section's right edge (1229/1229). At 390 and under reduced motion at 1280: no pin, vertical (same left, tops increasing).
- **Contact lines.** sr-only copies read "Call me, Baby" / "for your new website." (from `profile.copy.contactLines`); heading accessible name "Call me, Baby for your new website.".
- **Contrast.** All 32 visible text nodes (28 at 390) in the scene are `rgb(21,32,0)` on lime: 13.23:1.
- **Email.** mailto `faizmohammed176@gmail.com`; "Copy email" → "Copied", clipboard reads the address. 52.3px at 1280; hovering sets `--wdth` 130 and the line is 1106px inside 1178px, scrollWidth unchanged. 21px at 390 with no overflow. Links are GitHub, LinkedIn and `/assets/MdFaizResume.pdf`; no phone-number pattern on the page.
- **Footer fold.** On `/`: one `<footer>`, inside `#contact`; Contact is the last scene; `main` is followed by no footer. Padding-bottom is 152px at 390 (96 + 56 dock) and 153.6px at 1280. On `/system`: the root footer follows `main` with `/`, `/#work`…`/#contact`.
- **Trace.** Six vias, one per scene, in order top › statement › work › materials › revisions › contact. After scrolling to the bottom at 1280: 6 pads (8px) each centred on its via, in page order; route 13039px fully drawn (dash 13039px, offset 0). At 390: local leads, 6 pads. Reduced motion: finished route, 6 pads.
- **Statement.** Past the scrub end, all 44 words are at opacity 1 (was ≈45% before Phase 10); back above the start, all 44 return to 0.2.
- **Navigation.** Desktop strip links: each scene lands at top 44 (below the strip) with the correct sheet label (Sheets 03–06, and back to 03). Mobile menu at 390: top 0, menu closed, dock label correct for all four.
- **Stability.** CLS on load is 0.0027 at 1280 (strip mono font swap, known since Phase 9 and deferred to P13) and 0 at 390; scrolling the whole page adds 0 at both. One 55ms long task at load (1280), none while scrolling. No console errors or hydration warnings in dev or production. The only console lines are 3–4 `404 /work/<slug>?_rsc` prefetches (case routes arrive in Phase 11) and Motion's known reduced-motion notice.
- **Activity.** Row 2 open → router push to `/system` (home hidden, 0 open rows) → back: rows `-----`, pin live again.
- **No JS.** Every row shows its panel link; revisions are stacked; contact heading and footer links are present; no horizontal scroll at 1280 or 390.
- `npm run lint` (with the content validator) and `npm run build` pass; `/`, `/_not-found`, `/system` are all ○ with no revalidate. `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src/components` → nothing.
