import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Inline SVG icons (design.md §6): 16-unit grid, 1.5px stroke that stays 1.5px
 * at any size (non-scaling-stroke), square caps, currentColor. Sized to the
 * surrounding text (1em) and always decorative: the label carries the meaning.
 */
const iconPaths = {
  "arrow-right": <path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" />,
  "arrow-up-right": <path d="M4 12 12 4M5.5 4H12v6.5" />,
  copy: (
    <>
      <path d="M5.5 5.5h8v8h-8z" />
      <path d="M10.5 5.5v-3h-8v8h3" />
    </>
  ),
} as const;

export type IconName = keyof typeof iconPaths;

const iconClasses = {
  base: "inline-block size-[1em] shrink-0 overflow-visible *:[vector-effect:non-scaling-stroke]",
} as const;

export type IconProps = Omit<ComponentPropsWithRef<"svg">, "children"> & {
  name: IconName;
};

export function Icon({ name, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={cn(iconClasses.base, className)}
      {...rest}
    >
      {iconPaths[name]}
    </svg>
  );
}

export function ArrowRightIcon(props: Omit<IconProps, "name">) {
  return <Icon name="arrow-right" {...props} />;
}

export function ArrowUpRightIcon(props: Omit<IconProps, "name">) {
  return <Icon name="arrow-up-right" {...props} />;
}

export function CopyIcon(props: Omit<IconProps, "name">) {
  return <Icon name="copy" {...props} />;
}
