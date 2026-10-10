# Design System — "Build Sheet"

> The design reference for the portfolio of **Mohamed Faiz**, full-stack engineer.
> Concept and scene list: `specs/phase0.md`. Token implementation: `specs/phase2.md`.
> If this file and a spec disagree, this file wins for visual decisions; update the spec to match
> and log the change in `status.md`.

The site is a **set of engineering drawings for one person**. Every page is a *sheet*, every
section a *view*, every project an *assembly*. The visual language comes from technical drawing:
hairlines, title blocks, dimension lines, callouts, revision tables and a bill of materials. One
lime **signal trace** runs through the whole site like a track on a circuit board.

---

## 1. Principles

1. **Structure carries information.** Rules, grids, numbering and annotations only exist when
   they say something true: a dimension line shows a real measured value; a revision letter
   marks a real sequence; a "Built by me" mark shows real ownership. No decorative chrome.
2. **One signal.** Acid lime is not a brand colour. It is the electrical signal: the trace,
   focus, the active state, the cursor, the contact sheet. If lime appears anywhere else, it is
   a bug. *Owner exception (2026-10-10):* the Statement's moving scrub band (see §7 Statement).
3. **Type is the image.** There are no stock photos, 3D blobs or illustrations. Display type
   stretches, compresses, cuts and gets measured, and it does the work imagery usually does.
   *Owner exception (2026-10-10):* the owner's own portrait, once, as the full-bleed band that
   opens the Statement scene. Project screenshots live only in drawing plates.
4. **Flat and exact.** Square corners, 1px hairlines, no shadows, no gradients, no blur, no
   glass. Depth comes from overlap, surface changes and line weight.
5. **Motion is an edit.** Every animation is a *cut*, *wipe*, *scrub* or *trace*. Timing and
   sequence matter more than how many things move. Hard cuts are allowed and encouraged.
6. **Honest by default.** Team work is credited as team work. Numbers come from the repos, not
   from optimism. Unconfirmed claims never ship.
7. **Works without the show.** Everything must be readable and usable with JavaScript disabled,
   with reduced motion, by keyboard, and with a thumb on a 360px screen. The show is a layer on
   top of a complete document.
8. **Wit in the words, precision in the build.** The voice is allowed to wink ("Daddy's Home.",
   "Call me, Baby — for your new website."). The layout never jokes: alignment stays exact.

### Hard bans
Gradients · glassmorphism · drop shadows · rounded cards · floating 3D objects · skill bars ·
"big number + small label + gradient" stats · a highlighted word in a different colour or weight
inside a headline · ALL-CAPS micro-labels · an eyebrow label above every section · fake terminal
heroes · animated `filter: blur()` · lime used decoratively.

---

## 2. Color

All values are canonical hex. Implementations may declare OKLCH equivalents, but must
match these hex values to the eye (ΔE < 1). Contrast ratios below are measured (WCAG 2.x).

### 2.1 Surface palette

Surfaces are whole-scene backgrounds. A scene picks exactly one surface. Moving from one scene
to the next is a hard cut between surfaces, never a gradient.

| Token | Hex | Role | Text on it |
|---|---|---|---|
| `--color-ink` | `#0D0E0B` | Default surface. Graphite drafting board. Hero, work index, revisions, case diagrams | paper, 16.2:1 |
| `--color-ink-2` | `#1A1B16` | Raised area on ink: expanded work row, table header band, menu cells | paper, 14.5:1 |
| `--color-ink-3` | `#2A2B24` | Pressed or selected cell on ink; diagram node fill on hover | paper, 12.0:1 |
| `--color-paper` | `#ECEBE4` | Second surface. Drafting paper. Statement, bill of materials, case body copy | ink, 16.2:1 |
| `--color-paper-2` | `#E0DED5` | Alternating table rows and raised cells on paper | ink, 14.4:1 |
| `--color-signal` | `#C6F432` | Full surface **only** for the Contact sheet and the open menu | on-signal, 13.2:1 |

Rhythm on the home page: ink → paper → ink → paper → ink → signal. Never two paper scenes in a
row; never signal anywhere except the last scene and the menu.

### 2.2 Content palette

Content colours are **semantic variables that change with the surface**. Components only ever
use these variables, never the raw surface tokens. `Scene` sets `data-surface`, which remaps them.

| Variable | On ink | On paper | On signal | Use |
|---|---|---|---|---|
| `--bg` | `#0D0E0B` | `#ECEBE4` | `#C6F432` | Scene background |
| `--fg` | `#ECEBE4` | `#0D0E0B` | `#152000` | Primary text, display type, solid buttons, diagram strokes |
| `--fg-muted` | fg 62% → `#979792` (6.6:1) | fg 62% → `#62625D` (5.1:1) | fg 72% → `#475B0E` (5.9:1) | Secondary text, mono labels, dates, inactive rows |
| `--rule` | fg 16% → `#31312E` | fg 16% → `#C8C8C1` | fg 16% → `#AAD22A` | Hairlines, table rules, grid lines. Decorative only, never the only boundary of a control |
| `--raised` | `#1A1B16` | `#E0DED5` | — | Raised cell background |
| `--accent` | `#C6F432` (15.1:1) | `#3F5C00` (6.4:1) | `#152000` | The signal *as a line or text* on this surface: trace, active marks, focus ring, owned-node corner |

Notes:
- **Lime cannot be drawn on paper.** `#C6F432` on paper is 1.07:1, so it disappears. On paper,
  the accent becomes **signal-deep `#3F5C00`**. The trace changes colour when it crosses a paper
  scene, the way a track changes layer through a via.
- `--fg-muted` mix amount is 62% on ink and paper and 72% on signal. 62% on signal measured
  4.3:1 and fails AA.
- Selection: `background: var(--color-signal); color: var(--color-on-signal)` on every surface.

### 2.3 Semantic colors

| Token | Hex | Use | Rules |
|---|---|---|---|
| `--color-signal` | `#C6F432` | Signal on ink: trace, focus, active, cursor | Never a decorative fill |
| `--color-signal-deep` | `#3F5C00` | Signal on paper | Text-safe on paper (6.4:1) |
| `--color-on-signal` | `#152000` | Text and lines on a lime surface or lime button fill | — |
| `--color-fault` | `#FF4D2E` | Errors on ink, such as "Copy failed" | 5.9:1 on ink; **never on paper** |
| `--color-fault-deep` | `#B32D15` | Errors on paper | 5.3:1 on paper |
| `--status-live` | `= --accent` | "Available" dot, "Live" link marker, shipped status | Always paired with a text label |
| `--status-progress` | `= --fg-muted` + dashed outline | "On the drawing board" (in-progress projects) | Dashed hairline, never a colour alone |
| `--focus` | `= --accent` | `:focus-visible` outline, 1.5px, 3px offset | Must reach ≥ 3:1 on its surface (ink 15.1, paper 6.4, signal 13.2) |

There is no success green, warning yellow or info blue. Status is said in words first and
supported by the accent or a dashed line.

---

## 3. Typography

### 3.1 Font stack

Three variable families, each with one job. All are loaded with `next/font/google`.

| Role | Family | Axes used | Fallback stack | Job |
|---|---|---|---|---|
| Display | **Anybody** | `wght` 100–900, `wdth` 50–150 | `"Arial Narrow", "Helvetica Neue", Arial, sans-serif` | Headlines, project names, the hero line, revision letters. The **width axis is the concept**: it compresses, stretches and snaps |
| Text | **Newsreader** | `opsz` 6–72, `wght` 200–800, italic | `"Iowan Old Style", Georgia, "Times New Roman", serif` | Paragraphs, lede, statement, case-study body. Optical sizing on (`font-optical-sizing: auto`) |
| Data | **Martian Mono** | `wght` 100–800, `wdth` 75–112.5 | `ui-monospace, "SFMono-Regular", Menlo, monospace` | Labels, values, dates, coordinates, build log, diagram labels, button labels. Always `tabular-nums` |

Rules:
- Display weights: 800 for `mega`/`h1`, 700 for `h2`, 600 for `h3`. Default `wdth` 100.
- Text weights: 400 body, 500 lede, italic for emphasis inside a sentence. No bold paragraphs.
- Mono is **sentence case**, never all caps. Labels look like `Role`, `Stack`, `Rev. B`.
- Never mix two families inside one headline. Serif and mono may sit side by side; display stays alone.
- Emphasis inside a headline is not allowed. If something matters, give it its own line.
- Body measure: max **62ch**. Lede max 48ch.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Hanging punctuation on the hero and contact lines (`hanging-punctuation: first last`, with an
  optical left nudge on opening quotes where unsupported).

### 3.2 Type scale

Fluid between 360px and 1600px viewport widths. Ratio grows from 1.25 to 1.333. **Tracking
tightens as size grows.** Values are `min → max` in px.

| Token | Size | Line height | Tracking | Family / weight | Use |
|---|---|---|---|---|---|
| `--text-data` | 11.5 → 12.5 | 1.4 | +0.01em | Mono 400 | Labels, metadata, coordinates, build log |
| `--text-small` | 14 → 15 | 1.45 | 0 | Newsreader 400 | Captions, table cells, notes |
| `--text-body` | 17 → 19 | 1.5 | 0 | Newsreader 400 | Paragraphs |
| `--text-lede` | 21 → 26 | 1.35 | −0.005em | Newsreader 500 | Intro paragraphs, revision org names |
| `--text-h3` | 26 → 36 | 1.1 | −0.01em | Anybody 600 | Sub-heads, BOM group names |
| `--text-h2` | 34 → 64 | 1.0 | −0.015em | Anybody 700 | Scene headings, email in contact |
| `--text-h1` | 44 → 112 | 0.9 | −0.025em | Anybody 800 | Project names in the work index, case titles, menu links |
| `--text-mega` | 64 → 220 | 0.82 | −0.03em | Anybody 800 | "Daddy's Home.", "Call me, Baby / for your new website." |

Only `mega` and `h1` may break the grid (bleed into margins, overlap a rule). Every other style
stays inside its columns.

---

## 4. Shadows & elevation

**There are no shadows.** `box-shadow` and `filter: drop-shadow` are not used anywhere. Elevation
is expressed by these four means only, in this order of preference:

| Level | Means | Example |
|---|---|---|
| 0 — Sheet | Surface `--bg` | Scene background |
| 1 — Ruled | 1px `--rule` hairline around or between | Table rows, title-block cells |
| 2 — Raised | `--raised` fill + hairline | Expanded work row, menu cells |
| 3 — Overlaid | Opposite surface + 1px `--fg` border | Hover preview panel, callouts, toasts |

Layer order (z-index tokens): `--z-base 0` → `--z-trace 1` (the trace sits behind content) →
`--z-content 2` → `--z-chrome 50` (strip, dock) → `--z-cursor 100` → `--z-overlay 200` (menu,
transitions). No other z-index values are allowed.

Radii: `0` everywhere. `999px` only for status dots and diagram vias.

---

## 5. Spacing

Base unit **4px**. Use the tokens only; no raw pixel values in components.

| Token | px | Typical use |
|---|---|---|
| `--space-1` | 4 | Icon to label gap |
| `--space-2` | 8 | Mono label to value |
| `--space-3` | 12 | Inside a dense table cell |
| `--space-4` | 16 | Button inline padding, paragraph gap in data blocks |
| `--space-5` | 24 | Paragraph gap in body copy, cell padding |
| `--space-6` | 32 | Between related groups |
| `--space-7` | 48 | Heading to content |
| `--space-8` | 64 | Between sub-sections inside a scene |
| `--space-9` | 96 | Large internal break |
| `--space-10` | 128 | Hero internal tension (top vs. bottom mass) |
| `--space-11` | 192 | Rare. Statement scene breathing room |
| `--space-12` | 256 | Rare. Desktop-only pinned track spacing |

Layout tokens:
- `--section-y: clamp(96px, 12vw, 192px)` — **the only** vertical padding between scenes.
  Apply it as `padding-block`, never through a `padding` shorthand.
- `--margin-x: clamp(16px, 4vw, 64px)` — page side margins.
- `--gutter: clamp(12px, 1.5vw, 24px)` — column gap.
- Columns: 4 below 640px, 8 from 640–1023px, 12 from 1024px.
- Page grid named lines: `full` (edge to edge), `content` (inside margins).
- Strip height `--strip-h: 44px`; dock height `--dock-h: 56px` plus safe area.
- Minimum touch target: 44 × 44px.

Rhythm rule: inside a scene, spacing between elements grows by token steps as their
relationship weakens (label → value `--space-2`, item → item `--space-5`, group → group
`--space-7`).

---

## 6. Buttons

All buttons are square, flat and set in the mono **data** style with a sentence-case label.
They are at least 44px tall. A button is a `<button>`, or a `Link` when it has an `href`.

| Variant | Rest | Hover / focus | Use |
|---|---|---|---|
| **Solid** | `--fg` fill, `--bg` label | Lime fill grows `scaleX(0→1)` from the left (`--ease-wipe`, `--dur-base`); label turns `--color-on-signal`; arrow moves 4px right | One per scene at most. The main action |
| **Outline** | Transparent, 1px `--fg` border, `--fg` label | Same lime grow; border becomes lime | Secondary actions: "See the work", "Open the drawing" |
| **Ghost** | No border, `--fg` label, underline pseudo at `scaleX(0)` | Underline grows; arrow moves | Tertiary: "Next drawing →", repo links |

Details:
- Sizes: `md` = 44px tall, inline padding `--space-4`; `lg` = 56px, inline padding `--space-5`.
- Icons: inline SVG at 1.5px stroke in `currentColor`: `→` for internal navigation, `↗` for external
  links, a copy icon for copy actions. Icons come after the label.
- **On paper** the hover fill is `--color-signal-deep` with `--color-paper` text, because lime on
  paper fails contrast.
- **On the signal surface** solid buttons are `--color-on-signal` fill with lime text; the hover
  fill is `--color-ink`.
- Focus: 1.5px `--focus` outline, 3px offset, always visible on keyboard focus.
- Disabled: `--fg-muted` label, dashed `--rule` border, `cursor: not-allowed`, no hover motion.
- Pressed: `transform: translateY(1px)` for 80ms. No scale effects.
- Magnetic pull (up to 12px) only for the main contact action, and only on `(pointer: fine)`.
- Only `transform` and `opacity` animate. Never width, padding, background-size or clip-path.

Links: inline links in body copy keep a 1px underline at all times, which thickens on hover;
navigation links use the roll-text effect (the label slides up and is replaced by a copy).

---

## 7. Feature-level guidance

### Sheet strip & dock (site chrome)
- Desktop strip (≥1024px): three title-block cells. Left: "Mohamed Faiz". Centre: current sheet
  name, which changes with a vertical cut. Right: Chennai local time and, with a mouse, live
  cursor coordinates (`x 0412 · y 0288`).
- The strip takes the active scene's surface colours; it never uses blend modes.
- Mobile dock: bottom, square, hairline border, shows sheet name and a "Menu" button. It hides
  when scrolling down and returns when scrolling up.
- Menu: full-screen signal surface; links in `h1` display that stretch their width on hover.

### Cursor
A crosshair of two 1px `--rule` lines across the viewport with a mono coordinate readout. Over an
interactive element the intersection shows a small accent square. Only with a fine pointer and
motion allowed. Text inputs keep the normal text cursor.

### Signal trace
- One SVG path, 1.5px, `--accent` (lime on ink, signal-deep on paper), drawn as you scroll.
- Straight runs with 45° corners, like a circuit board track. Each scene has exactly one via (a
  small circle) where the trace connects.
- It sits behind content (`--z-trace`) and never crosses running text; it routes through margins
  and gutters.
- Below 640px only short local segments per scene are drawn.

### Hero — "Daddy's Home."
- Ink surface. "Daddy's Home." in `mega`, sitting at the bottom of the viewport; the sparse top
  holds the build log (mono, muted) and a title block (Drawn by Mohamed Faiz · Chennai ·
  Available).
- Sequence: outline glyphs → dimension lines measure real widths → build log lines cut in →
  glyphs fill → width snaps 50 → 140 → 100 in hard cuts → trace starts.
- Must fit the first viewport at 1280×800 and 390×844. Total sequence ≤ 2.4s; ≤ 0.8s on a
  repeat visit in the same session.

### Statement
Paper surface. It opens with the owner's portrait as a full-bleed band (85svh from 1024px), its
pixels clearing as it enters. Across its lower third, three role words in `h1` display ink, each
on a paper strip, sit over one ink hairline: "Systems · Retrieval · Interfaces" (owner exception,
2026-10-10). Under the band, a mono caption strip: "Fig. 01 — Mohamed Faiz" and the margin note.
Then the statement in large Newsreader across columns 2–10. Words go from 20% to 100% ink as you
scroll; about three words at the leading edge pass through `--accent`, broken by a coarse pixel
mask, and no word keeps the accent at rest.

### Work index
- Ink surface, scene heading "Selected assemblies". Home shows three **cards** (P11c, after
  produx.design): from 1024px card 1 spans columns 1–7, card 2 columns 9–12 bottom-aligned with
  it, card 3 columns 2–11. 6 + 6 then full at tablet; one column on mobile.
- Each card is one link: plate 1 in a hairline frame (16:10, card 2 at 4:5; the hatched
  placeholder until a screenshot exists), then a hidden accent square marker, the title in
  display type, and year and role in mono. The first three stack items are mono tags.
- Fine pointer with motion: the plate drifts with scroll and scales inside its fixed frame on
  hover, the marker grows in front of the title, tags slide into the plate's corner, the other
  cards fade, and the crosshair carries an "Open drawing" chip. Focus shows marker and tags.
- "See all assemblies" and the total sit underneath. `/work` keeps the expanding rows: one open
  at a time, `--raised` fill, spec list, summary, "Open the drawing →", cursor-following preview,
  rows that aren't open fade to `--fg-muted`.
- In-progress projects (IAM backend) show "On the drawing board" with a dashed rule, no preview
  and no case page.

### Services & toolkit (was: Bill of materials)
- Paper surface, scene id `materials`, "Sheet 04 — Toolkit" (phase11b.md). Four faces: Interface,
  Systems, AI, Tooling, each owning capability categories.
- Readable layer (phones, no JS, reduced motion, screen readers): one block per face — drawn rule,
  mono label + index, the face word as a display h3 with an `--accent` full stop, the paragraph, the
  tools with years and "Used in" links in mono.
- From 1024px with motion: the scene pins; the face word in `mega` above a full-bleed band between
  heavy rules, a fixed `--accent` needle with diamonds, tools sliding past it like a meter (size,
  opacity and lift follow distance only), a mono readout beside the needle.

### Revisions
- Ink surface. Rev. C (Multimeta) → Rev. B (Zingbizz) → Rev. A (Rajalakshmi Engineering College).
- The revision letter is in `h1` display, the organisation in `lede`, dates in mono, changes as a
  short list.
- Multimeta says only: works on Faczonline (a social media app that publishes only verified,
  trusted facts and content) and a women's SOS app.
- On desktop the scene pins and slides horizontally; on mobile it is a vertical list.

### Contact — "Call me, Baby — for your new website."
- Signal surface. The two lines in `mega`, flush left, revealed line by line.
- Email in `h2` display; it stretches on hover and copies on click, with a mailto fallback.
- Footer title block: Drawn by · Location + local time · Availability · GitHub / LinkedIn /
  Resume · an "Approved for build" stamp cell with the year. The trace ends in the stamp.

### Case pages & architecture diagrams
- Header title block: Project · Year · Role · Team · Stack · Status.
- The diagram scene is on ink: square nodes drawn by kind, hairline edges with mono protocol
  labels, dashed async edges.
- Nodes the owner built carry an accent corner mark; the legend reads "Built by me" (plus
  "Team of 2" where relevant).
- Edges draw in order; hovering or focusing a node lights its connections and shows its note.
- A "Read the diagram as text" disclosure lists every connection.
- Body copy is on paper at 62ch. On team projects, only the "My part" section uses "I".
- Metrics are a spec list, never giant numbers.

### Not found & errors
"Sheet not found", with a dimension line measuring the empty space and a ghost button home.
Errors use `--fault` on ink or `--fault-deep` on paper, with a retry button.

### Pixel seams
Two scene boundaries dissolve upward in square cells of the next surface's colour, scrubbed by
scroll: Work → Toolkit, Revisions → Contact (Hero → Statement removed, owner 2026-10-10). 25 columns × 4 rows (12 at
tablet, 6 on mobile), hard cuts per cell, deterministic order. None under reduced motion.

### Motion summary
| Edit term | Library | Ease / duration |
|---|---|---|
| Cut | GSAP `set` | 0ms |
| Wipe | GSAP or Motion | `--ease-wipe` cubic-bezier(.76,0,.24,1), `--dur-base` 320ms – `--dur-slow` 640ms |
| Reveal | GSAP SplitText | `--ease-out` cubic-bezier(.16,1,.3,1), `--dur-slow` 640ms |
| Scrub | GSAP ScrollTrigger | linear to scroll |
| Trace / draw | GSAP DrawSVG (site), anime.js (diagrams, dimensions) | scroll-linked / `--dur-scene` 1100ms |
| Spring | Motion | stiffness 320, damping 32, mass 0.6 |

With reduced motion: every sequence shows its final state, native scrolling, no cursor, no pinning.
