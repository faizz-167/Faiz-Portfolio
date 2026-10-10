import { ArchitectureDiagram } from "@/components/diagram/ArchitectureDiagram";
import { WorkRows, type WorkRowData } from "@/components/home/WorkRows";
import { Cluster } from "@/components/layout/Cluster";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Spec, type SpecItem } from "@/components/type/Spec";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import {
  caseHref,
  getCapability,
  hasCasePage,
  homeProjects,
  previewPlate,
  sortedProjects,
  type Project,
} from "@/content";

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
  const href = caseHref(project);
  const casePage = href !== undefined;
  // Without a plate image, case-page projects show a miniature of their drawing instead
  // (P10.3 fallback, decided in Phase 11). It is decorative; the panel text says it all.
  const thumb = casePage && !previewPlate(project);
  return (
    <div className="flex flex-col gap-6 pt-5 lg:grid lg:grid-cols-2 lg:gap-gutter">
      <Stack gap={6}>
        {casePage && <Spec items={specItems(project)} />}
        <Text variant="body">{project.summary}</Text>
        {href ? (
          <Button variant="outline" icon="arrow-right" href={href} className="self-start">
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
 * Row data for `WorkRows`, shared by the home index and /work so both list the
 * same rows. In-progress projects read "On the drawing board", with a dashed
 * rule and no case page.
 */
export function workRowData(projects: readonly Project[]): WorkRowData[] {
  return projects.map((project) => {
    const inProgress = !hasCasePage(project);
    const plate = previewPlate(project);
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
      preview: plate && {
        src: plate.image.src,
        alt: plate.alt,
        width: plate.image.width,
        height: plate.image.height,
      },
      panel: <RowPanel project={project} />,
    };
  });
}

/** The total under the home rows: counted from the data, never typed in. */
function assemblyCount(count: number) {
  return `${count} ${count === 1 ? "assembly" : "assemblies"}`;
}

/**
 * Sheet 03 — the work index (P10.1–P10.3, P11b.4). Ink. The first three
 * projects in project order, then a link to /work with the total.
 */
export function WorkIndex() {
  const rows = workRowData(homeProjects());

  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Assemblies" surface="ink">
      {/* Trace via: left margin rail, level with the top of the content. */}
      <span data-via="left" aria-hidden="true" className="absolute top-section left-0 h-0 w-margin" />
      <Container>
        <Stack gap={7}>
          <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
            Selected assemblies
          </Text>
          <Stack gap={6}>
            <WorkRows rows={rows} />
            <Cluster gap={5} align="center">
              <Button variant="outline" icon="arrow-right" href="/work">
                See all assemblies
              </Button>
              <Text variant="data" tone="muted">
                {assemblyCount(sortedProjects().length)}
              </Text>
            </Cluster>
          </Stack>
        </Stack>
      </Container>
    </Scene>
  );
}
