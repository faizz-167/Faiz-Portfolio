# Phase 12d — Work Page: Field Only

## Objective

The owner asked (2026-10-12) to remove the drawing register (Phase 12b) from `/work` and make the
floating plates work with the cursor chip. The floating field (Phase 12c) becomes the whole
page, so it must now do the register's job: every project reachable by everyone.

## Prerequisites

Phase 12c complete, including its pointer fix: the title layer spanned the band above the
plates, so a real pointer never reached them (no hover, no chip, no click). The 12c validation
clicked with `element.click()`, which skipped the overlap. Fixed by letting the pointer through
the title layer. Recorded in status.md.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P12d.1 | Log the change; amend design.md §7 Work index |
| P12d.2 | Remove the register |
| P12d.3 | Floating plates become the index |
| P12d.4 | In-progress project in the field |
| P12d.5 | Phones |

## Execution

### P12d.1 — Record it

Decisions-log row dated 2026-10-12: the register is removed, and the field is the index. TechText
leaves the project with it (its only use was the register titles). design.md §7 Work index drops
the register paragraph.

### P12d.2 — Remove the register

The grid, its arrival animation and the TechText title effect are deleted, not hidden. Nothing
else on the site used them.

### P12d.3 — Floating plates become the index

- Each case-page plate is a normal link: in the tab order and in the accessibility tree, named
  by the project's full title, with role and team as its description.
- **Cursor:** over a plate the crosshair shows the "Open drawing" chip, the media scales inside
  the frame, and the other plates fade to the muted mix (as on the home cards).
- **Focus:** the lime focus ring on the plate. Keyboard focus does not move the plates.
- Under the title: the count in mono ("5 assemblies"), the line the register's title cell had.

### P12d.4 — In-progress project

*Owner chose the fifth plate (2026-10-12).* IAM backend gets a fifth slot as a plate
with a dashed frame and the caption "A-05 IAM backend · On the drawing board". It is not a link
and has no hover state, but it floats like the others. It is in the accessibility tree as text.

### P12d.5 — Phones

Below 640px the plates can't float around the title, so they stack in one column under it, at
full width and 16:10, in project order. They stay links, and nothing moves.

## Open items

- ~~IAM backend on /work~~ — resolved: a fifth floating plate (owner, 2026-10-12).

## Validation criteria

- [x] Decisions log row; design.md §7 matches. No register code, RegisterReveal, TechTitle or
      TechText left in the project.
- [x] With a real pointer (DevTools hover, not a scripted click), at 1440: hovering each linked
      plate shows the "Open drawing" chip, scales its media and fades the others. Clicking opens its
      drawing.
- [x] Tab reaches Back, then every linked plate in project order, each with a visible ring. The
      accessibility tree has one h1 and one link per case page, named by the full title.
- [x] At 1024, 1440 and 1920: no plate (including the fifth) overlaps the title or count at full
      drift. 0 horizontal overflow at 360, 768, 1024, 1440 and 1920.
- [x] At 360: the title, count, then every plate stacked and tappable.
- [x] Parallax, reduced-motion and touch behaviour unchanged from Phase 12c.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. No new packages.

## Validation result — 2026-10-12

Production build (`next start` on :3111), DevTools MCP Chrome, real pointer (DevTools `hover` and
`click`, not scripted clicks).

- **Removed.** No `RegisterReveal`, `TechTitle`, `TechText` or register grid is left in `src`. The
  Decisions-log row and design.md §7 are updated.
- **Pointer (1920).** Hovering SpeechPath and Laptop Sentinel scaled the hovered plate's media to
  1.04, faded the other four to 0.62, and showed the "Open drawing" chip (screenshot). A real
  click on Academic ERP opened /work/academic-erp.
- **Keyboard.** Tab order: Back, speechpath, academic-erp, zingdesk, laptop-sentinel. Each shows
  the lime ring, and focus doesn't move the plates. The tree has one h1, four links named by
  their full titles with role · team as the description, and IAM as text.
- **Placement.** At 1024, 1440 and 1920 no plate touches the title, count, line or Back, even
  with each plate grown by its full drift. At 768 no plates overlap each other, the title or Back.
  0 horizontal overflow at 360, 768, 1024, 1440 and 1920. Fixes on the way: A-01 had moved into
  the title once the count line was added (moved up, narrowed). Back to 0.4px at 1024 (nudged).
  IAM overlapped A-04 at 768 (A-04 moved right below 1024px).
- **360.** Title, count, line, then five full-width plates stacked, with no transforms.
- **Reduced motion (forced through `matchMedia`) and touch.** No inline transforms.
- `npm run lint`, tests 41/41 and `npm run build` pass. No console errors. No new packages.
