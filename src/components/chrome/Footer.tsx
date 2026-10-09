"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/Link";
import { RollText } from "@/components/ui/RollText";
import { profile } from "@/content";
import { cn } from "@/lib/cn";
import { homeHref, sectionHref, sections } from "./nav";

/** The home page folds the footer into the Contact title block (P10.6). */
const HOME = "/";

/*
 * The site footer landmark. It carries the section links in plain HTML, so a
 * phone without JavaScript (where the dock's Menu button can't open) still
 * reaches every section. Below 1024px its bottom padding matches the dock plus
 * the safe area, so the last line scrolls clear of the fixed dock.
 */
const footerClasses = {
  root: [
    "px-margin border-t-(length:--border-hair) border-rule",
    "pb-[calc(var(--dock-h)+env(safe-area-inset-bottom))] lg:pb-0",
  ].join(" "),
  links: "flex flex-wrap items-center justify-between gap-x-5 font-mono text-data",
  list: "flex flex-wrap items-center gap-x-4",
} as const;

/**
 * The name (top of home / home) and the section links, plain HTML. Rendered by
 * the root `Footer` and, on the home page, inside the Contact title block.
 */
export function FooterLinks({ pathname, className }: { pathname: string; className?: string }) {
  return (
    <div className={cn(footerClasses.links, className)}>
      <Link variant="nav" href={homeHref(pathname)}>
        <RollText>{profile.name}</RollText>
      </Link>
      <nav aria-label="Footer">
        <ul className={footerClasses.list}>
          {sections.map((section) => (
            <li key={section.id}>
              <Link variant="nav" href={sectionHref(pathname, section.id)}>
                <RollText>{section.label}</RollText>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Every route but home: nothing may follow the signal Contact scene there, and
 * its title block carries these links instead (owner decision 2026-10-08).
 */
export function Footer() {
  const pathname = usePathname();
  if (pathname === HOME) return null;
  return (
    <footer className={footerClasses.root}>
      <FooterLinks pathname={pathname} />
    </footer>
  );
}
