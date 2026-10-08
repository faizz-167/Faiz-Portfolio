"use client";

import { useRef, type ElementType } from "react";
import { SplitSource } from "@/components/motion/SplitSource";
import { gsap, SplitText, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import type { PolymorphicProps } from "@/lib/polymorphic";

/** Starting ink of each word (design.md §7 Statement: 20% → 100%). */
const START_OPACITY = 0.2;
/* Scrub range (phase6.md P6.2). */
const SCRUB_START = "top 75%";
const SCRUB_END = "bottom 40%";
/* Words ink in one after another: each word's share of the scrub, in timeline units. */
const WORD_STAGGER = 0.1;

type ScrubTextOwnProps = {
  /** Plain text only (rendered twice: visible + screen-reader copy). */
  children: string;
  className?: string;
};

export type ScrubTextProps<E extends ElementType = "p"> = PolymorphicProps<E, ScrubTextOwnProps>;

/**
 * Scrub (design.md §7): words ink in from 20% to 100% opacity, linked to
 * scroll. Opacity only — no blur, no transform. Words are split without
 * lines, so no re-split is needed on resize.
 *
 * Server HTML is the full-ink text. Reduced motion: no split, full ink.
 */
export function ScrubText<E extends ElementType = "p">({
  as,
  children,
  className,
  ...rest
}: ScrubTextProps<E>) {
  const Component: ElementType = as ?? "p";
  const root = useRef<HTMLElement>(null);
  const target = useRef<HTMLSpanElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const { words } = SplitText.create(el, { type: "words", tag: "span", aria: "none" });
        const scrub = gsap.fromTo(
          words,
          { opacity: START_OPACITY },
          {
            opacity: 1,
            ease: "none",
            stagger: WORD_STAGGER,
            scrollTrigger: {
              trigger: root.current,
              start: SCRUB_START,
              end: SCRUB_END,
              scrub: true,
            },
          },
        );
        // Initialise every staggered child now (split time) rather than one by one
        // as the scrub reaches it mid-scroll; ScrollTrigger then sets the real progress.
        scrub.progress(1).progress(0);
      });
    },
    { scope: root },
  );

  return (
    <Component {...rest} ref={root} className={className}>
      <SplitSource text={children} targetRef={target} />
    </Component>
  );
}
