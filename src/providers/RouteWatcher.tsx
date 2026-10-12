"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { noteRoute } from "@/lib/motion/arrival";

/**
 * Tells the arrival check (P12f.1) about every route the visitor reaches, so a
 * client navigation is remembered even on pages without arrival animations.
 * Renders nothing. MotionProvider mounts it inside Suspense: under Cache
 * Components `usePathname` suspends on routes with a fallback param.
 */
export function RouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    noteRoute(pathname);
  }, [pathname]);
  return null;
}
