import { ArchitectureDiagram } from "@/components/diagram/ArchitectureDiagram";
import { WorkRows, type WorkRowData } from "@/components/home/WorkRows";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Spec, type SpecItem } from "@/components/type/Spec";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { getCapability, hasCasePage, sortedProjects, type Project } from "@/content";

const SCENE_ID = "work";

/** Status line for projects without a case page (design.md §2.3 status-progress). */
const IN_PROGRESS_LABEL = "On the drawing board";

function specItems(project: Project): SpecItem[] {
  const items: SpecItem[] = [
    { term: "Role", detail: project.role },
    { term: "Stack", detail: project.stack.map((id) => getCapability(id).name).join(", ") },
  ];
  if (project.year !== undefined) items.push({ term: "Year", detail: String(project.year) });
  // "Scale" is the first real metric under its own label; projects with no
  // metrics (Laptop Sentinel, IAM) show none rather than an invented one.
  const metric = project.metrics[0];
  if (metric) items.push({ term: metric.label, detail: metric.value });
  return items;
}

/**
 * The open-row content, rendered here on the server and handed to the client
 * rows as a node: it shows inside the animated panel, and in a <noscript> copy
 * so every row reads in full without JavaScript.
 */
function RowPanel({ project }: { project: Project }) {
  const casePage = hasCasePage(project);
  // No project has a cover yet: case-page projects show a miniature of their drawing instead
  // (P10.3 fallback, decided in Phase 11). It is decorative; the panel text says it all.
  const thumb = casePage && !project.cover;
  return (
    <div className="flex flex-col gap-6 pt-5 lg:grid lg:grid-cols-2 lg:gap-gutter">
      <Stack gap={6}>
        {casePage && <Spec items={specItems(project)} />}
        <Text variant="body">{project.summary}</Text>
        {casePage ? (
          <Button variant="outline" icon="arrow-right" href={`/work/${project.slug}`} className="self-start">
            Open the drawing
          </Button>
        ) : (
          project.repo && (
            <Button variant="ghost" href={project.repo} className="self-start">
              Repository
            </Button>
          )
        )}
      </Stack>
      {thumb && <ArchitectureDiagram project={project} variant="thumb" className="self-start" />}
    </div>
  );
}

/**
 * Sheet 03 — the work index (P10.1–P10.3). Ink. One disclosure row per
 * project in content order; in-progress projects read "On the drawing board",
 * with a dashed rule and no case page.
 */
export function WorkIndex() {
  const rows: WorkRowData[] = sortedProjects().map((project) => {
    const inProgress = !hasCasePage(project);
    return {
      id: project.slug,
      title: project.title,
      indexTitle: project.indexTitle ?? project.title,
      // Year is omitted when unknown; team only when the data names one.
      meta: [
        project.year !== undefined ? String(project.year) : null,
        project.role,
        project.team ?? null,
        inProgress ? IN_PROGRESS_LABEL : null,
      ].filter((part): part is string => part !== null),
      inProgress,
      cover: project.cover,
      panel: <RowPanel project={project} />,
    };
  });

  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Assemblies" surface="ink">
      {/* Trace via: left margin rail, level with the top of the content. */}
      <span data-via="left" aria-hidden="true" className="absolute top-section left-0 h-0 w-margin" />
      <Container>
        <Stack gap={7}>
          <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
            Selected assemblies
          </Text>
          <WorkRows rows={rows} />
        </Stack>
      </Container>
    </Scene>
  );
}
