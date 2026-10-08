import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { PolymorphicProps } from "@/lib/polymorphic";

type Cols4 = 1 | 2 | 3 | 4;
type Cols8 = Cols4 | 5 | 6 | 7 | 8;
type Cols12 = Cols8 | 9 | 10 | 11 | 12;

/**
 * Responsive placement, keyed by column tier (design.md §5):
 * `base` = 4 columns (<640px), `md` = 8 columns (640–1023px, Tailwind `sm:`),
 * `lg` = 12 columns (≥1024px). A tier inherits the previous tier's value.
 */
export type GridSpan = {
  base?: Cols4 | "full";
  md?: Cols8 | "full";
  lg?: Cols12 | "full";
};
export type GridStart = { base?: Cols4; md?: Cols8; lg?: Cols12 };

/*
 * Span uses `grid-column-end: span N` (not the `grid-column` shorthand) so a
 * span at one tier never resets a start set at another tier.
 * Literal class strings so Tailwind can see them.
 */
const gridClasses = {
  grid: "grid gap-x-gutter",
  columns: "grid-cols-[repeat(var(--cols),minmax(0,1fr))]",
  subgrid: "grid-cols-subgrid",
  span: {
    base: {
      1: "col-end-[span_1]",
      2: "col-end-[span_2]",
      3: "col-end-[span_3]",
      4: "col-end-[span_4]",
      full: "col-start-1 col-end-[-1]",
    },
    md: {
      1: "sm:col-end-[span_1]",
      2: "sm:col-end-[span_2]",
      3: "sm:col-end-[span_3]",
      4: "sm:col-end-[span_4]",
      5: "sm:col-end-[span_5]",
      6: "sm:col-end-[span_6]",
      7: "sm:col-end-[span_7]",
      8: "sm:col-end-[span_8]",
      full: "sm:col-start-1 sm:col-end-[-1]",
    },
    lg: {
      1: "lg:col-end-[span_1]",
      2: "lg:col-end-[span_2]",
      3: "lg:col-end-[span_3]",
      4: "lg:col-end-[span_4]",
      5: "lg:col-end-[span_5]",
      6: "lg:col-end-[span_6]",
      7: "lg:col-end-[span_7]",
      8: "lg:col-end-[span_8]",
      9: "lg:col-end-[span_9]",
      10: "lg:col-end-[span_10]",
      11: "lg:col-end-[span_11]",
      12: "lg:col-end-[span_12]",
      full: "lg:col-start-1 lg:col-end-[-1]",
    },
  },
  start: {
    base: { 1: "col-start-1", 2: "col-start-2", 3: "col-start-3", 4: "col-start-4" },
    md: {
      1: "sm:col-start-1",
      2: "sm:col-start-2",
      3: "sm:col-start-3",
      4: "sm:col-start-4",
      5: "sm:col-start-5",
      6: "sm:col-start-6",
      7: "sm:col-start-7",
      8: "sm:col-start-8",
    },
    lg: {
      1: "lg:col-start-1",
      2: "lg:col-start-2",
      3: "lg:col-start-3",
      4: "lg:col-start-4",
      5: "lg:col-start-5",
      6: "lg:col-start-6",
      7: "lg:col-start-7",
      8: "lg:col-start-8",
      9: "lg:col-start-9",
      10: "lg:col-start-10",
      11: "lg:col-start-11",
      12: "lg:col-start-12",
    },
  },
} as const;

function placement(span?: GridSpan, start?: GridStart) {
  return cn(
    start?.base !== undefined && gridClasses.start.base[start.base],
    start?.md !== undefined && gridClasses.start.md[start.md],
    start?.lg !== undefined && gridClasses.start.lg[start.lg],
    span?.base !== undefined && gridClasses.span.base[span.base],
    span?.md !== undefined && gridClasses.span.md[span.md],
    span?.lg !== undefined && gridClasses.span.lg[span.lg],
  );
}

type PlacementProps = {
  /** Columns to span in the parent grid, per tier. */
  span?: GridSpan;
  /** Start line in the parent grid, per tier. Keep start + span ≤ the tier's columns. */
  start?: GridStart;
  className?: string;
};

type GridOwnProps = PlacementProps & {
  /**
   * Inherit the parent grid's column tracks (`grid-template-columns: subgrid`).
   * Use it whenever this Grid is nested inside another Grid with a `span`,
   * so its columns stay on the page lines. Without it the Grid lays out
   * `--cols` equal tracks (aligned only when it spans the whole content area).
   */
  subgrid?: boolean;
};

export type GridProps<E extends ElementType = "div"> = PolymorphicProps<E, GridOwnProps>;
export type GridCellProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  PlacementProps
>;

/** Column grid aligned to the page's content lines (4/8/12 columns, `--gutter` gap). */
export function Grid<E extends ElementType = "div">({
  as,
  span,
  start,
  subgrid = false,
  className,
  ...rest
}: GridProps<E>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn(
        gridClasses.grid,
        subgrid ? gridClasses.subgrid : gridClasses.columns,
        placement(span, start),
        className,
      )}
      {...rest}
    />
  );
}

/** A leaf item placed on a Grid's columns via `span` / `start`. */
export function GridCell<E extends ElementType = "div">({
  as,
  span,
  start,
  className,
  ...rest
}: GridCellProps<E>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cn(placement(span, start), className)} {...rest} />;
}
