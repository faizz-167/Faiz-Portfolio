import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Scene surfaces (design.md §2.1). One per scene; remaps --bg/--fg/--accent… */
export const surfaces = ["ink", "paper", "signal"] as const;
export type Surface = (typeof surfaces)[number];

const sceneClasses = {
  /* Section rhythm is block padding only (never a padding shorthand). */
  base: "relative py-section",
} as const;

/** Id the scene's heading must carry, unless `labelledBy` is given. */
export function sceneTitleId(id: string) {
  return `${id}-title`;
}

export type SceneProps = Omit<
  ComponentPropsWithRef<"section">,
  "id" | "children"
> & {
  /** Anchor and nav target. */
  id: string;
  /** Human label shown in the SheetStrip, e.g. "Sheet 04 — Bill of materials". */
  sheet: string;
  surface: Surface;
  /** Id of the heading that names this scene. Defaults to `sceneTitleId(id)`. */
  labelledBy?: string;
  children: ReactNode;
};

/**
 * A home-page view: `<section id data-sheet data-surface aria-labelledby>`.
 * `data-surface` paints the background and remaps the content colours.
 */
export function Scene({
  id,
  sheet,
  surface,
  labelledBy,
  className,
  children,
  ...rest
}: SceneProps) {
  return (
    <section
      id={id}
      data-sheet={sheet}
      data-surface={surface}
      aria-labelledby={labelledBy ?? sceneTitleId(id)}
      className={cn(sceneClasses.base, className)}
      {...rest}
    >
      {children}
    </section>
  );
}
