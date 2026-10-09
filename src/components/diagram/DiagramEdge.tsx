import type { LayoutEdge } from "./layout";
import { diagramMetrics } from "./layout";

/** Async edges are dashed (design.md §7). Also re-applied by the stage after the draw-in. */
export const ASYNC_DASH = "6 5";
/** The travelling dash on a lit edge (P11.4). Its period is what the loop offsets by. */
export const FLOW_DASH = "3 9";

export type DiagramEdgeProps = {
  layout: LayoutEdge;
  /** Thumb variant: the line only. */
  thumb?: boolean;
};

/**
 * One edge: the line (drawn in by anime.js), a signal copy that carries the
 * travelling dash when the edge is lit, the arrowhead and the protocol label.
 */
export function DiagramEdge({ layout, thumb = false }: DiagramEdgeProps) {
  const { edge, d, arrow, label, step, index } = layout;
  const dash = edge.async ? ASYNC_DASH : undefined;
  if (thumb) return <path d={d} strokeDasharray={dash} className="fill-none" />;
  return (
    <g data-edge={index} data-from={edge.from} data-to={edge.to} data-step={step} data-async={edge.async || undefined}>
      <path data-edge-line="" d={d} strokeDasharray={dash} className="fill-none" />
      <path data-edge-flow="" d={d} strokeDasharray={FLOW_DASH} className="fill-none stroke-accent" visibility="hidden" />
      <path data-edge-arrow="" d={arrow} className="fill-none" />
      {label && (
        <text
          data-edge-label=""
          x={label.x}
          y={label.y}
          fontSize={diagramMetrics.smallSize}
          textAnchor="middle"
          dominantBaseline="central"
          transform={label.vertical ? `rotate(-90 ${label.x} ${label.y})` : undefined}
          // The halo is the surface colour: the label breaks the line it sits on, as on a drawing.
          className="fill-fg-muted stroke-surface font-mono [paint-order:stroke] [stroke-width:5]"
        >
          {label.text}
        </text>
      )}
    </g>
  );
}
