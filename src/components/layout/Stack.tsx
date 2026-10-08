import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { PolymorphicProps } from "@/lib/polymorphic";

export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const stackClasses = {
  base: "flex flex-col",
  gap: {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    7: "gap-7",
    8: "gap-8",
    9: "gap-9",
    10: "gap-10",
    11: "gap-11",
    12: "gap-12",
  },
  align: {
    stretch: "items-stretch",
    start: "items-start",
    center: "items-center",
    end: "items-end",
  },
} as const;

type StackOwnProps = {
  /** `--space-N` between children. Default 5 (item → item, design.md §5). */
  gap?: SpaceStep;
  align?: keyof typeof stackClasses.align;
  className?: string;
};

export type StackProps<E extends ElementType = "div"> = PolymorphicProps<E, StackOwnProps>;

/** Vertical flow with token gaps. */
export function Stack<E extends ElementType = "div">({
  as,
  gap = 5,
  align = "stretch",
  className,
  ...rest
}: StackProps<E>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn(
        stackClasses.base,
        stackClasses.gap[gap],
        stackClasses.align[align],
        className,
      )}
      {...rest}
    />
  );
}
