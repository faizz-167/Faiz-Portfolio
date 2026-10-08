import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { PolymorphicProps } from "@/lib/polymorphic";

/** Where direct children sit on the page grid's named lines. */
const containerClasses = {
  base: "page-grid",
  content: "*:col-content",
  full: "*:col-full",
} as const;

type ContainerOwnProps = {
  /** Place direct children on the `full` lines (edge to edge) instead of `content`. */
  bleed?: boolean;
  className?: string;
};

export type ContainerProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  ContainerOwnProps
>;

/**
 * The page grid (`.page-grid`): margin tracks + 4/8/12 content columns.
 * Every direct child spans the `content` lines (or `full` with `bleed`).
 * To mix bleed and content children, use two Containers.
 */
export function Container<E extends ElementType = "div">({
  as,
  bleed = false,
  className,
  ...rest
}: ContainerProps<E>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn(
        containerClasses.base,
        bleed ? containerClasses.full : containerClasses.content,
        className,
      )}
      {...rest}
    />
  );
}
