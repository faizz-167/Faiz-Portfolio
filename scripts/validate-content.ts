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
import { toolkitFaces } from "../src/content/toolkit.ts";
import type { Capability, Project, Revision, ToolkitFace } from "../src/content/types.ts";

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
const allFaces: readonly ToolkitFace[] = toolkitFaces;

for (const id of duplicates(allCapabilities.map((c) => c.id))) {
  errors.push(`capabilities: duplicate id "${id}"`);
}
const capabilityIds = new Set<string>(allCapabilities.map((c) => c.id));

// Toolkit faces (P11b.1): a capability's face is derived from its category, so every category in
// use must belong to exactly one face, and the faces' tool counts must sum to the capability count.
for (const id of duplicates(allFaces.map((f) => f.id))) errors.push(`toolkit: duplicate face id "${id}"`);
for (const category of new Set(allCapabilities.map((c) => c.category))) {
  const owners = allFaces.filter((face) => face.categories.includes(category));
  if (owners.length !== 1) {
    errors.push(
      `toolkit: category "${category}" belongs to ${owners.length} faces (${owners.map((f) => f.id).join(", ") || "none"}); expected exactly 1`,
    );
  }
}
const faceTotal = allFaces.reduce(
  (sum, face) => sum + allCapabilities.filter((c) => face.categories.includes(c.category)).length,
  0,
);
if (faceTotal !== allCapabilities.length) {
  errors.push(`toolkit: faces hold ${faceTotal} tools, capabilities.ts has ${allCapabilities.length}`);
}

for (const slug of duplicates(allProjects.map((p) => p.slug))) {
  errors.push(`projects: duplicate slug "${slug}"`);
}

for (const project of allProjects) {
  const where = `projects[${project.slug}]`;

  // Belt and braces: CapabilityId already makes this a type error.
  for (const id of project.stack) {
    if (!capabilityIds.has(id)) errors.push(`${where}: stack id "${id}" is not in capabilities.ts`);
  }

  // Plates (P11b.6): at most four (the tuple type says so too); an image needs a real size.
  const plates = project.plates ?? [];
  if (plates.length > 4) errors.push(`${where}: ${plates.length} plates, at most 4`);
  plates.forEach((plate, index) => {
    if (!plate) return;
    if (plate.caption.trim() === "" || plate.alt.trim() === "") {
      errors.push(`${where}: plate ${index + 1} needs a caption and alt text`);
    }
    if (plate.image && (plate.image.width <= 0 || plate.image.height <= 0)) {
      errors.push(`${where}: plate ${index + 1} image needs its intrinsic width and height`);
    }
  });

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
  `Content valid: ${allCapabilities.length} capabilities in ${allFaces.length} toolkit faces, ${allProjects.length} projects, ${allRevisions.length} revisions.`,
);
