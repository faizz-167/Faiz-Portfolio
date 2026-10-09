import "react";

// Lets `style` carry CSS custom properties (`--name`) with type checking instead
// of a cast. Used where a data-derived value feeds a CSS calculation (P10.6).
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
