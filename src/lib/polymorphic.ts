import type { ComponentPropsWithRef, ElementType } from "react";

/**
 * Props for a component that renders as `E` (via `as`) and adds `Own` props.
 * Native props of `E` are forwarded; `Own` wins on name clashes.
 * Uses `ComponentPropsWithRef` because React 19 passes `ref` as a plain prop,
 * so client callers (motion layer) can attach refs to these server primitives.
 */
export type PolymorphicProps<
  E extends ElementType,
  Own extends object = object,
> = Own & { as?: E } & Omit<ComponentPropsWithRef<E>, keyof Own | "as">;
