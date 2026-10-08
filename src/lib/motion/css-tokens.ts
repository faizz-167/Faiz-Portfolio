/**
 * Runtime reads of px tokens defined in globals.css (`--space-*`, `--margin-x`…),
 * so JS geometry (Trace, Dimension, Magnetic) uses the same values as CSS
 * instead of duplicating numbers.
 *
 * Only tokens whose computed value is a px length can be read: px literals
 * (`--space-*`) or custom properties registered with `@property … <length>`
 * (`--margin-x`), which the browser resolves (clamp/vw) to px. Anything else
 * throws, so a token that changes shape fails loudly instead of reading as 0.
 *
 * Browser-only: call from effects / event handlers / observers, never during
 * render (ensureStatic prerender has no `window`). A pure style read: it never
 * writes, so callers can batch it with other reads.
 */
export function readPxToken(name: `--${string}`, element?: Element) {
  const raw = getComputedStyle(element ?? document.documentElement).getPropertyValue(name).trim();
  const px = /^(-?[\d.]+)px$/.exec(raw);
  if (!px?.[1]) throw new Error(`readPxToken: ${name} is "${raw}", not a px length`);
  return Number.parseFloat(px[1]);
}
