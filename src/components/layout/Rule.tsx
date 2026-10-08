import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Line weight goes through a local --rule-w so orientation and emphasis stay
 * independent. Preflight already sets border-style: solid and margin: 0.
 */
const ruleClasses = {
  orientation: {
    horizontal: "h-0 w-full [border-block-start-width:var(--rule-w)]",
    vertical:
      "h-auto w-0 self-stretch border-t-0 [border-inline-start-width:var(--rule-w)]",
  },
  emphasis: {
    hair: "[--rule-w:var(--border-hair)] border-rule",
    active: "[--rule-w:var(--border-active)] border-accent",
  },
} as const;

export type RuleProps = Omit<ComponentPropsWithRef<"hr">, "children"> & {
  /** Vertical rules need a flex/grid parent to stretch against. */
  orientation?: keyof typeof ruleClasses.orientation;
  /** `hair`: 1px --rule (decorative). `active`: 1.5px --accent (an active mark). */
  emphasis?: keyof typeof ruleClasses.emphasis;
};

/**
 * Static hairline. `data-rule` (= orientation) is the hook the motion layer
 * (RuleDraw, Phase 6) uses to draw it in.
 */
export function Rule({
  orientation = "horizontal",
  emphasis = "hair",
  className,
  ...rest
}: RuleProps) {
  return (
    <hr
      data-rule={orientation}
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        ruleClasses.orientation[orientation],
        ruleClasses.emphasis[emphasis],
        className,
      )}
      {...rest}
    />
  );
}
