import type { ArchNodeKind } from "@/content";
import type { LayoutNode, Rect } from "./layout";
import { diagramMetrics } from "./layout";

/** Size of the owned corner mark (viewBox units). */
const MARK = 12;
/** Inset of the inner rule on db and worker nodes, and the offset of the external frame. */
const INSET = 5;
/** Spacing of the queue's internal ticks. */
const TICK_STEP = 12;
const TICK_HEIGHT = 7;

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The extra rules that tell the kinds apart (design.md §7: square nodes drawn by kind).
 * Everything is square-cornered; the shape is the outline plus these marks.
 */
function KindMarks({ kind, rect: { x, y, width: w, height: h } }: { kind: ArchNodeKind; rect: Rect }) {
  switch (kind) {
    case "db":
      // Double top rule.
      return <path d={`M${x} ${y + INSET}H${r2(x + w)}`} />;
    case "worker":
      // Double left rule.
      return <path d={`M${x + INSET} ${y}V${y + h}`} />;
    case "queue": {
      // Internal ticks along the bottom: slots in a buffer.
      const ticks: string[] = [];
      for (let tx = x + TICK_STEP; tx < x + w - TICK_STEP / 2; tx += TICK_STEP) {
        ticks.push(`M${r2(tx)} ${y + h}v${-TICK_HEIGHT}`);
      }
      return <path d={ticks.join("")} />;
    }
    default:
      return null;
  }
}

/** Outline by kind. Fill is the surface, so edges never show through a node. */
function Outline({ kind, rect: { x, y, width: w, height: h } }: { kind: ArchNodeKind; rect: Rect }) {
  const box = <rect x={x} y={y} width={w} height={h} className="fill-surface" />;
  switch (kind) {
    case "client":
    case "edge":
      // Open on the left: the side that faces the outside world.
      return (
        <>
          <rect x={x} y={y} width={w} height={h} className="fill-surface stroke-none" />
          <path d={`M${x} ${y}H${r2(x + w)}V${y + h}H${x}`} className="fill-none" />
        </>
      );
    case "cache":
      return <rect x={x} y={y} width={w} height={h} className="fill-surface" strokeDasharray="4 3" />;
    case "external":
      // Hairline offset frame: someone else's box behind ours.
      return (
        <>
          <rect x={x + INSET} y={y + INSET} width={w} height={h} className="fill-surface stroke-rule" />
          {box}
        </>
      );
    default:
      return box;
  }
}

export function NodeShape({ kind, rect }: { kind: ArchNodeKind; rect: Rect }) {
  return (
    <>
      <Outline kind={kind} rect={rect} />
      <KindMarks kind={kind} rect={rect} />
    </>
  );
}

/** The owned corner mark: a signal triangle in the top-right corner. */
export function OwnedMark({ x, y }: { x: number; y: number }) {
  return <path d={`M${r2(x - MARK)} ${y}H${x}V${y + MARK}Z`} className="fill-accent stroke-none" />;
}

export type DiagramNodeProps = {
  layout: LayoutNode;
  /** Id of the callout that describes this node (when it has a note). */
  calloutId?: string;
  /** Accessible name: the label, plus ownership when the diagram mixes owners. */
  name: string;
  /** Thumb variant: shape only, not focusable, no text. */
  thumb?: boolean;
};

/**
 * One node: a focusable `<g role="button">` (P11.4) whose description is its
 * note callout. The client stage finds it by `data-node`.
 */
export function DiagramNode({ layout, calloutId, name, thumb = false }: DiagramNodeProps) {
  const { node, rect, lines } = layout;
  const { labelSize, labelLineHeight } = diagramMetrics;
  const cx = r2(rect.x + rect.width / 2);
  const cy = rect.y + rect.height / 2;
  const firstLine = cy - ((lines.length - 1) / 2) * labelLineHeight;
  const shape = (
    <>
      <NodeShape kind={node.kind} rect={rect} />
      {node.owned && <OwnedMark x={r2(rect.x + rect.width)} y={rect.y} />}
    </>
  );
  if (thumb) return <g data-kind={node.kind}>{shape}</g>;
  return (
    <g
      data-node={node.id}
      data-kind={node.kind}
      tabIndex={0}
      role="button"
      aria-label={name}
      aria-describedby={calloutId}
    >
      {/* Drawn focus ring: outlines on SVG groups are unreliable across browsers. */}
      <rect
        data-node-focus=""
        x={rect.x - 5}
        y={rect.y - 5}
        width={r2(rect.width + 10)}
        height={rect.height + 10}
        className="fill-none stroke-accent"
      />
      {shape}
      <text
        x={cx}
        fontSize={labelSize}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-fg stroke-none font-mono"
        aria-hidden="true"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={cx} y={r2(firstLine + i * labelLineHeight)}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

/** A node's note, shown on hover/focus. Hidden, but still its node's accessible description. */
export function DiagramCallout({ id, nodeId, callout }: { id: string; nodeId: string; callout: NonNullable<LayoutNode["callout"]> }) {
  const { rect, lines } = callout;
  const { smallSize, smallLineHeight, calloutPadding } = diagramMetrics;
  return (
    <g id={id} data-callout={nodeId} visibility="hidden">
      <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} className="fill-raised stroke-fg" />
      <text fontSize={smallSize} className="fill-fg stroke-none font-mono">
        {lines.map((line, i) => (
          <tspan
            key={i}
            x={rect.x + calloutPadding}
            y={r2(rect.y + calloutPadding + (i + 0.5) * smallLineHeight)}
            dominantBaseline="central"
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
