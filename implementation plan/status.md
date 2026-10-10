# Implementation Status

> **Agents: read this file first, then the spec for the current phase in `specs/`.**
> These two locations are the only source of truth for continuing the work.

## Protocol for agents

1. Read this file → find **Current focus** → open `specs/phaseN.md` for that phase.
2. Before starting a subtask, set it to `in progress` here.
3. After finishing a subtask, set it to `done`, add a one-line note (files touched, anything
   surprising), and update **Current focus** and **Last updated**.
4. A phase is `done` only when every validation criterion in its spec is checked off. Record the
   validation result in the phase's notes row.
5. If blocked, set `blocked` and write the reason under **Blockers**. Never silently skip.
6. Any deviation from a spec (new dependency, changed token, renamed file) goes in the
   **Decisions log** with date and reason, and the spec file is edited to match.
7. Never mark something `done` without running its validation.
8. **Each new phase is executed by a freshly spawned subagent** (owner instruction). The main
   session spawns one subagent per phase, gives it this file + the phase spec + `design.md`, and
   reviews its report before starting the next phase.

Status values: `todo` · `in progress` · `done` · `blocked` · `skipped (reason)`

## Current focus

- **Phase:** 12 — Responsive, accessibility & reduced motion
- **Next subtask:** P12.1
- **Owner content:** received and fully confirmed 2026-10-08 → `content/owner-content.md`.

**Last updated:** 2026-10-09 — Phase 11b complete: toolkit gauge (pinned meter ≥1024 with motion, readable faces list elsewhere), home shows 3 projects + `/work` full index (○), placeholder screenshot plates on 3 case pages; lint/test/build pass; next: Phase 12.

## Phase overview

| Phase | Title | Spec | Status |
|---|---|---|---|
| 0 | Brief, research record & locked decisions | `specs/phase0.md` | done |
| 1 | Project foundation | `specs/phase1.md` | done |
| 2 | Design tokens & global styles | `specs/phase2.md` | done |
| 3 | Layout & typography primitives | `specs/phase3.md` | done |
| 4 | Interactive primitives | `specs/phase4.md` | done |
| 5 | Motion infrastructure | `specs/phase5.md` | done |
| 6 | Motion components | `specs/phase6.md` | done |
| 7 | Content model & data | `specs/phase7.md` | done |
| 8 | Site chrome | `specs/phase8.md` | done |
| 9 | Home scenes I — Hero "Daddy's Home." & Statement | `specs/phase9.md` | done |
| 10 | Home scenes II — Work, BOM, Revisions, Contact | `specs/phase10.md` | done |
| 11 | Case study pages & architecture diagrams | `specs/phase11.md` | done |
| 11b | Toolkit gauge, work archive & screenshot plates | `specs/phase11b.md` | done |
| 12 | Responsive, accessibility & reduced motion | `specs/phase12.md` | todo |
| 13 | Performance, SEO & production hardening | `specs/phase13.md` | todo |

Dependency order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 8 → 9 → 10 → 11 → 11b → 12 → 13.
Phase 7 can run any time after Phase 1 (in parallel with 2–6).

## Subtasks

### Phase 0 — Brief & decisions
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P0.1 | Record reference-site analysis | done | 5 sites studied in Chrome DevTools at 1440 and 390 widths; Inspo + Kexsio consulted |
| P0.2 | Record concept and scene list | done | "Build Sheet" + Signal Trace; 6 home scenes + case pages |
| P0.3 | Record locked technical decisions | done | |
| P0.4 | Record copy voice and signature lines | done | "Daddy's Home." (hero), "Call me, Baby — for your new website." (contact) |
| P0.5 | Read Next.js 16 docs | done | 9 differences logged under Notes for agents (Activity, ensureStatic, Date rules, turbopack Tailwind…) |
| P0.6 | Collect owner content | done | Resume PDF + 4 repos read; dossier at `content/owner-content.md` |

### Phase 1 — Foundation
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P1.1 | Install dependencies | done | gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26, motion 14.0.0, animejs 4.5.0; npm audit's 5 high findings are all in the dev-only eslint-config-next → fast-glob → braces chain |
| P1.2 | Folder structure | done | Only `src/lib/` added (lazy creation); tree in phase1.md stays the naming contract |
| P1.3 | TypeScript strictness + aliases | done | `tsconfig.json`: `noUncheckedIndexedAccess: true` added; `strict` and `@/*` → `./src/*` already present |
| P1.4 | Remove boilerplate | done | layout.tsx (no Geist, `ensureStatic = 'navigation'`, title "Portfolio"), page.tsx → `<main />`, globals.css → import + body rule; deleted 5 starter SVGs (only page.tsx used them); kept `src/app/favicon.ico` (Phase 13) and `public/assets/MdFaizResume.pdf` |
| P1.5 | `cn` helper | done | `src/lib/cn.ts` |
| P1.6 | Verify dev + build | done | lint clean; build passes (/, /_not-found both ○ static, with ensureStatic); dev GET / → 200, title "Portfolio", no server errors |

### Phase 2 — Tokens & global styles
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P2.1 | Fonts | done | Anybody (wdth+wght), Newsreader (opsz+wght, normal+italic), Martian Mono (wdth+wght, preload:false) — all axes confirmed in font-data.json and @font-face output (font-stretch 50–150% / 75–112.5%); vars on <html> via cn(); design.md fallback stacks via `fallback` |
| P2.2 | Colour tokens + surfaces | done | globals.css `@theme static` hex tokens + `[data-surface]` remap (also paints bg/fg, per-surface color-scheme); `body data-surface="ink"`; computed muted/rule hex match design.md exactly |
| P2.3 | Type scale | done | `--text-*` clamp() 360→1600 with line-height/tracking/weight sub-tokens → `text-mega…text-data`; verified 360/768/1280/1600 (min/max hit exactly, linear between) |
| P2.4 | Spacing, rhythm, grid | done | `--space-1..12` + Tailwind `--spacing-N` (p-5 = 24px; multiplier removed), `--section-y`, `--margin-x`, `--gutter`, `--cols` 4/8/12, `.page-grid` with gutter-compensated margin tracks, `col-content`/`col-full` |
| P2.5 | Borders, radii, z-index, focus | done | `--border-hair/active`, `rounded-dot` only radius, shadow/blur namespaces cleared, `z-*` named utilities, global `:focus-visible` 1.5px accent / 3px offset (renders 1px at DPR 1 — Chrome device-pixel snapping) |
| P2.6 | Motion tokens (CSS + TS) | done | CSS `--ease-out/--ease-wipe` (+ `ease-*` utilities), `--dur-cut/fast/base/slow/scene`; `src/lib/motion/tokens.ts` typed consts with header equality table, no library imports |
| P2.7 | Base layer | done | Base layer in globals.css: selection, text-wrap balance/pretty, media block, antialiasing, body text tokens; Lenis CSS via `@import "lenis/dist/lenis.css"` |
| P2.8 | Media hooks in CSS | done | Reduced-motion rule in @layer base; `@custom-variant pointer-fine` |

### Phase 3 — Layout & type primitives
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P3.1 | Container / Grid | done | `layout/Container.tsx` (page-grid, children `*:col-content`, `bleed` → full), `layout/Grid.tsx` (`Grid` + `GridCell`, span/start per tier, `subgrid`); helper `src/lib/polymorphic.ts`. `md` tier = 8 cols from 640px (Tailwind `sm:`) |
| P3.2 | Scene | done | `layout/Scene.tsx`: section id/data-sheet/data-surface/aria-labelledby (default `sceneTitleId(id)` = `${id}-title`), `relative py-section` (padding-block only) |
| P3.3 | Stack / Cluster | done | `layout/Stack.tsx` (gap 0–12, default 5; align), `layout/Cluster.tsx` (gap default 4, align, justify, wrap) |
| P3.4 | Rule | done | `layout/Rule.tsx`: `<hr data-rule={orientation}>`, hair (1px --rule) / active (1.5px --accent) via local `--rule-w`; vertical needs a flex/grid parent |
| P3.5 | Text | done | `type/Text.tsx`: 8 variants → font-*/text-* utilities; lede max-w-lede, body/small max-w-measure; tone fg/muted/signal (= --accent), omitted = inherit |
| P3.6 | Spec | done | `type/Spec.tsx`: `<dl>` of div>dt+dd, own `repeat(k)` tracks + --gutter (lands on page lines when k divides --cols; verified), default columns {base 2, lg 4} |
| P3.7 | `/system` page | done | `src/app/system/page.tsx`, static, noindex/nofollow; CSS-only grid overlay (checkbox + `group-has-[#grid-toggle:checked]`), swatches, type scale, spacing, grid/subgrid, Rule/Spec/Stack/Cluster, every Text variant on ink/paper/signal |

### Phase 4 — Interactive primitives
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P4.1 | Link | done | `ui/Link.tsx`: variants draw/inline/nav/plain; next/link internal, `<a target=_blank rel=noopener noreferrer>` + aria-hidden ↗ glyph + sr-only "(opens in new tab)" external, plain `<a>` for mailto/tel; inline uses text-decoration (pseudo underlines break on wrap) |
| P4.2 | RollText | done | `ui/RollText.tsx`: string children twice in overflow-clip; rolls on parent `group/control` hover/focus-visible; gated by motion-safe + (hover:hover); copy `display:none` under (hover:none) |
| P4.3 | Button | done | `ui/Button.tsx` + `ui/icons.tsx`; solid/outline/ghost × md(44)/lg(56); surface wipe via new `--wipe/--on-wipe` tokens; label colour is a cut at the wipe midpoint; renders `Link` when `href` |
| P4.4 | CopyButton | done | `ui/CopyButton.tsx` (only client component): Button outline + copy icon, "Copied" 1.6s, failure text in `text-error` beside the button, role=status aria-live=polite, useLayoutEffect cleanup resets |
| P4.5 | TitleBlock | done | `ui/TitleBlock.tsx`: `<dl>` of hairline cells (each full box pulled -1px up/left so short rows stay closed), columns {base 2, md 3, lg 6}, span clamped per tier |
| P4.6 | Add to `/system` | done | Scenes `ui-ink`, `ui-paper` after `layout`; signal demo appended inside the last `text-signal` scene so signal stays last. Validated 2026-10-08 (all 6 criteria, see phase4.md) |

### Phase 5 — Motion infrastructure
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P5.1 | gsap.ts registration | done | `src/lib/motion/gsap.ts`: `import "client-only"` (build error if a Server Component imports it — verified), registers useGSAP/ScrollTrigger/SplitText/DrawSVGPlugin, defaults from tokens; adds `requestRefresh()` (rAF-coalesced refresh) + `useRefreshOnShow()` for <Activity> |
| P5.2 | Lenis bridge | done | `src/lib/motion/lenis.ts`: module singleton + `LenisContext`/`useLenis()`/`getLenis()`; `mountLenis()` = lerp 0.1, syncTouch false, autoRaf false, stopInertiaOnNavigate; gsap.ticker drive, lagSmoothing(0) (restored on teardown), scroll → ScrollTrigger.update |
| P5.3 | Reduced-motion store | done | `src/lib/motion/reduced-motion.ts`: `useReducedMotion()` (via useMediaQuery, server false), `prefersReducedMotion()`, query constants |
| P5.4 | MotionProvider | done | `src/providers/MotionProvider.tsx`: MotionConfig reducedMotion="user" + spring token; gsap.matchMedia sets `motion-ok`/`motion-reduced` in an effect and mounts Lenis only in the motion-ok branch (live toggle verified); fonts.ready → ScrollTrigger.refresh() |
| P5.5 | Mount + anchor scrolling | done | layout.tsx (still server, ensureStatic) wraps children; capture-phase `a[href^="#"]` handler (also pre-empts next/link) → Lenis scrollTo with `--strip-h` offset, reduced → scrollIntoView; globals.css `[id]{scroll-margin-top:var(--strip-h)}` |
| P5.6 | Hooks | done | `src/lib/hooks/{useMediaQuery,usePointerFine,useLocalTime}.ts`: useSyncExternalStore, server snapshots false / "--:--"; local time re-aligned to each minute + resync on visibilitychange |
| P5.7 | Ownership rules documented | done | Ownership table, usage rules and the <Activity> refresh contract in the gsap.ts header |

### Phase 6 — Motion components
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P6.1 | SplitReveal | done | `motion/SplitReveal.tsx` + `SplitSource.tsx` (aria-hidden visual copy + sr-only twin); SplitText lines mask, autoSplit, `set`+`to` so transforms parse at split time; default div wrappers (span wrappers get no display → no transform) |
| P6.2 | ScrubText | done | `motion/ScrubText.tsx`: words 0.2 → 1 scrubbed `top 75%`→`bottom 40%`, children pre-initialised at split time |
| P6.3 | Trace | done | `motion/Trace.tsx` + pure `trace-path.ts` (`buildTracePath`, `drawnFractionAt`): margin rails + seams, 45° chamfers, 3 surface-clipped copies for per-surface `--accent`, one eased DrawSVG tween (head tracks viewport centre), via pops, <640 local leads, debounced RO + fonts rebuild → requestRefresh |
| P6.4 | RuleDraw | done | `motion/RuleDraw.tsx`: wrapper, ScrollTrigger.batch on `[data-rule]`, scaleX/scaleY, once; not contextSafe (synchronous batch inside the context recursed) |
| P6.5 | WidthFlex | done | `motion/WidthFlex.tsx` (+ `widthAxis`): hover (host = closest a/button/[data-flex-host]), velocity (quickTo, ±3000px/s → 85–115, idle → 100), compile (ref for parent timelines); block, nowrap, contain: layout |
| P6.6 | Pin | done | `motion/Pin.tsx`: desktop+motion only, `pinType: "transform"` (fixed pinning scored 0.47 CLS), `data-pinned` gates the row layout, will-change on toggle |
| P6.7 | Magnetic | done | `motion/Magnetic.tsx`: Motion `useSpring` ×2 (spring token), pull `--space-3`, rect read once per enter, reset in layout-effect cleanup |
| P6.8 | Crosshair | done | `motion/Crosshair.tsx` + globals.css `html.has-crosshair` cursor rule; quickTo lines/point, readout via textContent, surface copied from pointer target; demo-mounted on `/system` only (P8.6 mounts it) |
| P6.9 | HoverPreview | done | `motion/HoverPreview.tsx`: parent-controlled `activeId`, `preloadPreview(item)` (getImageProps srcset warm-up), quickTo follower (`--dur-base` lag), AnimatePresence opacity swap, next/image `sizes="(pointer: fine) 28vw, 0px"` |
| P6.10 | Dimension | done | `motion/Dimension.tsx`: RO-measured (reads only in RO callback), anime.js `createDrawable` lines + count-up label, `play` false retracts, reduced = instant; label = Math.round(measured px), follows resize |
| P6.11 | `/system` demos | done | `/system`: 4 motion scenes (ink/paper/ink/paper) before ui-ink, Via anchors on all 15 scenes, Trace + Crosshair on `<main class="relative">`, client demos in `app/system/MotionDemos.tsx`, demo images `public/system/preview-{1,2,3}.webp`. Validated 2026-10-08 (all 6 criteria, see phase6.md) |

### Phase 7 — Content
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P7.1 | types.ts | done | `src/content/types.ts`; spec types + `copy.buildLog: string[]` (Phase 9 expects it); type-only imports so Node can load the data |
| P7.2 | capabilities.ts | done | 46 ids, `as const satisfies readonly Capability[]`, `CapabilityId` derived; no versions (dossier has none) |
| P7.3 | projects / experience / profile | done | All `satisfies`; `scripts/validate-content.ts` (Node type stripping) via `npm run validate:content`, chained into `lint`; tsconfig `allowImportingTsExtensions` |
| P7.4 | Selectors | done | `src/content/index.ts`: sortedProjects, getProject, hasCasePage, projectSlugs (excludes in-progress), getCapability, capabilityUsage, capabilitiesByCategory, revisions, profile |
| P7.5 | Ingest owner content | done | Dossier mapped field by field; no TODO(content); no phone, no CGPA. Owner to confirm: IAM role, ERP/Laptop Sentinel body copy (see Decisions log). Validated 2026-10-08 (all 4 criteria, see phase7.md) |

### Phase 8 — Chrome
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P8.1 | Skip link + landmarks | done | Root layout owns `<header>` (SiteChrome) / `<main id="content" tabIndex=-1>` / `<footer>`; pages render no `<main>` (/system → div, `/` → null); skip link first in header; footer = section links (no-JS nav) + dock clearance |
| P8.2 | useActiveSheet | done | `src/lib/hooks/useActiveSheet.ts`: store + `useSheetTracker(pathname)` (visible `main [data-sheet]`, `refreshPriority -1`, onToggle + onRefresh) + `useActiveSheet()` |
| P8.3 | SheetStrip | done | `chrome/SheetStrip.tsx` + `SheetLabel.tsx` (GSAP vertical cut); `--strip-h` 0 below 1024px; coords via CSS `pointer-fine:` + textContent (`formatCoords` exported from Crosshair) |
| P8.4 | Dock | done | `chrome/Dock.tsx`: full-width bottom bar, safe-area padding (`viewportFit: cover`), GSAP yPercent hide at ±300px/s, reveal on focus; never hides under reduced motion |
| P8.5 | Menu | done | `chrome/Menu.tsx`: signal dialog, AnimatePresence wipe + link stagger, trap/Escape/inert/Lenis stop + `html.menu-open`; focus moves in a microtask (React's commit restores the pre-commit focus otherwise — found in validation) |
| P8.6 | Crosshair mount | done | Mounted in MotionProvider, removed from /system; /system grid toggle + overlay moved to z-chrome / below the strip. Validated 2026-10-08 (all 5 criteria, see phase8.md) |

### Phase 9 — Hero & Statement
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P9.1 | Hero static layout | done | `components/home/Hero.tsx` (server: Scene `top`, TitleBlock, details) + `HeroGuard.tsx` (pre-paint inline script) + guard/fit/mask CSS in globals.css; line capped to content width ≥640px (mega is 7.62em wide, overflowed at 1280); `leading-hero` 0.9 |
| P9.2 | Build log | done | `HeroCompile.tsx`: `<ol>` of `copy.buildLog`, `gsap.set` visibility cuts 120ms apart; last line starts the fill |
| P9.3 | Compile timeline + Dimensions | done | Outline layer (inline word spans, one LCP candidate) + WidthFlex fill split into masked chars, yPercent 125 → 0 (masks bleed 0.1em); 3 Dimensions on the outline words/line, play via `tl.call` |
| P9.4 | Width cuts + trace start | done | Split reverted before the cuts (no element moves → CLS 0); cuts 50/140/100 at 80ms; `Trace armed` prop + `home/TracedScenes.tsx`; hand-off one frame after the last cut (same-tick arming cost a ~50ms forced layout) |
| P9.5 | Reduced-motion + mobile variants | done | Reduced/no-JS = server HTML; <640px: `w-min` line (two lines at any wdth), split words nowrap, log lines 1 + last two, one Dimension |
| P9.6 | Statement | done | `components/home/Statement.tsx`: paper, ScrubText `text-h3` at lede weight, cols 2–10, mono note, left-margin via, sr-only h2 "Notes"; scrub tops out ≈45% until Phase 10 adds scenes below |
| P9.7 | Return-visit timing | done | `home/hero-session.ts` (try/catch sessionStorage, shared with the guard script); return = no log/dims, fill at `--dur-base`, 0.71–0.74s. Validated 2026-10-08 (all 6 criteria, see phase9.md) |

### Phase 10 — Work, BOM, Revisions, Contact
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P10.1 | Work index rows | done | `home/WorkIndex.tsx` (server: rows + panels) + `home/WorkRows.tsx` (client); titles wrap (no WidthFlex — see Decisions), meta = year · role · team · status from data; IAM "On the drawing board", dashed rule, repo link only |
| P10.2 | Row expand | done | `<button aria-expanded aria-controls>` disclosure, one open; Motion `layout="position"` + `AnimatePresence popLayout` fade; 120ms mouse hover-intent (real moves only); raised fill cut, others at opacity `--muted-mix`; `<noscript>` panel copies for no-JS; reset on Activity hide |
| P10.3 | Preview / touch expand | done | No project has a `cover`, so no preview renders; HoverPreview + inline touch image are wired only for rows with a cover. ArchitectureDiagram thumb fallback left to Phase 11 |
| P10.4 | Bill of Materials | done | `home/Materials.tsx`: table + caption h2, tbody per category (drawn hairline + h3), alternating raised rows in `--fg`, Used in from `capabilityUsage`, Qty = build year − since + 1; <640px rows become stacked blocks via `data-label` |
| P10.5 | Revisions | done | `home/Revisions.tsx`: article cards in `Pin` (row of lede-wide cards, --space-12 gap, `lg:pt-strip`), vertical list otherwise; one scene via outside the track |
| P10.6 | Contact "Call me, Baby" | done | `home/Contact.tsx` + `LocalTime.tsx`: contact lines (SplitReveal, first line capped to one line ≥640), email WidthFlex hover + Magnetic + CopyButton + mailto (size fitted to the line), title block + folded footer (`FooterLinks`); root `Footer` returns null on `/`; stamp year = `BUILD_YEAR` |
| P10.7 | Scene seams + vias | done | Six scenes, one via each, in page order; Trace scroll ends clamped so the draw completes at the stamp. Validated 2026-10-09 (all 7 criteria, see phase10.md) |

### Phase 11 — Case pages & diagrams
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P11.1 | Route + static params + metadata | done | `app/work/[slug]/page.tsx`: 4 slugs prerendered (○); unknown and in-progress slugs → `notFound()` (404). No `dynamicParams` (build error under Cache Components, see Decisions). Metadata title + description; OG image left to Phase 13 |
| P11.2 | Layout engine | done | `diagram/layout.ts` (pure): fixed 1200-wide viewBox, ports and gutter channels 6 apart, a two-turn route through a row gutter when a one-turn route would cross a node (ERP ingest→db), 45° chamfers, labels on the longest segment (parallel labels nudged apart), BFS draw steps. `npm test`: 38 `node:test` cases over all 4 diagrams |
| P11.3 | Renderer | done | `diagram/{ArchitectureDiagram,DiagramNode,DiagramEdge}.tsx` (server). Shapes by kind; `worker` = double left rule (owner decision). Owned = signal corner triangle; legend: Built by me, team, Async. `thumb` variant wired into the work-row panel (owner decision) |
| P11.4 | anime.js sequence + callouts | done | `diagram/DiagramStage.tsx` (client): IntersectionObserver → nodes stagger, edges `createDrawable` by step, arrows/labels fade; lines restored after (async dashes return). Hover/focus lights edges + travelling dash, shows callout (= aria-describedby), dims the rest; Escape clears. State CSS in globals.css "P11.3–P11.4" |
| P11.5 | Text alternative | done | `<details>` "Read the diagram as text", one sentence per edge ("A → B (protocol, async)"). SVG is `role="group"` + title/desc, not `img` (see Decisions) |
| P11.6 | Case layout | done | `case/CaseScenes.tsx`: Sheet 01 title block (ink, h1 + summary + TitleBlock sized to one row), Sheet 02 System (ink), Sheet 03 Notes (paper: body at 62ch, Measurements Spec, Links, Next drawing → wraps). Status = "Live" with dot if `live`, else "Complete". Selector `nextCaseProject` |
| P11.7 | Page transition | done | `app/work/template.tsx` + `motion/RouteWipe.tsx`: on arrival at a case page (not a hard load) scroll to top (Lenis immediate), `requestRefresh()`, signal panel `scaleY` 1→0 over 0.6s via Motion `animate()` from a layout effect (see Decisions). Case → index has no wipe |

### Phase 11b — Toolkit gauge, work archive & plates
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P11b.1 | Content: faces, paragraphs, project order, plate slots | done | `content/toolkit.ts` (4 faces → categories), `types.ts` `Plate`/`Plates` tuple replaces `cover`, projects reordered (ERP 2nd), 12 placeholder plates; selectors `toolkit()`, `homeProjects()`, `previewPlate()`, `caseHref()`; validator checks faces + plates |
| P11b.2 | Toolkit gauge: readable list | done | `home/Materials.tsx` (Sheet 04 — Toolkit, h2 "Services & toolkit"): 4 face blocks (RuleDraw rule, category label + index, h3 word, paragraph, tool list with years + Used in); table gone. Shared parts in `home/ToolkitParts.tsx` |
| P11b.3 | Toolkit gauge: pinned gauge | done | `home/ToolkitGauge.tsx` (client): ScrollTrigger pin (transform), 25vh/tool, gaussian meter (scale/opacity/lift/bar), needle + diamonds, readout keyed per tool; list sr-only + links tabindex −1 while live. Column width must be read fractionally (offsetWidth drifted 18px) |
| P11b.4 | Home work index: three + "See all assemblies" | done | `WorkIndex` = first 3 + outline "See all assemblies" + count; `workRowData()` shared; WorkRows `preview` from plate 1 image only, `headingLevel` prop |
| P11b.5 | All-assemblies page `/work` | done | `app/work/page.tsx` + `components/work/AllAssemblies.tsx`: ink, ○, h1 + h2 rows, back link; the `/work` template wipe also plays on arrival here |
| P11b.6 | Screenshot plates on case pages | done | `case/CasePlates.tsx`: own ink scene "Sheet 03 — Plates" between System and Notes (Notes → Sheet 04 when plates exist); 16:10 hairline frame, corner ticks, SVG hatch placeholder (role=img), next/image path for real images. Validated 2026-10-09 (all 8 criteria, see phase11b.md) |

### Phase 12 — Responsive & a11y
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P12.1 | Breakpoint audit | todo | |
| P12.2 | Touch audit | todo | |
| P12.3 | Keyboard + screen reader | todo | |
| P12.4 | Contrast audit | todo | |
| P12.5 | Reduced-motion walkthrough | todo | |
| P12.6 | Fix list | todo | |

### Phase 13 — Production
| ID | Subtask | Status | Notes |
|---|---|---|---|
| P13.1 | Performance traces | todo | |
| P13.2 | Bundle audit | todo | |
| P13.3 | Images + fonts | todo | |
| P13.4 | Metadata, OG, sitemap, JSON-LD | todo | |
| P13.5 | Error + 404 | todo | |
| P13.6 | Production checklist | todo | |
| P13.7 | Final ban review | todo | |

## Blockers

- None.

## Decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-08 | Concept "Build Sheet" with Signal Trace | Communicates "builds systems"; distinct from reference sites |
| 2026-10-08 | Fonts: Anybody / Newsreader / Martian Mono (default) | Free, variable; width axis carries the concept. Owner may swap in paid faces — change only in Phase 2 |
| 2026-10-08 | Ink base surface with paper scenes (default) | Owner did not choose; reversible via tokens |
| 2026-10-08 | Accent: acid lime `#C6F432`, signal-only | Brief asks for acid-lime accent; used as signal, not decoration |
| 2026-10-08 | Use `motion` package (`motion/react`) for Framer Motion | Framer Motion's current package name |
| 2026-10-08 | Signature copy: "Daddy's Home." / "Call me, Baby — for your new website." | Owner request; stored in `profile.ts` `copy` with literal types |
| 2026-10-08 | Work index order: SpeechPath, ZingDesk, Academic ERP, Laptop Sentinel, IAM (in progress) | Flagship systems first; side project and work-in-progress last |
| 2026-10-08 | Phone number not published on the site | Privacy default; resume PDF still contains it (owner warned) |
| 2026-10-08 | Added `ai` capability category; `Project` gains `status`, `repo`, `live` | Needed by owner content |
| 2026-10-08 | Name "Mohamed Faiz"; CGPA hidden; IAM shown as in progress; ERP has no year/link | Owner answers |
| 2026-10-08 | SpeechPath credited as frontend in a team of 2; ZingDesk solo; diagrams mark `owned` nodes | Honest attribution on team projects |
| 2026-10-08 | Multimeta: only "works on Faczonline (verified-facts social app) and a women's SOS app" | Owner disclosure limit |
| 2026-10-08 | `Project.year` optional; added `team`; `ArchNode.owned` | Needed by owner answers |
| 2026-10-08 | Added `design.md`; colours canonical in hex; added `signal-deep #3F5C00` and `fault-deep #B32D15`; muted mix is 72% on signal | Contrast check: lime on paper 1.07:1, fault on paper 2.77:1, muted on signal 4.33:1 all failed |
| 2026-10-08 | Root layout exports `ensureStatic = 'navigation'`; `/work/[slug]` uses `dynamicParams = false` | Whole site must stay static (P0.5 finding) |
| 2026-10-08 | One subagent per phase | Owner instruction |
| 2026-10-08 | Added `client-only` to package.json dependencies (main session, Phase 5 review) | gsap.ts/lenis.ts import it; it was only resolvable transitively via Next, which is fragile |
| 2026-10-08 | IAM role "Solo build" confirmed; Laptop Sentinel notes section kept; ERP keeps its two sections plus the owner's own "The problem" / "What it does" text | Owner answers after Phase 7 |
| 2026-10-08 | External (outside-service) nodes are never `owned`; enforced by `validate-content.ts` | "Built by me" must only mark what the owner built |
| 2026-10-08 | BOM has no version/Spec column | Owner decision: no versions to show |
| 2026-10-08 | Home page: footer folded into the Contact title block (P10.6); root Footer stays on other routes | Owner decision — signal Contact stays the last thing on the home page |
| 2026-10-08 | Mono font preload deferred to Phase 13 (P13.3) | Owner decision; CLS 0.0027 at worst, weigh against LCP there |
| 2026-10-08 | Brief's "post-production artist" hero line treated as a paste mismatch | Subject is a full-stack engineer; hero uses compile/build language instead |
| 2026-10-08 | Tailwind default namespaces cleared: `--color-*`, `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--text-shadow-*`, `--blur-*`, `--radius-*`, `--font-*`, `--ease-*`, `--text-*`, `--spacing-*` (incl. the numeric multiplier) | Enforces "tokens only": `p-5` = `--space-5` (24px), no `shadow-*`, `red-500`, `rounded-lg`, `p-7.5`. Unknown numeric spacing classes now generate nothing |
| 2026-10-08 | `font-display` / `font-text` / `font-mono` are `@utility` rules, not `@theme --font-*` keys | next/font owns `--font-display/-text/-mono` on `<html>`; a theme key of the same name would self-reference. Utilities also carry `"wdth" var(--wdth)` (registered `@property`), optical sizing, and `tabular-nums` |
| 2026-10-08 | `[data-surface]` also sets `background-color: var(--bg); color: var(--fg)` and per-surface `color-scheme` | A nested surface paints itself without extra classes; form controls/scrollbars match the surface |
| 2026-10-08 | Extra tokens/utilities: `--dur-cut 0ms`, `--measure-lede 48ch`, `--strip-h`, `--dock-h`, `--touch-min`; Tailwind `text-error` (= `--fault-c`), `max-w-measure/lede`, `py-section`, `px-margin`, `gap-gutter`, `size-touch`, `h-strip`, `h-dock`, `z-trace…z-overlay`, `border-hair/active`, `col-content/full` | design.md §3.1/§5 values given a home; spec P2.3–P2.6 updated |
| 2026-10-08 | `@source not` for `implementation plan/`, `.agents/`, `.claude/` | Tailwind was scanning the docs and emitting stray classes (`ring`, `bg-gradient-to-br`, `uppercase`…) |
| 2026-10-08 | Grid/Spec responsive key `md` = the 8-column tier, emitted with Tailwind `sm:` (≥640px), not Tailwind `md:` (768px) | Column count changes at 640/1024 (design.md §5); spans must switch with it. Tailwind breakpoints left untouched |
| 2026-10-08 | `Grid.tsx` also exports `GridCell` (leaf placement); span = `grid-column-end: span N` (`col-end-[span_N]`), start = `col-start-N` | A Grid is itself a grid, so leaves need a non-grid placer; avoiding the `grid-column` shorthand stops a span at one tier from resetting a start set at another |
| 2026-10-08 | `Spec` uses its own `repeat(k, 1fr)` tracks with `--gutter`, not `subgrid` | k equal tracks with the page gutter land exactly on the page column lines whenever k divides --cols (verified 768/1280/1600), and still work inside padded/raised containers where a subgrid can't align |
| 2026-10-08 | Polymorphic props use `ComponentPropsWithRef` (helper `src/lib/polymorphic.ts`) instead of `ComponentPropsWithoutRef` | React 19 passes `ref` as a prop; lets Phase 5–6 client code attach refs to these server primitives |
| 2026-10-08 | `Container` places direct children with `*:col-content` / `*:col-full` (`bleed`) | Spec default; the variant outranks child classes, so mixing content and bleed children means two Containers |
| 2026-10-08 | `Scene` adds optional `labelledBy` + exported `sceneTitleId(id)` (`${id}-title`) and `position: relative`; `Text` `tone` omitted = inherit, `signal` = `--accent` | aria-labelledby needs a heading id contract; relative anchors the Phase 10 trace/vias; accent is the surface-correct signal (design.md §2.2) |
| 2026-10-08 | `next dev` appends a Next agent-rules block to AGENTS.md; reverted with `git checkout` after validation | Owner instruction: don't touch AGENTS.md. Future phases running `next dev` will see the same diff |
| 2026-10-08 | New surface tokens `--wipe` / `--on-wipe` (Tailwind `bg-wipe`, `text-on-wipe`): ink = signal / on-signal, paper = signal-deep / paper, signal = ink / signal; `--control-lg: 56px` (`min-h-control-lg`) | design.md §6 surface-specific hover fills and the lg button height needed a token home |
| 2026-10-08 | Button label colour changes as a cut (`--dur-cut`, delayed `--dur-fast` = wipe midpoint; no delay under reduced motion); pressed `translateY(1px)` is a cut while `:active` | Keeps "only transform/opacity animate"; no 80ms token exists |
| 2026-10-08 | Link variants `draw` / `inline` / `nav` / `plain`; `inline` uses `text-decoration` (1px → 2px as a cut) instead of a pseudo underline | A pseudo-element underline breaks on links that wrap across lines; inline links are exempt from 44px (WCAG 2.5.8) |
| 2026-10-08 | External ↗ is an aria-hidden text glyph joined with U+202F, not an SVG icon | Chrome allows a line break before an inline SVG, leaving the ↗ alone on the next line |
| 2026-10-08 | Link and Button share the named group `group/control`; never use an unnamed `group` inside them | `/system`'s `<main class="group">` would trigger unnamed `group-hover` everywhere; RollText needs one group name for both parents |
| 2026-10-08 | No `sr-only` added to globals.css | Tailwind v4 ships `sr-only` as a core utility (verified in the build CSS) |
| 2026-10-08 | TitleBlock: full hairline box per cell pulled up/left by one hairline (container pads one hairline) instead of top/left + right/bottom borders | A row left short by a spanning cell left an open edge at 360px |
| 2026-10-08 | CopyButton failure text sits beside the button (in `text-error`) inside the live region; success text is sr-only | `--fault` on the paper-coloured solid fill would fail contrast; the button label already shows "Copied" |
| 2026-10-08 | `gsap.ts` / `lenis.ts` use `import "client-only"` instead of a `"use client"` directive | `"use client"` would turn a Server Component import into a silent client-reference boundary; `client-only` makes it a build error (verified). The modules are imported only by client components |
| 2026-10-08 | `gsap.ts` also exports `DrawSVGPlugin`, `requestRefresh()` and `useRefreshOnShow()` | Phase 6 Trace needs DrawSVG helpers; <Activity> re-shows routes without remounting, so ScrollTrigger owners need a coalesced refresh on show |
| 2026-10-08 | Lenis is a module singleton (`getLenis`/`subscribeLenis`) surfaced through `LenisContext`/`useLenis()`; it is mounted inside the `gsap.matchMedia()` no-preference branch, with `stopInertiaOnNavigate: true` | One source of truth for reduced motion (live toggling creates/destroys Lenis); non-React callers (anchor handler) can read it |
| 2026-10-08 | Anchor handler runs in the capture phase on `document`, defers the scroll one frame, pushes the hash and focuses targets that have `tabindex`; reduced motion → `scrollIntoView` | Runs before next/link (which would otherwise jump natively); the frame delay lets a link's onClick (menu closing + `lenis.start()`) run first; skip-link focus |
| 2026-10-08 | `globals.css` base: `[id] { scroll-margin-top: var(--strip-h) }`; Lenis offset = target scroll-margin − `--strip-h` | Gives the strip offset without JS and under reduced motion; Lenis already subtracts scroll-margin, so the offset only tops it up (no double count, verified 44px both modes) |
| 2026-10-08 | Reduced-motion validation uses CDP `Emulation.setEmulatedMedia` in a separate headless Chrome | The Chrome DevTools MCP `emulate` tool has no media-feature option; this is the same emulation DevTools → Rendering uses |
| 2026-10-08 | Split text: aria-hidden visual copy (SplitText `aria: "none"`) + `sr-only` twin; SplitReveal/ScrubText take a plain string | SplitText's `aria-label` is ignored on generic `<p>`/`<div>`; identical accessible text before JS, after split and re-split |
| 2026-10-08 | Added `staggersS` (lines 0.08 / words 0.04 / chars 0.025) to `tokens.ts` | Staggers had no token; chars value is the hero's (P9.3) |
| 2026-10-08 | Trace colour per surface = 3 copies of the route in `<g data-surface>` clipped to scenes of that surface, one DrawSVG tween | `var(--accent)` resolves per copy (lime/signal-deep/on-signal); no hand-split segments to keep in sync |
| 2026-10-08 | Trace routing = margin rails + seam crossings in scene top padding; vias not chamfered; `data-via` = `left` or `right` rail override; draw schedule tracks the viewport centre (crossings 0.25px scroll per px) as the ease of one tween | Never crosses running text; linear-by-length drawing lagged the viewport by thousands of px on /system; 60 per-segment tweens cost ~60ms lazy init |
| 2026-10-08 | Pin uses `pinType: "transform"`; row layout only via `data-pinned` set from the effect | Fixed pinning scored CLS 0.24 + 0.21 per fixed↔static switch (draw was continuous); readable column without JS / reduced motion |
| 2026-10-08 | HoverPreview lag `--dur-base` (0.32s) instead of 0.4s; parent owns `activeId`; `preloadPreview(item)` export; panel `z-chrome` | No 400ms token; preloading needs the row's hover-intent, which the parent owns |
| 2026-10-08 | Crosshair demo-mounted on `/system`; cursor hidden by `html.has-crosshair` (unlayered CSS, `(pointer: fine)`); layer copies `data-surface` under the pointer | Mounting is P8.6; unlayered so it beats control `cursor-*` utilities |
| 2026-10-08 | `--margin-x` registered with `@property <length>`; `readPxToken` only reads px (throws otherwise, no layout probe) | Resolved px without a write+read probe (23ms forced layout per Trace rebuild) |
| 2026-10-08 | Dimension strokes without `vector-effect`; lines/label `--fg-muted`, label beside the line | anime.js calls getCTM() every frame for non-scaling-stroke paths (55ms forced layout); dimensions are annotation, not signal |
| 2026-10-08 | New helpers `src/lib/merge-refs.ts`, `src/lib/motion/css-tokens.ts`, `src/lib/motion/will-change.ts`; demo images `public/system/preview-{1,2,3}.webp` | Shared by several components; HoverPreview needs real images on `/system` |
| 2026-10-08 | ScrubText sets no will-change | Opacity on ~30 inline words; layer promotion per word costs more than it saves |
| 2026-10-08 | Content validation runs with Node 24's built-in type stripping (`node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/validate-content.ts`, script `validate:content`, `lint` = `eslint && npm run validate:content`); tsconfig gains `allowImportingTsExtensions: true`; `src/content` files import each other type-only | No new package (no tsx/ts-node). Node needs explicit `.ts` paths and can't resolve `@/`; the flag only silences the "no `type` in package.json" reparse warning, adding `"type": "module"` would change how every config file loads |
| 2026-10-08 | Edge → node references are checked by the script, not the type system | Spec P7.3 asked for both; ids per project as literal unions would need a generic per project for little gain. Spec edited |
| 2026-10-08 | `Profile.copy.buildLog: string[]` added; `statement` stays top-level | Phase 9 spec reads `copy.buildLog`; spec P7.1 type edited |
| 2026-10-08 | Selectors beyond the spec: `sortedProjects()` (file order), `hasCasePage()`, `getCapability()`, `revisions()`, `profile` re-export; `capabilityUsage` includes in-progress projects | Phases 10–11 need names for stack ids, the revision list and one rule for "has a case page"; express/zod/jwt/pino/nodejs are used only by IAM, so excluding it would leave their "Used in" empty |
| 2026-10-08 | IAM backend `role: "Solo build"` (dossier gives no role; `role` is required) | Same as the other project on the owner's own GitHub. **Owner to confirm** |
| 2026-10-08 | Laptop Sentinel `team: "Solo"`; its body is one "Notes from the build" section built from the dossier's page notes; its diagram cols/rows and node kinds chosen by the agent from the dossier topology | Dossier says solo and gives topology + notes but no layout or sections |
| 2026-10-08 | Academic ERP body: two short sections restating only the summary, the metric and the diagram edges | Dossier has no prose for it; a case page with no body would be empty. **Owner may want to supply copy** |
| 2026-10-08 | Root layout owns `<header>`/`<main id="content">`/`<footer>` and mounts the chrome; pages render no `<main>` (`/system` wraps in a div, `/` returns null) | <Activity> keeps hidden routes mounted, so per-page `<main id>` would duplicate; chrome state must outlive routes |
| 2026-10-08 | `--strip-h` is `0px` below 1024px, `44px` from 1024px | Strip is desktop-only; anchor offset and `[id]` scroll-margin read it (Phase 5 note) |
| 2026-10-08 | Strip cells reuse TitleBlock's hairline treatment, not the component | TitleBlock's stacked label/value cell is taller than `--strip-h` (44px) |
| 2026-10-08 | Dock is a full-width bar flush with the bottom edge (top hairline), not inset/floating; root layout exports `viewport.viewportFit = "cover"` | Spec asks for `padding-bottom: env(safe-area-inset-bottom)`, which only makes sense if the bar's fill runs under the home indicator; env() is 0 without `cover` |
| 2026-10-08 | Footer = section links + name (plain HTML), bottom padding = dock + safe area below 1024px | Spec names a `<footer>` landmark but no content; the Menu button needs JS, so phones without JS reach sections through the footer. Contact title block (P10.6) stays page content. **Owner may want a different footer** |
| 2026-10-08 | Nav hrefs: `#id` on `/`, `/#id` elsewhere; strip name → `#top` on `/`, `/` elsewhere | The anchor handler only takes bare hashes; from other pages the sections are on home |
| 2026-10-08 | Menu also inerts `<header>` and `<footer>`, closes on route change and at ≥1024px, clips page scroll with `html.menu-open { overflow: clip }` (same as Lenis's stop); reduced motion mounts with `initial={false}` | Full modal behaviour; native scroll under reduced motion; a 0-duration Motion tween still waited a frame |
| 2026-10-08 | Menu focus moves (open and close) run in a `queueMicrotask` after the layout effect | React's commit restores the element focused before the commit after mutation effects, undoing a focus call made in a layout-effect cleanup |
| 2026-10-08 | Dock hide threshold ±300px/s (named constant) | Velocity-based per spec; no token exists for it |
| 2026-10-08 | `/system` grid toggle and overlay moved from z-overlay to z-chrome; toggle sits below the strip (`top-strip mt-3`) | They painted over the menu dialog and the strip's nav |
| 2026-10-08 | Hero line from 640px: `font-size: min(var(--text-mega), 100cqi / 7.7)` (container = the line's wrapper) | "Daddy's Home." sets 7.62em; at mega it overflowed 1280 (1370px in 1163px). Spec P9.1 keeps one line spanning the content columns |
| 2026-10-08 | New token `--leading-hero: 0.9` (`leading-hero`); hero line sets `font-kerning: none` | Phase 2 descender note (global 0.82 unchanged); split chars can't kern, so outline, split and reverted fill share advances |
| 2026-10-08 | Fill reveal `yPercent 125 → 0` (spec said 100); char masks bleed 0.1em (`--hero-mask-bleed`) | Masks at the 0.9em line box clipped ascenders (0.086em) and the "y" (0.06em); with the bleed, 100 left the glyph tops visible |
| 2026-10-08 | Pre-hydration guard: `HeroGuard` inline script (Next "preventing flash" pattern, `text/plain` on the client) sets `data-hero-guard="first|return"` on the hero section; CSS shows the outline, hides fill (+ log on first visit); 3s CSS fail-safe; section `suppressHydrationWarning` | Phase 6 note: mount reveals flashed the SSR text. No-JS and reduced motion never get the guard; the outline paints at FCP so LCP stays at first paint |
| 2026-10-08 | Split reverted when filled, before the width cuts | Cutting `--wdth` on split chars moves every char box (layout shift); one text node keeps its start point |
| 2026-10-08 | Outline words are inline spans (not inline-block) | Inline-block words were separate LCP candidates; on mobile the later fill became a larger candidate (LCP 1223ms → 325ms) |
| 2026-10-08 | `Trace` gains `armed?: boolean` (default true; dependency, rebuilds once) and `components/home/TracedScenes.tsx` (wrapper + `useArmTrace()`); the hero arms it one rAF after the last cut | Phase 6 note: no start API. Arming in the cut's tick forced a dirty layout inside DrawSVG's length reads |
| 2026-10-08 | Positioning sentence = `profile.copy.availability`; secondary action "Get in touch" → `#contact` | No positioning field exists in content; `#work`/`#contact` scenes are Phase 10 (the chrome already links them) |
| 2026-10-08 | Statement: `text-h3` size with `font-(--text-lede--font-weight)` (500), sr-only `h2` "Notes" as the scene label | design.md: serif lede→h3 size, no bold paragraphs, no eyebrow labels |
| 2026-10-08 | Mobile log keeps lines 1 + last two; return visit fills at `--dur-base` | "ready." must stay (it starts the fill); 0.64s fill + cuts would exceed 0.8s |
| 2026-10-09 | Work index titles wrap (balanced `h1` display) and do not use WidthFlex | WidthFlex is one nowrap line by design; measured "Smart Academic ERP & Analytics Dashboard" at 2250px on a 1177px line (1280) and "Laptop Sentinel" at 370px on 328px (360). Hover feedback is the open row (raised fill) and the other titles dimming. **Owner may supply short index names** |
| 2026-10-09 | Contact email: WidthFlex hover kept, font size capped to fit the line: `min(h2, 100cqi / (chars × em-per-char))`, em-per-char 0.9 with hover (measured 0.845 at wdth 130), 0.68 without (measured 0.636 at 100); `--email-chars` passed from data | At `h2` the address is 541px on a 328px line (360) and 1189px on 1177px when stretched (1280). Result: 52px at 1280, 19–21px on phones |
| 2026-10-09 | Contact lines from 640px: size capped so "Call me, Baby" stays on one line (`100cqi / 7.05`; measured 6.94em); both lines use `leading-hero` (0.9) | Hero precedent for a locked literal. At mega the first line broke into "Call me," / "Baby" at 1280; at 0.82 the "y" of Baby met "for" |
| 2026-10-09 | Contact scene sets `--fg-muted: var(--fg)` | Criterion "on-signal text ≥ 7:1"; signal muted mix is 5.9:1. Every text node measured 13.23:1 |
| 2026-10-09 | Footer fold: on `/` the root `Footer` returns null; the Contact title block is a `<footer>` (TitleBlock + `FooterLinks`, exported from `chrome/Footer.tsx`) and the scene pads by dock + safe area below 1024px | Owner decision. The folded `<footer>` sits inside `<main>`/the section, so `/` has no `contentinfo` landmark; other routes keep the root footer |
| 2026-10-09 | Build year is a build-time constant: `next.config.ts` `env.BUILD_YEAR` → `src/lib/build-year.ts` `BUILD_YEAR` (throws if unset) | A `'use cache'` + `cacheLife("max")` read made `/` revalidate every 30 days (build output column); the stamp is the build's year |
| 2026-10-09 | BOM Qty = build year − `since` + 1 (inclusive) | A tool first used this year reads 1, not 0 |
| 2026-10-09 | Work row "Scale" = the project's first metric under its own label; none when a project has no metrics | No scale field exists; never invent one |
| 2026-10-09 | No-JS work rows: each row prints its panel in a `<noscript>` (server-rendered) | Disclosure panels need JS to open; no layout shift for JS users |
| 2026-10-09 | Revisions: one via for the scene (left margin), not one per revision; cards are `<article>`s with an `h3` "Rev. X" | Phase 6/9 rule: one via per scene, never inside the moving Pin track |
| 2026-10-09 | Trace scroll ends wrapped in `clamp()` (desktop draw and mobile leads) | The stamp via sits 33px below the viewport centre at full scroll (1280×800), so the draw never completed |
| 2026-10-09 | `capabilitiesByCategory()` returns `CapabilityEntry` (`Capability & { id: CapabilityId }`), built from the literal data | Avoids an `as CapabilityId` cast when passing ids to `capabilityUsage` |
| 2026-10-09 | `src/types/css-custom-properties.d.ts`: React `CSSProperties` accepts `--*` keys | Typed inline custom properties (`--email-chars`) without a cast |
| 2026-10-09 | Work rows call `requestRefresh()` when the open row changes | Rows below move every scroll-driven trigger (pin, rule draws, sheet tracker), also under reduced motion where the Trace does not refresh |
| 2026-10-09 | Resume link uses `Link external` (new tab, ↗) | It is a PDF in /public; next/link would try a client route |
| 2026-10-09 | Case pages: no `export const dynamicParams = false`; the page calls `notFound()` for unknown or in-progress slugs | Next 16.4 fails the build with `dynamicParams` under `cacheComponents` (docs: migrating-to-cache-components). Unknown slugs still return 404 |
| 2026-10-09 | Diagram `<svg role="group">` with `<title>`/`<desc>` via aria-labelledby/-describedby, not `role="img"` | An img role makes its children presentational, which would hide the focusable node buttons (spec P11.4/P11.5 conflict) |
| 2026-10-09 | `worker` nodes = rect with a double left rule | Data uses `worker`; spec listed no shape (owner decision) |
| 2026-10-09 | Work-row panel shows `ArchitectureDiagram variant="thumb"` when a case project has no cover | Phase 10 left the preview fallback to Phase 11 (owner decision) |
| 2026-10-09 | Route wipe uses Motion `animate()` on an always-rendered panel, started in a layout effect, instead of `AnimatePresence` | Next prerenders prefetched routes hidden under `<Activity>`, so mount ≠ arrival; only the layout effect (runs on show) knows. A state-driven AnimatePresence would paint the page for one frame before the cover |
| 2026-10-09 | Wipe plays on arrival at `/work/*` only (index → case, case → case); case → index has none | A home template would remount the home page under its Activity cache; the spec scopes the template to `/work/*` |
| 2026-10-09 | `npm test` = `node --test` over `src/**/*.test.ts` | Spec asks for layout-engine unit tests with `node:test`; type stripping, no new package |
| 2026-10-09 | Project order SpeechPath, Academic ERP, ZingDesk, Laptop Sentinel, IAM (supersedes 2026-10-08 order); home shows the first three | Owner order (phase11b.md P11b.1); order is the only control, no featured flag |
| 2026-10-09 | Gauge readout links stay in the accessibility tree and the tab order; the visually hidden list keeps its links for screen readers but takes them out of the tab order (tabindex −1) while the gauge is live | Spec wants real, focusable readout links and the list as the screen-reader tree. Focusable links inside aria-hidden would fail, and Tab must not land on invisible list links. So the tree is the list plus the needle tool's readout (one group of 0–3 links). **Owner may prefer otherwise** |
| 2026-10-09 | Plates are their own ink scene "Sheet 03 — Plates" (id `plates`) between System and Notes; Notes becomes "Sheet 04" when a project has plates | Spec places them after the diagram and before the notes but names no scene; a sheet of its own keeps the strip label honest. Paper would put two paper scenes in a row |
| 2026-10-09 | Face label = the face's categories ("Language · Backend · Data · Infra"); gauge eyebrow = "Services & toolkit" + "0N / 04" | Spec asks for "a small mono label" without naming it; categories say something true |
| 2026-10-09 | "Used in" shows `indexTitle ?? title` ("Academic ERP") in both layers | The readout has half a band of width; the BOM used the full title |
| 2026-10-09 | `capabilitiesByCategory()` removed; `toolkit()`, `homeProjects()`, `previewPlate()`, `caseHref()` added; every case link goes through `caseHref()` | One face mapping; one place `/work/` paths are made |
| 2026-10-09 | `WorkRows` takes `headingLevel` (h3 home, h2 on `/work`); `/work` scene id `top` | `/work` has an h1 page heading, so rows step down one level |
| 2026-10-09 | `/work` is under `app/work/template.tsx`, so the signal wipe also plays on arrival at `/work` | Same template as case pages; no extra code. Remove by moving the archive outside the template if the owner dislikes it |
| 2026-10-09 | Placeholder hatch is an SVG `<pattern>` (45°, 12px, `--fg-muted`), not a CSS repeating gradient | Gradients are banned (design.md §1) |
| 2026-10-09 | design.md §7 "Bill of materials" replaced by "Services & toolkit" | The table is gone (owner request, phase11b.md); design.md must describe what ships |
| 2026-10-10 | Gauge `--gauge-col`/`--gauge-bar` set as arbitrary properties on the band, not a global `[data-gauge-band]` rule | Turbopack dev CSS dropped the vars-only global rule (prod kept it), collapsing every column to the bar width in `next dev` |

## Notes for agents

- **Visual source of truth: `implementation plan/design.md`** (principles, palette with measured contrast, type, elevation, spacing, buttons, per-feature guidance). Read it before Phases 2–11.

- AGENTS.md: this Next.js (16.4) has breaking changes — read `node_modules/next/dist/docs/` before coding.
- `next.config.ts` already sets `cacheComponents: true` and `partialPrefetching: true`; keep them.
- Motion skills available in `.claude/skills/`: gsap-core, gsap-react, gsap-scrolltrigger,
  gsap-performance, gsap-plugins, gsap-timeline, gsap-utils, gsap-frameworks, framer-motion-animator, animejs.
- Chrome DevTools MCP is available for visual verification and performance traces.
### Carry-forward notes from Phase 2 review
- **Hero (Phase 9):** at `text-mega` line-height 0.82 the "y" descender of "Daddy's" collides with
  "Home." on the next line. Fix in P9.1 by giving the two-line hero its own line-height (≈0.9) or by
  adjusting line spacing, not by changing the global token.
- **BOM (Phase 10):** `--fg-muted` on the paper raised fill (`#E0DED5`) is only 4.55:1. In alternating
  rows use `--fg` for cell text; reserve muted for non-essential labels.
- Tailwind's default palette and spacing scale are cleared: only token utilities exist
  (`p-5` = 24px, no `shadow-*`, no `rounded-lg`, no `red-500`). See the Phase 2 report row in the
  decisions log for the full class list.

### Carry-forward notes from Phase 3
- Primitives: `@/components/layout/{Container,Grid,Scene,Stack,Cluster,Rule}`, `@/components/type/{Text,Spec}`. All server components, `className` + native props forwarded, polymorphic `as` (Container/Grid/GridCell/Stack/Cluster/Text).
- Scene headings must carry `id={sceneTitleId(sceneId)}` (or pass `labelledBy`).
- Nested grids: a Grid inside a Grid with a `span` must set `subgrid` to stay on page lines. Keep start + span ≤ the tier's column count (4/8/12) or implicit tracks overflow.
- Responsive tier keys are `base`/`md`/`lg` = 4/8/12 columns; `md` emits `sm:` classes (≥640px).
- `cn` does not merge Tailwind conflicts — don't pass a className that fights a primitive's own class (e.g. `display`, `gap`); wrap instead.
- `next dev` rewrites AGENTS.md; revert it (`git checkout -- AGENTS.md`) before finishing.
- Add Phase 4 demos to `src/app/system/page.tsx` as new `Scene`s, keeping the ink/paper alternation (signal last).

### Carry-forward notes from Phase 4
- Primitives: `@/components/ui/{Link,RollText,Button,CopyButton,TitleBlock,icons}`. Only `CopyButton` is a client component; the rest are server components that client code can render.
- Interactive parents use the named group `group/control` (Link, Button). New hover-driven children must use `group-hover/control:` + `group-focus-visible/control:`, not unnamed `group-*`. Root-level hover styles use plain `hover:`/`focus-visible:` (a group variant never matches the group element itself).
- Tailwind v4 `scale-*`/`translate-*` set the individual `scale`/`translate` properties; `transition-transform` covers `transform, translate, scale, rotate`. GSAP (Phase 5–6) writes `transform`; don't let GSAP and these utilities fight on the same element.
- Surface hover colours: `bg-wipe` / `text-on-wipe`. Errors: `text-error`.
- Transient UI resets in a `useLayoutEffect` cleanup (pattern in `CopyButton.tsx`).
- If a `globals.css` change does not show in `next dev`, the Turbopack dev cache is stale: stop the server, `rm -rf .next/dev`, restart.
- Don't `pkill -f "next dev"` from a Bash call: it matches and kills the calling shell. Kill by the PID listening on :3000.

### Carry-forward notes from Phase 5
- Import GSAP only from `@/lib/motion/gsap` (`gsap`, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `useGSAP`, `requestRefresh`, `useRefreshOnShow`). It is client-only (build error from a Server Component). Motion from `motion/react`; Lenis via `useLenis()` from `@/lib/motion/lenis` (null under reduced motion — always null-check).
- Every component that creates ScrollTriggers calls `useRefreshOnShow()` once (verified: hidden routes revert triggers, show recreates them, one coalesced refresh realigns). Use `useGSAP(fn, { scope })`; cleanup returned trigger count to baseline in testing.
- Reduced motion: `gsap.matchMedia()` inside useGSAP, `useReducedMotion()` (false on server/hydration — render the final readable state first, animate from effects), `prefersReducedMotion()` for anime.js. CSS can key off `html.motion-ok` / `html.motion-reduced` (added after hydration, so never rely on them for first paint) and Lenis's own `html.lenis` class.
- SplitText: `document.fonts.ready` → provider refreshes ScrollTrigger; split with `autoSplit: true` + `onSplit`, and avoid `text-wrap: balance` on split targets (globals.css balances h1–h6 — override on the split element).
- GSAP `defaults`: ease `expo.out`, duration 0.64 (tokens). Lenis is on `gsap.ticker`; never start another rAF loop for scroll.
- Phase 8: the menu must call `lenis.stop()` while open and `lenis.start()` synchronously in its link onClick (the anchor scroll runs one frame later and is ignored while Lenis is stopped). Skip-link target needs `tabIndex={-1}` to receive focus. If the strip is desktop-only, redefine `--strip-h` (e.g. 0 below 1024px) — the anchor offset and `[id]` scroll-margin both read it.
- Clock: `useLocalTime("Asia/Kolkata")` renders `--:--` on the server; pointer: `usePointerFine()` (false until hydrated).
- Dev CSS cache went stale again after a globals.css edit (`rm -rf .next/dev` + restart fixed it).

### Carry-forward notes from Phase 6
- Components (all client, `@/components/motion/*`): `SplitReveal`, `ScrubText`, `Trace`, `RuleDraw`, `WidthFlex` (+ `widthAxis`), `Pin`, `Magnetic`, `Crosshair` (+ `CROSSHAIR_CLASS`), `HoverPreview` (+ `preloadPreview`, `PreviewImage`), `Dimension`; pure `trace-path.ts`. All render final readable HTML on the server and animate from effects.
- **SplitReveal / ScrubText** take `children: string` only (rendered twice: visual + sr-only). For the hero (P9.3) chars: `split="chars"`, `trigger="mount"`, `delay`; `mega` line-height 0.82 may clip glyph tops inside line masks — check in P9.1 and give the hero line its own line-height there. Mount reveals briefly show SSR text before hydration hides it (no-JS safety); a pre-hydration guard, if wanted, belongs to P9.
- **Trace**: put `<Trace />` as a child of one positioned wrapper around all home scenes; each scene gets exactly one `[data-via]` (an empty span is fine; `data-via="left|right"` picks the rail). Vias are measured where they are at rebuild time — don't put a via inside the moving Pin track (put it on the pinned section). Scenes must be `[data-sheet][data-surface]` (Scene does this) for the colour clip. Phase 9's "trace starts after the hero" can gate on scroll; the Trace has no play API yet.
- **WidthFlex**: block-level, nowrap; `mode="compile"` exposes the element through `ref` — animate `"--wdth"` with `gsap.set` cuts (`widthAxis.compressed/stretched/rest`) then remount/switch `mode` to `"velocity"` (mode is a dependency, the hook reverts and rebuilds).
- **Dimension**: needs a positioned parent shared with the target; drive `play` from the hero timeline (`onStart` → setState), `play={false}` retracts.
- **HoverPreview** (P10.3): parent keeps `activeId` (120ms hover-intent), calls `preloadPreview(item)` on pointerenter, resets `activeId` in a layout-effect cleanup / `onNavigate`.
- **Pin** (P10.5): children are the track items; give them widths via `trackClassName` using `data-pinned:` variants (e.g. `data-pinned:*:w-lede *:shrink-0`). Starts at `top top` — if the strip is fixed on desktop, P8/P10 may need a `--strip-h` offset.
- **Crosshair** (P8.6): mount once in the provider tree and delete the `<Crosshair />` from `src/app/system/page.tsx`.
- **Magnetic** (P10.6): wrap only the main contact action.
- Tokens read at runtime must be px literals or registered `<length>` properties (`readPxToken` throws otherwise).
- Validation tip: CDP `emulate` with only `cpuThrottlingRate` resets the viewport override — pass `viewport` in the same call. After HMR, reload with `ignoreCache`.

### Carry-forward notes from Phase 7
- Import content only from `@/content` (`src/content/index.ts`); never from `@/content/projects` etc. Types are re-exported there too.
- `profile` — name, role, location, timeZone, email, links (GitHub/LinkedIn/Resume), statement; `profile.copy.heroLine` / `contactLines` (literal types, a typo fails tsc), `buildLog: string[]`, `availability`.
- `sortedProjects()` — work-index order, includes IAM (`status: "in-progress"`, row only).
- `hasCasePage(p)` — false for in-progress; use it to decide row link / "On the drawing board" / BOM "Used in" links.
- `projectSlugs()` — `/work/[slug]` static params (4 slugs, no IAM). `getProject(slug)` — `Project | undefined`.
- `getCapability(id)` — name/category/since for a stack id. `capabilityUsage(id)` — projects using it (includes IAM, link only `hasCasePage`).
- `capabilitiesByCategory()` — `{ category, capabilities }[]` in BOM order language → tooling.
- `revisions()` — Rev C → B → A. `end` may be `"present"`.
- Project fields that may be absent: `year` (ERP), `team` (ERP, IAM), `repo` (ERP), `live` (only ZingDesk), `cover` (none yet), `links` (none). IAM has empty metrics/architecture/body. Laptop Sentinel has no metrics. No capability has a `version` (BOM Spec column will be empty).
- Diagram `owned`: SpeechPath only `browser`; all other diagram nodes owned. Legend "Team of 2" only on SpeechPath.
- New content files must use `import type` between each other (the validation script loads them with Node's type stripping).

### Carry-forward notes from Phase 8
- Pages must **not** render `<main>`: the root layout owns `<main id="content">`, `<header>` and `<footer>`. Return scenes directly (a fragment or a positioned wrapper `div` for the Trace).
- The strip/dock read `Scene`'s `data-sheet` + `data-surface`; only scenes inside `main` that are rendered count. Phase 9/10 sheet labels show verbatim (e.g. "Sheet 03 — Assemblies"). The hero scene id must stay `top` (strip name links to `#top`).
- Nav anchors are `#work`, `#materials`, `#revisions`, `#contact` (`src/components/chrome/nav.ts`); the Phase 10 scene ids must match.
- Desktop strip is fixed 44px over the top of each scene's padding; `--section-y` (≥96px) clears it. A `Pin` that starts at `top top` will have its top 44px under the strip — offset P10.5's pin start by `--strip-h` if content sits there.
- Below 1024px the footer pads by `--dock-h` + safe area so the last content clears the dock; nothing else needs to reserve it.
- Contact (P10.6) is signal and comes last, but the layout `<footer>` (ink, body surface) follows it. Decide in Phase 10 whether the footer should take the signal surface or be folded into the contact title block (owner call; see Decisions log).
- Menu is the only `z-overlay` dialog; anything else fixed at `z-overlay` inside a page paints over it (pages come later in the DOM). Use `z-chrome` or lower in pages.
- Focus moves inside a layout effect are undone by React's post-commit focus restore; defer them (`queueMicrotask`) as `Menu.tsx` does.
- Motion logs a dev-only "Reduced Motion enabled" console warning under reduced motion (from `MotionConfig reducedMotion="user"`); it is not an app error.


### Carry-forward notes from Phase 9
- **Home page shape:** `src/app/page.tsx` renders `<TracedScenes>` (client, `components/home/TracedScenes.tsx`) with the scenes as Server Component children. It is the one positioned wrapper; it renders the single `<Trace armed>` last. Phase 10 adds Work, BOM, Revisions, Contact as further children after `<Statement />`, in page order.
- **Via convention:** exactly one `[data-via]` per scene. Margin vias: an empty `span` `absolute top-section left-0 h-0 w-margin` (or `right-0` + `data-via="right"`) as a direct child of the Scene (see `Statement.tsx`), which lands at the content top in the centre of the margin rail. The hero's via is inside the outline layer, after "Home.".
- **Trace start API:** `Trace armed` (default true). While false under motion it measures and draws nothing; flipping it true rebuilds once and pops reached vias. Only the hero calls `useArmTrace()`; new scenes need nothing. Under reduced motion the trace is finished regardless.
- **Hero hooks other phases may touch:** `data-hero-part` (`line`/`fill`/`outline`/`log`), `data-hero-stage`, `data-hero-guard` (+ CSS in globals.css "P9 — Hero guard"), sessionStorage key `hero-compiled` (`home/hero-session.ts`). Don't add `data-hero-*` elsewhere.
- **Statement scrub** needs page below it: until Phase 10 scenes exist, max scroll inks ≈45%. Re-check full ink (and reverse) in P10.7.
- **CLS:** the hero sequence is 0; the page shows 0.0004–0.0027 from the Martian Mono swap (strip + mono labels; mono `preload: false`). Phase 13 (fonts) should decide on preloading mono or tighter fallback metrics.
- **Mobile trace lead** at the hero via runs up between "Daddy's" and "Home." beside the full stop (touches no glyph at 390). Check in the Phase 12 breakpoint audit.
- Validation tooling: a CDP script in the session scratchpad drove no-JS (`Emulation.setScriptExecutionDisabled`), reduced motion, JS-blocked (`Network.setBlockedURLs`), mid-sequence resize and frame/long-task timing. Clear `sessionStorage` (or use a fresh profile) to see a first visit.


### Carry-forward notes from Phase 10
- **Home shape:** `src/app/page.tsx` = `TracedScenes` > Hero, Statement, WorkIndex, Materials, Revisions, Contact (ids `top`, `statement`, `work`, `materials`, `revisions`, `contact`), one `[data-via]` each, surfaces ink/paper/ink/paper/ink/signal. Contact is last; nothing renders after it on `/` (root `Footer` returns null there).
- **Case links 404 until Phase 11:** "Open the drawing" (`/work/[slug]`) and BOM "Used in" links exist only for `hasCasePage` projects. next/link prefetches them in view, so the console shows 3–4 `404 /work/<slug>?_rsc=…` resource errors today. They should disappear once P11.1 adds the route; re-check. No route was stubbed.
- **Work previews (open question):** no project has a `cover`, so no hover panel or touch image renders. `WorkRows` already passes covers to `HoverPreview` and shows an inline image on touch when a cover exists. The spec's fallback (miniature `ArchitectureDiagram variant="thumb"`) is Phase 11's component; decide in Phase 11 whether to add it to `WorkRowData` (e.g. a `preview: ReactNode` rendered by the server).
- **Panels are server nodes:** `WorkIndex` builds each row's panel (Spec, summary, button) on the server and passes it as `panel: ReactNode`; the same node prints in `<noscript>`.
- **Build year:** `BUILD_YEAR` from `@/lib/build-year` (next.config `env`). Use it for any "current year"; never `new Date()` in a Server Component.
- **Fit caps:** display lines that must stay on one line use a container-query cap in globals.css (`[data-email-fit]`, `[data-contact-lines]`), next to the hero's. A measured em constant is only safe for locked literals; the email cap is per-character from data.
- **Footer:** `FooterLinks({ pathname })` (chrome/Footer.tsx) is the shared plain-HTML nav. Case pages keep the root `<footer>`.
- **Trace:** scroll ends are `clamp()`ed. Any new last via near the page end still completes. 6 pads verified on vias, in order; the desktop route is 13039px at 1280.
- **Contrast on signal:** the Contact scene maps `--fg-muted` to `--fg`. Anything else placed on signal should do the same if the ≥ 7:1 rule applies.
- **Validation harness:** headless Chrome needs `--blink-settings=primaryPointerType=4,primaryHoverType=2,availablePointerTypes=4,availableHoverTypes=2` to report `(hover: hover)`/`(pointer: fine)`; `Emulation.setEmulatedMedia` ignores hover/pointer. `window.scrollTo` fights Lenis, so drive scroll with `mouseWheel` events. `main svg[preserveAspectRatio=none]` is the trace (the hero has other SVGs).
- **BOM at 360:** the column-header row sits inside an `sr-only` thead (1×1px, clipped); it measures 12px past the content edge in `getBoundingClientRect` but is not visible (scrollWidth 360). Not an overflow.

### Carry-forward notes from Phase 11
- **Case pages:** `src/app/work/[slug]/page.tsx` → `components/case/CaseScenes.tsx` (scenes `top`, `drawing`, `notes`; sheets 01–03). Root `<footer>` renders below. Selectors: `nextCaseProject(slug)`.
- **Diagram:** `components/diagram/` — `layout.ts` (pure, `npm test`), server `ArchitectureDiagram` (`variant` full | thumb), client `DiagramStage`. Hooks: `[data-diagram]`, `[data-node]`, `[data-edge]` (+ `data-step`, `data-from/to`, `data-async`), `[data-callout]`; state CSS in globals.css "P11.3–P11.4". No ScrollTriggers (IntersectionObserver).
- **Diagram at narrow widths:** `min-w-[64rem]` inside a labelled, focusable `overflow-x-auto` region (node text ≈ 11px at 360). Phase 12 may prefer a transposed mobile layout; the engine takes any viewBox width.
- **Font metric:** Martian Mono advance = 0.70em (measured), `diagramMetrics.monoAdvance`; label wrapping depends on it.
- **Route wipe:** `motion/RouteWipe.tsx` decides "arrival" in a layout effect, because prefetched routes are prerendered hidden under Activity. Hard loads (document navigation entry path) keep native scroll and get no wipe. A case page re-shown from Activity also wipes.
- **Not verified in a browser:** reduced-motion paths for the draw-in, flow dash and wipe (the DevTools MCP emulate tool has no reduced-motion option). Code paths skip all three; Phase 12 should confirm.
- **Dev CSS cache** went stale again after the globals.css edit (`rm -rf .next/dev` + restart fixed it).

### Carry-forward notes from Phase 11b
- **Toolkit:** `home/Materials.tsx` (server, readable list) wraps its list in `home/ToolkitGauge.tsx` (client). Live = `[data-live]` on the gauge root, set only ≥1024 with motion; hooks `[data-gauge-tool]`, `[data-gauge-readout]`, `[data-toolkit-word]`, `li[data-tool]`, `[data-tool-years]`, `[data-tool-usage]`. Pin length 11.5 viewports at 46 tools.
- **Phase 12 should judge:** the readout-in-tree decision (Decisions log), and keyboard use of the gauge (only the needle tool's links are reachable by Tab while live).
- **Images:** add `image: { src, width, height }` to a plate in `projects.ts`; plate 1 with an image also turns on the work-row hover/touch preview. Home never shows placeholders.
- **Validation tooling:** scrolling with `window.scrollTo` works for the gauge (Lenis follows native scroll); the face changes at the midpoint between two faces' tools.
- The dev server on :3000 was not started by this phase and went away mid-validation; production checks ran on :3111.

### AGENTS.md
`next dev` re-adds a generated block to `AGENTS.md`. Do not revert it with `git checkout`; the file
itself says reverting only re-creates the change. Leave it as `next dev` writes it.

### Next 16.4 differences (from P0.5 docs read, 2026-10-08)
1. **`cacheComponents` + `partialPrefetching` must both stay `true`** (`partialPrefetching` requires
   `cacheComponents`; unset logs a warning). Cache Components requires the Node runtime — never
   export `runtime = 'edge'`.
2. **Routes are hidden, not unmounted (React `<Activity>`).** Up to 3 visited routes stay in the DOM
   with `display: none`; effects run cleanup on hide and re-run on show. Consequences:
   - `useGSAP`/ScrollTrigger cleanup runs on hide; triggers are recreated on show → call
     `ScrollTrigger.refresh()` after a route becomes visible.
   - Transient UI (menu overlay, open work row, hover preview) must reset in a `useLayoutEffect`
     cleanup, or via `Link`'s `onNavigate` callback.
   - Global singletons (Lenis, Crosshair) live in the root provider, not in pages.
3. **`template.tsx` remounts on segment change** (unique key). Use it for the `/work/*` route
   transition (Phase 11.7); it is the one place where state reset is guaranteed.
4. **`generateStaticParams` must return at least one param** (empty array errors). `params` is a
   `Promise` — `await params`. Use the global `PageProps<'/work/[slug]'>` / `LayoutProps<'/'>`
   helpers (no import needed). **`dynamicParams` is not allowed with Cache Components (build
   error)**: call `notFound()` for unknown params instead (corrected in Phase 11).
5. **`export const ensureStatic = 'navigation'`** (new segment config) guarantees a route's complete
   output is static; validated in dev and build. Put it on the root layout so the whole site must
   stay static. Not allowed in client components.
6. **Non-deterministic values in Server Components** (`Date.now()`, `new Date()`, `Math.random()`)
   are not allowed without `connection()` (which makes the route dynamic). So:
   - "Approved for build" year → read inside a `'use cache'` function or pass a build-time
     constant; never `new Date()` directly in a server component.
   - Local time / cursor coordinates render client-only with a stable server placeholder
     (`--:--`) via `useSyncExternalStore` server snapshot, to avoid hydration mismatch.
7. **Tailwind v4 runs through `@tailwindcss/turbopack`** (already configured in `next.config.ts`
   turbopack rules) — not the PostCSS plugin the docs describe. Keep the existing setup; do not
   add `postcss.config.mjs`. Global CSS is never removed on navigation, so keep it truly global.
8. **`next/font/google`** works as before; prefer variable fonts and the `variable` option.
9. Build debugging: `next build --debug-prerender` gives stack traces for prerender errors.
