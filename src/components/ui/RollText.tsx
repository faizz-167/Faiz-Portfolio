import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

/*
 * The label and an aria-hidden copy stacked in a clipped box; on hover or
 * keyboard focus of the nearest Link/Button (`group/control`) both slide up
 * one line. translateY only. Static under (hover: none) — Tailwind gates hover
 * variants behind (hover: hover) and the copy is not rendered visibly — and
 * under reduced motion (motion-safe: gate).
 */
const rollClasses = {
  root: "relative inline-flex overflow-clip align-bottom",
  layer: [
    "block transition-transform duration-(--dur-base) ease-out",
    "motion-safe:group-hover/control:-translate-y-full",
    "motion-safe:group-focus-visible/control:-translate-y-full",
  ].join(" "),
  copy: "absolute inset-x-0 top-full [@media(hover:none)]:hidden",
} as const;

export type RollTextProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /** Plain text: it is rendered twice. */
  children: string;
};

/** Nav-link label that rolls up to an identical copy. Place inside `Link` or `Button`. */
export function RollText({ children, className, ...rest }: RollTextProps) {
  return (
    <span className={cn(rollClasses.root, className)} {...rest}>
      <span className={rollClasses.layer}>{children}</span>
      <span aria-hidden="true" className={cn(rollClasses.layer, rollClasses.copy)}>
        {children}
      </span>
    </span>
  );
}
