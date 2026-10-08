"use client";

import { useRef, type ElementType, type Ref } from "react";
import { cn } from "@/lib/cn";
import { mergeRefs } from "@/lib/merge-refs";
import { gsap, ScrollTrigger, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases } from "@/lib/motion/tokens";
import type { PolymorphicProps } from "@/lib/polymorphic";

/** Values of the display face's `wdth` axis (Anybody 50–150; rest = 100). */
export const widthAxis = {
  rest: 100,
  hover: 130,
  velocityMin: 85,
  velocityMax: 115,
  /* Hero compile cuts (phase9.md P9.4). */
  compressed: 50,
  stretched: 140,
} as const;

/** Scroll speed (px/s) that maps to the full 85–115 range. */
const VELOCITY_FULL_PX_S = 3000;
/** How long scrolling must stop before the width returns to rest (s). */
const VELOCITY_IDLE_S = durationsS.fast;

/** Elements whose hover/focus also flexes a WidthFlex inside them. */
const HOVER_HOST = "a, button, [data-flex-host]";

export type WidthFlexMode = "hover" | "velocity" | "compile";

type WidthFlexOwnProps = {
  /**
   * "hover": wdth 100 → 130 while the element (or its closest link/button/
   *   `[data-flex-host]`) is hovered or keyboard-focused, `--dur-base`.
   * "velocity": scroll speed → wdth 85–115, back to 100 when scrolling stops.
   * "compile": no behaviour of its own; a parent timeline animates `--wdth`
   *   on this element (pass `ref`).
   */
  mode: WidthFlexMode;
  /** Single display line. */
  children: string;
  className?: string;
  ref?: Ref<HTMLElement>;
};

export type WidthFlexProps<E extends ElementType = "span"> = PolymorphicProps<E, WidthFlexOwnProps>;

/**
 * Animates the registered `--wdth` custom property, which `font-display` reads
 * through `font-variation-settings`. That re-lays out the text every frame, so
 * it is only for one display line: `white-space: nowrap`, `contain: layout`,
 * and block-level so a wider line never moves its neighbours.
 * Reduced motion: static at wdth 100.
 */
export function WidthFlex<E extends ElementType = "span">({
  as,
  mode,
  children,
  className,
  ref,
  ...rest
}: WidthFlexProps<E>) {
  const Component: ElementType = as ?? "span";
  const root = useRef<HTMLElement | null>(null);
  useRefreshOnShow();

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe || mode === "compile") return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        if (mode === "hover") {
          const host = el.closest<HTMLElement>(HOVER_HOST) ?? el;
          const to = contextSafe((value: number) => {
            gsap.to(el, { "--wdth": value, duration: durationsS.base, ease: gsapEases.out, overwrite: true });
          });
          const flex = () => to(widthAxis.hover);
          const rest = () => {
            if (!host.matches(":hover") && !host.matches(":focus-visible")) to(widthAxis.rest);
          };
          const onFocus = () => host.matches(":focus-visible") && flex();
          host.addEventListener("pointerenter", flex);
          host.addEventListener("pointerleave", rest);
          host.addEventListener("focusin", onFocus);
          host.addEventListener("focusout", rest);
          return () => {
            host.removeEventListener("pointerenter", flex);
            host.removeEventListener("pointerleave", rest);
            host.removeEventListener("focusin", onFocus);
            host.removeEventListener("focusout", rest);
          };
        }

        // velocity
        const setWidth = gsap.quickTo(el, "--wdth", { duration: durationsS.base, ease: gsapEases.out });
        const toWidth = gsap.utils.pipe(
          gsap.utils.clamp(-VELOCITY_FULL_PX_S, VELOCITY_FULL_PX_S),
          gsap.utils.mapRange(
            -VELOCITY_FULL_PX_S,
            VELOCITY_FULL_PX_S,
            widthAxis.velocityMin,
            widthAxis.velocityMax,
          ),
        );
        const settle = gsap.delayedCall(VELOCITY_IDLE_S, () => setWidth(widthAxis.rest)).pause();
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            setWidth(toWidth(self.getVelocity()));
            settle.restart(true);
          },
        });
      });
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );

  return (
    <Component
      {...rest}
      ref={mergeRefs(root, ref)}
      className={cn("block whitespace-nowrap [contain:layout]", className)}
    >
      {children}
    </Component>
  );
}
