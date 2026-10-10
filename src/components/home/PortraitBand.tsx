"use client";

import Image from "next/image";
import { useRef } from "react";
import { Container } from "@/components/layout/Container";
import { PixelField, type PixelColumns } from "@/components/motion/PixelField";
import { PlateDrift } from "@/components/motion/PlateDrift";
import type { Profile } from "@/content/types";
import { gsap, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";

/* Same cell grid as the seams (P11c.6), as many rows as the band needs. */
const REVEAL_COLUMNS: PixelColumns = { base: 6, md: 12, lg: 25 };
const REVEAL_SEED = 0x0f1;
/** Timeline units: the underline draws over the first one, then the words cut in. */
const LINE_SPAN = 1;
const WORD_GAP = 0.25;

const bandClasses = {
  /* Above the trace layer (z-content > z-trace): the trace passes behind the photo, never over it. */
  band: "relative z-content h-[80svh] w-full overflow-hidden sm:h-[75svh] lg:h-[85svh]",
  /* The head sits right of centre in the landscape original (P11c.5); y keeps the face clear of the words. */
  image: "object-cover object-[62%_35%]",
  reveal: "absolute inset-0",
  /* The words sit across the band's lower third. */
  words: "absolute inset-x-0 bottom-[12%]",
  list: "flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between",
  /* A paper strip under each word: contrast never depends on the photo (P11d.3). */
  /* h3 on tablet so the three still fit one line; h2 from 1024px. */
  word: "block bg-surface px-4 py-2 font-display text-h2 text-fg sm:max-lg:text-h3",
  line: "mt-4 h-0 origin-left border-t-(length:--border-hair) border-fg",
} as const;

export type PortraitBandProps = Pick<Profile, "portrait" | "roleWords">;

/**
 * The full-bleed portrait that opens Sheet 02 (P11d.2–3; owner exception,
 * Decisions log 2026-10-10), after oliverjeffers.com/about: the photo edge to
 * edge, drifting with scroll and clearing from paper-colour cells as it
 * enters, with the three role words on paper strips over one ink hairline.
 * With motion, the hairline draws and then the words cut in, scrubbed (so
 * reverse scroll undoes it). Without JS or with reduced motion everything
 * is simply there.
 */
export function PortraitBand({ portrait, roleWords }: PortraitBandProps) {
  const words = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useRefreshOnShow();

  useGSAP(
    () => {
      const row = words.current;
      const rule = line.current;
      if (!row || !rule) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-word]", row);
        gsap.set(rule, { scaleX: 0 });
        gsap.set(items, { autoAlpha: 0 });
        const timeline = gsap.timeline({
          // Done while the whole band is still on screen (row bottom from 100% to 85% of the viewport;
          // it is at ~80% when the band first fits under the strip at 1440×900).
          scrollTrigger: { trigger: row, start: "bottom bottom", end: "bottom 85%", scrub: true },
        });
        timeline.to(rule, { scaleX: 1, ease: "none", duration: LINE_SPAN });
        items.forEach((item, i) => {
          timeline.set(item, { autoAlpha: 1 }, LINE_SPAN + (i + 1) * WORD_GAP);
        });
        timeline.set({}, {}, LINE_SPAN + (items.length + 1) * WORD_GAP);
      });
    },
    { scope: words },
  );

  return (
    <div className={bandClasses.band}>
      <PlateDrift anyPointer>
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="100vw"
          // Just below the fold: fetch it with the page rather than on approach.
          loading="eager"
          className={bandClasses.image}
        />
      </PlateDrift>
      <PixelField
        mode="clear"
        columns={REVEAL_COLUMNS}
        rows="cover"
        surface="paper"
        seed={REVEAL_SEED}
        start="top 85%"
        end="top 25%"
        className={bandClasses.reveal}
      />
      <div ref={words} className={bandClasses.words}>
        <Container>
          <ul className={bandClasses.list}>
            {roleWords.map((word) => (
              <li key={word}>
                <span data-word="" className={bandClasses.word}>
                  {word}
                </span>
              </li>
            ))}
          </ul>
          <div ref={line} aria-hidden="true" className={bandClasses.line} />
        </Container>
      </div>
    </div>
  );
}
