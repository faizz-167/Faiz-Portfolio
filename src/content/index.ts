// The only entry point UI code may import content from. Components never import the raw arrays
// in `./projects`, `./experience` or `./capabilities`; ordering and filtering rules live here once.
import { capabilities } from "./capabilities";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import type {
  Capability,
  CapabilityCategory,
  CapabilityId,
  Project,
  Revision,
} from "./types";

export type {
  ArchEdge,
  ArchNode,
  ArchNodeKind,
  Capability,
  CapabilityCategory,
  CapabilityId,
  Metric,
  Profile,
  Project,
  Revision,
} from "./types";

export { profile };

// Widened once here so every selector returns the declared model, not the literal shapes.
const allProjects: readonly Project[] = projects;
const allCapabilities: readonly Capability[] = capabilities;
const allRevisions: readonly Revision[] = experience;

/** Bill of materials group order (design.md §7). */
const categoryOrder: readonly CapabilityCategory[] = [
  "language",
  "frontend",
  "backend",
  "data",
  "infra",
  "ai",
  "tooling",
];

/** Projects in work-index order (the order of `projects.ts`), including in-progress ones. */
export function sortedProjects(): readonly Project[] {
  return allProjects;
}

export function getProject(slug: string): Project | undefined {
  return allProjects.find((project) => project.slug === slug);
}

/**
 * In-progress projects are shown as a row only ("On the drawing board") and have no case page,
 * so they never get a /work/[slug] route or a link to one.
 */
export function hasCasePage(project: Project): boolean {
  return project.status !== "in-progress";
}

/** Slugs for /work/[slug] static params. Excludes in-progress projects (no case page). */
export function projectSlugs(): string[] {
  return allProjects.filter(hasCasePage).map((project) => project.slug);
}

export function getCapability(id: CapabilityId): Capability {
  const capability = allCapabilities.find((c) => c.id === id);
  // Unreachable: CapabilityId is derived from the same array.
  if (!capability) throw new Error(`Unknown capability id "${id}"`);
  return capability;
}

/**
 * Projects whose stack uses this capability, in work-index order. In-progress projects are
 * included (they are real usage); callers link only those that pass `hasCasePage`.
 */
export function capabilityUsage(id: CapabilityId): Project[] {
  return allProjects.filter((project) => project.stack.includes(id));
}

/** A capability whose id is known to be one of `CapabilityId` (it came from the data). */
export type CapabilityEntry = Capability & { id: CapabilityId };

/**
 * Capabilities grouped in BOM order; within a group, the order of `capabilities.ts`.
 * Typed from the literal data so each id can be passed straight to `capabilityUsage`.
 */
export function capabilitiesByCategory(): {
  category: CapabilityCategory;
  capabilities: CapabilityEntry[];
}[] {
  return categoryOrder.map((category) => ({
    category,
    capabilities: capabilities.filter((c) => c.category === category),
  }));
}

/** Experience and education, newest first (Rev. C → A). */
export function revisions(): readonly Revision[] {
  return allRevisions;
}
