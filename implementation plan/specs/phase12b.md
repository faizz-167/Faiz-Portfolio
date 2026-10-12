# Phase 12b — Work Page: Drawing Register

## Objective

The owner asked for a new UI on `/work` (2026-10-12). They chose to stay inside the Build Sheet
rules (design.md §1, hard bans intact) and replace the expanding rows with a **drawing register**:
a hairline-ruled grid of square plates, one per assembly, the way a drawing set's register lists
every sheet. The home page is not touched.

## Prerequisites

Phase 12 complete.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P12b.1 | Log the change; amend design.md §7 Work index |
| P12b.2 | Add React Bits TechText (owner approval needed) |
| P12b.3 | Register grid and title cell |
| P12b.4 | Assembly plates |
| P12b.5 | Hover, focus and touch behaviour |
| P12b.6 | Motion, reduced motion and no JS |

## Reference study (2026-10-12)

- **Inspo** `recommend` for "engineer portfolio work index, technical drawing" returned dark SaaS
  landing pages (Penpot, Buildkite, Turso). Nothing usable for layout; the register is drawn from
  the Build Sheet concept itself.
- **Kexsio** had no project-index item.
- **React Bits `TechText`**: a canvas wordmark whose letters turn into dashed vector outlines under
  the cursor. Dashed outlines read as construction lines on a drawing, so it fits the concept.
  It is one self-contained file with no npm dependencies, added through the shadcn CLI from the
  `@react-bits` registry already in the project config.

## Execution

### P12b.1 — Record it

Decisions-log row dated 2026-10-12: `/work` drops the expanding rows for the register; TechText
added. Edit design.md §7 Work index so its `/work` sentence describes the register.

### P12b.2 — TechText

- Add the TypeScript + Tailwind variant. It is vendored source: fix anything that fails strict
  TypeScript or lint instead of loosening the config, and tell the owner if a fix is not obvious.
- Its colours are hex props. They are read from the scene's `--fg` and `--fg-muted` at runtime,
  never hard-coded, so they follow the surface.
- Turned off for this site: draggable letters, selection box, coordinate labels, specks and the
  idle sweep. Only the hover outline effect remains. Lime is never passed to it.

### P12b.3 — Register grid and title cell

- Ink surface. Sheet strip label stays "Sheet 03 — Assemblies (full index)". The "Back to home"
  ghost button stays above the grid.
- The grid has one more cell than there are projects. The **first cell is the title cell**: the
  h1 "All assemblies", the count in mono ("5 assemblies"), and one line saying the plates open
  their drawings. With 5 projects that makes 6 cells, which fills the grid exactly at every width.
- Columns: 3 from 1024px, 2 from 640px, 1 below. Cells are square-cornered and share 1px `--rule`
  hairlines (no doubled lines, no gaps between cells). No fills except as below.
- Projects run in project order, as now.

### P12b.4 — Assembly plates

Each plate, top to bottom:

1. A mono row: the drawing number on the left (`A-01`, `A-02`… in project order) and the year on
   the right (omitted when unknown).
2. Plate 1 of the project in a hairline frame at 16:10. Until a screenshot exists it shows the same
   hatched placeholder the home cards use.
3. The title in display type at `h3` size, as an h2 (the page h1 is in the title cell). The short
   index title is what is drawn; the full title is the accessible name, as on the rows today.
4. Role and team in mono, `--fg-muted`.
5. The first three stack items as mono tags (as on the home cards).

- A plate with a case page is one link to its drawing, the whole cell clickable.
- An in-progress project (IAM backend) is not a link. Its plate has a dashed frame instead of the
  hatched placeholder, the label "On the drawing board" in place of the year, and no hover effect.

### P12b.5 — Hover, focus and touch

- **Fine pointer, motion allowed:** hovering a plate raises it to `--raised`, the hatched plate (or
  screenshot) scales slightly inside its fixed frame, and the title turns into TechText's dashed
  outlines around the pointer. The other plates fade to `--fg-muted`. The crosshair carries the
  "Open drawing" chip, as on the home cards.
- **Keyboard focus:** the same `--raised` fill and the site's lime focus ring on the cell. The
  title stays solid (TechText needs a pointer).
- **Touch:** no hover state. A tap opens the drawing.
- The title is real text in the DOM at all times. TechText's canvas sits on top, hidden from the
  accessibility tree, and the real text is visually hidden only while the canvas has drawn.

### P12b.6 — Motion, reduced motion, no JS

- On arrival the hairlines draw in (RuleDraw), then the cells cut in left to right, top to bottom
  (hard cut, opacity). The existing route wipe stays.
- Reduced motion: no line draw, no cut-in, no scale, no TechText; plain solid titles. Hover keeps
  the `--raised` fill only.
- No JS: the full grid with plain titles, every link working.

## Open items

- None. Screenshots still pending from the owner (P11b.6); plates use the hatched placeholder.

## Validation criteria

- [x] Decisions log has the 2026-10-12 row; design.md §7 Work index describes the register.
- [x] The grid fills exactly (no empty cell) at 360, 768, 1440 and 1920, with 1, 2, 3 and 3
      columns. Hairlines are 1px everywhere, never doubled. 0 horizontal overflow.
- [x] Every plate with a case page navigates to it; the IAM plate is not a link and shows the
      dashed frame and "On the drawing board".
- [x] Hovering a title at 1440 shows dashed outlines in `--fg`; no lime appears in the canvas.
      The other plates fade. The "Open drawing" chip shows.
- [x] Tab reaches every linked plate in order with a visible focus ring; the accessibility tree
      shows one h1 and one h2 per project with the full titles.
- [x] Reduced motion (emulated) and JS disabled: static grid, solid titles, no canvas.
- [x] Phase 0 ban checklist passes on `/work`: no gradient, shadow, blur, rounded corner, or
      decorative lime.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. The only new code from
      outside is the TechText file.

## Validation result — 2026-10-12

Production build (`next start` on :3111), DevTools MCP Chrome.

- **Grid.** 1440 and 1920: 3 columns; 768: 2 columns; 360 (touch): 1 column. All 6 cells, no
  empty cell, 0 horizontal overflow at every width.
- **Plates.** Four links in order (/work/speechpath, academic-erp, zingdesk, laptop-sentinel).
  IAM is not a link and shows the dashed frame and "On the drawing board".
- **Hover at 1440.** Dashed outlines in `--fg` inside the lens, the cell raised, the others faded,
  and the "Open drawing" chip shown. The canvas takes its colour from the computed text colour,
  so it never draws lime.
- **Focus.** A plate gets the `--raised` fill (rgb 26 27 22) and the lime ring. The tree has one
  h1 and an h2 per project, with the full ERP title as the name.
- **Motion.** Hairlines draw from 110 to 906 ms, then the cells cut in one at a time, 80 ms apart.
  No inline styles are left afterwards. With reduced motion forced through `matchMedia`: no canvas
  and no inline styles. Server HTML (no JS): 6 cells, 4 plate links, no canvas.
- **Bans.** No gradient, shadow, blur or rounded corner in the page.
- `npm run lint`, tests 41/41 and `npm run build` pass. No console errors or warnings.
- **Known:** on a hard load the cells paint once, hide, and then cut in, as RuleDraw rules
  already do elsewhere. Arrivals by client navigation are covered by the route wipe.
