# Phase 13 — Performance, SEO & Production Hardening

## Objective

Ship a production-ready build: 60fps motion, strong Core Web Vitals, complete metadata/OG,
lean bundles, and a clean deploy checklist.

## Prerequisites

Phase 12 complete.

## Subtasks

| ID    | Subtask |
|-------|---------|
| P13.1 | Performance traces & fixes (scroll, hero, route change) |
| P13.2 | Bundle audit and code-splitting |
| P13.3 | Images and fonts optimisation |
| P13.4 | Metadata, OG images, sitemap, robots, JSON-LD |
| P13.5 | Error and 404 pages in the visual language |
| P13.6 | Production checklist from Next 16 docs |
| P13.7 | Final review against Phase 0 bans |

## Execution

### P13.1
Chrome DevTools MCP `performance_start_trace` / `performance_stop_trace` on `/` with full scroll,
with 4× CPU throttle. Fix: long tasks > 50ms, forced reflows (layout thrash in Trace/Dimension
measuring — batch reads before writes), excessive `will-change` layers (Layers panel).

### P13.2
`next build` output: home first-load JS target ≤ 180kB gzip. Lazy-load case-page-only code
(`ArchitectureDiagram` interaction, anime.js) with `next/dynamic` or route-level splitting; import
anime.js modules granularly (`animejs/animation`, `animejs/svg`…). Crosshair/HoverPreview load only on
pointer-fine.

### P13.3
`next/image` with AVIF/WebP, explicit sizes, `priority` only for LCP media (none in hero — text LCP).
Fonts: preload display only; mono `preload: false`; verify `size-adjust` fallbacks avoid CLS.

### P13.4
- Root `metadata`: title template `"%s — <Name>"`, description, `metadataBase`.
- `opengraph-image.tsx` (home + per project) rendered in the Build Sheet style (title block + display line).
- `sitemap.ts`, `robots.ts` (`/system` disallowed), JSON-LD `Person` on home, `CreativeWork` per project.

### P13.5
`not-found.tsx`: "Sheet not found" with a Dimension measuring the empty space and a link home.
`error.tsx` (client) with retry Button.

### P13.6
Walk `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`; record each item
pass/fail in status notes.

### P13.7
Re-read Phase 0 P0.2 bans and check every page. Record result.

## Validation criteria

- [ ] Lighthouse (mobile) Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] LCP < 2.5s, CLS < 0.05, INP < 200ms (lab).
- [ ] No frame > 16.7ms during normal scroll on unthrottled desktop trace.
- [ ] OG images render for home and every project.
- [ ] `npm run build && npm run start` serves all routes with no console errors.
- [ ] Phase 0 ban checklist passes.
