import { hasPlates } from "@/components/case/CasePlates";
import { ArchitectureDiagram } from "@/components/diagram/ArchitectureDiagram";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Spec } from "@/components/type/Spec";
import { Text } from "@/components/type/Text";
import { Link } from "@/components/ui/Link";
import { TitleBlock, type TitleBlockCell, type TitleBlockColumns } from "@/components/ui/TitleBlock";
import { caseHref, getCapability, type Project } from "@/content";

/** Scene ids. The header must stay `top`: the strip's name links to #top. */
const IDS = { header: "top", drawing: "drawing", notes: "notes" } as const;

const caseClasses = {
  title: "[overflow-wrap:anywhere]",
  /* Status is said in words; the live dot is the only colour (design.md §2.3). */
  liveDot: "inline-block size-2 rounded-dot bg-accent",
  status: "inline-flex items-center gap-2",
  section: "flex flex-col gap-4",
  links: "flex flex-wrap gap-x-6 gap-y-3 font-mono text-data",
  next: "group/control flex flex-col gap-2 self-start",
} as const;

/**
 * "Live" when the project has a public deployment, otherwise "Complete" — the
 * data has no shipped date, so nothing stronger is claimed.
 */
function statusCell(project: Project): TitleBlockCell {
  return {
    label: "Status",
    value: project.live ? (
      <span className={caseClasses.status}>
        <span aria-hidden="true" className={caseClasses.liveDot} />
        Live
      </span>
    ) : (
      "Complete"
    ),
  };
}

/** Columns that fit every cell (with its span) on one row: 5–7 for the case data. */
const LG_TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const satisfies readonly NonNullable<TitleBlockColumns["lg"]>[];

function lgColumns(cells: readonly TitleBlockCell[]): TitleBlockColumns["lg"] {
  const total = cells.reduce((sum, cell) => sum + (cell.span ?? 1), 0);
  return LG_TIERS[Math.min(LG_TIERS.length, Math.max(1, total)) - 1];
}

/** Sheet 01 — the title block (P11.6). Ink. */
export function CaseHeader({ project }: { project: Project }) {
  const cells: TitleBlockCell[] = [
    { label: "Project", value: project.title },
    ...(project.year !== undefined ? [{ label: "Year", value: String(project.year) }] : []),
    { label: "Role", value: project.role },
    ...(project.team ? [{ label: "Team", value: project.team }] : []),
    { label: "Stack", value: project.stack.map((id) => getCapability(id).name).join(", "), span: 2 },
    statusCell(project),
  ];
  return (
    <Scene id={IDS.header} sheet="Sheet 01 — Title block" surface="ink">
      <Container>
        <Stack gap={7}>
          <Text variant="h1" id={sceneTitleId(IDS.header)} className={caseClasses.title}>
            {project.title}
          </Text>
          <Text variant="lede">{project.summary}</Text>
          {/* One row at lg whatever the data omits (year, team). */}
          <TitleBlock cells={cells} columns={{ base: 2, md: 3, lg: lgColumns(cells) }} />
        </Stack>
      </Container>
    </Scene>
  );
}

/** Sheet 02 — the system drawing (P11.3–P11.5). Ink. */
export function CaseDrawing({ project }: { project: Project }) {
  return (
    <Scene id={IDS.drawing} sheet="Sheet 02 — System" surface="ink">
      <Container>
        <Stack gap={6}>
          <Text variant="h2" id={sceneTitleId(IDS.drawing)}>
            System
          </Text>
          <ArchitectureDiagram project={project} />
        </Stack>
      </Container>
    </Scene>
  );
}

/** Sheet 03 (04 after plates) — notes: body sections, metrics as a spec list, links, next drawing (P11.6). Paper. */
export function CaseNotes({ project, next }: { project: Project; next: Project | undefined }) {
  const links = [
    ...(project.live ? [{ label: "Live site", href: project.live }] : []),
    ...(project.repo ? [{ label: "Repository", href: project.repo }] : []),
    ...(project.links ?? []),
  ];
  const nextHref = next && caseHref(next);
  return (
    <Scene id={IDS.notes} sheet={hasPlates(project) ? "Sheet 04 — Notes" : "Sheet 03 — Notes"} surface="paper">
      <Container>
        <Stack gap={9}>
          <Text variant="h2" id={sceneTitleId(IDS.notes)}>
            Notes
          </Text>

          {project.body.map((section) => (
            <section key={section.heading} className={caseClasses.section}>
              <Text variant="h3">{section.heading}</Text>
              {section.paragraphs.map((paragraph, i) => (
                <Text key={i} variant="body">
                  {paragraph}
                </Text>
              ))}
            </section>
          ))}

          {project.metrics.length > 0 && (
            <section className={caseClasses.section}>
              <Text variant="h3">Measurements</Text>
              <Spec
                items={project.metrics.map((metric) => ({
                  term: metric.label,
                  detail: metric.context ? `${metric.value} — ${metric.context}` : metric.value,
                }))}
                columns={{ base: 1, md: 2, lg: 4 }}
              />
            </section>
          )}

          {links.length > 0 && (
            <section className={caseClasses.section}>
              <Text variant="h3">Links</Text>
              <ul className={caseClasses.links}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} external>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {nextHref && next && (
            <Link variant="plain" href={nextHref} className={caseClasses.next}>
              <Text variant="data" tone="muted">
                Next drawing →
              </Text>
              <Text as="span" variant="h2">
                {next.title}
              </Text>
            </Link>
          )}
        </Stack>
      </Container>
    </Scene>
  );
}
