# Phase 8 — Site Chrome (Sheet Strip, Dock, Menu, Footer, Cursor Mount)

## Objective

Build the persistent interface around the scenes: the desktop sheet strip, the mobile dock and
menu, skip link, and cursor mount — all driven by `Scene` metadata.

## Prerequisites

Phases 4, 5, 6 (Crosshair), 7 (profile).

## Subtasks

| ID   | Subtask |
|------|---------|
| P8.1 | Skip link + landmark structure |
| P8.2 | `useActiveSheet` — tracks current `Scene` via ScrollTrigger |
| P8.3 | `SheetStrip` (desktop top bar) |
| P8.4 | `Dock` (mobile bottom bar) |
| P8.5 | `Menu` overlay (Motion AnimatePresence, focus trap, Lenis stop) |
| P8.6 | Mount Crosshair; surface-aware chrome colours |

## Execution

### P8.1
"Skip to content" link, first focusable, visible on focus. `<header>`, `<main id="content">`, `<footer>`.

### P8.2 — useActiveSheet
One ScrollTrigger per `[data-sheet]` with `start: "top 50%"`, `end: "bottom 50%"`, `onToggle`
sets active `{ id, sheet, surface }` in a small external store (no React re-render storm: only
SheetStrip/Dock subscribe).

### P8.3 — SheetStrip (≥ 1024px)
- Fixed top, height token `--strip-h` (≈ 44px), hairline bottom rule, `mix-blend-mode: difference`
  is NOT used; instead colours follow the active surface (`data-surface` mirrored on the strip).
- Three cells (TitleBlock styling): left = name (Link to top); centre = active sheet label with a
  `RollText`-style swap animation (GSAP, vertical cut); right = local time (`useLocalTime`) and,
  on pointer-fine, live cursor coordinates.
- Nav links (Work, Materials, Revisions, Contact) as `RollText` links, anchor-scrolling via Lenis.

### P8.4 — Dock (< 1024px)
Floating bottom bar, square, hairline border, `--bg` of active surface; left: active sheet label;
right: "Menu" button. Safe-area aware (`padding-bottom: env(safe-area-inset-bottom)`). Hides on
scroll-down, reveals on scroll-up (GSAP `y`, velocity-based).

### P8.5 — Menu
- Full-screen overlay, `data-surface="signal"`; links set in `h1` display with WidthFlex hover.
- Motion `AnimatePresence`: overlay wipes in (`scaleY` from bottom, `--ease-wipe`), links stagger.
- Opening calls `lenis.stop()`, closes on Escape / link click (`lenis.start()` then scrollTo).
- Focus trap and `aria-modal`, returns focus to trigger on close; `inert` on `<main>` while open.

### P8.6
Mount `<Crosshair />` in the provider tree; it reads active surface to pick line colour.

## Validation criteria

- [ ] Active sheet label updates correctly when scrolling up and down through all scenes.
- [ ] Keyboard: Tab reaches skip link first; Menu traps focus and restores it.
- [ ] Dock respects iOS safe area (emulate iPhone in DevTools).
- [ ] Chrome remains legible on every surface (ink, paper, signal).
- [ ] No layout shift when the strip/dock mounts.
