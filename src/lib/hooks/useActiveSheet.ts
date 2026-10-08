/**
 * Active sheet (P8.2): which `[data-sheet]` scene sits under the viewport's
 * centre line. A tiny external store, so a scroll past a seam re-renders only
 * the components that read it (SheetStrip, Dock), never the page.
 *
 * - `useSheetTracker(routeKey)` — the single writer, mounted once by the site
 *   chrome. One ScrollTrigger per visible scene, `top 50%` → `bottom 50%`.
 * - `useActiveSheet()` — read hook. `null` on the server, before the first
 *   refresh, and on pages without scenes.
 *
 * Client-only (imports gsap).
 */
import { useSyncExternalStore } from "react";
import { surfaces, type Surface } from "@/components/layout/Scene";
import { gsap, requestRefresh, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

export type ActiveSheet = { id: string; sheet: string; surface: Surface };

/** Scenes live in the page; the chrome itself never carries `data-sheet`. */
const SCENE_SELECTOR = "main [data-sheet][data-surface]";

let active: ActiveSheet | null = null;
const listeners = new Set<() => void>();

function setActive(next: ActiveSheet | null) {
  // Snapshots must be stable for useSyncExternalStore: only a real change emits.
  if (active?.id === next?.id && active?.sheet === next?.sheet && active?.surface === next?.surface) {
    return;
  }
  active = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => active;
const getServerSnapshot = () => null;

export function useActiveSheet() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function readSheet(el: HTMLElement): ActiveSheet | null {
  const sheet = el.dataset.sheet;
  const surface = el.dataset.surface;
  if (!sheet || !surfaces.includes(surface as Surface)) return null;
  return { id: el.id, sheet, surface: surface as Surface };
}

/**
 * Creates the scene triggers for the current route. `routeKey` (the pathname)
 * rebuilds them on navigation: under <Activity> earlier routes stay in the DOM
 * with `display: none`, so only scenes that are actually rendered count.
 */
export function useSheetTracker(routeKey: string) {
  useGSAP(
    () => {
      const scenes = gsap.utils
        .toArray<HTMLElement>(SCENE_SELECTOR)
        .filter((el) => el.checkVisibility());

      for (const el of scenes) {
        const sheet = readSheet(el);
        if (!sheet) continue;
        const sync = (self: ScrollTrigger) => {
          if (self.isActive) setActive(sheet);
        };
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          // Measured after every page trigger (pins add spacing above later scenes).
          refreshPriority: -1,
          // Leaving a scene does not clear the label: the neighbour's onToggle
          // sets the next one, so a seam never flashes an empty strip.
          onToggle: sync,
          onRefresh: sync,
        });
      }
      requestRefresh();
      return () => setActive(null);
    },
    { dependencies: [routeKey], revertOnUpdate: true },
  );
}
