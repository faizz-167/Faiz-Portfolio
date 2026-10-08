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
All three landmarks are rendered once by the root layout (pages render no `<main>`): under
<Activity> hidden routes stay mounted, so a per-page `<main id>` would be duplicated. The chrome
(`SiteChrome`: skip link + strip + dock in `<header>`, menu dialog beside it) and `Footer` live in
`src/components/chrome/`. The footer holds the section links as plain HTML (no-JS navigation on
phones, where the Menu button needs JS) and reserves the dock height + safe area below 1024px.

### P8.2 — useActiveSheet
One ScrollTrigger per `[data-sheet]` with `start: "top 50%"`, `end: "bottom 50%"`, `onToggle`
sets active `{ id, sheet, surface }` in a small external store (no React re-render storm: only
SheetStrip/Dock subscribe). Lives in `src/lib/hooks/useActiveSheet.ts`: `useSheetTracker(pathname)`
(single writer, in the chrome; scenes = visible `main [data-sheet]`, `refreshPriority: -1`, rebuilt
per route) and `useActiveSheet()` (reader).

### P8.3 — SheetStrip (≥ 1024px)
- Fixed top, height token `--strip-h` (≈ 44px), hairline bottom rule, `mix-blend-mode: difference`
  is NOT used; instead colours follow the active surface (`data-surface` mirrored on the strip).
- Three cells (TitleBlock styling — hairline-ruled one-line cells; the TitleBlock component's
  stacked label/value cell is taller than 44px): left = name (Link to `#top` on home, `/` elsewhere);
  centre = active sheet label with a `RollText`-style swap animation (GSAP, vertical cut,
  `--dur-base`, `--ease-wipe`); right = local time (`useLocalTime`) and, on pointer-fine (CSS),
  live cursor coordinates.
- Nav links (Work, Materials, Revisions, Contact) as `RollText` links, anchor-scrolling via Lenis
  (`#id` on home, `/#id` from other pages).
- `--strip-h` is `0px` below 1024px and `44px` from 1024px (strip is desktop-only).

### P8.4 — Dock (< 1024px)
Bottom bar flush with the screen edge (full width, so its fill runs under the home indicator),
square, hairline top border, `--bg` of active surface; left: active sheet label; right: "Menu"
button. Safe-area aware (`padding-bottom: env(safe-area-inset-bottom)`; root layout exports
`viewport.viewportFit = "cover"`). Hides on scroll-down, reveals on scroll-up (GSAP `yPercent`,
velocity-based, ±300px/s), stays near the top and while it holds focus. Reduced motion: never hides.

### P8.5 — Menu
- Full-screen overlay, `data-surface="signal"`; links set in `h1` display with WidthFlex hover.
- Motion `AnimatePresence`: overlay wipes in (`scaleY` from bottom, `--ease-wipe`), links stagger.
- Opening calls `lenis.stop()`, closes on Escape / link click (`lenis.start()` then scrollTo).
- Focus trap and `aria-modal`, returns focus to trigger on close; `inert` on `<main>` while open
  (also on `<header>` and `<footer>`; the dialog renders beside the header). Page scroll is clipped
  (`html.menu-open`). Closes on route change and when the viewport reaches 1024px. Reduced motion:
  mounts in its final state (`initial={false}`), closes instantly.

### P8.6
Mount `<Crosshair />` in the provider tree (MotionProvider); removed from `/system`. It takes its
colours from the `data-surface` under the pointer (Phase 6 behaviour), which over the chrome is the
chrome's mirrored surface.

## Validation criteria

- [x] Active sheet label updates correctly when scrolling up and down through all scenes.
- [x] Keyboard: Tab reaches skip link first; Menu traps focus and restores it.
- [x] Dock respects iOS safe area (emulate iPhone in DevTools).
- [x] Chrome remains legible on every surface (ink, paper, signal).
- [x] No layout shift when the strip/dock mounts.

Validated 2026-10-08 on `next dev` (Chrome DevTools MCP; reduced motion and safe-area insets in a
separate headless Chrome via CDP `Emulation.setEmulatedMedia` / `Emulation.setSafeAreaInsetsOverride`):
- Label: `/system` 15 scenes, scene centred top→bottom→top 30/30 correct at 1280×800 and 390×844
  (also after `/` → back, i.e. an <Activity> round trip); 91 Lenis wheel stops with 0 mismatches.
  Strip `data-surface` matches the scene; the cut runs ~320ms.
- Keyboard: first Tab = "Skip to content" (z-overlay, inset, visible); Enter focuses `main#content`.
  Menu: focus on "Work", Tab cycles Work → Close → Work, Shift+Tab Work → Close; Escape and Close
  return focus to "Menu"; header/main/footer inert while open, cleared on close.
- Safe area (bottom inset 34px): dock 56 + 1 + 34 = 91px tall, bottom 844; menu bar padded 34px.
- Contrast (strip text / muted on its surface): ink 16.2 / 6.6, paper 16.2 / 5.13, signal 13.23 / 5.9.
- CLS 0 on load at 1280×800, 900×800 and 390×844. Opening the menu with a classic scrollbar
  (900px window) scores 0.00017 (scrollbar removed under the dialog — same as Lenis's own stop).
- Crosshair: one layer + `has-crosshair` with a fine pointer; none under touch or reduced motion.
- Reduced motion: no Lenis, dock never hides, menu fully open and links visible 30ms after the click,
  gone 30ms after Escape. Motion logs its dev-only "Reduced Motion enabled" warning there.
- Menu link from `/system` → `/#work` closes the menu; menu opened on `/` then browser Back →
  `/system` with the menu closed and the label live. Viewport to 1280 with the menu open closes it.
- No console errors or hydration warnings (one pre-existing `/system` "form field without id" issue).
- `npm run lint` and `npm run build` pass, all routes ○; no raw colours in `src/components`.
