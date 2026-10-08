"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases } from "@/lib/motion/tokens";

const labelClasses = {
  root: "relative block min-w-0 overflow-clip",
  /* React owns the text of the incoming layer; GSAP only moves it. */
  current: "block truncate",
  /* The outgoing label is written imperatively for the length of one swap. */
  outgoing: "absolute inset-x-0 top-0 block truncate",
} as const;

/**
 * The active sheet name with a vertical cut: the old name leaves upward as the
 * new one arrives from below, inside a clipped one-line box (RollText's
 * geometry, GSAP-driven because the change comes from scroll, not hover).
 * First label and reduced motion: a plain cut.
 */
export function SheetLabel({ label, className }: { label: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  const outgoing = useRef<HTMLSpanElement>(null);
  const previous = useRef(label);

  useGSAP(
    () => {
      const from = previous.current;
      previous.current = label;
      const incoming = current.current;
      const leaving = outgoing.current;
      if (!incoming || !leaving || from === label) return;

      if (!from || prefersReducedMotion()) {
        leaving.textContent = "";
        gsap.set([incoming, leaving], { yPercent: 0 });
        return;
      }

      leaving.textContent = from;
      const swap = { duration: durationsS.base, ease: gsapEases.wipe, overwrite: true } as const;
      gsap.fromTo(leaving, { yPercent: 0 }, {
        ...swap,
        yPercent: -100,
        onComplete: () => {
          leaving.textContent = "";
        },
      });
      gsap.fromTo(incoming, { yPercent: 100 }, { ...swap, yPercent: 0 });
    },
    { scope: root, dependencies: [label] },
  );

  return (
    <span ref={root} className={cn(labelClasses.root, className)}>
      <span ref={current} className={labelClasses.current}>
        {/* A no-break space keeps the line box before the first scene registers. */}
        {label || "\u00a0"}
      </span>
      <span ref={outgoing} aria-hidden="true" className={labelClasses.outgoing} />
    </span>
  );
}
