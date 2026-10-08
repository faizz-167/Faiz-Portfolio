# Phase 0 — Brief, Research Record & Locked Decisions

> This file is the single source of truth for the creative direction. Every later phase
> references it. Read it fully before touching any other phase.

## Objective

Lock the concept, design language, technical stack and copy voice so that any agent can
implement later phases without re-doing research or re-litigating decisions.

## Subtasks

| ID   | Subtask                                              |
|------|------------------------------------------------------|
| P0.1 | Record reference-site analysis                       |
| P0.2 | Record concept ("Build Sheet") and scene list        |
| P0.3 | Record locked technical decisions                    |
| P0.4 | Record copy voice and signature lines                |
| P0.5 | Read the Next.js 16 docs relevant to this project    |
| P0.6 | Collect owner content (resume + project details)     |

---

## P0.1 — Reference analysis (completed via Chrome DevTools, 2026-10-08)

Principles only. Never copy text, assets or branding from these sites.

| Site | Measured facts | Principle we take |
|---|---|---|
| jackiezhang.co.za/work | Dark `#171717`, cream `#F5E1CD`, single red `#E35342`; Departure Mono + tall condensed serif; Lenis | Each job rendered as a **physical artifact** (ticket, tag, CRT) whose details carry real data |
| somehowliving.tech | DM Sans + Newsreader (opsz); OKLCH warm neutrals (hue ~70); 4px-radius outline buttons with ↗ | **One continuous SVG line** threads all sections; blur-to-focus timeline; scribble loader |
| pamidordesign.co | Single family; fluid ~1.25 ratio (15.8 → 39.6 → 59.4 → 102.9 → 128px); tracking −1% body → −3% at 128px; 1px rules @ 20% alpha; radius 0–2px | Accordion project index: active row expands to a spec grid (role/timeline/year/team) + thumbnail; square outline buttons with →; duplicated-text roll hover |
| studioloop.com.br | Sans + serif cuts of one family mixed inside a sentence; paper `#F7F6F0`, espresso `#2B190F` | Scroll-scrubbed statement (words ink in as read); metadata strip joined by long rules; letters behaving as objects |
| crency.agency | Condensed display 180px, line-height 0.78; viewport-scaled root rem; lime `#C2EC40`; bottom floating dock nav | **Bézier path with visible anchor nodes** drawn over type (pen-tool motif); custom glyph swaps; dock persists on mobile |

Shared patterns: Lenis everywhere, one accent used as signal, hairline rules, near-zero radii,
tight display tracking, metadata as data grids rather than tags.

Inspo archive finding: 79% of comparable sites use a grotesk display. We deliberately take the
opposite position with a variable-width display face whose width axis is part of the concept.

Kexsio: only the "cursor-follow preview" pattern is used, as a reference for the work-index
hover preview. No Kexsio component is imported (they rely on WebGL / decorative effects).

## P0.2 — Concept: "Build Sheet"

The site is a **drawing set for one engineer**. Each section is a *sheet*. Visual vocabulary of
engineering drawings: title block, dimension lines, callouts, section cuts, revision table,
bill of materials (BOM).

**Unifying device — the Signal Trace.** One SVG route (PCB-trace style: orthogonal runs with
45° chamfers, round vias at nodes) draws itself on scroll and connects every scene. Each scene
sits on a via. The trace is the only element that uses the acid-lime signal colour continuously.

### Scene list (home page, in order)

| # | Scene | Surface | Summary |
|---|---|---|---|
| S1 | Hero — "Daddy's Home." | ink | Display type starts as outlines with live dimension lines measuring each glyph; mono build log runs; on "compile" glyphs fill and the width axis snaps 50→100 with hard cuts; trace begins. Fits first viewport. |
| S2 | Statement | paper | One serif paragraph; words scrub from 20% to 100% ink. |
| S3 | Work index | ink | Hairline rows, huge project names; active row expands into a spec sheet; cursor-follow preview (desktop), tap-to-expand (touch). |
| S4 | Bill of Materials | paper | Capabilities as a parts table: component, version, years, used-in (links to projects). No skill bars. |
| S5 | Revisions | ink | Experience as revision table (REV A, B, C…). Genuinely sequential, so numbering is allowed. Pinned horizontal track on desktop, vertical on mobile. |
| S6 | Contact — "Call me, Baby — for your new website." | signal/ink | Title-block footer; giant email with width-axis stretch on hover; click copies. |

Case pages `/work/[slug]`: the artifact is a **system architecture diagram generated from typed
data** (nodes: client/edge/service/db/queue/cache/external; edges with protocol labels). Edges
draw on scroll; nodes reveal callouts on hover/focus.

Chrome: fixed thin top strip (name · current sheet · local time + cursor coordinates). Mobile:
bottom floating dock. Desktop cursor: crosshair with x/y readout, `(pointer: fine)` only.

### Anti-patterns (hard bans)
- No gradients, glassmorphism, floating 3D blobs, rounded cards, drop shadows.
- No single highlighted word in a different weight/colour inside a headline.
- No ALL-CAPS micro-labels; no eyebrow label above every section.
- No skill bars, no "big number + small label + gradient" stats.
- No fake terminal hero.
- Numbering only where content is sequential (revisions, process steps).

## P0.3 — Locked technical decisions

| Area | Decision |
|---|---|
| Framework | Next.js 16.4 App Router, React 19.3, TypeScript strict, `cacheComponents: true` (already in `next.config.ts`). All pages static. |
| Styling | Tailwind CSS v4, tokens declared in CSS via `@theme` in `src/app/globals.css`. No `tailwind.config`. |
| Scroll | `lenis` — driven by `gsap.ticker`, `gsap.ticker.lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`. |
| Scroll/timeline animation | `gsap` + `@gsap/react` (`useGSAP`), plugins ScrollTrigger, SplitText, DrawSVGPlugin (all free since GSAP 3.13). |
| React-state UI animation | `motion` (Framer Motion's current package; import from `motion/react`). Layout animations, AnimatePresence, springs. |
| SVG data visuals | `animejs` v4 (`animate`, `createTimeline`, `stagger`, `svg.createDrawable`). Architecture diagrams + dimension lines only. |
| Ownership rule | One library per responsibility. Never animate the same element with two libraries. |
| Fonts | `next/font/google`, variable: **Anybody** (display, `wdth` 50–150, `wght`), **Newsreader** (text, `opsz`), **Martian Mono** (data). Default choice — swappable in Phase 2 only. |
| Base surface | Ink (graphite) base with paper scenes. Default — owner may override (see status.md decisions). |
| Content | Static TypeScript under `src/content/`. No CMS/API/DB/auth. |

## P0.4 — Copy voice

Confident, dry, a little cheeky; engineering precision with a wink. Signature lines (owner-requested,
must appear verbatim):

- **"Daddy's Home."** — the hero's compiled display line (the build log resolves into it).
- **"Call me, Baby — for your new website."** — contact scene headline (display set across lines:
  "Call me, Baby" / "for your new website.").

Both live in `src/content/profile.ts` under `copy`, never hard-coded in components.
Secondary copy uses drawing vocabulary: "Sheet", "Rev.", "Tolerance", "Bill of materials",
"Approved for build". Mono labels are sentence case.

## P0.5 — Docs to read before coding (Next 16 has breaking changes)

From `node_modules/next/dist/docs/01-app/`:
- `01-getting-started/02-project-structure.md`, `03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `11-css.md`, `12-images.md`, `13-fonts.md`,
  `14-metadata-and-og-images.md`
- `02-guides/server-and-client-boundary.md`, `keeping-pages-static.md`,
  `preventing-flash-before-hydration.md`, `production-checklist.md`, `lazy-loading.md`
- `03-api-reference/04-functions/generate-static-params.md` (path may vary — search the folder)
- `03-api-reference/05-config/` entries for `cacheComponents`

Record any convention that differs from older Next.js in `status.md` → "Notes for agents".

## P0.6 — Owner content

Received and confirmed 2026-10-08. Source of truth: `implementation plan/content/owner-content.md`.
Phase 7 subtask P7.5 maps it into `src/content/`.

## Validation criteria

- [x] All reference principles recorded (P0.1).
- [x] Scene list and bans recorded (P0.2).
- [x] Technical decisions table complete (P0.3).
- [x] Signature copy recorded verbatim (P0.4).
- [x] Next 16 docs read; differences logged in `status.md` (P0.5).
- [x] Owner content received or placeholder policy acknowledged (P0.6).
