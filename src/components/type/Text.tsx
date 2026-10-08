import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { PolymorphicProps } from "@/lib/polymorphic";

/*
 * Each text-* utility carries size, line-height, tracking and weight from the
 * type scale (design.md §3.2). font-display reads the animatable --wdth axis
 * (registered @property, default 100).
 */
const textClasses = {
  variant: {
    mega: "font-display text-mega",
    h1: "font-display text-h1",
    h2: "font-display text-h2",
    h3: "font-display text-h3",
    lede: "font-text text-lede max-w-lede",
    body: "font-text text-body max-w-measure",
    small: "font-text text-small max-w-measure",
    data: "font-mono text-data",
  },
  element: {
    mega: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    lede: "p",
    body: "p",
    small: "p",
    data: "span",
  },
  tone: {
    fg: "text-fg",
    muted: "text-fg-muted",
    /* The signal as text on this surface: lime on ink, signal-deep on paper. */
    signal: "text-accent",
  },
} as const;

export type TextVariant = keyof typeof textClasses.variant;
export type TextTone = keyof typeof textClasses.tone;

type TextOwnProps = {
  variant?: TextVariant;
  /** Omit to inherit the surrounding colour. */
  tone?: TextTone;
  className?: string;
};

export type TextProps<E extends ElementType = "p"> = PolymorphicProps<E, TextOwnProps>;

/**
 * Type-scale text. Default element follows the variant (mega/h1 → h1, h2 → h2,
 * h3 → h3, lede/body/small → p, data → span); override with `as`.
 * lede caps at 48ch, body/small at 62ch.
 */
export function Text<E extends ElementType = "p">({
  as,
  variant = "body",
  tone,
  className,
  ...rest
}: TextProps<E>) {
  const Component: ElementType = as ?? textClasses.element[variant];
  return (
    <Component
      className={cn(
        textClasses.variant[variant],
        tone && textClasses.tone[tone],
        className,
      )}
      {...rest}
    />
  );
}
