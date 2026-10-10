// Content model. Every content file is plain data checked against these types; the only way UI
// code reads it is through the selectors in `./index.ts`.
//
// Imports in src/content are type-only (`import type`) on purpose: `scripts/validate-content.ts`
// loads the data files with Node's built-in type stripping, which erases type imports but cannot
// resolve the `@/` alias or extensionless runtime imports.
import type { CapabilityId } from "./capabilities";

export type { CapabilityId };

export type CapabilityCategory =
  | "language"
  | "frontend"
  | "backend"
  | "data"
  | "infra"
  | "ai"
  | "tooling";

export type Capability = {
  id: string;
  name: string;
  version?: string;
  /** Year first used; the bill of materials derives "years" from it. */
  since: number;
  category: CapabilityCategory;
};

export type ArchNodeKind =
  | "client"
  | "edge"
  | "service"
  | "worker"
  | "db"
  | "cache"
  | "queue"
  | "external";

export type ArchNode = {
  id: string;
  label: string;
  kind: ArchNodeKind;
  note?: string;
  col: number;
  row: number;
  /** Built by the owner. Marks honest attribution on team projects (design.md §7). */
  owned?: boolean;
};

export type ArchEdge = { from: string; to: string; protocol?: string; async?: boolean };

export type Metric = { label: string; value: string; context?: string };

export type Project = {
  slug: string;
  title: string;
  /** Short name for the work index, where every title must fit one display line so it can take the width-stretch hover. Falls back to `title`. */
  indexTitle?: string;
  /** Omitted when the owner gave no year; the UI then omits it too. */
  year?: number;
  role: string;
  /** "Solo", "Team of 2" … */
  team?: string;
  summary: string;
  /** Only "in-progress" changes behaviour (no case page); absent means a normal project. */
  status?: "shipped" | "in-progress";
  repo?: string;
  live?: string;
  stack: CapabilityId[];
  metrics: Metric[];
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
  links?: { label: string; href: string }[];
  /**
   * Up to four screenshot plates for the case page (P11b.6). The only way to attach images: the
   * work-row preview uses plate 1, and only when it has an image.
   */
  plates?: Plates;
  body: { heading: string; paragraphs: string[] }[];
};

/** A screenshot plate. Without `image` it is a placeholder ("Screenshot pending"). */
export type Plate = {
  caption: string;
  /** Describes the screenshot; used as the image's alt text once an image exists. */
  alt: string;
  /** Intrinsic size of the source image. */
  image?: { src: string; width: number; height: number };
};

/** One to four plates; the tuple caps the count at the type level. */
export type Plates = readonly [Plate, Plate?, Plate?, Plate?];

/**
 * A face of the toolkit gauge (P11b.1). Faces own capability categories; a capability's face is
 * derived from its category through this one mapping (validated: each category in exactly one
 * face).
 */
export type ToolkitFace = {
  id: string;
  /** The display word, sentence case ("Interface"); the paragraph's bold lead is `${name}.`. */
  name: string;
  categories: readonly CapabilityCategory[];
  /** The paragraph after the bold lead word. */
  paragraph: string;
};

export type Revision = {
  rev: string;
  org: string;
  title: string;
  start: string;
  end: string | "present";
  changes: string[];
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  timeZone: string;
  email: string;
  links: { label: string; href: string }[];
  statement: string;
  /** The owner's portrait (P11c.5): shown once, as a plate in the Statement scene. */
  portrait: { src: string; width: number; height: number; alt: string };
  /** The three role words over the portrait band (P11d.3), owner-confirmed 2026-10-10. */
  roleWords: [string, string, string];
  // Literal types: the signature lines are locked (Phase 0, P0.4) and must not drift.
  copy: {
    heroLine: "Daddy's Home.";
    contactLines: ["Call me, Baby", "for your new website."];
    /** Hero build log lines (P9.2), in display order. */
    buildLog: string[];
    availability: string;
  };
};
