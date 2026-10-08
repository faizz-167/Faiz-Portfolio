import type { Surface } from "@/components/layout/Scene";

/** Home scenes the chrome links to (scene ids from phase9/phase10 specs). */
export const sections = [
  { id: "work", label: "Work" },
  { id: "materials", label: "Materials" },
  { id: "revisions", label: "Revisions" },
  { id: "contact", label: "Contact" },
] as const;

const HOME = "/";
/** The hero scene id; `#top` also means "top of page" without JS. */
const TOP_ID = "top";

/**
 * On the home page a bare hash, so MotionProvider's anchor handler scrolls with
 * Lenis; elsewhere a link back to that scene on the home page.
 */
export function sectionHref(pathname: string, id: string) {
  return pathname === HOME ? `#${id}` : `${HOME}#${id}`;
}

/** The name in the strip: top of the home page, or home from any other page. */
export function homeHref(pathname: string) {
  return pathname === HOME ? `#${TOP_ID}` : HOME;
}

/** Tailwind `lg` (64rem = 1024px): strip at or above, dock and menu below. */
export const DESKTOP_QUERY = "(width >= 64rem)";
export const MOBILE_QUERY = "(width < 64rem)";

/** Chrome surface before any scene is active: the body's surface. */
export const DEFAULT_SURFACE: Surface = "ink";

export const MENU_ID = "site-menu";
