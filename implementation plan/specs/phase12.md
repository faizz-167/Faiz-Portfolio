# Phase 12 — Responsive, Accessibility & Reduced-Motion Pass

## Objective

Make the experience excellent on every device and for every user: hand-tuned mobile layouts,
WCAG 2.2 AA compliance, and a fully designed reduced-motion version (not a broken one).

## Prerequisites

Phases 9–11 complete.

## Subtasks

| ID    | Subtask |
|-------|---------|
| P12.1 | Breakpoint audit at 360, 390, 768, 1024, 1280, 1440, 1920 |
| P12.2 | Touch audit (targets, hover-less paths, gestures) |
| P12.3 | Keyboard & screen-reader audit |
| P12.4 | Contrast & colour audit on all surfaces |
| P12.5 | Reduced-motion walkthrough |
| P12.6 | Fix list execution |

## Execution

### P12.1
Use Chrome DevTools MCP (`resize_page`, `take_screenshot`) at each width for `/`, `/work/[first]`,
`/system`. Check: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`),
display type never clips, hero fits the viewport, line lengths ≤ 62ch.

### P12.2
Emulate touch devices: every hover-only affordance has a tap equivalent; targets ≥ 44px; no
crosshair; Lenis does not hijack touch; Dock reachable with thumb.

### P12.3
- Tab through every page: logical order, visible focus, no traps except the menu.
- Landmarks and heading outline (one `h1` per page — on home it is the hero line).
- Run an axe-style check in DevTools (Lighthouse accessibility ≥ 100 target, ≥ 95 minimum).

### P12.4
Measure contrast for: fg/bg, fg-muted/bg, on-signal/signal, signal focus ring vs. each surface
(≥ 3:1 for non-text). Adjust tokens in Phase 2 file only.

### P12.5
Emulate `prefers-reduced-motion: reduce`: native scroll, no SplitText movement, Trace rendered fully
drawn and static, Revisions vertical, menu opens instantly, diagrams static fully drawn. Page must
still look intentional.

### P12.6
Log each issue as a row in `status.md` under P12.6 notes; fix; re-verify.

## Validation criteria

- [ ] Zero horizontal overflow at all audited widths.
- [ ] Lighthouse accessibility ≥ 95 on `/` and a case page.
- [ ] Full keyboard operation verified.
- [ ] All contrast pairs pass AA (text) / 3:1 (UI).
- [ ] Reduced-motion version reviewed with screenshots and approved as intentional.
