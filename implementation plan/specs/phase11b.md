# Phase 11b — Toolkit Gauge, Work Archive & Screenshot Plates

## Objective

Three owner-requested changes, made before the Phase 12 audit so that audit covers them:

1. The Bill of Materials becomes a **toolkit gauge**, modelled on the "Services & Toolkit" section of
   portfolio.thecodeman.cloud: four big category faces, and a ruled strip of tools sliding past a
   fixed needle as you scroll.
2. The home work index shows **three** projects. Every project is listed on a new **all-assemblies
   page**.
3. Case pages get a set of **four screenshot plates** for SpeechPath, Academic ERP and ZingDesk.
   They are placeholders until the owner supplies the images.

## Prerequisites

Phase 11 complete.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P11b.1 | Content: the four toolkit faces, their paragraphs, project order, plate slots |
| P11b.2 | Toolkit gauge: readable list (all widths, no JS, reduced motion) |
| P11b.3 | Toolkit gauge: pinned scrolling gauge (≥ 1024px, motion allowed) |
| P11b.4 | Home work index: three projects + "See all assemblies" link |
| P11b.5 | All-assemblies page |
| P11b.6 | Screenshot plates on case pages (placeholders) |

## Reference study (2026-10-09)

The reference "Services & Toolkit" section, measured at 1440×900 and 390 wide:

- **Desktop:** the section is pinned for about 11 viewports of scrolling. A small eyebrow label sits
  above a huge display word for the current face ("INTERFACES."), with a coloured full stop and a
  two-sentence paragraph (bold lead word, then the rest). Below that is a full-bleed band between
  two heavy rules. It is divided into faint columns, with a fixed vertical needle in the centre and
  a diamond at each end of the needle. Tool names slide right-to-left through the band as you
  scroll. The tool nearest the needle is the largest, darkest and highest, with a tall accent bar
  under it. Neighbours shrink, fade and drop lower the further they are from the needle, so the
  band reads like a meter. When a face's last tool passes, the display word changes to the next
  face.
- **Narrow:** nothing is pinned. Each face is a block with a top rule, a small label plus its index
  ("01"), the display word, the paragraph, and the tools as a plain inline list.

We take the composition and translate it into the Build Sheet language (design.md). The display
word is in sentence case, never all caps (design.md §3), and the full stop is in `--accent`. Rules
are hairlines or our heavy rule weight, and labels are mono. The scene stays on the **paper**
surface, so the needle and bars use `--accent` (signal-deep on paper).

## Execution

### P11b.1 — Content

- **Faces.** Exactly four faces, in this order. Each one collects existing capability categories:

  | # | Face | Categories |
  |---|------|------------|
  | 01 | Interface | frontend |
  | 02 | Systems | language, backend, data, infra |
  | 03 | AI | ai |
  | 04 | Tooling | tooling |

  The face for each capability is derived from its category through this one mapping. Do not add
  a second per-capability field. Every capability belongs to exactly one face, and the content
  validator fails if a category has no face.
- **Paragraphs** (owner-editable drafts; the owner said "yes, draft them"). Each paragraph opens
  with the bold lead word:
  - **Interface.** Typed React and Next.js front ends that do real work: an in-browser audio
    recorder, a drag-and-drop plan board, live dashboards. State lives in Zustand and TanStack
    Query, styles in Tailwind, and nothing ships until it reads cleanly on a phone.
  - **Systems.** APIs, auth and data models in Node, Express and FastAPI, backed by PostgreSQL and
    Redis. Background work runs in Celery, files sit in blob storage, and services stay up under
    systemd on Linux.
  - **AI.** Models wired into products, not demos. Whisper, HuBERT and SpeechBrain score speech in
    real time; OpenAI and Azure OpenAI answer through the Vercel AI SDK and an MCP server; pgvector
    gives retrieval its memory.
  - **Tooling.** The bench around the build: Git and GitHub, Figma for the first sketch, esbuild and
    Pino for the runtime, Claude Code for the long stretches, and UiPath and Telegram bots when the
    job is automation.
- **Project order.** SpeechPath, Academic ERP, ZingDesk, Laptop Sentinel, IAM backend. The order of
  the project list is the only control over which three appear on home. There is no "featured"
  flag. This order also drives the case pages' "next project" link.
- **Plates.** A project may carry up to four screenshot plates. Each plate has a caption and
  alt text, and may also have an image (source plus intrinsic size). A plate without an image is a
  placeholder. SpeechPath, Academic ERP and ZingDesk each get four plates with captions drafted from
  their case content and no images. Laptop Sentinel and IAM backend get none.
- The existing single `cover` field is replaced by the plates, so there is one way to attach images.
  The work-row preview uses plate 1 **only when plate 1 has an image** (see P11b.4).

### P11b.2 — Toolkit gauge: readable layer (`Scene id="materials"`, paper)

- Sheet label becomes "Sheet 04 — Toolkit". The scene heading (h2) reads "Services & toolkit". The
  scene id stays `materials`, so nav links and the trace via are unchanged.
- The semantic content is one block per face:
  - small mono label and the index ("01")
  - the face word as an h3 in display type, with an `--accent` full stop
  - the paragraph
  - the face's tools as a list.
- Each tool keeps the old BOM data. Its years (build year − `since` + 1) and its "Used in" project
  links are still generated from data. They appear in the tool's readout (P11b.3) and, in this
  layer, inline after the tool name in mono.
- This layer is what renders below 1024px, without JS, and under reduced motion. It follows the
  reference's narrow layout: a top rule per face drawn with RuleDraw, no pin, no horizontal scroll
  at 360.
- The old `<table>` is removed.

### P11b.3 — Toolkit gauge: pinned gauge (≥ 1024px, motion allowed)

- The scene pins for a scroll distance proportional to the total number of tools (about 25vh per
  tool, so 45 tools come to about 11 viewports, matching the reference).
- **Top half:** eyebrow label, then the current face word in display type (as large as fits one
  line at 1024px), then its paragraph. The face swaps (cross-fade, opacity only) when the gauge's
  centre passes the boundary between two faces.
- **Bottom half:** a full-bleed band between two heavy rules, with faint column hairlines and a
  fixed centre needle that has a diamond at each end. All tools sit in one continuous horizontal
  track, in face order, with one column per tool. Scroll moves the track so that each tool in turn
  lands on the needle.
- **Meter.** Each tool's size, opacity and vertical lift follow its distance from the needle, like
  the reference. The tool on the needle gets an `--accent` bar beneath it. Distance means distance
  only: bar height does not encode years.
- **Readout.** The tool on the needle shows its years and "Used in" links next to the needle, in
  mono. The links are real and focusable.
- The visual track is `aria-hidden`. The readable layer from P11b.2 stays in the accessibility tree
  (visually hidden while the gauge is live), so screen readers get the list, not the animation.
- The scene keeps exactly one trace via, outside the moving track (same rule as Revisions).
- *As built (Decisions log 2026-10-09):* the readout stays in the accessibility tree; while the
  gauge is live the hidden list's links leave the tab order (tabindex −1).

### P11b.4 — Home work index

- Home lists the first three projects: SpeechPath, Academic ERP, ZingDesk. Rows behave exactly as in
  Phase 10 (disclosure, one open at a time, hover intent, touch).
- Under the last row is a "See all assemblies" link (`Button variant="outline" icon="arrow-right"`)
  to the all-assemblies page. It also shows the total ("5 assemblies"), computed from the data.
- Hover preview: a row shows plate 1 only if it has an image. Placeholders never appear on home.

### P11b.5 — All-assemblies page (`/work`)

- A static page listing every project in project order, using the same rows as home: same expand,
  same in-progress treatment for IAM backend.
- Ink surface, sheet label "Sheet 03 — Assemblies (full index)", h1 "All assemblies", and a link
  back to home.
- The root footer renders here, as on every non-home route.
- Metadata: title and description.

### P11b.6 — Screenshot plates on case pages

- A project with plates gets a "Plates" section on its case page, placed after the architecture
  diagram and before the notes. It is styled as drawing plates, after the Etienne Studio archive
  reference in Inspo (framed image, mono caption strip):
  - Plate 1 spans the full content width. Plates 2–4 sit in a three-column row from 1024px and
    stack below that.
  - Each plate is a hairline frame with registration ticks at the four corners, fixed at 16:10.
    Under it is a mono caption strip: "Fig. 0N — caption" on the left, "Plate N of 4" on the right.
  - **Placeholder:** the frame is filled with a 45° hatch in `--fg-muted` hairlines, with
    "Screenshot pending" centred in mono. It has no image element, and its accessible name is
    "Plate N: caption (screenshot pending)".
  - **With an image:** `next/image` at the plate's intrinsic size, `object-fit: cover` inside the
    16:10 frame, alt text from data.
- Projects without plates render no section.
- *As built (Decisions log 2026-10-09):* the section is its own ink scene "Sheet 03 — Plates";
  Notes becomes "Sheet 04 — Notes" on projects with plates.

## Validation criteria

- [x] Every capability appears in exactly one face. The face counts sum to the capability count, and
      the validator fails on an unmapped category.
- [x] Years and "Used in" links for every tool equal the values computed from data (0 mismatches).
      No hard-coded `/work/` paths.
- [x] ≥ 1024 with motion: the scene pins, each tool reaches the needle in order, the face word
      changes exactly at face boundaries, and the readout shows the needle tool's data. Scrolling
      through has no frames over 20ms and adds 0 layout shift.
- [x] < 1024, reduced motion and no JS: four stacked face blocks, all tools and data readable,
      no horizontal scroll at 360. The screen-reader tree is the list in every mode.
- [x] Home lists exactly SpeechPath, Academic ERP and ZingDesk, plus a working "See all assemblies"
      link. `/work` lists all 5 projects, is static (○), and its rows pass the Phase 10 keyboard
      and touch checks.
- [x] SpeechPath, Academic ERP and ZingDesk case pages each show 4 placeholder plates with the right
      captions and accessible names. Laptop Sentinel shows no plates section.
- [x] Trace: still one via per home scene, in order, fully drawn at the bottom.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors or hydration warnings.

## Validation result — 2026-10-09 (all criteria met)

Production build (`next start` on :3111). Desktop gauge runs in the DevTools MCP Chrome at 1280×800
with motion; width / reduced-motion / no-JS / accessibility-tree runs in a separate headless Chrome
over CDP from Node (`Emulation.setEmulatedMedia`, `setScriptExecutionDisabled`), scripts in the
session scratchpad.

- **Faces.** 46 capabilities → Interface 6, Systems 23, AI 9, Tooling 8 (sum 46). Emptying the AI
  face's categories makes `npm run validate:content` exit 1 with `category "ai" belongs to 0 faces`
  and `faces hold 37 tools, capabilities.ts has 46`; restored → valid.
- **Tool data.** Years and "Used in" (slug + href) for all 46 tools in the served HTML equal values
  recomputed independently from `capabilities.ts` / `projects.ts` (0 mismatches; IAM unlinked).
  At every needle position the readout's years and links equal that tool's list entry. Every case
  link is built by `caseHref()`; `grep '"/work/' src` finds only route type names.
- **Gauge ≥ 1024 with motion.** Scene pins (pin-spacer, stage top 0 for the whole run), pin length
  9200px = 11.5 viewports. Scrolling to each of the 46 positions: the `data-on` column, the readout
  and the face are the expected tool/face every time (0 failures), the needle tool's bar centre is
  within 1.2px of the needle. Face word at ±0.06 tool around each boundary (6, 29, 38): previous
  face before, next face after, all three. Scrolling through the pin 40px per frame: 269 frames,
  p50 16.7ms, max 16.8ms, 0 over 20ms, 0 long animation frames, layout shift 0. "Interface." is
  803px in a 927px line at 1024 (mega fits; no cap needed).
- **Readable layer.** 1023, 390 and 360 with motion, 1280 and 360 reduced motion, 1280 and 360
  no JS: not live, stage `display: none`, no pin-spacer, 4 face blocks, 46 tools with 46 visible
  data lines, no `<table>`, scrollWidth = viewport (360 at 360). Accessibility tree of the region
  "Services & toolkit" is identical in all eight modes: headings Services & toolkit / Interface. /
  Systems. / AI. / Tooling., 46 list items, 43 links. While live the list is `sr-only`, its 43
  links are out of the tab order, the stage is aria-hidden except the readout (see Decisions log).
- **Work.** Home lists SpeechPath, Academic ERP, ZingDesk; "See all assemblies" → `/work` (clicked:
  lands on /work, h1 "All assemblies"), "5 assemblies" beside it. `/work` is ○, lists 5 rows (IAM
  dashed), sheet "Sheet 03 — Assemblies (full index)", title/description set, "Back to home" → `/`,
  root footer present. On both pages: Enter opens row 1, Tab → "Open the drawing" → row 2, Space
  switches, Enter closes; mouse closed at 60ms, open after hover-intent; touch at 390: tap opens,
  tap another switches, tap again closes, last row (Laptop Sentinel / IAM) opens; scrollWidth 390.
  Home → /work → back: gauge live again, one pin-spacer.
- **Plates.** SpeechPath, Academic ERP, ZingDesk: scene order top › drawing › plates › notes, 4
  figures, 0 `<img>`, 4 AX images named "Plate N: caption (screenshot pending)", captions "Fig. 0N
  — caption" + "Plate N of 4", every frame 1.600 ratio; 1280: plate 1 1163px wide, plates 2–4 three
  across (375px, same top); 390: stacked at 358px. Laptop Sentinel: no plates scene, notes stay
  Sheet 03.
- **Trace.** Six scenes, one via each, none inside the gauge or a pin track; after scrolling to the
  bottom at 1280 the 6 pads sit on their vias in order, route 19564px fully drawn (dasharray = length,
  offset 0).
- `npm run lint` (with validator), `npm test` (38/38), `npm run build` pass. No console messages on
  `/` in production or dev, nor on `/work` → `/work/speechpath` in dev.
