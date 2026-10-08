"use client";

import { useRef, useState } from "react";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { Dimension } from "@/components/motion/Dimension";
import { HoverPreview, preloadPreview, type PreviewImage } from "@/components/motion/HoverPreview";
import { WidthFlex, widthAxis } from "@/components/motion/WidthFlex";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { durationsS } from "@/lib/motion/tokens";

/* Client-side demo harnesses for /system (P6.11). Scenes compose the real components. */

/** WidthFlex "compile": a parent timeline cuts --wdth 50 → 140 → 100 (phase9.md P9.4). */
export function CompileDemo() {
  const line = useRef<HTMLElement>(null);
  const run = () => {
    const el = line.current;
    if (!el) return;
    if (prefersReducedMotion()) return; // reduced motion: the line stays at rest
    gsap
      .timeline()
      .set(el, { "--wdth": widthAxis.compressed })
      .set(el, { "--wdth": widthAxis.stretched }, `+=${durationsS.fast}`)
      .set(el, { "--wdth": widthAxis.rest }, `+=${durationsS.fast}`);
  };
  return (
    <Stack gap={4} align="start">
      <WidthFlex ref={line} mode="compile" as="p" className="font-display text-h1">
        Compile
      </WidthFlex>
      <Button variant="outline" onClick={run}>
        Run the width cuts
      </Button>
    </Stack>
  );
}

const previews: readonly PreviewImage[] = [
  { id: "one", src: "/system/preview-1.webp", alt: "Plan view with three blocks", width: 1200, height: 750 },
  { id: "two", src: "/system/preview-2.webp", alt: "Elevation with a header block", width: 1200, height: 750 },
  { id: "three", src: "/system/preview-3.webp", alt: "Section with a circular part", width: 1200, height: 750 },
];

/** Hover-intent before a row activates (phase10.md P10.2). */
const HOVER_INTENT_MS = 120;

/** HoverPreview: rows preload on pointerenter, activate after hover-intent or on focus. */
export function HoverPreviewDemo() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const intent = (item: PreviewImage) => {
    preloadPreview(item);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActiveId(item.id), HOVER_INTENT_MS);
  };
  const clear = () => {
    clearTimeout(timer.current);
    setActiveId(null);
  };
  return (
    <>
      <ul className="border-rule [border-top-width:var(--border-hair)]" onPointerLeave={clear}>
        {previews.map((item) => (
          <li key={item.id} className="border-rule [border-bottom-width:var(--border-hair)]">
            <button
              type="button"
              className="flex min-h-touch w-full items-center justify-between gap-4 py-3 text-left font-display text-h3"
              onPointerEnter={() => intent(item)}
              onFocus={() => {
                preloadPreview(item);
                setActiveId(item.id);
              }}
              onBlur={clear}
            >
              <span>{item.alt}</span>
              <span className="font-mono text-data text-fg-muted">{item.id}</span>
            </button>
          </li>
        ))}
      </ul>
      <HoverPreview items={previews} activeId={activeId} />
    </>
  );
}

/** Dimension: measures a display line (x) and a box (y); play toggles draw / retract. */
export function DimensionDemo() {
  const word = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(true);
  return (
    <Stack gap={6} align="start">
      <div className="relative pt-8">
        <Text variant="h1" as="p">
          <span ref={word} className="inline-block">
            Daddy&apos;s Home.
          </span>
        </Text>
        <Dimension targetRef={word} axis="x" play={play} />
      </div>
      <div className="relative pb-8 pl-9">
        <div ref={box} className="h-10 w-12 max-w-full resize border-hair border-rule overflow-auto p-3">
          <Text variant="data" tone="muted">
            Drag the corner to resize
          </Text>
        </div>
        <Dimension targetRef={box} axis="y" play={play} />
        <Dimension targetRef={box} axis="x" side="bottom" play={play} />
      </div>
      <Cluster gap={4}>
        <Button variant="outline" onClick={() => setPlay((p) => !p)}>
          {play ? "Retract dimensions" : "Draw dimensions"}
        </Button>
      </Cluster>
    </Stack>
  );
}
