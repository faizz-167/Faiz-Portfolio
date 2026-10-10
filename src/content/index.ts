// The only entry point UI code may import content from. Components never import the raw arrays
// in `./projects`, `./experience` or `./capabilities`; ordering and filtering rules live here once.
import { capabilities } from "./capabilities";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { toolkitFaces } from "./toolkit";
import type { Capability, CapabilityId, Plate, Project, Revision, ToolkitFace } from "./types";

export type {
  ArchEdge,
  ArchNode,
  ArchNodeKind,
  Capability,
  CapabilityCategory,
  CapabilityId,
  Metric,
  Plate,
  Plates,
  Profile,
  Project,
  Revision,
  ToolkitFace,
} from "./types";

export { profile };

// Widened once here so every selector returns the declared model, not the literal shapes.
const allProjects: readonly Project[] = projects;
const allCapabilities: readonly Capability[] = capabilities;
const allRevisions: readonly Revision[] = experience;
const allFaces: readonly ToolkitFace[] = toolkitFaces;

/** How many projects the home work index lists: the first ones in project order (P11b.4). */
const HOME_PROJECT_COUNT = 3;

/** Projects in work-index order (the order of `projects.ts`), including in-progress ones. */
export function sortedProjects(): readonly Project[] {
  return allProjects;
}

/** The projects the home work index shows: the head of the project order. */
export function homeProjects(): readonly Project[] {
  return allProjects.slice(0, HOME_PROJECT_COUNT);
}

/**
 * The image a work row may preview: plate 1, only when it has an image. Placeholder plates are
 * never previewed (P11b.4).
 */
export function previewPlate(project: Project): (Plate & { image: NonNullable<Plate["image"]> }) | undefined {
  const first = project.plates?.[0];
  return first?.image ? { ...first, image: first.image } : undefined;
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

/** The case page's path, or undefined for a project without one. The one place `/work/` paths are made. */
export function caseHref(project: Project): string | undefined {
  return hasCasePage(project) ? `/work/${project.slug}` : undefined;
}

/** Slugs for /work/[slug] static params. Excludes in-progress projects (no case page). */
export function projectSlugs(): string[] {
  return allProjects.filter(hasCasePage).map((project) => project.slug);
}

/**
 * The case page after this one in work-index order, wrapping to the first: the
 * "Next drawing" link. Only projects with a case page take part.
 */
export function nextCaseProject(slug: string): Project | undefined {
  const cases = allProjects.filter(hasCasePage);
  const at = cases.findIndex((project) => project.slug === slug);
  return at < 0 ? undefined : cases[(at + 1) % cases.length];
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

/** A toolkit face with its tools: capabilities whose category it owns, in `capabilities.ts` order. */
export type ToolkitFaceEntry = ToolkitFace & { index: number; tools: CapabilityEntry[] };

/**
 * The toolkit gauge's faces in order (P11b.1). A capability's face is derived from its category
 * through the faces' `categories` (the content validator checks every category maps to exactly
 * one face). Typed from the literal data so each id can be passed straight to `capabilityUsage`.
 */
export function toolkit(): ToolkitFaceEntry[] {
  return allFaces.map((face, index) => ({
    ...face,
    index: index + 1,
    tools: capabilities.filter((c) => face.categories.includes(c.category)),
  }));
}

/** Experience and education, newest first (Rev. C → A). */
export function revisions(): readonly Revision[] {
  return allRevisions;
}
