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
  cover?: { src: string; alt: string; width: number; height: number };
  body: { heading: string; paragraphs: string[] }[];
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
  // Literal types: the signature lines are locked (Phase 0, P0.4) and must not drift.
  copy: {
    heroLine: "Daddy's Home.";
    contactLines: ["Call me, Baby", "for your new website."];
    /** Hero build log lines (P9.2), in display order. */
    buildLog: string[];
    availability: string;
  };
};
