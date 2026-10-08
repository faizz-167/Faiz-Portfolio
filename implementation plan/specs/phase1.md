# Phase 1 — Project Foundation

## Objective

Prepare the repository: install the approved dependencies, establish the folder structure,
path aliases and lint rules, and remove create-next-app boilerplate — without any visual work.

## Prerequisites

Phase 0 complete (especially P0.5 docs read).

## Subtasks

| ID   | Subtask |
|------|---------|
| P1.1 | Install runtime dependencies |
| P1.2 | Create folder structure |
| P1.3 | Configure TypeScript strictness and path aliases |
| P1.4 | Remove boilerplate (Geist fonts, starter page, unused public assets) |
| P1.5 | Add `src/lib/cn.ts` class utility |
| P1.6 | Verify dev server and build |

## Execution

### P1.1 — Dependencies
```bash
npm install gsap @gsap/react lenis motion animejs
```
Do not add any other runtime dependency. If a later need arises, justify it in `status.md`
→ Decisions log before installing. `clsx`/`tailwind-merge` are NOT installed; P1.5 provides a
minimal joiner.

### P1.2 — Folder structure
```
src/
  app/
    layout.tsx            root layout, fonts, providers
    page.tsx              home: composes scenes
    globals.css           tokens + base styles (Phase 2)
    system/page.tsx       design-system specimen page (Phase 3)
    work/[slug]/page.tsx  case study (Phase 11)
    not-found.tsx
  components/
    layout/      Container, Grid, Scene, Stack, Cluster, Rule
    type/        Text, Spec, Dimension
    ui/          Link, Button, CopyButton, TitleBlock
    motion/      SplitReveal, ScrubText, Trace, Pin, WidthFlex, Magnetic, Crosshair, HoverPreview, RollText
    chrome/      SheetStrip, Dock, Menu, Footer
    scenes/      Hero, Statement, WorkIndex, Bom, Revisions, Contact
    diagram/     ArchitectureDiagram, DiagramNode, DiagramEdge, layout.ts
  content/       types.ts, profile.ts, projects.ts, experience.ts, capabilities.ts
  lib/
    cn.ts
    motion/      tokens.ts, gsap.ts (plugin registration), lenis.ts, reduced-motion.ts
    hooks/       useMediaQuery.ts, usePointerFine.ts, useLocalTime.ts
  providers/     MotionProvider.tsx
```
Create folders lazily when the first file lands; this tree is the contract for names/locations.

### P1.3 — TypeScript
- `tsconfig.json`: confirm `"strict": true`; add `"noUncheckedIndexedAccess": true`.
- Alias `@/*` → `./src/*` (verify it exists; create-next-app usually adds it).

### P1.4 — Boilerplate removal
- `src/app/layout.tsx`: drop Geist imports (fonts arrive in Phase 2). Keep `LayoutProps<"/">` typing.
- `src/app/page.tsx`: replace with a minimal server component returning `<main />`.
- Delete unused `public/*.svg` starter assets (check each is unreferenced first).
- `metadata`: placeholder title "Portfolio" (real metadata in Phase 13).

### P1.5 — `cn` helper
```ts
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
```

### P1.6 — Verify
`npm run lint`, `npm run build`, `npm run dev` → page loads with no console errors.

## Validation criteria

- [x] `package.json` lists exactly the 5 new runtime deps.
- [x] `npm run build` passes with zero type errors.
- [x] `npm run lint` passes.
- [x] No Geist / create-next-app references remain (`grep -ri geist src` is empty).
- [x] Folder contract documented above matches reality for folders created so far.
