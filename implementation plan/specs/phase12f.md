# Phase 12f — Work Page: No Flash on Hard Load

## Objective

On a hard load of `/work` (typed URL, refresh, external link), the floating plates paint in the
server HTML, then hydration hides them and they cut in one by one: show, hide, show. Remove the
flash without hiding content from anyone whose JavaScript is slow or missing.

## Prerequisites

Phase 12e complete.

## Cause

The server HTML is the resting state (principle 7: works without the show). The arrival cut-in
hides the plates in a layout effect after hydration. By then the browser has already painted them,
so on a hard load the hidden state lands after first paint. Arrivals by client navigation don't
flash: the route wipe covers the page while the plates hide.

## Decision (owner)

*Owner chose A (2026-10-12).*

**A. No cut-in on a hard load (recommended).** The plates are simply there on the first view of
the URL the browser loaded. Client navigations into `/work` (e.g. "See all assemblies" from home)
keep the cut-in under the route wipe, as now. Nothing is ever hidden before JavaScript runs, so a
slow or failed script can't leave the page empty. Cost: someone who lands directly on `/work`
never sees the cut-in.

**B. Hide before first paint.** A tiny script that runs before the first paint marks the document
as "JS + motion". CSS hides the plates only under that mark, and the cut-in reveals them. This
keeps the cut-in on hard loads. Cost: a site-wide pre-paint script, and while the page bundle
loads the plates are hidden. That needs a CSS failsafe that shows them after a fixed time (2s)
if the cut-in never ran. On a slow connection the plates can then be missing for up to 2s.

I'd take A: it removes the flash with no state where content is hidden, and most visitors reach
`/work` from the home page, where the cut-in still plays.

## Subtasks (for A)

| ID     | Subtask |
|--------|---------|
| P12f.1 | Shared "is this a hard load of this URL" check |
| P12f.2 | Skip the cut-in on a hard load |
| P12f.3 | Record it |

## Execution (for A)

### P12f.1 — Hard-load check

One shared check answers "is this the first view of the URL the browser loaded". It is true only
for the first mount on the document's own path. After any client navigation it is false, and that
includes coming back to `/work` later in the same visit. The route wipe already makes this
decision. It and the cut-in use the same check, so they can't disagree.

### P12f.2 — Skip the cut-in

On a hard load the plates are never hidden and never cut in. On a client-navigation arrival the
cut-in runs as now. Parallax and hover are unaffected either way.

### P12f.3 — Record it

Decisions-log row and design.md's `/work` paragraph: the cut-in plays on client-navigation
arrivals only.

## Validation criteria (for A)

- [x] Hard load of `/work` at 1440 (sampled every animation frame from the first frame): every
      plate is visible in every frame. It never goes hidden.
- [x] Refresh on `/work`: same as above.
- [x] Home → "See all assemblies" (client navigation): the plates cut in one by one after the
      title, under the route wipe, as before.
- [x] Hard load of `/work` → a case page → back to `/work` (client): the cut-in plays on the way
      back.
- [x] Hard load of a case page: the route wipe still doesn't play (unchanged behaviour).
- [x] Reduced motion and no JS: unchanged (plates static and visible).
- [x] `npm run lint`, tests and `npm run build` pass. No console errors. No new packages.

## Validation result — 2026-10-12

Production build (`next start` on :3111), DevTools MCP Chrome, plates sampled every animation
frame from the first frame (on-screen plates only).

- **Hard load of `/work`.** 134 frames, 0 plates hidden in every frame, no wipe.
- **Refresh.** 133 frames, 0 hidden.
- **Home → "See all assemblies" (client).** From the first on-screen frame all 5 plates are hidden
  under the wipe, then they cut in (5→4→3→2→1→0). The first run showed plates visible for a few
  frames before hiding: the hide was inside the timeline's 160ms delay. It now happens in the
  layout effect; the second run starts at 5 hidden.
- **Hard load of `/work` → SpeechPath → back (client).** The cut-in plays on the way back.
- **Hard load of a case page.** No wipe. Case page → another case page (client): wipe plays.
- **Reduced motion (forced), client navigation into `/work`.** 0 plates hidden in any frame.
- No JS: unchanged; server HTML has every plate in place (nothing in this phase hides before JS).
- `npm run lint`, tests 41/41 and `npm run build` pass. No console errors. No new packages.
