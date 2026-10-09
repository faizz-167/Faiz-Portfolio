"use client";

import { animate, createDrawable, createTimeline, stagger, utils, type JSAnimation, type Timeline } from "animejs";
import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { animeEases, durationsMs } from "@/lib/motion/tokens";
import { ASYNC_DASH, FLOW_DASH } from "./DiagramEdge";

/** Share of the drawing that must be on screen before it draws in. */
const IN_VIEW = 0.2;
/** Node entrance stagger and the gap between edge draw steps (ms). */
const NODE_STAGGER = 50;
const STEP_GAP = 240;
/** One period of FLOW_DASH: offsetting by it loops the dash seamlessly. */
const FLOW_PERIOD = FLOW_DASH.split(" ").reduce((sum, n) => sum + Number(n), 0);
const FLOW_MS = 600;

const all = <E extends Element>(root: ParentNode, selector: string) => [...root.querySelectorAll<E>(selector)];

/** Puts an edge line back exactly as the server drew it (anime's drawable rewrites its dashes). */
function restoreLine(line: SVGPathElement) {
  line.removeAttribute("pathLength");
  line.removeAttribute("stroke-dashoffset");
  line.style.removeProperty("stroke-linecap");
  if (line.closest("[data-async]")) line.setAttribute("stroke-dasharray", ASYNC_DASH);
  else line.removeAttribute("stroke-dasharray");
}

/**
 * Client behaviour for `ArchitectureDiagram` (P11.4). The server markup is the
 * finished drawing; this only adds motion on top, so no-JS and reduced motion
 * see it complete.
 * - Draw-in (anime.js, once per show): nodes stagger in (opacity + 4px y),
 *   edges draw in topological steps (`data-step`), arrowheads and protocol
 *   labels fade in last.
 * - Hover/focus a node: its edges light in the signal colour with a travelling
 *   dash, its note callout shows (it is also the node's aria-describedby), and
 *   unrelated nodes and edges dim. Escape clears it.
 * Hidden routes (<Activity>) run the effect cleanup, which restores the markup.
 */
export function DiagramStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Draw-in.
  useEffect(() => {
    const svg = ref.current?.querySelector<SVGSVGElement>("[data-diagram]");
    if (!svg || prefersReducedMotion()) return;
    const nodes = all<SVGGElement>(svg, "[data-node]");
    const lines = all<SVGPathElement>(svg, "[data-edge-line]");
    const fades = all<SVGElement>(svg, "[data-edge-arrow], [data-edge-label]");

    utils.set(nodes, { opacity: 0, translateY: 4 });
    utils.set(fades, { opacity: 0 });
    const drawables = createDrawable(lines);

    let timeline: Timeline | null = null;
    const play = () => {
      const tl = createTimeline({ defaults: { ease: animeEases.out } });
      tl.add(nodes, { opacity: 1, translateY: 0, duration: durationsMs.slow, delay: stagger(NODE_STAGGER) }, 0);
      // Edges start while the last nodes settle, one topological step after another.
      const firstStep = durationsMs.base + NODE_STAGGER * nodes.length * 0.5;
      const steps = [...new Set(lines.map((l) => Number(l.closest("[data-edge]")?.getAttribute("data-step") ?? 0)))];
      steps.forEach((step, i) => {
        const group = drawables.filter((_, j) => Number(lines[j]!.closest("[data-edge]")?.getAttribute("data-step") ?? 0) === step);
        tl.add(group, { draw: ["0 0", "0 1"], duration: durationsMs.slow, ease: animeEases.wipe }, firstStep + i * STEP_GAP);
      });
      const drawn = firstStep + Math.max(0, steps.length - 1) * STEP_GAP + durationsMs.slow;
      if (fades.length > 0) tl.add(fades, { opacity: 1, duration: durationsMs.base }, drawn);
      tl.then(() => lines.forEach(restoreLine));
      timeline = tl;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        play();
      },
      { threshold: IN_VIEW },
    );
    observer.observe(svg);

    return () => {
      observer.disconnect();
      timeline?.cancel();
      for (const el of [...nodes, ...fades]) {
        el.style.removeProperty("opacity");
        el.style.removeProperty("transform");
      }
      lines.forEach(restoreLine);
    };
  }, []);

  // Hover / focus.
  useEffect(() => {
    const svg = ref.current?.querySelector<SVGSVGElement>("[data-diagram]");
    if (!svg) return;
    let active: string | null = null;
    let flow: JSAnimation | null = null;

    const clear = () => {
      if (active === null) return;
      active = null;
      flow?.revert();
      flow = null;
      delete svg.dataset.active;
      for (const el of all<SVGElement>(svg, "[data-on]")) el.removeAttribute("data-on");
      for (const el of all<SVGElement>(svg, "[data-callout], [data-edge-flow]")) el.setAttribute("visibility", "hidden");
    };

    const light = (id: string) => {
      if (id === active) return;
      clear();
      active = id;
      svg.dataset.active = id;
      const edges = all<SVGGElement>(svg, "[data-edge]").filter((e) => e.dataset.from === id || e.dataset.to === id);
      const related = new Set([id, ...edges.flatMap((e) => [e.dataset.from ?? "", e.dataset.to ?? ""])]);
      for (const node of all<SVGGElement>(svg, "[data-node]")) {
        if (related.has(node.dataset.node ?? "")) node.setAttribute("data-on", "");
      }
      for (const edge of edges) edge.setAttribute("data-on", "");
      svg.querySelector(`[data-callout="${CSS.escape(id)}"]`)?.setAttribute("visibility", "visible");
      const flows = edges.flatMap((e) => all<SVGPathElement>(e, "[data-edge-flow]"));
      for (const f of flows) f.setAttribute("visibility", "visible");
      // Reduced motion: lit edges, no travelling dash.
      if (flows.length > 0 && !prefersReducedMotion()) {
        flow = animate(flows, { strokeDashoffset: [0, -FLOW_PERIOD], duration: FLOW_MS, ease: "linear", loop: true });
      }
    };

    const nodeOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<SVGGElement>("[data-node]") : null;
    const focused = () => nodeOf(document.activeElement)?.dataset.node ?? null;

    const onOver = (event: PointerEvent) => {
      const node = nodeOf(event.target);
      if (node?.dataset.node) light(node.dataset.node);
    };
    const onOut = (event: PointerEvent) => {
      if (nodeOf(event.relatedTarget)) return;
      // Leaving the nodes falls back to the keyboard focus, if any.
      const keep = focused();
      if (keep) light(keep);
      else clear();
    };
    const onFocusIn = (event: FocusEvent) => {
      const node = nodeOf(event.target);
      if (node?.dataset.node) light(node.dataset.node);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!nodeOf(event.relatedTarget)) clear();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || active === null) return;
      const node = nodeOf(document.activeElement);
      if (node) node.blur();
      clear();
    };

    svg.addEventListener("pointerover", onOver);
    svg.addEventListener("pointerout", onOut);
    svg.addEventListener("focusin", onFocusIn);
    svg.addEventListener("focusout", onFocusOut);
    svg.addEventListener("keydown", onKey);
    return () => {
      svg.removeEventListener("pointerover", onOver);
      svg.removeEventListener("pointerout", onOut);
      svg.removeEventListener("focusin", onFocusIn);
      svg.removeEventListener("focusout", onFocusOut);
      svg.removeEventListener("keydown", onKey);
      clear();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
