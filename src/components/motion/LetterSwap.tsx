"use client";

import { animate, stagger } from "motion/react";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { cubicBeziers, durationsS, staggersS } from "@/lib/motion/tokens";

/*
 * Letter swap (P12e.2), after Fancy Components' "Letter 3D Swap", written here
 * on Motion's `animate` instead of installing it. Each letter is a box with two
 * faces holding the same letter: the front face, and a second face folded
 * under it (rotateX -90°, pushed out half a line). Turning the box 90° about X
 * brings the second face up to the front; snapping it back to 0° afterwards is
 * invisible because both faces match. No perspective, so nothing leaves the
 * line box. Changed from the original: `--dur-base`/`--ease-out` instead of a
 * spring, one direction (up) and one stagger (from the first letter), and it
 * also plays on keyboard focus.
 *
 * The 3D geometry exists only while `data-live` is on the root, which is set
 * only with a fine pointer and motion allowed. Server HTML, touch, reduced
 * motion and no JS get flat letters in a mono line, the same size as the plain
 * label (every label it wraps is mono, so splitting letters loses no kerning).
 */

const FINE_MOTION_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
/** The control whose hover/focus plays the swap (Link and Button share it). */
const CONTROL = "a, button";

const swapClasses = {
  root: "group/swap relative",
  word: "inline-flex whitespace-nowrap",
  box: "relative inline-block group-data-live/swap:transform-3d",
  front: "block group-data-live/swap:backface-hidden group-data-live/swap:[transform:translateZ(0.5lh)]",
  /* Folded under the front face; only exists in 3D. */
  back: [
    "absolute top-0 left-0 hidden backface-hidden [transform:rotateX(-90deg)_translateZ(0.5lh)]",
    "group-data-live/swap:block",
  ].join(" "),
} as const;

export type LetterSwapProps = {
  /** Plain text: it is split into letters. */
  children: string;
  className?: string;
};

/** A label whose letters turn over one by one when its link or button is hovered or focused. */
export function LetterSwap({ children, className }: LetterSwapProps) {
  const root = useRef<HTMLSpanElement>(null);
  const live = useMediaQuery(FINE_MOTION_QUERY);

  useEffect(() => {
    const el = root.current;
    const control = el?.closest<HTMLElement>(CONTROL);
    if (!el || !control || !live) return;
    const boxes = Array.from(el.querySelectorAll<HTMLElement>("[data-swap-box]"));
    let playing = false;
    let stopped = false;

    const play = () => {
      if (playing || control.matches(":disabled")) return;
      playing = true;
      const turn = animate(
        boxes,
        { rotateX: [0, 90] },
        { duration: durationsS.base, ease: cubicBeziers.out, delay: stagger(staggersS.chars) },
      );
      void turn.then(() => {
        if (stopped) return;
        // Both faces show the same letter, so the snap back to 0° can't be seen.
        for (const box of boxes) box.style.transform = "";
        playing = false;
      });
    };
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") play();
    };
    const onFocus = () => {
      if (control.matches(":focus-visible")) play();
    };

    control.addEventListener("pointerenter", onPointerEnter);
    control.addEventListener("focus", onFocus);
    return () => {
      stopped = true;
      control.removeEventListener("pointerenter", onPointerEnter);
      control.removeEventListener("focus", onFocus);
      for (const box of boxes) box.style.transform = "";
    };
    // The text re-renders the boxes (e.g. "Copy email" → "Copied"), so collect them again.
  }, [live, children]);

  const words = children.split(" ");
  return (
    <span ref={root} data-live={live || undefined} className={cn(swapClasses.root, className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          // Words never break inside; the space between them stays a real space.
          <span key={w}>
            <span className={swapClasses.word}>
              {Array.from(word).map((char, c) => (
                <span key={c} data-swap-box="" className={swapClasses.box}>
                  <span className={swapClasses.front}>{char}</span>
                  <span className={swapClasses.back}>{char}</span>
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </span>
  );
}
