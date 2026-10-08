"use client";

import { useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases, staggersS } from "@/lib/motion/tokens";
import { willChangeDuring } from "@/lib/motion/will-change";
import type { PolymorphicProps } from "@/lib/polymorphic";

/** Rules draw when their top passes 90% of the viewport. */
const DRAW_START = "top 90%";

type RuleDrawOwnProps = {
  className?: string;
};

export type RuleDrawProps<E extends ElementType = "div"> = PolymorphicProps<E, RuleDrawOwnProps>;

/**
 * Progressive enhancement over `Rule` (P6.4). Wrap any markup: every
 * `[data-rule]` inside draws in once as it scrolls into view — horizontal
 * rules `scaleX 0 → 1` from the left, vertical rules `scaleY 0 → 1` from the
 * top — with `--ease-wipe` / `--dur-base`, batched with ScrollTrigger.batch so
 * rules entering together stagger as one group.
 *
 * Rules are server-rendered at full length; the collapsed state is applied from
 * an effect. Reduced motion: rules stay static.
 * Renders a plain wrapper element (`as`, default div) that carries layout.
 */
export function RuleDraw<E extends ElementType = "div">({
  as,
  className,
  ...rest
}: RuleDrawProps<E>) {
  const Component: ElementType = as ?? "div";
  const root = useRef<HTMLElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const rules = gsap.utils.toArray<HTMLElement>("[data-rule]", el);
        if (rules.length === 0) return;
        const axis = (rule: Element) => (rule.getAttribute("data-rule") === "vertical" ? "Y" : "X");
        for (const rule of rules) {
          gsap.set(rule, axis(rule) === "X"
            ? { scaleX: 0, transformOrigin: "0% 50%" }
            : { scaleY: 0, transformOrigin: "50% 0%" });
        }
        ScrollTrigger.batch(rules, {
          start: DRAW_START,
          once: true,
          // Not contextSafe: batch fires synchronously for rules already in view, and
          // a context-safe call made during the context's own run recurses. A tween
          // that outlives a revert only ends at the rule's natural state (scale 1).
          onEnter: (batch) => {
            gsap.to(batch, {
              scaleX: 1,
              scaleY: 1,
              duration: durationsS.base,
              ease: gsapEases.wipe,
              stagger: staggersS.lines,
              clearProps: "transform,transformOrigin",
              ...willChangeDuring(batch, "transform"),
            });
          },
        });
      });
    },
    { scope: root },
  );

  return <Component {...rest} ref={root} className={className} />;
}
