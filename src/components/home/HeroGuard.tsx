"use client";

import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { HERO_GUARD_ATTR, HERO_SESSION_KEY } from "./hero-session";

/*
 * Pre-hydration guard (P9.1/P9.3). Runs while the HTML is parsed, before the
 * first paint: when motion is allowed it marks the parent section so CSS
 * (globals.css "Hero guard") shows the outline glyphs and hides the fill (and,
 * on a first visit, the build log) until the compile sequence takes over.
 * Without JS it never runs, so the server HTML (the finished hero) stands.
 * A CSS fail-safe releases the guard if the sequence never arrives.
 *
 * Client Component, per node_modules/next/dist/docs/.../preventing-flash-before-hydration.md:
 * `text/plain` on the client, so a soft navigation neither runs it nor warns.
 * The section carries suppressHydrationWarning for the attribute it adds.
 */
const source = `(function(){try{var s=document.currentScript&&document.currentScript.parentElement;if(!s||!matchMedia(${JSON.stringify(
  MOTION_OK_QUERY,
)}).matches)return;var v="first";try{if(sessionStorage.getItem(${JSON.stringify(
  HERO_SESSION_KEY,
)})==="1")v="return"}catch(e){}s.setAttribute(${JSON.stringify(HERO_GUARD_ATTR)},v)}catch(e){}})()`;

export function HeroGuard() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: source }}
    />
  );
}
