"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/Link";
import { RollText } from "@/components/ui/RollText";
import { profile } from "@/content";
import { homeHref, sectionHref, sections } from "./nav";

/*
 * The site footer landmark. It carries the section links in plain HTML, so a
 * phone without JavaScript (where the dock's Menu button can't open) still
 * reaches every section. Below 1024px its bottom padding matches the dock plus
 * the safe area, so the last line scrolls clear of the fixed dock.
 * The Contact scene's title block (Phase 10) is page content, not this footer.
 */
const footerClasses = {
  root: [
    "flex flex-wrap items-center justify-between gap-x-5 px-margin",
    "border-t-(length:--border-hair) border-rule font-mono text-data",
    "pb-[calc(var(--dock-h)+env(safe-area-inset-bottom))] lg:pb-0",
  ].join(" "),
  list: "flex flex-wrap items-center gap-x-4",
} as const;

export function Footer() {
  const pathname = usePathname();
  return (
    <footer className={footerClasses.root}>
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
    </footer>
  );
}
