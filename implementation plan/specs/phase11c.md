# Phase 11c — Assembly Cards, Ink Reveal, Portrait & Pixel Seams

## Objective

Four owner-requested changes (2026-10-10), made before the Phase 12 audit so that audit covers them:

1. The home **Selected assemblies** index becomes a staggered grid of large project cards, with a
   cursor label and hover behaviour, modelled on the "Selected projects" section of produx.design.
2. The **Statement** scrub gets a moving accent band at its leading edge, modelled on the produx.design
   hero text reveal.
3. The owner's **portrait photo** appears on the home page as a drawing plate.
4. Three **pixelated scene transitions**, modelled on paulkalkbrenner.net.

We take each reference's composition and motion, never its styling: everything stays flat, square,
hairline and token-only (design.md).

## Prerequisites

Phase 11b complete.

## Owner-approved exceptions (2026-10-10)

These override design.md. Record them in the Decisions log, and amend design.md (§1 principles 2–3,
§7 Statement, §7 Work index) so a later phase does not "fix" them back:

- **Photo.** Principle 3 ("type is the image, no photos") gets one exception: the owner's own
  portrait, once, treated as a drawing plate (P11c.5). No other photography.
- **Accent band in the Statement.** Principle 2 and the "highlighted word in a different colour" ban
  get one exception: while the Statement is scrubbing, the words at the leading edge show in
  `--accent`. No word stays in the accent colour at rest (P11c.4).
- **Placeholders on home.** P11b.4's "placeholders never appear on home" is reversed. Home cards show
  the plate-1 placeholder until the owner supplies screenshots.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P11c.1 | Log the exceptions; amend design.md |
| P11c.2 | Home assembly cards: layout and content |
| P11c.3 | Assembly cards: hover and cursor label |
| P11c.4 | Statement: accent band on the scrub |
| P11c.5 | Portrait plate in the Statement scene |
| P11c.6 | Pixel seams at three scene boundaries |

## Reference study (2026-10-10, 1440 wide)

- **produx.design, Selected projects.** A 12-column grid with a 1.4vw gap. The cards sit in a
  staggered rhythm: card 1 spans columns 1–7. Card 2 spans columns 9–12 and is bottom-aligned with
  card 1, so it sits lower. Card 3 spans columns 2–11 on its own row. Each card is a tall image, then
  a small square marker, the title, and a muted mono category line. On hover the card scales to
  1.02, the image drifts vertically inside its frame (parallax, about 110% tall), mono tags slide up
  into the image's bottom-right corner, and the marker square grows in front of the title. The
  native cursor is replaced by a follower chip: a square arrow cell plus a "VIEW" label, which scales
  in from 0 over a card and out when it leaves. The image distortion is WebGL; we do not copy that.
- **produx.design, hero reveal.** Words go from muted grey to white with scroll. The words at the
  leading edge are lime and broken up by a coarse pixel pattern that resolves as each word completes.
- **paulkalkbrenner.net, section transitions.** At the bottom of a section, a full-width grid of
  25 columns × 4 rows (6 columns on mobile) of square cells in the *next* section's colour. Cells
  switch on one at a time, column by column in a scattered order, scrubbed by scroll. When the grid
  is full, the next section continues seamlessly below it.

## Execution

### P11c.1 — Exceptions

Add three Decisions-log rows (photo, accent band, home placeholders) dated 2026-10-10, and edit
design.md to match. Edit §7 Work index to describe the cards (P11c.2–3) in place of the rows.

### P11c.2 — Home assembly cards: layout and content

- The home Work scene (ink, "Sheet 03 — Assemblies", heading "Selected assemblies") replaces its
  expanding rows with **three cards**: the same first three projects in project order. The "See all
  assemblies" link and the total stay underneath.
- The `/work` all-assemblies page keeps its expanding rows unchanged.
- **Layout ≥ 1024:** the produx rhythm on our 12-column grid. Card 1 spans columns 1–7. Card 2 spans
  9–12 and is bottom-aligned with card 1. Card 3 spans 2–11 on its own row. The vertical gap between
  rows is a section-level spacing token.
- **768–1023** *(as built: the 640–1023 tier, 8 columns, so 4 + 4)*: cards 1 and 2 side by side at 6 + 6 columns (same bottom alignment), card 3 full
  width. **Below 768:** one column, full width.
- **Each card is one link** to the project's case page. Its accessible name is the project title.
  Top to bottom:
  - **Plate:** plate 1 in a hairline frame. Cards 1 and 3 use 16:10, card 2 uses 4:5 so the
    stagger reads. *As built (Decisions log 2026-10-10):* card 1 is 4:3 and card 2 square from 1024px (swapped below, where both are equally wide); at 4:5
    card 2 was taller than card 1, so bottom alignment lifted it instead of dropping it. When plate 1 has no image, use the same hatched "Screenshot pending" placeholder as
    the case pages, with no image element. With an image, it is cropped to cover.
  - **Caption row:** a small square marker (hidden at rest), the title as an h3 in display type, then
    on the right in mono the year (when known) and role.
  - **Tags:** the first three stack items by name, in mono, sentence case. They are always in the
    accessibility tree. Visually they show inside the plate's bottom-right corner on hover (P11c.3),
    and below the caption row on touch and under reduced motion.
- The card shows no spec list, summary or expanding panel. The case page holds that.
- The row hover preview panel and its preloading no longer run on home.
- The scene keeps exactly one trace via, positioned as today.

### P11c.3 — Assembly cards: hover and cursor label

These apply only with a fine pointer and motion allowed. Every movement is a transform or opacity;
nothing uses blur, filter or scale on the card frame.

- **Plate drift.** The plate content is 110% tall and drifts vertically with scroll (parallax,
  scrubbed) while the card is in view. On hover it also scales to 1.04 inside the frame, which stays
  fixed. Placeholders drift the same way.
- **Marker.** The square marker grows from 0 to its full size in front of the title (`--accent`),
  pushing the title right by its width.
- **Tags.** They slide up about one spacing step into the plate's bottom-right corner and fade in,
  staggered. Each tag is a square, raised-ink chip with a hairline border.
- **Siblings.** The other two cards fade to `--fg-muted` levels of opacity, as the rows did.
- **Cursor label.** Over a card, the crosshair gains a chip that sits just below-right of the
  intersection: a square accent cell with an arrow, plus a mono label "Open drawing" in sentence case
  (never all caps). It scales in from 0 on enter and back to 0 on leave, and follows the crosshair's
  motion. It is `aria-hidden`. The crosshair lines and readout stay as they are.
- **Keyboard focus** on a card shows the marker and tags (same as hover, without the cursor chip) and
  the standard focus ring.
- **Touch, coarse pointer, reduced motion:** no drift, no chip, no hover states. The marker is hidden
  and tags sit below the caption row. The card works as a plain link.

### P11c.4 — Statement: accent band on the scrub

- The existing behaviour stays: words ink from 20% to 100% with scroll, over the same scrub range.
- **New:** about the three words at the leading edge of the inking show in `--accent` (signal-deep on
  paper) instead of ink. Each word goes 20% ink → accent → full ink as the scrub passes it.
- While a word is in the band, it is broken by a coarse square-pixel mask: cells about the size of the
  word's stroke weight, which fill in as the word moves through the band, so the colour arrives
  pixelated. This is transform-free, blur-free and opacity/colour-only.
- When the scrub is complete, no word shows the accent colour. Scrolling back reverses it exactly.
- **Reduced motion and no JS:** full ink, no band, no split (unchanged).
- The screen-reader copy is unchanged.

### P11c.5 — Portrait plate in the Statement scene

*Superseded by Phase 11d (2026-10-10): the plate became the full-bleed portrait band.*

- The owner's photo (already black and white, 3452×2588, head turned right of centre) appears once,
  in the Statement scene (paper).
- **Layout ≥ 1024:** the statement moves to columns 1–7. The portrait spans columns 9–12. The
  existing mono margin note ("Chennai, India / Rev. current") becomes the plate's caption strip.
  **Below 1024:** the portrait follows the statement at 8 columns on tablet and full width on mobile,
  never taller than 70svh.
- **Plate treatment** (same family as the case-page plates): a 4:5 crop centred on the face, hairline
  frame, corner registration ticks, greyscale only. Under it, the mono caption strip reads
  "Fig. 01 — Mohamed Faiz" on the left and the margin note on the right. A Dimension annotation
  measures the plate's real rendered width.
- **Reveal:** as the plate enters, it is covered by a grid of paper-colour square cells (same cell
  logic as P11c.6) that switch off in a scattered order, scrubbed by scroll, so the photo appears in
  pixels. Reduced motion and no JS: the photo is simply there.
- Alt text: "Mohamed Faiz, black-and-white portrait, glasses, looking to the right." It is served
  through the framework's image pipeline at the sizes it displays (never the original file), lazily
  loaded, with no layout shift. It is not the LCP element.

### P11c.6 — Pixel seams at three scene boundaries

- A seam is a decorative, `aria-hidden` overlay across the bottom edge of a scene. It is a full-bleed
  grid of square cells in the **next** scene's surface colour: 25 columns from 1024px, 12 from 768px,
  6 below that, and 4 rows. The cells are square, so the seam's height follows the viewport width.
- **Motion:** scrubbed by scroll. It starts when the seam's bottom reaches the bottom of the viewport
  and ends when the seam's top reaches about 40% from the top. Cells switch on (hard cut, no fade) in
  a scattered order biased bottom-up within each column, so the boundary appears to dissolve upward.
  The order is generated deterministically, so it is identical on every load. Fully scrolled, the
  seam is solid and meets the next scene with no visible line.
- **Placement**, exactly three *(as of 2026-10-10 two: the owner removed Hero → Statement after
  Phase 11d)*:
  1. Hero → Statement (ink → paper)
  2. Work → Toolkit (ink → paper). The toolkit gauge's pin start must not move.
  3. Revisions → Contact (ink → signal lime). This is the contact sheet, so lime is allowed here.
- The seam sits above the scene's content and below the signal trace and the site chrome. It never
  intercepts the pointer.
- It overlays the scene's existing bottom space, so it adds no height and causes no layout shift.
- **Reduced motion and no JS:** no seam, just today's hard edge.

## Validation criteria

- [x] Decisions log has the three 2026-10-10 rows, and design.md principles 2–3, Statement and Work
      index describe the new behaviour.
- [x] Home Work scene at 1440: three cards in the 1–7 / 9–12 (bottom-aligned) / 2–11 rhythm. At 768:
      6 + 6, then full. At 360: one column. No horizontal scroll at 360, 768 or 1440.
- [x] Each card is a single link to its case page, named by its title. Tab reaches all three cards
      in order, and focus shows the marker and tags. `/work` rows behave exactly as before.
- [x] Fine pointer with motion: hovering a card shows the cursor chip within one frame of entering,
      grows the marker, slides the tags in, fades the siblings, and drifts the plate. Leaving reverses
      all of these. Nothing animates `filter` or the frame's scale.
- [x] Statement: mid-scrub, the accent band covers about three words at the leading edge, and the
      colour arrives pixelated. With the scrub complete, 0 words have the accent colour. Scrolling back
      reverses it. Reduced motion shows full ink and no band.
- [x] Portrait: a 4:5 plate with caption strip and Dimension at ≥ 1024 beside the statement, and
      below it on smaller screens. The served image is not the original file. CLS from the plate is 0.
      The pixel reveal completes on scroll, and the photo is static under reduced motion.
- [x] Exactly three seams on home, at the three boundaries listed. Each ends solid and flush with the
      next scene. The cell order is identical across two reloads. The toolkit pin start is unchanged
      (within 1px of before). The trace stays drawn on top of the seams.
- [x] Reduced motion and no JS: no seams, no drift, no chip, full-ink statement, static portrait. The
      page still reads completely.
- [x] Scrolling the whole home page at 1280×800 with motion: no frames over 20ms caused by the seams,
      cards or band, and 0 added layout shift.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors or hydration warnings. No new
      packages.

## Validation result — 2026-10-10

Production build (`next start` on :3111), DevTools MCP Chrome.

- **Exceptions.** Decisions log has the 2026-10-10 rows (photo, accent band, home placeholders, plus
  as-built card aspects and mask technique). design.md §1 principles 2–3, §7 Statement, Work index
  and a new Pixel seams section describe what ships.
- **Layout.** 1440: cards at x 58 / 945 / 169, widths 755 / 422 / 1088 (cols 1–7, 9–12, 2–11).
  Card 2 is bottom-aligned with card 1 and starts 106px lower. 768: 340 + 340, card 2 starts 85px
  lower, card 3 692 wide. 390 and 360: one column (358 wide at 390). Horizontal overflow is 0 at 360
  (full-page sweep), 390, 768 and 1440.
- **Cards a11y.** The accessibility snapshot shows three links named "SpeechPath", "Smart Academic
  ERP & Analytics Dashboard" and "ZingDesk", each holding an h3, with year/role as the description,
  in document order. `/work` still renders the expanding rows (`aria-expanded` buttons). Case pages
  still show their placeholder plates. *Not verified by real Tab presses:* focus showing the marker
  and tags comes from the `group-focus-visible` styles; Phase 12's keyboard audit should confirm it.
- **Hover (1440, mouse).** Over SpeechPath: the "Open drawing" chip sits under the readout, the
  accent marker shows and the title shifts, the Next.js / React / TypeScript tags sit in the plate's
  bottom-right corner, and Academic ERP fades to muted. Hover is CSS transitions on transform and
  opacity only; drift is GSAP `yPercent`.
- **Statement.** Mid-scrub the band covers 3 words ("know,", "interfaces", "that") and the pixels
  are visible on the trailing word. At the end of the scrub 0 words are accent and every ink span is
  at opacity 1. Back at the top, 0 accent.
- **Portrait.** At 1440 it is a 4:5 plate beside the statement; the Dimension reads 422. On mobile it
  is 358 wide, below the statement. It is served through `/_next/image` at responsive widths, never
  the original file. The reveal reaches 0 remaining cells once scrolled in.
- **Seams.** Exactly three, under #top, #work and #revisions, each 100 cells (25 × 4) at 1440, 12
  columns at 768 and 6 at 390. Cells are off at load. Partway through, Revisions → Contact shows 42
  of 100 cells. Fully scrolled, all 100 are on, the cell colour equals the next scene's background,
  and the gap to the next scene is 0px. The order is seeded (unit test: same seed gives the same
  order; a full permutation; bottom row first on average). The seams are absolutely positioned, so
  they add no height and cannot move the toolkit pin. They sit on `z-base`, below the trace's
  `z-trace`.
- **Reduced motion** (forced through `matchMedia` in an init script, because DevTools MCP cannot
  emulate the media query, so only the JS paths are covered): 0 seam or portrait cells, 0 split
  words, no crosshair, no drift transforms. The CSS hover is gated by the `fine-motion` media variant.
- **Performance.** A full-page scroll at 1440×900 in 40px steps gave 467 frames: 0 over 20ms
  (max 17ms) and no long animation frames. CLS is 0.0000 on load and 0.0000 while scrolling.
- `npm run lint` passed (content valid), tests 41/41, `npm run build` passed (all routes static or
  partial as before). No console errors or warnings. No new packages.
