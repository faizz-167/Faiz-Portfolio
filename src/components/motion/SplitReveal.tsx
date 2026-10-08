"use client";

import { useRef, type ElementType } from "react";
import { SplitSource } from "@/components/motion/SplitSource";
import { gsap, SplitText, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases, staggersS } from "@/lib/motion/tokens";
import { willChangeDuring } from "@/lib/motion/will-change";
import type { PolymorphicProps } from "@/lib/polymorphic";

export type SplitUnit = "lines" | "words" | "chars";

/* What SplitText splits per unit. Lines are always split so the mask is a line. */
const splitTypes: Record<SplitUnit, string> = {
  lines: "lines",
  words: "lines,words",
  chars: "lines,words,chars",
};

/** Scroll trigger: reveal when the element's top passes 85% of the viewport. */
const SCROLL_START = "top 85%";

type SplitRevealOwnProps = {
  /** Plain text only (it is rendered twice: visible + screen-reader copy). */
  children: string;
  /** Unit that moves. Default "lines". Every unit is clipped by a line mask. */
  split?: SplitUnit;
  /** "mount": on hydration. "scroll" (default): once, when it scrolls into view. */
  trigger?: "mount" | "scroll";
  /** Seconds before the reveal starts. Default 0. */
  delay?: number;
  /** Seconds between units. Default: the unit's token in `staggersS`. */
  stagger?: number;
  className?: string;
};

export type SplitRevealProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  SplitRevealOwnProps
>;

/**
 * Reveal (design.md §7 motion summary): text rises into place line by line
 * (or word/char) behind `overflow: clip` line masks. SplitText `autoSplit`
 * re-splits on resize and font load, and the reveal is rebuilt in `onSplit`
 * so its progress survives a re-split.
 *
 * The server HTML is the plain, final text; the hidden state is applied from
 * an effect (never in markup). Reduced motion: no split, no transform.
 */
export function SplitReveal<E extends ElementType = "div">({
  as,
  children,
  split = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  className,
  ...rest
}: SplitRevealProps<E>) {
  const Component: ElementType = as ?? "div";
  const root = useRef<HTMLElement>(null);
  const target = useRef<HTMLSpanElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        SplitText.create(el, {
          type: splitTypes[split],
          mask: "lines",
          // Default div wrappers: SplitText only gives block/inline-block display
          // (needed for transforms and the clip mask) to non-span tags.
          aria: "none",
          autoSplit: true,
          onSplit(self) {
            const units = self[split];
            // Hidden state as an explicit set (not a from-tween): every unit's transform
            // is parsed here, at split time, instead of lazily as each staggered child
            // starts mid-scroll (measured ~50ms of getComputedStyle per second at 4× CPU).
            gsap.set(units, { yPercent: 110 });
            return gsap.to(units, {
              yPercent: 0,
              duration: durationsS.slow,
              ease: gsapEases.out,
              delay,
              stagger: stagger ?? staggersS[split],
              clearProps: "transform",
              ...willChangeDuring(units, "transform"),
              ...(trigger === "scroll" && {
                scrollTrigger: { trigger: root.current, start: SCROLL_START, once: true },
              }),
            });
          },
        });
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
