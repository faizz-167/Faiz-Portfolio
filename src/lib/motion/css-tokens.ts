/**
 * Runtime reads of px tokens defined in globals.css (`--space-*`, `--margin-x`,
 * `--border-active`…), so JS geometry (Trace, Dimension, Magnetic) uses the same
 * values as CSS instead of duplicating numbers.
 *
 * Browser-only: call from effects / event handlers / observers, never during
 * render (ensureStatic prerender has no `window`).
 */

/** Resolved px value of a length custom property on `element` (default <html>). 0 if unset. */
export function readPxToken(name: `--${string}`, element?: Element) {
  const el = element ?? document.documentElement;
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  if (raw.endsWith("px") || /^-?[\d.]+$/.test(raw)) return Number.isFinite(n) ? n : 0;
  // clamp()/calc()/rem: let the browser resolve it on a probe.
  return resolveLength(raw, el);
}

function resolveLength(value: string, parent: Element) {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:${value};block-size:0`;
  parent.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}
