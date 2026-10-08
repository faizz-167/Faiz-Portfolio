"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffectEvent, useLayoutEffect, useRef, type RefObject } from "react";
import { WidthFlex } from "@/components/motion/WidthFlex";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { useLenis } from "@/lib/motion/lenis";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { cubicBeziers, durationsS, staggersS } from "@/lib/motion/tokens";
import { DESKTOP_QUERY, MENU_ID, sectionHref, sections } from "./nav";

/** Everything except the open dialog: made inert while it is open. */
const INERT_SELECTOR = "body > :is(header, main, footer)";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** `<html>` class while open: no page scroll behind the dialog, Lenis or native. */
export const MENU_OPEN_CLASS = "menu-open";

const menuClasses = {
  /* Full-screen signal surface (design.md §2.1). Motion owns its transform. */
  panel: "fixed inset-0 z-overlay flex origin-bottom flex-col overflow-y-auto overscroll-contain",
  nav: "flex flex-1 flex-col justify-center px-margin py-7",
  list: "flex flex-col gap-2",
  link: "font-display text-h1",
  /* Same row as the dock, so Close sits under the thumb where Menu was. */
  bar: [
    "flex shrink-0 items-stretch border-t-(length:--border-hair) border-rule",
    "pb-[env(safe-area-inset-bottom)] font-mono text-data",
  ].join(" "),
  row: "flex h-dock flex-1 items-stretch",
  title: "flex flex-1 items-center pl-margin",
  close: "h-full border-l-(length:--border-hair) border-rule pr-margin",
} as const;

export type MenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  /** The Menu button; focus returns to it on close. */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
};

function trapTab(event: KeyboardEvent, panel: HTMLElement) {
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  const current = document.activeElement;
  const outside = !panel.contains(current);
  if (event.shiftKey && (current === first || outside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (current === last || outside)) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Mobile menu overlay (P8.5): a modal dialog on the signal surface. Wipes up
 * from the bottom (`scaleY`, --ease-wipe) and staggers its links in, with
 * Motion's AnimatePresence. While open: Lenis stopped, page scroll clipped,
 * header/main/footer inert, Tab trapped, Escape closes; on close focus returns
 * to the Menu button. Closes on a link click, a route change (the parent) and
 * when the viewport reaches the desktop strip.
 * Reduced motion: opens and closes instantly.
 */
export function Menu({ open, onClose, pathname, returnFocusTo }: MenuProps) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  // Layout effect keyed on `open`, not on the panel's mount: the panel stays
  // mounted through its exit animation, but the page must be live again (inert
  // off, scroll back, focus restored) the moment the menu closes.
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    const html = document.documentElement;
    const trigger = returnFocusTo.current;
    const shut = Array.from(document.querySelectorAll<HTMLElement>(INERT_SELECTOR));
    for (const node of shut) node.inert = true;
    html.classList.add(MENU_OPEN_CLASS);
    lenis?.stop();
    // Microtask for the same reason as the close below: React would put focus
    // back on the (now inert) Menu button at the end of this commit.
    queueMicrotask(() => el.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        trapTab(event, el);
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onDesktop = () => {
      if (desktop.matches) close();
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);

    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      for (const node of shut) node.inert = false;
      html.classList.remove(MENU_OPEN_CLASS);
      lenis?.start();
      // After the commit: React restores the element focused before a commit
      // (the menu link) once mutation effects finish, which would undo a focus
      // call made here. A microtask still runs before the anchor handler's
      // next-frame focus of a jump target, so that one wins.
      queueMicrotask(() => {
        const focused = document.activeElement;
        if (!focused || focused === document.body || el.contains(focused)) {
          trigger?.focus({ preventScroll: true });
        }
      });
    };
  }, [open, lenis, returnFocusTo]);

  const wipe: Transition = reduced
    ? { duration: 0 }
    : { duration: durationsS.slow, ease: cubicBeziers.wipe };
  const linkIn = (index: number): Transition =>
    reduced
      ? { duration: 0 }
      : {
          duration: durationsS.slow,
          ease: cubicBeziers.out,
          // Links start once the wipe is half way up.
          delay: durationsS.base + index * staggersS.lines,
        };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          ref={panel}
          id={MENU_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-surface="signal"
          className={menuClasses.panel}
          // Reduced motion: mount in the final state (a zero-length tween still waits a frame).
          initial={reduced ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={wipe}
        >
          <nav aria-label="Sections" className={menuClasses.nav}>
            <ul className={menuClasses.list}>
              {sections.map((section, index) => (
                <motion.li
                  key={section.id}
                  initial={reduced ? false : { opacity: 0, y: "50%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={linkIn(index)}
                >
                  <Link
                    variant="nav"
                    href={sectionHref(pathname, section.id)}
                    onClick={() => {
                      // Synchronously: the anchor scroll runs one frame later
                      // and a stopped Lenis would ignore it (Phase 5 note).
                      lenis?.start();
                      onClose();
                    }}
                    onNavigate={onClose}
                  >
                    <WidthFlex mode="hover" className={menuClasses.link}>
                      {section.label}
                    </WidthFlex>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className={menuClasses.bar}>
            <div className={menuClasses.row}>
              <p className={menuClasses.title}>Menu</p>
              <Button variant="ghost" className={menuClasses.close} onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
