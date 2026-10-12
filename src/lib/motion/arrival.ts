/**
 * Hard load vs client navigation (P12f.1). Shared by the route wipe and the
 * /work plate cut-in so they always agree.
 *
 * A "hard-load view" is the first view of the URL the browser itself loaded
 * (typed, refreshed, external link). Once any client navigation has happened in
 * this document it is never true again, including when the visitor comes back
 * to that same URL later.
 *
 * Arrival animations that hide content must skip a hard-load view: the server
 * HTML has already painted by the time a layout effect could hide anything, so
 * hiding it there flashes (show → hide → show).
 */

let navigated = false;

/* The document's navigation entry holds the URL the browser actually loaded. */
function documentPath() {
  const entry = performance.getEntriesByType("navigation")[0];
  return entry ? new URL(entry.name).pathname : null;
}

/** Called by the route watcher on every pathname it sees. */
export function noteRoute(pathname: string) {
  if (pathname !== documentPath()) navigated = true;
}

/** True only on the first view of the URL the browser loaded. Call from effects. */
export function isHardLoadView() {
  if (navigated) return false;
  if (window.location.pathname !== documentPath()) {
    navigated = true;
    return false;
  }
  return true;
}
