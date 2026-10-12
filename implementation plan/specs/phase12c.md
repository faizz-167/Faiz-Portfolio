# Phase 12c — Work Page: Floating Field

## Objective

The owner asked for a parallax floating effect on `/work` (2026-10-12), after the Fancy Components
"Parallax Floating" demo. They chose direction B: a first-screen band where the title sits in the
centre and the project plates float around it at different depths, drifting against the cursor.
The Phase 12b register follows below, unchanged except for its title cell. The band stays inside
the Build Sheet rules: flat square frames, hairlines, no shadow, no rounding, no blur.

## Prerequisites

Phase 12b complete.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P12c.1 | Log the change; amend design.md §7 Work index |
| P12c.2 | Floating field band |
| P12c.3 | Floating plates |
| P12c.4 | Cursor parallax |
| P12c.5 | Arrival, reduced motion, touch and no JS |
| P12c.6 | Register title cell |

## Reference study (2026-10-12)

- **Fancy Components "Parallax Floating"** (owner-supplied). Elements are hand-placed by percentage
  around a centred title. Each has a depth. Every frame, each element eases towards an offset
  proportional to the cursor position times its depth. Negative sensitivity makes them move against
  the cursor. Taken: hand placement, per-element depth, eased follow, against-cursor direction.
  Not taken: the soft opacity fade-in (we cut), the rounded pill button, and the offset measured
  from the container's top-left corner (ours is measured from the band's centre, so nothing jumps
  when the cursor enters).
- It is not installed from the `@fancy` registry. It is written in the project on `motion`
  (already a dependency): one wrapper and one element, about 60 lines.

## Execution

### P12c.1 — Record it

Add a Decisions-log row dated 2026-10-12: `/work` opens with a floating field. design.md §7 Work
index gains a sentence on the band. Hard bans: the plates are flat 2D frames, so the "floating 3D
objects" ban is not touched. The row says so.

### P12c.2 — Floating field band

- Ink, inside the existing Sheet 03 scene, above the register. "Back to home" moves to the band's
  top-left corner.
- **Height:** 80svh from 1024px, 70svh from 640px. Below 640px the band is only as tall as the
  title (no floating plates; the register directly below lists them all).
- **Title:** h1 "All assemblies", display face at `h1` size, centred in the band. The plates never
  cover it: it sits above them in stacking order, and their hand-placed positions keep clear of it
  even at full drift.

### P12c.3 — Floating plates

- One plate per project **with a case page** (four today), hand-placed by percentage around the
  title. Each has its own size and aspect (from 16:10, 4:5 and square) so the field reads as
  scattered sheets, not a row.
- **Each plate:** plate 1 in the hairline frame with corner ticks (the hatched placeholder until
  a screenshot exists), and under it a mono caption with the drawing number and short title
  ("A-01 SpeechPath").
- Each plate is a link to its drawing. Hover scales the media inside its fixed frame (as on the
  home cards) and the crosshair carries the "Open drawing" chip.
- **Accessibility:** the register below is the accessible index. Floating plates are out of the
  tab order (`tabindex=-1`) and hidden from the accessibility tree, so keyboard and screen-reader
  users meet each project once.

### P12c.4 — Cursor parallax

- Fine pointer, motion allowed: each plate eases towards an offset **against** the cursor,
  proportional to the cursor's distance from the band's centre and to the plate's depth.
- **Depths:** four values between 0.5 and 2. At depth 1 a plate travels at most 24px per axis.
  Easing is time-based (same feel at 60Hz and 120Hz). Transform only.
- The loop runs only while the band is on screen and stops once the plates have settled.
- When the pointer leaves the band, the plates ease back to rest.

### P12c.5 — Arrival, reduced motion, touch, no JS

- On arrival the title shows first, then the plates cut in one by one (hard cut, opacity, line
  stagger). The existing route wipe stays.
- Touch (640px and up), reduced motion and no JS: the plates sit still in their places, every
  link works, and nothing animates.

### P12c.6 — Register title cell

The h1 moves to the band, so the register's first cell keeps the count ("5 assemblies") and the
line "Each plate opens its drawing." It has no heading of its own. The grid still fills exactly.

## Open items

- None. Screenshots still pending from the owner (P11b.6); floating plates use the hatched
  placeholder until they arrive.

## Validation criteria

- [x] Decisions log has the 2026-10-12 floating-field row; design.md §7 Work index matches.
- [x] At 1024, 1440 and 1920: four plates around a centred title, none overlapping the title box
      at rest or with the cursor in any corner of the band. 0 horizontal overflow.
- [x] Below 640px: no floating plates, the title on its own, the register directly below.
- [x] Moving the cursor to opposite corners moves the plates in opposite directions, against the
      cursor, with deeper plates travelling further (measured transforms). Leaving the band
      returns them to 0.
- [x] No animation frames are requested while the band is off screen or the plates have settled.
- [x] Clicking a floating plate opens its drawing. Tab skips the floating plates; the
      accessibility tree has one h1 and the register's links once each.
- [x] Reduced motion (emulated), touch and JS disabled: plates static, no inline transforms.
- [x] Phase 0 ban checklist passes on `/work`.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. No new packages.

## Validation result — 2026-10-12

Production build (`next start` on :3111), DevTools MCP Chrome.

- **Placement.** At 1024, 1440 and 1920, none of the four plates touches the title's ink box or
  "Back to home", even with each plate grown by its full drift (depth × 24px). 0 horizontal
  overflow at 360, 768, 1024, 1440 and 1920. The first build failed this at 1440: A-02 (depth 2)
  could drift into the title. It was moved to the top edge and narrowed.
- **Below 640px (360).** No floating plates. The band is 171px tall with the title alone, and the
  register follows directly.
- **Parallax (1440).** Cursor at the top-left gave +24/+48/+12/+36 px for depths 1/2/0.5/1.5.
  Bottom-right gave the same values negated. After the pointer left, all four returned to 0.
- **Idle.** rAF calls per second: 64 at idle (the site's Lenis/GSAP ticker), 118 while plates
  move, and back to 65 once they settle. Off screen the loop doesn't start (IntersectionObserver).
- **Links and accessibility.** Clicking a floating plate opened /work/speechpath. *Correction: the click was scripted (`element.click()`), which skips hit-testing. A real pointer could not reach the plates: the title layer covered them. Fixed in the 12d prerequisite.* Tab order is Back,
  then the four register plates. The accessibility tree has one h1 and no floating plates.
- **Static paths.** Touch at 768 and reduced motion at 1440 (forced through `matchMedia`): no
  inline transforms. Server HTML renders every plate in place.
- **Tablet.** Plates are wider below 1024px; the "Screenshot pending" label now fits in every
  plate at 768.
- **Bans.** No gradient, shadow, blur or rounding. The plates are flat frames.
- `npm run lint`, tests 41/41 and `npm run build` pass. No console errors. No new packages.
