import type { ReactNode } from "react";
import { RouteWipe } from "@/components/motion/RouteWipe";

/**
 * Remounts on every /work/[slug] change (Next gives templates a unique key), so
 * the arrival wipe, scroll reset and ScrollTrigger refresh run once per case
 * page (P11.7).
 */
export default function WorkTemplate({ children }: { children: ReactNode }) {
  return <RouteWipe>{children}</RouteWipe>;
}
