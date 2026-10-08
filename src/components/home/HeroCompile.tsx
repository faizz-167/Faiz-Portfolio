"use client";

import { Fragment, useRef, useState, type ReactNode } from "react";
import { useArmTrace } from "@/components/home/TracedScenes";
import { Container } from "@/components/layout/Container";
import { Grid, GridCell } from "@/components/layout/Grid";
import { Dimension } from "@/components/motion/Dimension";
import { WidthFlex, widthAxis, type WidthFlexMode } from "@/components/motion/WidthFlex";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases, staggersS } from "@/lib/motion/tokens";
import { willChangeDuring } from "@/lib/motion/will-change";
import { HERO_GUARD_ATTR, markHeroCompiled, readHeroVisit } from "./hero-session";

/* Below 640px: 3 log lines and one Dimension (phase9.md P9.5). */
const NARROW_QUERY = "(max-width: 639.98px)";

/** Sequence timing (s). Cuts are `set`s (duration 0); the gaps come from phase9.md. */
const sequence = {
  /** Dimensions start drawing first; the log follows once they are under way. */
  logStart: durationsS.fast,
  /** Between log lines: P9.2 asks for 90–140ms. */
  logStep: 0.12,
  /** Between the three width cuts (P9.4: 80ms). */
  cutStep: 0.08,
} as const;

/** SplitText classes: char masks get `hero-char-mask` (globals.css bleed); words never break inside. */
const CHAR_CLASS = "hero-char";
const WORD_CLASS = "hero-word";
/**
 * Hidden fill position. The masks bleed 0.1em past the 0.9em line box (so no
 * glyph is clipped once landed), so a char must drop 0.9 + 0.1 + 0.086em
 * (its ascender) ≈ 121% of its box to be fully out of sight: 125, not 100.
 */
const FILL_HIDDEN_Y_PERCENT = 125;

/** Lines kept below 640px: the first and the last two (the last one, "ready", starts the fill). */
function keptOnNarrow(index: number, count: number) {
  return index === 0 || index >= count - 2;
}

const heroClasses = {
  /* Fills the section; top block pinned up, line + details pinned down. */
  container: "flex-1 content-between gap-y-8",
  log: "flex flex-col font-mono text-data text-fg-muted",
  /*
   * Hero-only line-height (leading-hero) so the "y" of "Daddy's" clears
   * "Home." when the line breaks (mega's 0.82 collides). No kerning: split
   * chars cannot kern, so the outline, the split fill and the reverted fill
   * all set the same advance widths.
   */
  line: "relative font-display text-mega leading-hero [font-kerning:none]",
  /* < 640px the line wraps at every space ("Daddy's / Home."), whatever --wdth is. */
  fill: "max-sm:w-min max-sm:whitespace-normal",
  outline: [
    "invisible absolute top-0 left-0 w-max whitespace-nowrap max-sm:w-min max-sm:whitespace-normal",
    "text-transparent [-webkit-text-stroke:var(--border-hair)_var(--fg)]",
  ].join(" "),
} as const;

export type HeroCompileProps = {
  /** `profile.copy.heroLine`, verbatim. */
  line: string;
  /** `profile.copy.buildLog`; the last line is the "ready" line. */
  log: readonly string[];
  /** Id for the display line (the scene's accessible name). */
  titleId: string;
  /** Top-right title block (server-rendered). */
  titleBlock: ReactNode;
  /** Name, role, positioning and actions under the line (server-rendered). */
  details: ReactNode;
};

/**
 * The hero's animated parts (P9.2–P9.5, P9.7). The server HTML is the finished
 * hero (log, filled line, details); everything else happens from effects.
 *
 * First visit: Dimensions draw on the outline glyphs → log lines cut in →
 * on the last line the fill chars rise through per-char masks → Dimensions
 * retract → width cuts 50 → 140 → 100 → WidthFlex goes to "velocity" and the
 * trace gate opens. Return visit (same session): no log, no Dimensions, a
 * faster fill, the cuts. Reduced motion, a re-shown route (<Activity>) or a
 * guard that already timed out: the finished state at once.
 */
export function HeroCompile({ line, log, titleId, titleBlock, details }: HeroCompileProps) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const outline = useRef<HTMLSpanElement>(null);
  const firstWord = useRef<HTMLSpanElement>(null);
  const lastWord = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [mode, setMode] = useState<WidthFlexMode>("compile");
  const [dims, setDims] = useState<"none" | "wide" | "narrow">("none");
  const [dimsPlay, setDimsPlay] = useState(false);
  const armTrace = useArmTrace();
  const words = line.split(" ");

  useGSAP(
    () => {
      const scope = root.current;
      const fillEl = fill.current;
      const outlineEl = outline.current;
      const section = scope?.closest("section");
      if (!scope || !fillEl || !outlineEl || !section) return;
      const logLines = gsap.utils.toArray<HTMLElement>("[data-hero-part='log']", scope);

      // The CSS fail-safe released the guard before JS arrived: the visitor has already
      // seen the finished hero, so don't take it away again.
      const released = fillEl.getAnimations().some((a) => a.playState === "finished");
      const releaseGuard = () => section.removeAttribute(HERO_GUARD_ATTR);

      const finish = () => {
        played.current = true;
        setMode("velocity");
        armTrace();
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK_QUERY, narrow: NARROW_QUERY }, (context) => {
        const motion = Boolean(context.conditions?.motion);
        const narrow = Boolean(context.conditions?.narrow);
        if (!motion || played.current || released) {
          releaseGuard();
          // Also covers reduced motion switched on mid-sequence: no Dimensions left drawn.
          setDims("none");
          finish();
          return;
        }
        const visit = readHeroVisit();

        // Hidden starting state, applied before the guard is lifted (same frame, no flash).
        const split = SplitText.create(fillEl, {
          type: "words,chars",
          mask: "chars",
          charsClass: CHAR_CLASS,
          wordsClass: WORD_CLASS,
          aria: "none",
        });
        gsap.set(split.chars, { yPercent: FILL_HIDDEN_Y_PERCENT });
        gsap.set(outlineEl, { visibility: "visible" });
        const lines = narrow ? logLines.filter((_, i) => keptOnNarrow(i, logLines.length)) : logLines;
        if (visit === "first") gsap.set(lines, { visibility: "hidden" });
        releaseGuard();

        // The last cut leaves layout dirty (a relaid-out line). Arming the trace in that
        // same tick made DrawSVG's length reads force that layout inside one ~50ms task,
        // so the hand-off waits one frame: the cut paints, then the trace builds on a
        // clean layout.
        let handOff = 0;
        const tl = gsap.timeline({
          onComplete: () => {
            markHeroCompiled();
            handOff = requestAnimationFrame(finish);
          },
        });

        let ready = 0;
        let fillDuration: number = durationsS.slow;
        if (visit === "first") {
          setDims(narrow ? "narrow" : "wide");
          tl.call(() => setDimsPlay(true), [], 0);
          lines.forEach((el, i) => {
            tl.set(el, { visibility: "visible" }, sequence.logStart + i * sequence.logStep);
          });
          ready = sequence.logStart + (lines.length - 1) * sequence.logStep;
        } else {
          // Return visit: ≤ 0.8s in total (P9.7), so the fill runs at the base duration.
          fillDuration = durationsS.base;
        }

        tl.to(
          split.chars,
          {
            yPercent: 0,
            duration: fillDuration,
            ease: gsapEases.out,
            stagger: staggersS.chars,
            ...willChangeDuring(split.chars, "transform"),
          },
          ready,
        );
        const filled = tl.duration();
        if (visit === "first") {
          // Retract so the lines are gone as the last char lands.
          tl.call(() => setDimsPlay(false), [], Math.max(ready, filled - durationsS.slow));
        }

        // Filled: drop the outline and un-split, so the cuts re-lay out one text node
        // (its start never moves: no layout shift) instead of moving every char box.
        tl.call(() => split.revert(), [], filled);
        tl.set(outlineEl, { visibility: "hidden" }, filled);
        tl.set(fillEl, { "--wdth": widthAxis.compressed }, filled);
        tl.set(fillEl, { "--wdth": widthAxis.stretched }, filled + sequence.cutStep);
        tl.set(fillEl, { "--wdth": widthAxis.rest }, filled + 2 * sequence.cutStep);
        return () => cancelAnimationFrame(handOff);
      });
    },
    { scope: root },
  );

  return (
    <Container ref={root} className={heroClasses.container}>
      <Grid className="gap-y-6">
        <GridCell as="ol" aria-label="Build log" span={{ base: 4, md: 4, lg: 6 }} className={heroClasses.log}>
          {log.map((entry, i) => (
            <li
              key={entry}
              data-hero-part="log"
              className={keptOnNarrow(i, log.length) ? undefined : "max-sm:hidden"}
            >
              {entry}
            </li>
          ))}
        </GridCell>
        <GridCell span={{ base: 4, md: 4, lg: 5 }} start={{ lg: 8 }}>
          {titleBlock}
        </GridCell>
      </Grid>

      {/* Positioned: the Dimensions' host, shared with the outline words they measure. */}
      <div data-hero-stage="" className="relative">
        <h1 id={titleId} data-hero-part="line" className={heroClasses.line}>
          <span className="sr-only">{line}</span>
          <WidthFlex ref={fill} mode={mode} aria-hidden="true" data-hero-part="fill" className={heroClasses.fill}>
            {line}
          </WidthFlex>
          {/* Outline glyphs: shown by the guard / sequence only. The Dimensions measure
              these words, and the trace via sits at the end of the line. */}
          <span ref={outline} aria-hidden="true" data-hero-part="outline" className={heroClasses.outline}>
            {words.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {i > 0 && " "}
                {/* Inline, not inline-block: the whole outline stays one LCP text
                    candidate (the size of the line), so the later fill is never "larger". */}
                <span ref={i === 0 ? firstWord : i === words.length - 1 ? lastWord : undefined}>{word}</span>
              </Fragment>
            ))}
            <span data-via="right" className="inline-block" />
          </span>
        </h1>
        {dims === "wide" && words.length > 1 && (
          <>
            <Dimension targetRef={firstWord} axis="x" side="top" play={dimsPlay} />
            <Dimension targetRef={lastWord} axis="x" side="top" play={dimsPlay} />
            <Dimension targetRef={outline} axis="x" side="bottom" play={dimsPlay} />
          </>
        )}
        {(dims === "narrow" || (dims === "wide" && words.length === 1)) && (
          <Dimension targetRef={outline} axis="x" side="top" play={dimsPlay} />
        )}
        {details}
      </div>
    </Container>
  );
}
