"use client";
import { Activity, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/motion/gsap";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { ScrubText } from "@/components/motion/ScrubText";
import { Trace } from "@/components/motion/Trace";
import { RuleDraw } from "@/components/motion/RuleDraw";
import { WidthFlex } from "@/components/motion/WidthFlex";
import { Pin } from "@/components/motion/Pin";
import { Magnetic } from "@/components/motion/Magnetic";
import { Crosshair } from "@/components/motion/Crosshair";
import { HoverPreview } from "@/components/motion/HoverPreview";
import { Dimension } from "@/components/motion/Dimension";
import { Rule } from "@/components/layout/Rule";

function All() {
  const t = useRef<HTMLSpanElement>(null);
  return (
    <div className="relative">
      <Trace />
      <section data-sheet="a" data-surface="ink" className="relative py-section"><span data-via="left" className="absolute top-section left-0 w-margin h-0" />
        <SplitReveal as="h2" trigger="mount" className="font-display text-h2">Split reveal mount</SplitReveal>
        <SplitReveal as="p" split="words">Split reveal scroll words here</SplitReveal>
        <ScrubText>Scrub text words go here and here</ScrubText>
        <RuleDraw><Rule /><Rule /></RuleDraw>
        <WidthFlex mode="hover" className="font-display text-h2">Hover</WidthFlex>
        <WidthFlex mode="velocity" className="font-display text-h2">Velocity</WidthFlex>
        <Magnetic><button>Mag</button></Magnetic>
        <div className="relative pt-8"><span ref={t} className="inline-block font-display text-h1">Measure</span><Dimension targetRef={t} axis="x" /></div>
      </section>
      <section data-sheet="b" data-surface="paper" className="relative py-section"><span data-via="right" className="absolute top-section right-0 w-margin h-0" />
        <Pin trackClassName="data-pinned:*:w-lede *:shrink-0">{[1,2,3,4,5].map(i => <div key={i} className="h-10 border-hair">Card {i}</div>)}</Pin>
      </section>
      <Crosshair />
      <HoverPreview items={[]} activeId={null} />
      <div className="h-12" />
    </div>
  );
}

export function Harness() {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  if (typeof window !== "undefined") (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
  return (
    <div>
      <button id="toggle-mount" onClick={() => setMounted((m) => !m)}>mount</button>
      <button id="toggle-activity" onClick={() => setVisible((m) => !m)}>activity</button>
      {mounted && <Activity mode={visible ? "visible" : "hidden"}><All /></Activity>}
    </div>
  );
}
