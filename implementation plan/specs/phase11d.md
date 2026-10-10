# Phase 11d — About Sheet: Full-Bleed Portrait

## Objective

The owner asked for a new style for the about section (Sheet 02, the Statement). They chose
direction B (2026-10-10): the portrait becomes a full-bleed band with three role words set large over
it, after the oliverjeffers.com about page (Inspo `oliverjeffers-com--about`). The statement follows
below. It stays in the Build Sheet language: flat, square, hairline, token-only.

## Prerequisites

Phase 11c complete.

## Owner-approved exception (2026-10-10)

This widens the Phase 11c photo exception (design.md principle 3). The portrait may run full-bleed,
once, in Sheet 02. It is still the only photograph on the site. Record it in the Decisions log and
amend design.md §1 principle 3 and §7 Statement.

## Subtasks

| ID     | Subtask |
|--------|---------|
| P11d.1 | Log the exception; amend design.md |
| P11d.2 | Full-bleed portrait band |
| P11d.3 | Role words over the band |
| P11d.4 | Statement below the band |

## Reference study (2026-10-10)

- **oliverjeffers.com/about (Inspo).** A black-and-white portrait fills the first screen edge to
  edge. Three role words ("Artist · Observer · Translator") are spread across it on one line, with a
  single hand-drawn underline running under all three. The text follows below the photo.
- **Kexsio "Cursor Grid Scramble Image Hover"** was looked at. Its code needs a subscription, so
  nothing is taken from it.

## Execution

### P11d.1 — Exception

Add the Decisions-log row dated 2026-10-10 and edit design.md to match.

### P11d.2 — Full-bleed portrait band

- Sheet 02 (paper, "Sheet 02 — Notes", sr-only h2 "Notes") opens with the portrait as a full-bleed
  band: edge to edge of the viewport, outside the content container.
- **Height:** 85svh from 1024px, 75svh from 640px, and 80svh below that. The photo is cropped to
  cover the band, with the head kept in frame at every width (focal point right of centre, as in
  P11c.5).
- **Drift:** with motion allowed (any pointer), the photo layer is 110% of the band and drifts
  vertically while the band crosses the viewport, scrubbed. Transform only.
- **Reveal:** the Phase 11c pixel reveal stays. Paper-colour square cells cover the band, 25 columns
  from 1024px, 12 from 640px and 6 below, with as many rows as it takes to cover the band. They clear
  in a scattered order as the band enters. Reduced motion and no JS: the photo is simply there.
- **Under the band**, inside the content container: a mono caption strip with
  "Fig. 01 — Mohamed Faiz" on the left and "Chennai, India · Rev. current" on the right.
- **Image:** served through the image pipeline with `sizes="100vw"`, never the original file. It is
  not lazy (it sits just below the fold), causes no layout shift, and is not the LCP element.
  Alt text is unchanged.
- The band has no frame, no ticks and no Dimension. A full-bleed photo is not a plate.

### P11d.3 — Role words over the band

- Three role words sit on one line across the lower third of the band, spread across the full
  content width (`justify-between` on the content grid). Below 640px they stack, left-aligned.
- *As built:* the hairline draws and the words cut in while the words row's bottom moves from 100%
  to 85% of the viewport, so all three are shown by the time the whole band fits on screen.
- **Words:** `Systems`, `Retrieval`, `Interfaces` (they mirror the statement's three examples) *(owner confirmed
  2026-10-10)*. They are kept in content (profile), not in the component.
- **Type:** display face at `h1` size, in ink. *As built:* `h2` (`h3` at 640–1023); at `h1` "Interfaces" ran past the
  viewport at 1440. Each word sits on a paper-colour label strip (padding
  one spacing step), so contrast never depends on the photo underneath. The strips are flat and
  square, with no shadow or blur.
- **Underline:** one hairline in ink under all three words, the full content width. It draws in
  (RuleDraw) as the band reaches the middle of the viewport.
- **Motion:** the words cut in one after another (hard cut, opacity) as the band crosses 60% of the
  viewport, after the underline has drawn. Reduced motion and no JS: everything is shown.
- **Accessibility:** the words are a real list ("Systems, Retrieval, Interfaces") in the
  accessibility tree. The photo keeps its own alt text.

### P11d.4 — Statement below the band

- Below the caption strip, the statement goes back to columns 2–10 from 1024px (full width below
  that), keeping the ScrubText accent band from Phase 11c.
- The old right-column plate (Portrait plate, Dimension, caption) is removed.
- The scene keeps exactly one trace via. It moves to the left margin, level with the top of the
  statement (below the band), so the trace never crosses the photo. *As built:* the band sits on
  `z-content`, above the trace layer, so the trace's run down the margin passes behind the photo.
- The Hero → Statement pixel seam stays and ends flush against the top of the band. *(Removed
  2026-10-10 at the owner's request; the band now meets the hero with a hard edge.)*

## Open items

- ~~Role words~~ — resolved: owner confirmed Systems · Retrieval · Interfaces (2026-10-10).

## Validation criteria

- [x] Decisions log has the 2026-10-10 full-bleed row, and design.md principle 3 and §7 Statement
      match.
- [x] The band is exactly the viewport's width at 360, 768, 1440 and 1920, at the specified heights,
      with the head in frame in all four screenshots. 0 horizontal overflow.
- [x] The three words are on one line from 640px and stacked below. The underline spans the content
      width. Every word's strip gives ≥ 4.5:1 ink on paper. The screen-reader tree reads the three
      words as a list.
- [x] With motion: the reveal clears fully once the band is in view, the underline draws and the
      words cut in, in order, and the photo drifts. Reverse scroll undoes all of it. Reduced motion:
      a static photo with all words and the underline shown.
- [x] The served image is a `/_next/image` URL, never the original file. CLS is 0 on load and while
      scrolling. No frames over 20ms caused by the band during a full scroll at 1280×800.
- [x] Statement in columns 2–10 with the accent band intact. One trace via, below the band. The
      Hero seam is flush with the band.
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. No new packages.

## Validation result — 2026-10-10

Production build (`next start` on :3111), DevTools MCP Chrome.

- **Exception.** A Decisions-log row covers the full-bleed portrait. design.md principle 3 and §7
  Statement describe the band.
- **Band.** It is exactly the page width at every size: 360 → 360×624 (80svh), 768 → 753×768
  (75svh), 1440 → 1425×765 (85svh), 1920 → 1905×918 (85svh). The head is in frame in the 390, 768,
  1440 and 1920 screenshots. Horizontal overflow is 0 at 360 (full-page sweep), 390, 768, 1440 and
  1920.
- **Words.** On one line at 768 (h3: 31–194, 277–446, 529–722 inside 753), 1440 and 1920 (h2).
  Stacked at 360 and 390. The underline spans the content width. Ink on the paper strips measures
  16.2:1. The words are a 3-item `ul` in the accessibility tree.
- **Motion.** When the band first fits on screen at 1440×900, the reveal has 0 cells left, the
  underline is at scaleX 1 and all three words are visible. Scrolling back above the band hides all
  three, and returning shows them again. The photo drifts. Under reduced motion (forced through
  `matchMedia`, JS paths only) there are 0 cells, all words are visible, the underline is untouched
  and there is no drift.
- **Image and performance.** It is served as `/_next/image?url=%2Fassets%2Fportrait.jpg` at
  responsive widths, and the original file is never referenced. LCP is still the hero line ("Daddy's
  Home."). CLS is 0.0000 on load and while scrolling. A full scroll at 1280×800 gave 430 frames:
  0 over 20ms (max 17ms).
- **Statement.** It sits in columns 2–10 (start 2, span 9) with the accent band intact. Sheet 02 has
  exactly one `data-via`, below the band. The band sits above the trace layer, so the trace passes
  behind the photo. The Hero seam ends flush with the band's top (0px gap at 1440).
- `npm run lint` passed (content valid), tests 41/41, `npm run build` passed. No console errors or
  warnings. No new packages.
