/**
 * `will-change` only while a tween runs (Phase 6 shared rule): spread the
 * result into a GSAP tween's vars. Never set `will-change` in static CSS.
 *
 *   gsap.to(el, { x: 10, ...willChangeDuring(el, "transform") });
 *
 * Client-only (imports gsap).
 */
import "client-only";
import { gsap } from "./gsap";

type Targets = gsap.TweenTarget;

export function willChangeDuring(targets: Targets, value: "transform" | "opacity" | "transform, opacity") {
  return {
    onStart() {
      gsap.set(targets, { willChange: value });
    },
    onComplete() {
      gsap.set(targets, { clearProps: "willChange" });
    },
  };
}
