"use client";

import { useRef, useState, type ReactNode } from "react";
import { FaceParagraph, FaceWord, pad2, ToolUsage, type GaugeFace } from "@/components/home/ToolkitParts";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY } from "@/lib/motion/reduced-motion";

/* The gauge is desktop-only, like every pin (design.md §7). */
const DESKTOP_QUERY = "(min-width: 1024px)";

/** Pin length per tool, in viewport heights: 46 tools ≈ 11.5 viewports, like the reference. */
const VH_PER_TOOL = 0.25;

/*
 * Meter shape. Everything follows g(d) = exp(−d² / 2σ²), d = distance from the
 * needle in columns: 1 on the needle, ≈0.46 two columns out, ≈0.04 at four.
 * Distance only — never years (P11b.3).
 */
const SIGMA = 1.6;
const MIN_SCALE = 0.4;
const MIN_OPACITY = 0.2;
const MIN_BAR = 0.08;

const gaugeClasses = {
  root: "group/gauge",
  /* While the gauge is live the list stays in the accessibility tree, visually hidden. */
  list: "group-data-live/gauge:sr-only",
  /* Hidden without JS, under reduced motion and below 1024px: the stage only exists while live. */
  stage: "hidden h-svh flex-col pt-strip group-data-live/gauge:flex",
  top: "relative grid px-margin pt-7 pb-6",
  /* All four faces share one grid cell, so swapping them never moves anything. */
  face: [
    "col-start-1 row-start-1 flex flex-col gap-4 opacity-0",
    "transition-opacity duration-(--dur-base) ease-out data-on:opacity-100",
  ].join(" "),
  eyebrow: "flex justify-between gap-4 font-mono text-data text-fg-muted",
  word: "font-display text-mega leading-hero whitespace-nowrap",
  paragraph: "font-text text-lede max-w-measure",
  /*
   * Column width: about seven tools across the band at 1280. The bar box is the
   * needle tool's full bar; labels sit on top of their bar. Set here, not in
   * globals.css: Turbopack's dev CSS dropped the vars-only global rule.
   */
  band: [
    "relative mb-7 min-h-[15rem] flex-1 border-y-(length:--border-active) border-fg",
    "[--gauge-col:clamp(9rem,13vw,14rem)] [--gauge-bar:var(--space-9)]",
  ].join(" "),
  /* Clips the track to the band; the needle's diamonds overhang the rules, outside it. */
  window: "absolute inset-0 overflow-hidden",
  /* One column per tool; the track is moved by transform only. */
  track: "absolute inset-y-0 left-0 flex",
  column: "group/col relative flex h-full w-(--gauge-col) shrink-0 flex-col items-center justify-end border-l-(length:--border-hair) border-rule",
  label: [
    /* A little wider than the column: neighbours are scaled down, so long words don't break. */
    "absolute -inset-x-2 bottom-(--gauge-bar) origin-bottom pb-2 text-center",
    "font-display text-h3 text-balance",
  ].join(" "),
  bar: "h-(--gauge-bar) w-2 origin-bottom bg-rule group-data-on/col:bg-accent",
  needle: "pointer-events-none absolute inset-y-0 left-1/2 w-0 border-l-(length:--border-active) border-accent",
  diamond: "absolute left-0 size-3 -translate-x-1/2 rotate-45 bg-accent",
  readout: "absolute top-0 left-1/2 mt-4 ml-5 max-w-[calc(50%-var(--space-7))] bg-surface px-2 py-1 font-mono text-data",
} as const;

export type ToolkitGaugeProps = {
  title: string;
  faces: GaugeFace[];
  /** The readable layer (Server Component output). */
  children: ReactNode;
};

/**
 * The toolkit gauge (P11b.3). ≥ 1024px with motion: the stage pins for
 * ≈25vh of scroll per tool and the tool track slides right-to-left past a
 * fixed needle; each tool's size, opacity, lift and bar follow its distance
 * from the needle, the face word cross-fades at face boundaries, and the
 * readout beside the needle shows the needle tool's years and "Used in" links.
 *
 * The visual stage is aria-hidden except the readout (real, focusable links).
 * The readable list stays in the tree, visually hidden, with its links taken
 * out of the tab order so keyboard focus never lands on something invisible.
 * Elsewhere `data-live` is never set: the list is the whole scene.
 */
export function ToolkitGauge({ title, faces, children }: ToolkitGaugeProps) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useRefreshOnShow();

  const tools = faces.flatMap((face, faceIndex) => face.tools.map((tool) => ({ ...tool, faceIndex })));
  const activeTool = tools[active] ?? tools[0];
  const activeFace = activeTool?.faceIndex ?? 0;

  useGSAP(
    () => {
      const rootEl = root.current;
      const listEl = list.current;
      const stageEl = stage.current;
      const bandEl = band.current;
      const trackEl = track.current;
      if (!rootEl || !listEl || !stageEl || !bandEl || !trackEl) return;
      const count = trackEl.children.length;
      if (count === 0) return;

      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP_QUERY} and ${MOTION_OK_QUERY}`, () => {
        rootEl.setAttribute("data-live", "");
        // The hidden list keeps its links for screen readers, not for Tab.
        const listLinks = Array.from(listEl.querySelectorAll<HTMLElement>("a[href]"));
        for (const link of listLinks) link.tabIndex = -1;

        const columns = Array.from(trackEl.children) as HTMLElement[];
        const labels = columns.map((col) => col.querySelector<HTMLElement>("[data-gauge-label]"));
        const bars = columns.map((col) => col.querySelector<HTMLElement>("[data-gauge-bar]"));
        let colW = 0;
        let bandW = 0;
        let barH = 0;
        let nearest = -1;

        // Reads only (on refresh), so every scroll frame is writes only.
        const measure = () => {
          // Fractional width: a rounded offsetWidth drifts 0.4px per column (18px by the last tool).
          colW = columns[0]?.getBoundingClientRect().width ?? 0;
          bandW = bandEl.clientWidth;
          barH = bars[0]?.offsetHeight ?? 0;
        };

        const render = (progress: number) => {
          const f = progress * (count - 1);
          gsap.set(trackEl, { x: bandW / 2 - (f + 0.5) * colW });
          for (let i = 0; i < count; i++) {
            const d = i - f;
            const g = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
            const bar = MIN_BAR + (1 - MIN_BAR) * g;
            const label = labels[i];
            const barEl = bars[i];
            // The label rides on top of its bar: lift = the bar's visible height.
            if (label) {
              label.style.transform = `translate3d(0, ${((1 - bar) * barH).toFixed(2)}px, 0) scale(${(MIN_SCALE + (1 - MIN_SCALE) * g).toFixed(4)})`;
              label.style.opacity = (MIN_OPACITY + (1 - MIN_OPACITY) * g).toFixed(3);
            }
            if (barEl) barEl.style.transform = `scaleY(${bar.toFixed(4)})`;
          }
          // The needle tool: the face boundary is the midpoint between two faces' tools.
          const next = Math.min(count - 1, Math.max(0, Math.round(f)));
          if (next !== nearest) {
            columns[nearest]?.removeAttribute("data-on");
            columns[next]?.setAttribute("data-on", "");
            nearest = next;
            setActive(next);
          }
        };

        measure();
        const trigger = ScrollTrigger.create({
          trigger: stageEl,
          pin: true,
          // Transform pinning, as Pin.tsx: fixed ↔ static switches scored as layout shift.
          pinType: "transform",
          start: "top top",
          end: () => `+=${Math.round(count * VH_PER_TOOL * window.innerHeight)}`,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            render(self.progress);
          },
          onUpdate: (self) => render(self.progress),
          onToggle: (self) =>
            gsap.set(trackEl, self.isActive ? { willChange: "transform" } : { clearProps: "willChange" }),
        });
        render(trigger.progress);

        return () => {
          rootEl.removeAttribute("data-live");
          for (const link of listLinks) link.removeAttribute("tabindex");
          columns[nearest]?.removeAttribute("data-on");
          for (const el of [...labels, ...bars]) el?.removeAttribute("style");
          gsap.set(trackEl, { clearProps: "transform,willChange" });
          setActive(0);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={gaugeClasses.root}>
      <div ref={list} className={gaugeClasses.list}>
        {children}
      </div>
      <div ref={stage} className={gaugeClasses.stage}>
        <div aria-hidden="true" className={gaugeClasses.top}>
          {faces.map((face, i) => (
            <div key={face.id} data-on={i === activeFace ? "" : undefined} className={gaugeClasses.face}>
              <p className={gaugeClasses.eyebrow}>
                <span>{title}</span>
                <span>
                  {pad2(face.index)} / {pad2(faces.length)}
                </span>
              </p>
              <p data-toolkit-word className={gaugeClasses.word}>
                <FaceWord name={face.name} />
              </p>
              <p className={gaugeClasses.paragraph}>
                <FaceParagraph face={face} />
              </p>
            </div>
          ))}
        </div>
        <div ref={band} data-gauge-band className={gaugeClasses.band}>
          <div aria-hidden="true" className={gaugeClasses.window}>
            <div ref={track} className={gaugeClasses.track}>
              {tools.map((tool) => (
                <div key={tool.id} data-gauge-tool={tool.id} className={gaugeClasses.column}>
                  <span data-gauge-label className={gaugeClasses.label}>
                    {tool.name}
                  </span>
                  <span data-gauge-bar className={gaugeClasses.bar} />
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className={gaugeClasses.needle}>
            <span className={cn(gaugeClasses.diamond, "top-0 -translate-y-1/2")} />
            <span className={cn(gaugeClasses.diamond, "bottom-0 translate-y-1/2")} />
          </div>
          {activeTool && (
            // Keyed by tool: a new node per tool, so swapping it never moves an existing box.
            <p key={activeTool.id} data-gauge-readout={activeTool.id} className={gaugeClasses.readout}>
              <span className="sr-only">{activeTool.name}: </span>
              <ToolUsage tool={activeTool} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
