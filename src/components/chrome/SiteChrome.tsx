"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Link } from "@/components/ui/Link";
import { useSheetTracker } from "@/lib/hooks/useActiveSheet";
import { Dock } from "./Dock";
import { Menu } from "./Menu";
import { SheetStrip } from "./SheetStrip";

/** The `<main>` id the skip link targets (root layout). */
export const CONTENT_ID = "content";

/*
 * Off-screen until focused (two of its heights up, so its inset never leaves a
 * sliver), then pinned over the strip, inset so the 3px-offset focus ring
 * isn't cut by the viewport edge. A translate cut, instant with or without motion.
 */
const skipClasses =
  "fixed top-1 left-1 z-overlay -translate-y-[200%] px-margin font-mono text-data focus:translate-y-0";

/**
 * Site chrome (Phase 8), mounted once in the root layout — never hidden by
 * <Activity>, so the scene tracker, Lenis hooks and the menu state outlive
 * route changes. Renders `<header>` (skip link, desktop strip, mobile dock)
 * and, beside it, the menu dialog, so the dialog stays live while the header,
 * main and footer are inert.
 */
export function SiteChrome() {
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  useSheetTracker(pathname);

  // Any route change (link, back/forward) closes the menu. Adjusting state
  // during render is React's pattern for "reset when a prop changes".
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header>
        <Link variant="nav" href={`#${CONTENT_ID}`} data-surface="ink" className={skipClasses}>
          Skip to content
        </Link>
        <SheetStrip pathname={pathname} />
        <Dock
          pathname={pathname}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
          triggerRef={trigger}
        />
      </header>
      <Menu open={menuOpen} onClose={closeMenu} pathname={pathname} returnFocusTo={trigger} />
    </>
  );
}
