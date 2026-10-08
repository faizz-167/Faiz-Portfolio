import type { ComponentPropsWithRef, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icons";
import { isExternalHref, Link, type LinkProps } from "@/components/ui/Link";
import { cn } from "@/lib/cn";

/*
 * design.md §6. Square, flat, mono "data" label, ≥ 44×44px.
 * Hover / keyboard focus (on the root; inner parts use the named group "control",
 * shared with Link so RollText works inside a Button too):
 * - solid/outline: a "::before" fill (--wipe: lime on ink, signal-deep on paper,
 *   ink on signal) scales X 0 → 1 from the left and out to the right, --ease-wipe.
 *   On outline it overhangs the 1px border, so the border takes the fill colour too.
 * - ghost: an "::after" underline under the label scales X the same way.
 * - icon translates 4px on X.
 * Only transform animates. The label colour is a hard cut (--dur-cut) at the
 * wipe's midpoint (--dur-fast = half of --dur-base), not a colour tween.
 * Pressed: translateY(1px) cut, held while :active.
 */
const buttonClasses = {
  base: [
    "group/control relative inline-flex items-center justify-center gap-2",
    "min-w-touch font-mono text-data select-none cursor-pointer",
    "active:translate-y-px",
    "disabled:cursor-not-allowed disabled:active:translate-y-0",
  ].join(" "),
  /* Label colour swap: a cut at the wipe midpoint (no reduced-motion delay). */
  labelCut: [
    "transition-[color] duration-(--dur-cut) delay-(--dur-fast) motion-reduce:delay-0",
    "hover:text-on-wipe focus-visible:text-on-wipe",
  ].join(" "),
  wipe: [
    "before:absolute before:bg-wipe",
    "before:origin-right before:scale-x-0",
    "before:transition-transform before:duration-(--dur-base) before:ease-wipe",
    "hover:before:origin-left hover:before:scale-x-100",
    "focus-visible:before:origin-left focus-visible:before:scale-x-100",
    "disabled:before:hidden",
  ].join(" "),
  variant: {
    solid: "bg-fg text-surface before:inset-0",
    /* The fill overhangs the border by its width, so the border wipes too. */
    outline: "border-hair border-fg text-fg before:-inset-(--border-hair)",
    ghost: "text-fg",
  },
  /* Disabled: muted label, dashed rule border, no fill, no motion. */
  disabled:
    "disabled:border-hair disabled:border-dashed disabled:border-rule disabled:bg-transparent disabled:text-fg-muted",
  size: {
    md: "min-h-touch px-4",
    lg: "min-h-control-lg px-5",
  },
  /* Positioned so it paints above the ::before fill. */
  content: "relative inline-flex items-center gap-2",
  ghostLabel: [
    "relative",
    "after:absolute after:inset-x-0 after:-bottom-1 after:h-(--border-hair) after:bg-current",
    "after:origin-right after:scale-x-0",
    "after:transition-transform after:duration-(--dur-base) after:ease-wipe",
    "group-hover/control:after:origin-left group-hover/control:after:scale-x-100",
    "group-focus-visible/control:after:origin-left group-focus-visible/control:after:scale-x-100",
    "[@media(hover:none)]:after:scale-x-100",
  ].join(" "),
  icon: [
    "transition-transform duration-(--dur-base) ease-wipe",
    "group-hover/control:translate-x-1 group-focus-visible/control:translate-x-1",
    "group-disabled/control:translate-x-0",
  ].join(" "),
} as const;

export type ButtonVariant = keyof typeof buttonClasses.variant;
export type ButtonSize = keyof typeof buttonClasses.size;
export type ButtonIcon = IconName | "none";

type ButtonOwnProps = {
  /** Default "solid". One solid per scene at most. */
  variant?: ButtonVariant;
  /** "md" 44px (default), "lg" 56px. */
  size?: ButtonSize;
  /** Trailing icon. Default: "arrow-right" for internal links, "arrow-up-right" for external, none for buttons. */
  icon?: ButtonIcon;
  /** Sentence case. */
  children: ReactNode;
  className?: string;
};

type ButtonAsLinkProps = ButtonOwnProps &
  Omit<LinkProps, keyof ButtonOwnProps | "variant" | "externalIcon"> & { href: string };

type ButtonAsButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithRef<"button">, keyof ButtonOwnProps> & { href?: undefined };

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

export function buttonClassName({
  variant = "solid",
  size = "md",
  className,
}: Pick<ButtonOwnProps, "variant" | "size" | "className">) {
  return cn(
    buttonClasses.base,
    buttonClasses.variant[variant],
    buttonClasses.size[size],
    variant !== "ghost" && buttonClasses.wipe,
    variant !== "ghost" && buttonClasses.labelCut,
    buttonClasses.disabled,
    className,
  );
}

function ButtonContent({
  variant,
  icon,
  children,
}: {
  variant: ButtonVariant;
  icon: ButtonIcon;
  children: ReactNode;
}) {
  return (
    <span className={buttonClasses.content}>
      <span className={variant === "ghost" ? buttonClasses.ghostLabel : undefined}>{children}</span>
      {icon !== "none" && <Icon name={icon} className={buttonClasses.icon} />}
    </span>
  );
}

/**
 * "<button type="button">", or a "Link" (internal or external) when "href" is given.
 * Focus ring comes from the global ":focus-visible" style.
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant = "solid", size = "md", icon, className, children, href, ...rest } = props;
    const resolvedIcon = icon ?? (isExternalHref(href) ? "arrow-up-right" : "arrow-right");
    return (
      <Link
        href={href}
        variant="plain"
        externalIcon={false}
        className={buttonClassName({ variant, size, className })}
        {...rest}
      >
        <ButtonContent variant={variant} icon={resolvedIcon}>
          {children}
        </ButtonContent>
      </Link>
    );
  }

  const { variant = "solid", size = "md", icon = "none", className, children, type, ...rest } = props;
  return (
    <button
      type={type ?? "button"}
      className={buttonClassName({ variant, size, className })}
      {...rest}
    >
      <ButtonContent variant={variant} icon={icon}>
        {children}
      </ButtonContent>
    </button>
  );
}
