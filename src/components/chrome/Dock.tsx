"use client";

import { useRef, type Ref } from "react";
import { Button } from "@/components/ui/Button";
import { useActiveSheet } from "@/lib/hooks/useActiveSheet";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases } from "@/lib/motion/tokens";
import { SheetLabel } from "./SheetLabel";
import { DEFAULT_SURFACE, MENU_ID, MOBILE_QUERY } from "./nav";

/*
 * Scroll speed (px/s) a direction must reach before the dock reacts. Below it,
 * the tail of a Lenis ease or a finger resting on the screen would flicker the
 * dock; above it, the intent to read on (hide) or go back (reveal) is clear.
 */
const TOGGLE_VELOCITY_PX_S = 300;

/*
 * A bar flush with the bottom edge whose padding extends its fill under the
 * home indicator (`env(safe-area-inset-bottom)`, needs viewport-fit=cover).
 * Below 1024px only, by CSS. Fixed, so mounting it never shifts the page; the
 * footer reserves the matching space so the last content can scroll clear.
 */
const dockClasses = {
  root: [
    "fixed inset-x-0 bottom-0 z-chrome lg:hidden",
    "border-t-(length:--border-hair) border-rule pb-[env(safe-area-inset-bottom)]",
    "font-mono text-data",
  ].join(" "),
  row: "flex h-dock items-stretch",
  label: "flex min-w-0 flex-1 items-center pl-margin pr-4",
  trigger: "h-full border-l-(length:--border-hair) border-rule pr-margin",
} as const;

export type DockProps = {
  pathname: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  triggerRef: Ref<HTMLButtonElement>;
};

/**
 * Mobile dock (P8.4), <1024px: the active sheet name and the Menu button.
 * Hides on a downward scroll and comes back on an upward one (GSAP `yPercent`
 * on the bar), stays while near the top and while it holds keyboard focus.
 * Reduced motion: it never hides.
 */
export function Dock({ pathname, menuOpen, onOpenMenu, triggerRef }: DockProps) {
  const active = useActiveSheet();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bar = root.current;
      if (!bar) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK_QUERY} and ${MOBILE_QUERY}`, () => {
        let hidden = false;
        let barHeight = bar.offsetHeight;
        const setHidden = (next: boolean) => {
          if (hidden === next) return;
          hidden = next;
          gsap.to(bar, {
            yPercent: next ? 100 : 0,
            duration: durationsS.base,
            ease: gsapEases.wipe,
            overwrite: true,
          });
        };

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onRefresh: () => {
            barHeight = bar.offsetHeight;
          },
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            if (self.scroll() < barHeight || bar.contains(document.activeElement)) setHidden(false);
            else if (velocity > TOGGLE_VELOCITY_PX_S) setHidden(true);
            else if (velocity < -TOGGLE_VELOCITY_PX_S) setHidden(false);
          },
        });

        // Tabbing into a hidden dock brings it back.
        const reveal = () => setHidden(false);
        bar.addEventListener("focusin", reveal);
        return () => bar.removeEventListener("focusin", reveal);
      });
    },
    // A new route starts with the dock shown (the revert resets yPercent).
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={root} data-surface={active?.surface ?? DEFAULT_SURFACE} className={dockClasses.root}>
      <div className={dockClasses.row}>
        <p className={dockClasses.label}>
          <SheetLabel label={active?.sheet ?? ""} />
        </p>
        <Button
          ref={triggerRef}
          variant="ghost"
          className={dockClasses.trigger}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? MENU_ID : undefined}
          onClick={onOpenMenu}
        >
          Menu
        </Button>
      </div>
    </div>
  );
}
