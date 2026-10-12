"use client";

import Image from "next/image";
import { PixelField, type PixelColumns } from "@/components/motion/PixelField";
import { PlateDrift } from "@/components/motion/PlateDrift";
import type { Profile } from "@/content/types";

/* Same cell grid as the seams (P11c.6), as many rows as the band needs. */
const REVEAL_COLUMNS: PixelColumns = { base: 6, md: 12, lg: 25 };
const REVEAL_SEED = 0x0f1;
const bandClasses = {
  /* Above the trace layer (z-content > z-trace): the trace passes behind the photo, never over it. */
  band: "relative z-content h-[80svh] w-full overflow-hidden sm:h-[75svh] lg:h-[85svh]",
  /* The head sits right of centre in the landscape original (P11c.5). */
  image: "object-cover object-[62%_35%]",
  reveal: "absolute inset-0",
} as const;

export type PortraitBandProps = Pick<Profile, "portrait">;

/**
 * The full-bleed portrait that opens Sheet 02 (P11d.2; owner exception,
 * Decisions log 2026-10-10), after oliverjeffers.com/about: the photo edge to
 * edge, drifting with scroll and clearing from paper-colour cells as it enters.
 */
export function PortraitBand({ portrait }: PortraitBandProps) {
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
    </div>
  );
}
