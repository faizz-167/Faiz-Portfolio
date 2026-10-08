"use client";

import { motion, useSpring } from "motion/react";
import { useLayoutEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { cn } from "@/lib/cn";
import { readPxToken } from "@/lib/motion/css-tokens";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { spring } from "@/lib/motion/tokens";

/** Maximum pull (design.md §6: up to 12px = --space-3). */
const PULL_TOKEN = "--space-3";

const springOptions = { stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass };

export type MagneticProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Magnetic pull (P6.7): while the pointer is over the wrapper, the child is
 * translated toward it — up to 12px at the edges, proportional in between —
 * on the design spring; it springs back on leave.
 * Only with a fine pointer and motion allowed (both false on the server, so
 * the server HTML is a plain inline-block wrapper). Motion owns this element's
 * transform; don't animate the wrapper with anything else.
 */
export function Magnetic({ children, className }: MagneticProps) {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotion();
  const enabled = pointerFine && !reduced;
  const x = useSpring(0, springOptions);
  const y = useSpring(0, springOptions);
  const box = useRef<{ cx: number; cy: number; hw: number; hh: number; pull: number } | null>(null);

  // Hidden routes (<Activity>) and a disabled state both rest at 0.
  useLayoutEffect(() => {
    return () => {
      box.current = null;
      x.jump(0);
      y.jump(0);
    };
  }, [enabled, x, y]);

  const onPointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    // One read per hover, not per move.
    const r = event.currentTarget.getBoundingClientRect();
    box.current = {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      hw: r.width / 2 || 1,
      hh: r.height / 2 || 1,
      pull: readPxToken(PULL_TOKEN),
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const b = box.current;
    if (!b) return;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    x.set(clamp((event.clientX - b.cx) / b.hw) * b.pull);
    y.set(clamp((event.clientY - b.cy) / b.hh) * b.pull);
  };

  const onPointerLeave = () => {
    box.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      style={enabled ? { x, y } : undefined}
      onPointerEnter={enabled ? onPointerEnter : undefined}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerLeave={enabled ? onPointerLeave : undefined}
    >
      {children}
    </motion.span>
  );
}
