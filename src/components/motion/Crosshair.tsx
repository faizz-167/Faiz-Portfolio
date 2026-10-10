"use client";

import { useRef } from "react";
import { surfaces, type Surface } from "@/components/layout/Scene";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases } from "@/lib/motion/tokens";

/** `<html>` class that hides the native cursor (globals.css, pointer: fine only). */
export const CROSSHAIR_CLASS = "has-crosshair";
/** Elements over which the intersection shows the accent square. */
const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [tabindex]:not([tabindex="-1"])';
const COORD_DIGITS = 4;

const crosshairClasses = {
  /* `[data-surface]` would paint a background; this layer must stay transparent. */
  root: "pointer-events-none fixed inset-0 z-cursor bg-transparent [contain:strict]",
  hLine: "absolute top-0 left-0 h-(--border-hair) w-full bg-rule opacity-0",
  vLine: "absolute top-0 left-0 h-full w-(--border-hair) bg-rule opacity-0",
  point: "absolute top-0 left-0 opacity-0",
  mark: "absolute size-2 -translate-1/2 bg-accent opacity-0 data-active:opacity-100",
  readout: "absolute top-3 left-3 font-mono text-data whitespace-nowrap text-fg-muted",
  /* Card chip (P11c.3): below the readout, scales from its top-left corner. */
  chip: "absolute top-6 left-3 flex origin-top-left items-stretch gap-1 scale-0",
  chipCell: "grid size-6 place-items-center bg-accent text-surface",
  chipLabel: "flex items-center bg-fg px-3 font-mono text-data whitespace-nowrap text-surface",
} as const;

/** Elements that carry a cursor chip name it here (e.g. the home work cards). */
const LABELLED = "[data-cursor-label]";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(COORD_DIGITS, "0");

/** `x 0412 · y 0288` — shared with the SheetStrip readout. */
export function formatCoords(x: number, y: number) {
  return `x ${pad(x)} · y ${pad(y)}`;
}

/** Same width as a real readout, for server HTML and before the first move. */
export const COORDS_PLACEHOLDER = `x ${"-".repeat(COORD_DIGITS)} · y ${"-".repeat(COORD_DIGITS)}`;

function isSurface(value: string | null | undefined): value is Surface {
  return surfaces.includes(value as Surface);
}

/**
 * Crosshair cursor (P6.8): two 1px `--rule` lines across the viewport meeting at
 * the pointer, a mono readout `x 0412 · y 0288`, and a small accent square at
 * the intersection over interactive elements. Lines and colours follow the
 * surface under the pointer (the layer copies its `data-surface`). Over an
 * element with `data-cursor-label` a chip (accent arrow cell + mono label)
 * scales in below the readout (P11c.3).
 * Follows with `gsap.quickTo` (transforms only). The native cursor is hidden
 * while mounted, except over text inputs (I-beam stays).
 * Renders nothing on the server, on touch/coarse pointers, or with reduced
 * motion. Mounted once by MotionProvider (P8.6).
 */
export function Crosshair() {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotion();
  if (!pointerFine || reduced) return null;
  return <CrosshairLayer />;
}

function CrosshairLayer() {
  const root = useRef<HTMLDivElement>(null);
  const hLine = useRef<HTMLDivElement>(null);
  const vLine = useRef<HTMLDivElement>(null);
  const point = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const chipLabel = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const els = {
        root: root.current,
        h: hLine.current,
        v: vLine.current,
        point: point.current,
        mark: mark.current,
        readout: readout.current,
        chip: chip.current,
        chipLabel: chipLabel.current,
      };
      if (!els.root || !els.h || !els.v || !els.point || !els.mark || !els.readout || !els.chip || !els.chipLabel)
        return;
      const { root: layer, h, v, point: dot, mark: square, readout: label, chip: tag, chipLabel: tagText } = els;
      const html = document.documentElement;
      html.classList.add(CROSSHAIR_CLASS);

      const follow = { duration: durationsS.fast, ease: gsapEases.out };
      const xTo = gsap.quickTo([v, dot], "x", follow);
      const yTo = gsap.quickTo([h, dot], "y", follow);
      let shown = false;
      let surface: string | null = null;
      let chipFor: Element | null = null;

      const setShown = (on: boolean) => {
        if (shown === on) return;
        shown = on;
        gsap.set([h, v, dot], { opacity: on ? 1 : 0 }); // a cut
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (!shown) {
          // First sighting: jump into place instead of sliding in from 0,0.
          gsap.set([v, dot], { x: event.clientX });
          gsap.set([h, dot], { y: event.clientY });
        }
        xTo(event.clientX);
        yTo(event.clientY);
        label.textContent = formatCoords(event.clientX, event.clientY);
        setShown(true);
      };

      const onOver = (event: PointerEvent) => {
        const target = event.target instanceof Element ? event.target : null;
        square.toggleAttribute("data-active", Boolean(target?.closest(INTERACTIVE)));
        const labelled = target?.closest(LABELLED) ?? null;
        if (labelled !== chipFor) {
          chipFor = labelled;
          const text = labelled?.getAttribute("data-cursor-label");
          if (text) tagText.textContent = text;
          gsap.to(tag, { scale: text ? 1 : 0, duration: durationsS.fast, ease: gsapEases.out, overwrite: true });
        }
        const next = target?.closest("[data-surface]")?.getAttribute("data-surface");
        if (isSurface(next) && next !== surface) {
          surface = next;
          layer.setAttribute("data-surface", next);
        }
      };

      const onLeave = () => {
        setShown(false);
        chipFor = null;
        gsap.set(tag, { scale: 0 });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      html.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        html.removeEventListener("pointerleave", onLeave);
        html.classList.remove(CROSSHAIR_CLASS);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" data-surface="ink" className={crosshairClasses.root}>
      <div ref={hLine} className={crosshairClasses.hLine} />
      <div ref={vLine} className={crosshairClasses.vLine} />
      <div ref={point} className={crosshairClasses.point}>
        <div ref={mark} className={crosshairClasses.mark} />
        <span ref={readout} className={crosshairClasses.readout} />
        <div ref={chip} className={crosshairClasses.chip}>
          <span className={crosshairClasses.chipCell}>
            <ArrowUpRightIcon className="size-3" />
          </span>
          <span ref={chipLabel} className={crosshairClasses.chipLabel} />
        </div>
      </div>
    </div>
  );
}
