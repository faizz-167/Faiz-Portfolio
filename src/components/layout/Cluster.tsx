import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { PolymorphicProps } from "@/lib/polymorphic";
import type { SpaceStep } from "@/components/layout/Stack";

const clusterClasses = {
  base: "flex",
  wrap: { true: "flex-wrap", false: "flex-nowrap" },
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
    start: "items-start",
    center: "items-center",
    end: "items-end",
    baseline: "items-baseline",
    stretch: "items-stretch",
  },
  justify: {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  },
} as const;

type ClusterOwnProps = {
  /** `--space-N` between children. Default 4. */
  gap?: SpaceStep;
  align?: keyof typeof clusterClasses.align;
  justify?: keyof typeof clusterClasses.justify;
  /** Wrap onto new lines. Default true. */
  wrap?: boolean;
  className?: string;
};

export type ClusterProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  ClusterOwnProps
>;

/** Horizontal flow (labels, meta rows, button groups) with token gaps. */
export function Cluster<E extends ElementType = "div">({
  as,
  gap = 4,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  ...rest
}: ClusterProps<E>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn(
        clusterClasses.base,
        clusterClasses.wrap[wrap ? "true" : "false"],
        clusterClasses.gap[gap],
        clusterClasses.align[align],
        clusterClasses.justify[justify],
        className,
      )}
      {...rest}
    />
  );
}
