import { Fragment } from "react";
import { Container } from "@/components/layout/Container";
import { Rule } from "@/components/layout/Rule";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { RuleDraw } from "@/components/motion/RuleDraw";
import { Text } from "@/components/type/Text";
import { Link } from "@/components/ui/Link";
import {
  capabilitiesByCategory,
  capabilityUsage,
  hasCasePage,
  type CapabilityCategory,
  type CapabilityEntry,
  type CapabilityId,
} from "@/content";
import { BUILD_YEAR } from "@/lib/build-year";
import { cn } from "@/lib/cn";

const SCENE_ID = "materials";

/** Group heads in sentence case (mono and display never go all caps). */
const categoryLabels: Record<CapabilityCategory, string> = {
  language: "Language",
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  infra: "Infra",
  ai: "AI",
  tooling: "Tooling",
};

/*
 * ≥ 640px: a ruled table. < 640px (Tailwind `max-sm:`): every row becomes a
 * stacked spec block — cells turn into blocks and print their column name from
 * `data-label`, while the markup stays a table for assistive tech.
 * Cell text is --fg: on the raised rows --fg-muted is only 4.55:1 (Phase 2).
 */
const bomClasses = {
  table: "w-full border-collapse text-left max-sm:block",
  caption: "pb-7 text-left max-sm:block",
  head: "max-sm:sr-only",
  headCell: "px-3 pb-3 align-bottom font-mono text-data font-normal text-fg-muted",
  group: "max-sm:block",
  /* Group heads sit on the content line; cells are inset inside the raised fill. */
  groupCell: "pt-7 pb-3 max-sm:block",
  groupRule: "mb-5",
  row: [
    "even:bg-raised",
    "max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-gutter max-sm:gap-y-4 max-sm:py-4",
  ].join(" "),
  cell: "px-3 py-3 align-top font-text text-small text-fg max-sm:flex max-sm:flex-col max-sm:gap-2 max-sm:py-0",
  /* Phones print the column name above the value. The item is the card's title: no label. */
  labelled: "max-sm:before:font-mono max-sm:before:text-data max-sm:before:content-[attr(data-label)]",
  item: "font-normal max-sm:col-span-2",
  qty: "font-mono text-data tabular-nums sm:text-right",
  usedIn: "max-sm:col-span-2",
  list: "inline",
} as const;

const columns = { item: "Item", qty: "Qty (years)", category: "Category", usedIn: "Used in" } as const;

function UsedIn({ id }: { id: CapabilityId }) {
  const projects = capabilityUsage(id);
  if (projects.length === 0) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">No listed project</span>
      </>
    );
  }
  // Generated from project stacks; only projects with a case page link.
  return (
    <span className={bomClasses.list}>
      {projects.map((project, i) => (
        <Fragment key={project.slug}>
          {i > 0 && ", "}
          {hasCasePage(project) ? (
            <Link variant="inline" href={`/work/${project.slug}`}>
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </Fragment>
      ))}
    </span>
  );
}

function MaterialRow({ capability }: { capability: CapabilityEntry }) {
  // Years counted inclusively: a tool first used this year has been used for 1.
  const years = BUILD_YEAR - capability.since + 1;
  return (
    <tr className={bomClasses.row}>
      <th scope="row" className={cn(bomClasses.cell, bomClasses.item)}>
        {capability.name}
      </th>
      <td data-label={columns.qty} className={cn(bomClasses.cell, bomClasses.labelled, bomClasses.qty)}>
        {years}
      </td>
      <td data-label={columns.category} className={cn(bomClasses.cell, bomClasses.labelled)}>
        {categoryLabels[capability.category]}
      </td>
      <td data-label={columns.usedIn} className={cn(bomClasses.cell, bomClasses.labelled, bomClasses.usedIn)}>
        <UsedIn id={capability.id} />
      </td>
    </tr>
  );
}

/**
 * Sheet 04 — the bill of materials (P10.4). Paper. A real table with a
 * caption (styled as the scene heading), one row group per category with a
 * drawn hairline and an h3 head, alternating raised rows.
 */
export function Materials() {
  const groups = capabilitiesByCategory().filter((group) => group.capabilities.length > 0);

  return (
    <Scene id={SCENE_ID} sheet="Sheet 04 — Bill of materials" surface="paper">
      {/* Trace via: right margin rail, level with the top of the content. */}
      <span data-via="right" aria-hidden="true" className="absolute top-section right-0 h-0 w-margin" />
      <Container>
        <RuleDraw>
          <table className={bomClasses.table}>
            <caption className={bomClasses.caption}>
              <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
                Bill of materials
              </Text>
            </caption>
            <thead className={bomClasses.head}>
              <tr>
                <th scope="col" className={bomClasses.headCell}>
                  {columns.item}
                </th>
                <th scope="col" className={cn(bomClasses.headCell, "sm:text-right")}>
                  {columns.qty}
                </th>
                <th scope="col" className={bomClasses.headCell}>
                  {columns.category}
                </th>
                <th scope="col" className={bomClasses.headCell}>
                  {columns.usedIn}
                </th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.category} className={bomClasses.group}>
                <tr className="max-sm:block">
                  <th scope="rowgroup" colSpan={4} className={bomClasses.groupCell}>
                    <Rule className={bomClasses.groupRule} />
                    <Text variant="h3">{categoryLabels[group.category]}</Text>
                  </th>
                </tr>
                {group.capabilities.map((capability) => (
                  <MaterialRow key={capability.id} capability={capability} />
                ))}
              </tbody>
            ))}
          </table>
        </RuleDraw>
      </Container>
    </Scene>
  );
}
