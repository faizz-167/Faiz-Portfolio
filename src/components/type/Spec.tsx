import type { ComponentPropsWithRef, ReactNode } from "react";
import { Text } from "@/components/type/Text";
import { cn } from "@/lib/cn";

type Cols4 = 1 | 2 | 3 | 4;
type Cols8 = Cols4 | 5 | 6 | 7 | 8;
type Cols12 = Cols8 | 9 | 10 | 11 | 12;

export type SpecItem = {
  /** Sentence case, e.g. "Role". */
  term: string;
  detail: ReactNode;
};

/** Items per row, by column tier: base <640px, md 640–1023px (Tailwind `sm:`), lg ≥1024px. */
export type SpecColumns = { base?: Cols4; md?: Cols8; lg?: Cols12 };

/*
 * k equal tracks with a --gutter gap land exactly on the page column lines
 * whenever k divides --cols (4/8/12), and still work outside a page grid
 * (e.g. inside a padded raised row), so no subgrid is required.
 */
const specClasses = {
  base: "grid gap-x-gutter gap-y-5",
  item: "flex flex-col gap-2",
  columns: {
    base: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    },
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
} as const;

export type SpecProps = Omit<ComponentPropsWithRef<"dl">, "children"> & {
  items: readonly SpecItem[];
  /** Default `{ base: 2, lg: 4 }`. A tier inherits the previous tier's value. */
  columns?: SpecColumns;
};

/** Key/value data as a `<dl>`: mono muted term above a small serif detail. */
export function Spec({
  items,
  columns = { base: 2, lg: 4 },
  className,
  ...rest
}: SpecProps) {
  return (
    <dl
      className={cn(
        specClasses.base,
        columns.base !== undefined && specClasses.columns.base[columns.base],
        columns.md !== undefined && specClasses.columns.md[columns.md],
        columns.lg !== undefined && specClasses.columns.lg[columns.lg],
        className,
      )}
      {...rest}
    >
      {items.map((item) => (
        <div key={item.term} className={specClasses.item}>
          <Text as="dt" variant="data" tone="muted">
            {item.term}
          </Text>
          <Text as="dd" variant="small">
            {item.detail}
          </Text>
        </div>
      ))}
    </dl>
  );
}
