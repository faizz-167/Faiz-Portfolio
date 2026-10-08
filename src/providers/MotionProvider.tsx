"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ScrollTrigger, gsap, requestRefresh } from "@/lib/motion/gsap";
import {
  LenisContext,
  getLenis,
  getServerLenis,
  mountLenis,
  subscribeLenis,
} from "@/lib/motion/lenis";
import { MOTION_OK_QUERY, REDUCED_MOTION_QUERY } from "@/lib/motion/reduced-motion";
import { spring } from "@/lib/motion/tokens";

const MOTION_CLASS = { ok: "motion-ok", reduced: "motion-reduced" } as const;

/** Elements that should take focus after an in-page jump (e.g. the skip link target). */
const FOCUS_AFTER_JUMP = "a[href], button, input, select, textarea, [tabindex]";

function px(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Height of the fixed sheet strip, read from the `--strip-h` token. */
function stripHeight() {
  return px(getComputedStyle(document.documentElement).getPropertyValue("--strip-h"));
}

function hashTarget(hash: string) {
  const id = hash.slice(1);
  if (!id) return null;
  try {
    return document.getElementById(decodeURIComponent(id));
  } catch {
    return document.getElementById(id);
  }
}

/**
 * In-page anchors (`a[href^="#"]`). Capture phase on document, so it runs
 * before next/link's own hash handling. The scroll itself waits one frame so
 * a link's onClick (e.g. the menu calling `lenis.start()` while closing) runs
 * first. Modified clicks, other buttons, `target`/`download` links and
 * unknown ids fall through to the browser.
 * Lenis → `lenis.scrollTo` minus `--strip-h`. Reduced motion (no Lenis) →
 * native `scrollIntoView`; the `[id] { scroll-margin-top: var(--strip-h) }`
 * base rule supplies the offset there (and without JS).
 */
function onAnchorClick(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

  const hash = anchor.getAttribute("href") ?? "#";
  const target = hashTarget(hash);
  const toTop = hash === "#" || hash === "#top";
  if (!target && !toTop) return;

  event.preventDefault();
  if (hash.length > 1 && window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }

  requestAnimationFrame(() => {
    const lenis = getLenis();
    if (lenis) {
      if (target) {
        // Lenis already subtracts the target's scroll-margin-top; top up to --strip-h.
        const margin = px(getComputedStyle(target).scrollMarginTop);
        lenis.scrollTo(target, { offset: margin - stripHeight() });
      } else {
        lenis.scrollTo(0);
      }
    } else if (target) {
      target.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
    if (target?.matches(FOCUS_AFTER_JUMP)) target.focus({ preventScroll: true });
  });
}

/**
 * Root motion runtime (P5.4). Mounted once in the root layout, never hidden.
 * - `<MotionConfig reducedMotion="user">` with the design spring for Motion.
 * - `gsap.matchMedia()` root: `motion-ok` / `motion-reduced` on <html>
 *   (client-only, after hydration) and Lenis only in the motion-ok branch.
 * - `ScrollTrigger.refresh()` after `document.fonts.ready`.
 * - Lenis-aware in-page anchor scrolling.
 * Renders no DOM of its own.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const lenis = useSyncExternalStore(subscribeLenis, getLenis, getServerLenis);

  useEffect(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();
    mm.add({ ok: MOTION_OK_QUERY, reduced: REDUCED_MOTION_QUERY }, (context) => {
      const reduced = Boolean(context.conditions?.reduced);
      root.classList.add(reduced ? MOTION_CLASS.reduced : MOTION_CLASS.ok);
      const unmountLenis = reduced ? undefined : mountLenis();
      requestRefresh();
      return () => {
        unmountLenis?.();
        root.classList.remove(MOTION_CLASS.ok, MOTION_CLASS.reduced);
      };
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    let active = true;
    // Font swap changes line breaks and heights → trigger positions.
    document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.addEventListener("click", onAnchorClick, true);
    return () => document.removeEventListener("click", onAnchorClick, true);
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LenisContext value={lenis}>{children}</LenisContext>
    </MotionConfig>
  );
}
