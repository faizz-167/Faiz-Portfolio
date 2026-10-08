import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * `group/control` is shared by Link and Button so RollText (and Button's own
 * parts) react to the nearest interactive ancestor's hover and keyboard focus.
 * Tailwind gates every hover variant behind (hover: hover).
 * Only transform animates: the underline is a scaleX'd pseudo-element.
 */
const linkClasses = {
  base: "group/control",
  root: {
    /* Standalone link: 44px target, underline draws in from the left, out to the right. */
    draw: "inline-flex min-h-touch min-w-touch items-center gap-1",
    /* Link inside body copy: inline (WCAG 2.5.8 inline exception), always underlined. */
    inline:
      "underline decoration-1 underline-offset-[0.2em] hover:decoration-2 focus-visible:decoration-2",
    /* Navigation link: 44px target, no underline; put a RollText inside. */
    nav: "inline-flex min-h-touch min-w-touch items-center",
    /* No decoration and no box: the caller styles it (Button). */
    plain: "",
  },
  label: {
    draw: [
      "relative",
      "after:absolute after:inset-x-0 after:-bottom-1 after:h-(--border-hair) after:bg-current",
      "after:origin-right after:scale-x-0",
      "after:transition-transform after:duration-(--dur-base) after:ease-out",
      "group-hover/control:after:origin-left group-hover/control:after:scale-x-100",
      "group-focus-visible/control:after:origin-left group-focus-visible/control:after:scale-x-100",
      /* No hover on this device: show the underline so the link still reads as one. */
      "[@media(hover:none)]:after:scale-x-100",
    ].join(" "),
    inline: "",
    nav: "",
    plain: "contents",
  },
} as const;

export type LinkVariant = keyof typeof linkClasses.root;

type NextLinkProps = ComponentPropsWithRef<typeof NextLink>;

/** Native anchor props plus the `next/link` options that apply to internal hrefs. */
export type LinkProps = Omit<ComponentPropsWithRef<"a">, "href" | "children"> &
  Pick<NextLinkProps, "prefetch" | "replace" | "scroll" | "onNavigate"> & {
  href: string;
  children: ReactNode;
  /** Default `draw`. */
  variant?: LinkVariant;
  /** Show the trailing ↗ on external links. The screen-reader text is always present. Default true. */
  externalIcon?: boolean;
  /** Force external treatment. Default: inferred from `href` (`http(s)://` or `//`). */
  external?: boolean;
};

const EXTERNAL_HREF = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;
const NATIVE_HREF = /^(?:mailto|tel|sms):/i;

export function isExternalHref(href: string) {
  return EXTERNAL_HREF.test(href);
}

/**
 * Internal hrefs go through `next/link`; external ones open in a new tab with
 * `rel="noopener noreferrer"`, an aria-hidden ↗ and visually hidden
 * "(opens in new tab)"; `mailto:`/`tel:` render a plain `<a>`.
 */
export function Link({
  href,
  variant = "draw",
  externalIcon = true,
  external,
  className,
  children,
  prefetch,
  replace,
  scroll,
  onNavigate,
  ...rest
}: LinkProps) {
  const isExternal = external ?? isExternalHref(href);
  const rootClassName = cn(linkClasses.base, linkClasses.root[variant], className);
  const label = <span className={linkClasses.label[variant] || undefined}>{children}</span>;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={rootClassName} {...rest}>
        {label}
        {/* A text glyph, not an SVG: Chrome may break a line before an atomic
            inline; a narrow no-break space (U+202F) keeps this ↗ on the last line. */}
        {externalIcon && (
          <span aria-hidden="true">
            {"\u202f↗"}
          </span>
        )}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  if (NATIVE_HREF.test(href)) {
    return (
      <a href={href} className={rootClassName} {...rest}>
        {label}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      onNavigate={onNavigate}
      className={rootClassName}
      {...rest}
    >
      {label}
    </NextLink>
  );
}
