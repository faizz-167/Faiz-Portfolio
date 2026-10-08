"use client";

import { useEffect, useRef } from "react";
import { COORDS_PLACEHOLDER, formatCoords } from "@/components/motion/Crosshair";
import { Link } from "@/components/ui/Link";
import { RollText } from "@/components/ui/RollText";
import { profile } from "@/content";
import { cn } from "@/lib/cn";
import { useActiveSheet } from "@/lib/hooks/useActiveSheet";
import { useLocalTime } from "@/lib/hooks/useLocalTime";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { SheetLabel } from "./SheetLabel";
import { DEFAULT_SURFACE, homeHref, sectionHref, sections } from "./nav";

/** "Chennai, India" → "Chennai": the strip names the city only (design.md §7). */
const CITY = profile.location.split(",")[0] ?? profile.location;

/*
 * Title-block cells (design.md §4 level 1): hairline-ruled, mono data text.
 * TitleBlock's stacked label-over-value cell is taller than --strip-h, so the
 * strip uses the same rule treatment with one line per cell.
 * Desktop only by CSS (`lg:flex`), so it is laid out before hydration and
 * mounting it never shifts the page; it is fixed and overlays scene padding.
 */
const stripClasses = {
  root: [
    "fixed inset-x-0 top-0 z-chrome hidden h-strip lg:flex",
    "border-b-(length:--border-hair) border-rule font-mono text-data",
  ].join(" "),
  cell: "flex min-w-0 items-center border-r-(length:--border-hair) border-rule px-4",
  first: "pl-margin",
  last: "border-r-0 pr-margin",
  label: "flex-1",
  meta: "gap-2 whitespace-nowrap",
  muted: "text-fg-muted",
  /* Fine pointers only, by CSS: the placeholder holds the width before the first move. */
  coords: "hidden text-fg-muted pointer-fine:inline",
  navList: "flex items-center gap-4",
} as const;

/**
 * Desktop sheet strip (P8.3), ≥1024px. Left: the name (home / top). Centre: the
 * active sheet with a vertical cut. Right: Chennai local time and, with a
 * mouse, live cursor coordinates. Then the section links.
 * Mirrors the active scene's `data-surface`, so its colours are that scene's
 * (no blend modes).
 */
export function SheetStrip({ pathname }: { pathname: string }) {
  const active = useActiveSheet();
  const time = useLocalTime(profile.timeZone);
  const pointerFine = usePointerFine();
  const coords = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = coords.current;
    if (!pointerFine || !el) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      // textContent, not state: a pointermove per frame must not re-render.
      el.textContent = formatCoords(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerFine]);

  return (
    <div data-surface={active?.surface ?? DEFAULT_SURFACE} className={stripClasses.root}>
      <div className={cn(stripClasses.cell, stripClasses.first)}>
        <Link variant="nav" href={homeHref(pathname)}>
          <RollText>{profile.name}</RollText>
        </Link>
      </div>
      <p className={cn(stripClasses.cell, stripClasses.label)}>
        <SheetLabel label={active?.sheet ?? ""} />
      </p>
      <p className={cn(stripClasses.cell, stripClasses.meta)}>
        <span className={stripClasses.muted}>{CITY}</span>
        <span>{time}</span>
        <span ref={coords} aria-hidden="true" className={stripClasses.coords}>
          {COORDS_PLACEHOLDER}
        </span>
      </p>
      <nav aria-label="Sections" className={cn(stripClasses.cell, stripClasses.last)}>
        <ul className={stripClasses.navList}>
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
