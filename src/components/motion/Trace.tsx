"use client";

import { useId, useRef } from "react";
import { surfaces, type Surface } from "@/components/layout/Scene";
import {
  buildLocalSegment,
  buildTracePath,
  drawnFractionAt,
  rectsPath,
  type RailSide,
  type TraceAnchor,
} from "@/components/motion/trace-path";
import { cn } from "@/lib/cn";
import { readPxToken } from "@/lib/motion/css-tokens";
import { gsap, requestRefresh, useGSAP, useRefreshOnShow } from "@/lib/motion/gsap";
import { MOTION_OK_QUERY, REDUCED_MOTION_QUERY } from "@/lib/motion/reduced-motion";
import { durationsS, gsapEases } from "@/lib/motion/tokens";

/* Below 640px only short local segments per via are drawn (design.md §7). */
const WIDE_QUERY = "(min-width: 640px)";
const NARROW_QUERY = "(max-width: 639.98px)";
/** Resize bursts collapse into one rebuild. */
const REBUILD_DEBOUNCE_MS = 150;
const SVG_NS = "http://www.w3.org/2000/svg";
/*
 * Mobile lead: draws while its via travels from the bottom edge to the centre.
 * Ends are clamped to the page's scroll range: the last via (the Contact stamp,
 * P10.6) sits too near the end of the page to ever reach the viewport centre.
 */
const LOCAL_START = "top bottom";
const LOCAL_END = "clamp(top center)";

/** Tokens the geometry is built from (read at runtime, never duplicated). */
const traceTokens = {
  chamfer: "--space-4",
  viaRadius: "--space-1",
  localLength: "--space-8",
  margin: "--margin-x",
} as const;

const traceClasses = {
  svg: "pointer-events-none absolute inset-0 z-trace size-full overflow-visible",
  /* `[data-surface]` paints a background in globals.css; a <g> must not. */
  layer: "bg-transparent",
  stroke: "fill-none stroke-accent [stroke-width:var(--border-active)] [vector-effect:non-scaling-stroke]",
  via: "fill-accent stroke-none",
} as const;

type Via = TraceAnchor & { surface: Surface; element: HTMLElement };

type Geometry = {
  width: number;
  height: number;
  vias: Via[];
  route: ReturnType<typeof buildTracePath>;
  /** Clip region (path data) per surface. */
  clips: Record<Surface, string>;
  viaRadius: number;
  localLength: number;
};

function isSurface(value: string | null | undefined): value is Surface {
  return surfaces.includes(value as Surface);
}

function surfaceOf(el: Element, fallback: Surface): Surface {
  const value = el.closest("[data-surface]")?.getAttribute("data-surface");
  return isSurface(value) ? value : fallback;
}

/**
 * All DOM reads for one rebuild, batched before any write. Returns null while
 * the layer is not laid out (hidden route under <Activity>).
 */
function measure(scope: HTMLElement): Geometry | null {
  const marginX = readPxToken(traceTokens.margin, scope);
  const box = scope.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return null;
  const originX = box.left + scope.clientLeft;
  const originY = box.top + scope.clientTop;
  const base: Surface = surfaceOf(scope, "ink");

  const sceneRects = Array.from(scope.querySelectorAll<HTMLElement>("[data-sheet][data-surface]")).map(
    (scene) => {
      const r = scene.getBoundingClientRect();
      return {
        surface: surfaceOf(scene, base),
        x: r.left - originX,
        y: r.top - originY,
        width: r.width,
        height: r.height,
        padTop: Number.parseFloat(getComputedStyle(scene).paddingTop) || 0,
        element: scene,
      };
    },
  );

  const vias: Via[] = Array.from(scope.querySelectorAll<HTMLElement>("[data-via]")).map((element) => {
    const r = element.getBoundingClientRect();
    const scene = sceneRects.find((s) => s.element.contains(element));
    const rail = element.getAttribute("data-via");
    return {
      x: r.left + r.width / 2 - originX,
      y: r.top + r.height / 2 - originY,
      rail: rail === "left" || rail === "right" ? (rail as RailSide) : undefined,
      // Cross the page inside the empty top padding of the via's scene.
      seamY: scene ? scene.y + scene.padTop / 2 : undefined,
      surface: surfaceOf(element, base),
      element,
    };
  });

  const width = box.width;
  const height = box.height;
  const others = sceneRects.filter((s) => s.surface !== base);
  const clips = Object.fromEntries(
    surfaces.map((surface) => [
      surface,
      surface === base
        ? // Everything except scenes of another surface (even-odd holes).
          rectsPath([{ x: 0, y: 0, width, height }, ...others])
        : rectsPath(sceneRects.filter((s) => s.surface === surface)),
    ]),
  ) as Record<Surface, string>;

  return {
    width,
    height,
    vias,
    route: buildTracePath(vias, { width, marginX }, readPxToken(traceTokens.chamfer)),
    clips,
    viaRadius: readPxToken(traceTokens.viaRadius),
    localLength: readPxToken(traceTokens.localLength),
  };
}

function svgElement<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

/** Writes the via pads (and mobile leads) into `layer`; returns pads and leads in via order. */
function drawVias(layer: SVGGElement, geometry: Geometry, local: boolean) {
  const pads: SVGCircleElement[] = [];
  const leads: SVGPathElement[] = [];
  layer.replaceChildren(
    ...geometry.vias.map((via) => {
      // Each via takes the accent of the surface it sits on.
      const group = svgElement("g", { "data-surface": via.surface, class: traceClasses.layer });
      if (local) {
        const lead = svgElement("path", {
          d: buildLocalSegment(via, geometry.localLength),
          class: traceClasses.stroke,
        });
        leads.push(lead);
        group.append(lead);
      }
      const pad = svgElement("circle", {
        cx: String(via.x),
        cy: String(via.y),
        r: String(geometry.viaRadius),
        class: traceClasses.via,
      });
      pads.push(pad);
      group.append(pad);
      return group;
    }),
  );
  return { pads, leads };
}

export type TraceProps = {
  /**
   * Start gate (P9.4). While false (motion allowed) nothing is measured or drawn;
   * flipping it to true builds the trace and pops the vias already reached, so a
   * page can hold the trace until an intro sequence ends. Ignored under reduced
   * motion (the finished trace shows at once). Default true.
   */
  armed?: boolean;
  className?: string;
};

/**
 * Signal trace (P6.3): one SVG layer covering its parent (which must be
 * positioned), routed through every `[data-via]` inside that parent in
 * document order. `data-via="left" | "right"` forces a via's rail.
 *
 * Colour per surface: the route is drawn three times, once per surface, each
 * copy inside `<g data-surface>` (so `stroke: var(--accent)` resolves to that
 * surface's accent) and clipped to the scenes (`[data-sheet][data-surface]`)
 * of that surface. All copies share one DrawSVG tween, so they read as one line
 * that changes colour at each scene seam.
 *
 * Desktop (≥640px): drawn 0 → 100% scrubbed between the first and last via
 * passing the viewport centre; each via pops when the draw head reaches it.
 * Mobile: a short lead per via, drawn as the via scrolls up to the centre.
 * Reduced motion: the finished trace, no tweens.
 * Rebuilds on resize (debounced) and after `document.fonts.ready`, then
 * requests one ScrollTrigger refresh. Purely decorative: aria-hidden.
 */
export function Trace({ armed = true, className }: TraceProps) {
  const svg = useRef<SVGSVGElement>(null);
  const routes = useRef<Array<SVGPathElement | null>>([]);
  const clips = useRef<Array<SVGPathElement | null>>([]);
  const viaLayer = useRef<SVGGElement>(null);
  const clipId = `trace${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  /* Set while a build was skipped by the gate: the build after arming animates its pops. */
  const held = useRef(false);
  useRefreshOnShow();

  useGSAP(
    () => {
      const svgEl = svg.current;
      const scope = svgEl?.parentElement;
      const layer = viaLayer.current;
      if (!svgEl || !scope || !layer) return;
      const routePaths = routes.current.filter((p): p is SVGPathElement => p !== null);
      const clipPaths = clips.current.filter((p): p is SVGPathElement => p !== null);

      const mm = gsap.matchMedia();
      mm.add(
        { wide: WIDE_QUERY, narrow: NARROW_QUERY, motion: MOTION_OK_QUERY, reduced: REDUCED_MOTION_QUERY },
        (context) => {
          const wide = Boolean(context.conditions?.wide);
          const animate = Boolean(context.conditions?.motion);
          if (animate && !armed) {
            // Gated: no measuring and no ScrollTriggers while an intro sequence runs.
            held.current = true;
            return;
          }
          // The first sync after the gate opens pops the reached vias instead of cutting them in.
          let popIn = held.current;
          held.current = false;
          let anim: gsap.Context | null = null;
          let timer: ReturnType<typeof setTimeout> | undefined;
          let alive = true;

          const rebuild = () => {
            if (!alive) return;
            const geometry = measure(scope);
            if (!geometry) return;
            anim?.revert();

            // Writes.
            svgEl.setAttribute("viewBox", `0 0 ${geometry.width} ${geometry.height}`);
            surfaces.forEach((surface, i) => clipPaths[i]?.setAttribute("d", geometry.clips[surface]));
            for (const path of routePaths) path.setAttribute("d", wide ? geometry.route.d : "");
            const { pads, leads } = drawVias(layer, geometry, !wide);

            if (!animate) return; // reduced motion: finished drawing
            anim = gsap.context(() => {
              if (wide) {
                const progress = geometry.route.viaProgress;
                const popped = pads.map(() => false);
                const sync = (at: number, instant: boolean) => {
                  pads.forEach((pad, i) => {
                    const on = at >= (progress[i] ?? 0) - Number.EPSILON;
                    if (on === popped[i]) return;
                    popped[i] = on;
                    const scale = on ? 1 : 0;
                    if (instant) gsap.set(pad, { scale, transformOrigin: "50% 50%" });
                    else gsap.to(pad, { scale, duration: durationsS.fast, ease: gsapEases.out, overwrite: true });
                  });
                };
                gsap.set(pads, { scale: 0, transformOrigin: "50% 50%" });
                gsap.set(routePaths, { drawSVG: "0% 0%" });
                // One DrawSVG tween; its ease maps scrub progress to drawn length so
                // the head tracks the viewport centre (trace-path.ts scheduleDraw).
                // 60+ per-segment tweens cost ~60ms of lazy init (getTotalLength ×3 each).
                const { schedule } = geometry.route;
                const first = schedule[0] ?? 0;
                const last = schedule[schedule.length - 1] ?? first;
                gsap.to(routePaths, {
                  drawSVG: "0% 100%",
                  ease: (p: number) => drawnFractionAt(geometry.route, p),
                  scrollTrigger: {
                    trigger: scope,
                    start: `top+=${first} center`,
                    // Clamped (see LOCAL_END): the draw completes at the bottom of the page.
                    end: `clamp(top+=${Math.max(last, first + 1)} center)`,
                    scrub: true,
                    onUpdate: (self) => sync(self.progress, false),
                    onRefresh: (self) => {
                      sync(self.progress, !popIn);
                      popIn = false;
                    },
                  },
                });
              } else {
                leads.forEach((lead, i) => {
                  const via = geometry.vias[i];
                  const pad = pads[i];
                  if (!via || !pad) return;
                  gsap
                    .timeline({
                      scrollTrigger: { trigger: via.element, start: LOCAL_START, end: LOCAL_END, scrub: true },
                    })
                    .fromTo(lead, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", ease: "none" })
                    .fromTo(
                      pad,
                      { scale: 0, transformOrigin: "50% 50%" },
                      { scale: 1, ease: gsapEases.out, duration: durationsS.fast },
                    );
                });
              }
            });
            requestRefresh();
          };

          const schedule = () => {
            clearTimeout(timer);
            timer = setTimeout(rebuild, REBUILD_DEBOUNCE_MS);
          };

          rebuild();
          let lastSize = `${scope.clientWidth}x${scope.clientHeight}`;
          const observer = new ResizeObserver(() => {
            const size = `${scope.clientWidth}x${scope.clientHeight}`;
            if (size === lastSize) return;
            lastSize = size;
            schedule();
          });
          observer.observe(scope);
          document.fonts.ready.then(() => alive && rebuild());

          return () => {
            alive = false;
            clearTimeout(timer);
            observer.disconnect();
            anim?.revert();
            for (const path of routePaths) path.setAttribute("d", "");
            layer.replaceChildren();
          };
        },
      );
    },
    // `armed` rebuilds everything once when the gate opens (revert + fresh build).
    { scope: svg, dependencies: [armed], revertOnUpdate: true },
  );

  return (
    <svg
      ref={svg}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={cn(traceClasses.svg, className)}
    >
      <defs>
        {surfaces.map((surface, i) => (
          <clipPath key={surface} id={`${clipId}-${surface}`}>
            <path
              ref={(node) => {
                clips.current[i] = node;
              }}
              clipRule="evenodd"
            />
          </clipPath>
        ))}
      </defs>
      {surfaces.map((surface, i) => (
        <g
          key={surface}
          data-surface={surface}
          clipPath={`url(#${clipId}-${surface})`}
          className={traceClasses.layer}
        >
          <path
            ref={(node) => {
              routes.current[i] = node;
            }}
            className={traceClasses.stroke}
          />
        </g>
      ))}
      <g ref={viaLayer} />
    </svg>
  );
}
