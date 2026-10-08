// Content integrity checks that the type system cannot express (edge → node references,
// uniqueness, revision order) plus a runtime re-check of stack ids. Runs in `npm run lint`.
//
// Executed by Node's built-in type stripping (`node scripts/validate-content.ts`), so no tsx or
// ts-node. That is why the imports below carry `.ts` extensions (tsconfig
// `allowImportingTsExtensions`) and why src/content uses only type-only imports between files.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { capabilities } from "../src/content/capabilities.ts";
import { experience } from "../src/content/experience.ts";
import { projects } from "../src/content/projects.ts";
import type { Capability, Project, Revision } from "../src/content/types.ts";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content");

const errors: string[] = [];

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

const allCapabilities: readonly Capability[] = capabilities;
const allProjects: readonly Project[] = projects;
const allRevisions: readonly Revision[] = experience;

for (const id of duplicates(allCapabilities.map((c) => c.id))) {
  errors.push(`capabilities: duplicate id "${id}"`);
}
const capabilityIds = new Set<string>(allCapabilities.map((c) => c.id));

for (const slug of duplicates(allProjects.map((p) => p.slug))) {
  errors.push(`projects: duplicate slug "${slug}"`);
}

for (const project of allProjects) {
  const where = `projects[${project.slug}]`;

  // Belt and braces: CapabilityId already makes this a type error.
  for (const id of project.stack) {
    if (!capabilityIds.has(id)) errors.push(`${where}: stack id "${id}" is not in capabilities.ts`);
  }

  const nodeIds = project.architecture.nodes.map((n) => n.id);
  for (const id of duplicates(nodeIds)) errors.push(`${where}: duplicate architecture node id "${id}"`);

  // "Built by me" marks only what the owner built; outside services are used, never owned.
  for (const node of project.architecture.nodes) {
    if (node.kind === "external" && node.owned) {
      errors.push(`${where}: external node "${node.id}" is marked owned`);
    }
  }

  const known = new Set(nodeIds);
  for (const edge of project.architecture.edges) {
    for (const end of [edge.from, edge.to]) {
      if (!known.has(end)) {
        errors.push(`${where}: edge ${edge.from} → ${edge.to} references missing node "${end}"`);
      }
    }
  }
}

// Newest first with letters assigned oldest = A: the list must read …, C, B, A with no gaps.
allRevisions.forEach((revision, index) => {
  const expected = String.fromCharCode("A".charCodeAt(0) + allRevisions.length - 1 - index);
  if (revision.rev !== expected) {
    errors.push(
      `experience[${index}] (${revision.org}): rev "${revision.rev}", expected "${expected}" (newest first, oldest = A)`,
    );
  }
});

for (const file of readdirSync(contentDir)) {
  const lines = readFileSync(join(contentDir, file), "utf8").split("\n");
  lines.forEach((line, index) => {
    if (line.includes("TODO(content)")) errors.push(`src/content/${file}:${index + 1}: TODO(content) left in content`);
  });
}

if (errors.length > 0) {
  console.error(`Content validation failed (${errors.length}):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Content valid: ${allCapabilities.length} capabilities, ${allProjects.length} projects, ${allRevisions.length} revisions.`,
);
