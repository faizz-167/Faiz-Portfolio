import type { Ref } from "react";

/*
 * Shared inner markup for split-text components (SplitReveal, ScrubText).
 *
 * The visible copy is aria-hidden and is the only thing SplitText touches; a
 * sr-only twin carries the sentence for assistive tech. The accessible text is
 * therefore identical before JS, after the split and after a re-split, on any
 * element (SplitText's own aria="auto" puts aria-label on the element, which
 * screen readers ignore on generic elements such as <p>/<div>).
 *
 * `text-wrap: wrap` overrides the global heading `balance`: split lines must
 * break exactly where the server-rendered text broke (no reflow on split).
 */
export function SplitSource({ text, targetRef }: { text: string; targetRef: Ref<HTMLSpanElement> }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={targetRef} aria-hidden="true" className="block text-wrap">
        {text}
      </span>
    </>
  );
}
