import type { Project } from "@/content";
import { cn } from "@/lib/cn";
import { ASYNC_DASH, DiagramEdge } from "./DiagramEdge";
import { DiagramCallout, DiagramNode } from "./DiagramNode";
import { DiagramStage } from "./DiagramStage";
import { layoutDiagram } from "./layout";

export type DiagramVariant = "full" | "thumb";

const diagramClasses = {
  /* Hairline strokes in --fg by default; children opt out (text) or recolour (rules, signal). */
  svg: "block h-auto w-full stroke-fg [stroke-width:1] [stroke-linecap:square]",
  /*
   * Below this width the drawing would shrink its 11–13 unit mono text under ~10–11px, so the
   * container scrolls sideways instead (validation: legible at 360px).
   */
  full: "min-w-[64rem]",
  scroller: "overflow-x-auto overscroll-x-contain",
  legend: "flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-data text-fg-muted",
  key: "inline-flex items-center gap-2",
  details: "font-mono text-data",
  summary: "inline-flex min-h-touch cursor-pointer items-center text-fg",
  list: "flex flex-col gap-2 pt-3 text-fg-muted",
} as const;

/** "Client → API gateway (HTTPS)", the sentence the text alternative lists per edge. */
export function edgeSentences(project: Project): string[] {
  const label = (id: string) => project.architecture.nodes.find((n) => n.id === id)?.label ?? id;
  return project.architecture.edges.map((e) => {
    const detail = [e.protocol, e.async ? "async" : null].filter(Boolean).join(", ");
    return `${label(e.from)} → ${label(e.to)}${detail ? ` (${detail})` : ""}`;
  });
}

function summary(project: Project) {
  const { nodes, edges } = project.architecture;
  const owned = nodes.filter((n) => n.owned);
  const ownership =
    owned.length === nodes.length ? "Every component built by me." : `Built by me: ${owned.map((n) => n.label).join(", ")}.`;
  return `${nodes.length} components and ${edges.length} connections. ${ownership} Every connection is listed as text below the drawing.`;
}

function Legend({ project }: { project: Project }) {
  const hasAsync = project.architecture.edges.some((e) => e.async);
  return (
    <figcaption className={diagramClasses.legend}>
      <span className={diagramClasses.key}>
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
          <path d="M0 0H12V12Z" className="fill-accent" />
        </svg>
        Built by me
      </span>
      {project.team && <span>{project.team}</span>}
      {hasAsync && (
        <span className={diagramClasses.key}>
          <svg viewBox="0 0 24 2" className="h-0.5 w-6" aria-hidden="true">
            <path d="M0 1H24" strokeDasharray={ASYNC_DASH} className="stroke-fg" />
          </svg>
          Async
        </span>
      )}
    </figcaption>
  );
}

export type ArchitectureDiagramProps = {
  project: Project;
  /** "full": the case-page drawing. "thumb": a decorative miniature (no text, not interactive). */
  variant?: DiagramVariant;
  className?: string;
};

/**
 * System architecture drawing (P11.3–P11.5), rendered on the server from the
 * project's typed nodes and edges, so it is a complete static SVG without
 * JavaScript. `DiagramStage` (client) adds the draw-in and the hover/focus
 * callouts on top of this markup.
 *
 * The SVG is `role="group"`, not `role="img"`: an img's children are
 * presentational, which would hide the focusable nodes from assistive tech.
 * It keeps the `<title>`/`<desc>` summary through aria-labelledby/-describedby.
 */
export function ArchitectureDiagram({ project, variant = "full", className }: ArchitectureDiagramProps) {
  const { nodes, edges } = project.architecture;
  const layout = layoutDiagram(nodes, edges);

  if (variant === "thumb") {
    return (
      <svg viewBox={layout.viewBox} aria-hidden="true" focusable="false" className={cn(diagramClasses.svg, className)}>
        {layout.edges.map((e) => (
          <DiagramEdge key={e.index} layout={e} thumb />
        ))}
        {layout.nodes.map((n) => (
          <DiagramNode key={n.node.id} layout={n} name={n.node.label} thumb />
        ))}
      </svg>
    );
  }

  const id = `diagram-${project.slug}`;
  const mixedOwnership = nodes.some((n) => n.owned) && nodes.some((n) => !n.owned);
  return (
    <figure className={cn("flex flex-col gap-5", className)}>
      <DiagramStage>
        <div role="region" aria-label={`${project.title} system drawing`} tabIndex={0} className={diagramClasses.scroller}>
          <svg
            data-diagram=""
            viewBox={layout.viewBox}
            role="group"
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-desc`}
            className={cn(diagramClasses.svg, diagramClasses.full)}
          >
            <title id={`${id}-title`}>{`${project.title}: system diagram`}</title>
            <desc id={`${id}-desc`}>{summary(project)}</desc>
            <g data-layer="edges">
              {layout.edges.map((e) => (
                <DiagramEdge key={e.index} layout={e} />
              ))}
            </g>
            <g data-layer="nodes">
              {layout.nodes.map((n) => (
                <DiagramNode
                  key={n.node.id}
                  layout={n}
                  name={mixedOwnership && n.node.owned ? `${n.node.label}, built by me` : n.node.label}
                  calloutId={n.callout ? `${id}-note-${n.node.id}` : undefined}
                />
              ))}
            </g>
            {/* Last, so an open callout paints over every node. */}
            <g data-layer="callouts">
              {layout.nodes.map((n) =>
                n.callout ? (
                  <DiagramCallout key={n.node.id} id={`${id}-note-${n.node.id}`} nodeId={n.node.id} callout={n.callout} />
                ) : null,
              )}
            </g>
          </svg>
        </div>
      </DiagramStage>
      <Legend project={project} />
      <details className={diagramClasses.details}>
        <summary className={diagramClasses.summary}>Read the diagram as text</summary>
        <ul className={diagramClasses.list}>
          {edgeSentences(project).map((sentence, i) => (
            <li key={i}>{sentence}</li>
          ))}
        </ul>
      </details>
    </figure>
  );
}
