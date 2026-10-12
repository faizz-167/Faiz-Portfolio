# Phase 12e — Letter Swap on Text Controls

## Objective

The owner asked (2026-10-12) for the Fancy Components "Letter 3D Swap" hover across the site, and
chose direction A: it replaces the roll-text effect and becomes the one hover for text controls.
Each letter sits on a small box that turns a quarter, so an identical copy of the letter comes up
from below, one letter after another. Plain text and headings stay still.

## Prerequisites

Phase 12d complete.

## Correction to the proposal

The proposal said every button already used the roll effect. That was wrong. Today `RollText` is
used only by the sheet strip (name and section links), the footer (name and section links) and
the `/system` demo. Buttons have their own hover: a fill wipe (solid, outline) or an underline
(ghost), plus the icon nudge. Because the owner chose A on that description, this spec adds the
swap to button labels **as well as** their existing hover. If that is two effects too many, drop
P12e.4 before building.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P12e.1 | Log the change; amend design.md (§6 buttons, §7 sheet strip, motion summary) |
| P12e.2 | Letter swap primitive |
| P12e.3 | Replace RollText |
| P12e.4 | Button labels |
| P12e.5 | Reduced motion, touch, no JS, accessibility |

## Reference study (2026-10-12)

- **Fancy Components "Letter 3D Swap"** (owner-supplied). Each character is a box with a front face
  and a second face rotated 90° on it. On hover each box turns 90° with a per-letter stagger, then
  snaps back invisibly. Taken: the box geometry for the `top` direction (faces offset by half a
  line height), per-letter stagger from the first letter, and the invisible reset. Not taken:
  springs (we use `--dur-base` and `--ease-out`), the `staggerFrom` options and other directions
  (one obvious way), and triggering on mouse only.
- It is not installed from the `@fancy` registry. It is written in the project on `motion`
  (already a dependency), replacing `RollText` (deleted).

## Execution

### P12e.1 — Record it

Decisions-log row dated 2026-10-12: the letter swap replaces roll text on text controls and is
added to button labels. design.md §6 and §7 and the motion summary are updated. Hard bans: this is
a short rotation of type, not a 3D object; the row says so.

### P12e.2 — Letter swap primitive

- Takes plain text. Renders the text once for assistive technology, and each letter as a
  two-faced box that is hidden from it.
- **Trigger:** hover or keyboard focus of the nearest link or button (`group/control`, as RollText
  used). Each trigger plays once to completion; re-hovering mid-swap does not restart it.
- **Motion:** every letter box turns 90° about X (upwards), `--dur-base` with `--ease-out`.
  Letter n starts `n × staggersS.chars` later (0.025s). When the last one lands, all boxes reset
  to 0° in one frame. Because both faces show the same letter, the reset is invisible.
- Spaces keep their width, and words never break mid-word when a label wraps.
- **Layout:** the swapped label has exactly the size and baseline of the plain label. No shift
  when the component hydrates or animates.

### P12e.3 — Replace RollText

The sheet strip's name and section links, the footer's name and section links, and the `/system`
demo use the letter swap. `RollText` is deleted.

### P12e.4 — Button labels

Every Button's label (solid, outline, ghost) uses the letter swap. The existing fill wipe,
underline, icon nudge and pressed state are unchanged and run at the same time.

### P12e.5 — Reduced motion, touch, no JS, accessibility

- Reduced motion, touch (no hover) and no JS: the plain label, with nothing in 3D.
- The accessible name of every link and button is unchanged; screen readers read the word, not
  its letters.

## Validation criteria

- [x] Decisions log row; design.md §6, §7 and the motion summary match. No `RollText` left in `src`.
- [x] Hovering a sheet-strip link, a footer link and a button at 1440 (real pointer): the letters
      turn one after another, and after the last one lands the boxes are back at 0° (measured).
- [x] Tabbing to a strip link and to a button plays the same swap.
- [x] A label's bounding box is identical (±0.5px) before hydration, at rest after hydration, and
      mid-swap. CLS stays 0 on `/` and `/work`.
- [x] The accessibility tree shows every affected link and button with the same name as before
      (strip, footer, Back to home, See all assemblies, the case-page buttons).
- [x] Reduced motion (emulated) and touch: no transforms on hover or focus.
- [x] No frame over 16.7ms while swapping a strip link (DevTools trace at 1440).
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. No new packages.

## Validation result — 2026-10-12

Production build (`next start` on :3111), DevTools MCP Chrome.

- **Geometry.** With the boxes held at 90° and 45° and the two faces coloured, the second face sits
  upright at the front at 90°, and at 45° the letters roll upwards.
- **Hover (real pointer, 1440).** On strip "Work", sampled every frame, the first letter started
  first, all four reached ~90° (89/89/87/85 mid-run), and every box was back at 0° afterwards.
  "See the work" (outline button) swapped together with its fill wipe.
- **Keyboard.** Real Tab presses played the swap on the strip name and on "Work". Programmatic
  focus-visible on "Back to home" turned all 10 boxes and left them at 0°.
- **Layout.** Live and flat label boxes are identical (Work 35.125×14, Mohamed Faiz and Back to
  home 105.375×14). Against plain text, "Back to home" measures 105.3125 vs 105.375 (0.06px).
  CLS is 0.0000 on `/` and `/work`.
- **Names.** Strip, footer, See the work, Get in touch, See all assemblies, Copy email and Back to
  home have the same accessible names as before. Case pages have no Button; the spec's mention of
  case-page buttons was wrong, so there was nothing to check there.
- **Reduced motion (forced) and touch (390, mobile + touch).** No `data-live`, no second faces
  shown, no transforms on focus.
- **Frames.** Hovering "See the work" gave 108 rAF intervals, max 16.9ms (vsync jitter at 60Hz),
  none over 17.7ms. Measured with rAF intervals, not a DevTools performance trace.
- **Bug found and fixed.** CopyButton changes its label to "Copied", which re-rendered the boxes
  while the effect kept the old nodes. The effect now depends on the text. After copying, all 6
  boxes of "Copied" turn on focus.
- `npm run lint`, tests 41/41 and `npm run build` pass. No console errors. No new packages.
