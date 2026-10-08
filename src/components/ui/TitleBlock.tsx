import type { ComponentPropsWithRef, ReactNode } from "react";
import { Text } from "@/components/type/Text";
import { cn } from "@/lib/cn";

type Cols4 = 1 | 2 | 3 | 4;
type Cols8 = Cols4 | 5 | 6 | 7 | 8;
type Cols12 = Cols8 | 9 | 10 | 11 | 12;

export type TitleBlockCell = {
  /** Sentence case, e.g. "Drawn by". */
  label: string;
  value: ReactNode;
  /** Columns this cell spans. Clamped to each tier's column count. Default 1. */
  span?: Cols12;
};

/** Cells per row, by tier: base <640px, md 640–1023px (Tailwind `sm:`), lg ≥1024px. */
export type TitleBlockColumns = { base?: Cols4; md?: Cols8; lg?: Cols12 };

/*
 * Hairline cell grid (design.md §4 level 1, "Ruled"): every cell draws a full
 * 1px --rule box pulled up and left by one hairline, so shared edges overlap
 * into a single line and a row left short by a spanning cell is still closed.
 * The block's top/left padding gives the pulled-back cells their room.
 */
const titleBlockClasses = {
  root: "grid pt-(--border-hair) pl-(--border-hair)",
  cell: "-mt-(--border-hair) -ml-(--border-hair) flex min-w-0 flex-col gap-2 border-hair border-rule p-3",
  value: "font-mono text-data text-fg break-words",
  columns: {
    base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" },
    md: {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
      7: "sm:grid-cols-7",
      8: "sm:grid-cols-8",
    },
    lg: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
      7: "lg:grid-cols-7",
      8: "lg:grid-cols-8",
      9: "lg:grid-cols-9",
      10: "lg:grid-cols-10",
      11: "lg:grid-cols-11",
      12: "lg:grid-cols-12",
    },
  },
  span: {
    base: { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" },
    md: {
      1: "sm:col-span-1",
      2: "sm:col-span-2",
      3: "sm:col-span-3",
      4: "sm:col-span-4",
      5: "sm:col-span-5",
      6: "sm:col-span-6",
      7: "sm:col-span-7",
      8: "sm:col-span-8",
    },
    lg: {
      1: "lg:col-span-1",
      2: "lg:col-span-2",
      3: "lg:col-span-3",
      4: "lg:col-span-4",
      5: "lg:col-span-5",
      6: "lg:col-span-6",
      7: "lg:col-span-7",
      8: "lg:col-span-8",
      9: "lg:col-span-9",
      10: "lg:col-span-10",
      11: "lg:col-span-11",
      12: "lg:col-span-12",
    },
  },
} as const;

export type TitleBlockProps = Omit<ComponentPropsWithRef<"dl">, "children"> & {
  cells: readonly TitleBlockCell[];
  /** Default `{ base: 2, md: 3, lg: 6 }`. A tier inherits the previous tier's value. */
  columns?: TitleBlockColumns;
};

/**
 * Drawing-sheet title block: a `<dl>` of hairline cells, each a sentence-case
 * mono muted label above a mono value. Used by SheetStrip (P8), the Contact
 * footer (P10) and case-page headers (P11).
 */
export function TitleBlock({
  cells,
  columns = { base: 2, md: 3, lg: 6 },
  className,
  ...rest
}: TitleBlockProps) {
  const base = columns.base ?? 1;
  const md = columns.md ?? base;
  const lg = columns.lg ?? md;
  return (
    <dl
      className={cn(
        titleBlockClasses.root,
        titleBlockClasses.columns.base[base],
        titleBlockClasses.columns.md[md],
        titleBlockClasses.columns.lg[lg],
        className,
      )}
      {...rest}
    >
      {cells.map((cell) => {
        const span = cell.span ?? 1;
        return (
          <div
            key={cell.label}
            className={cn(
              titleBlockClasses.cell,
              titleBlockClasses.span.base[Math.min(span, base) as Cols4],
              titleBlockClasses.span.md[Math.min(span, md) as Cols8],
              titleBlockClasses.span.lg[Math.min(span, lg) as Cols12],
            )}
          >
            <Text as="dt" variant="data" tone="muted">
              {cell.label}
            </Text>
            <dd className={titleBlockClasses.value}>{cell.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
