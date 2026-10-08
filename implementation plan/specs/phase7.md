# Phase 7 — Content Model & Data

## Objective

Define strongly-typed, static content for profile, projects, experience and capabilities, with
compile-time referential integrity, and ingest the owner's resume and project details.

## Prerequisites

Phase 1 complete. Can run in parallel with Phases 2–6.

## Subtasks

| ID   | Subtask |
|------|---------|
| P7.1 | `src/content/types.ts` |
| P7.2 | `capabilities.ts` with `as const` ids |
| P7.3 | `projects.ts`, `experience.ts`, `profile.ts` with `satisfies` checks |
| P7.4 | Derived selectors (`getProject`, `capabilityUsage`, `sortedProjects`) |
| P7.5 | Ingest owner resume + project details (replace all `TODO(content)`) |

## Execution

### P7.1 — Types
```ts
export type CapabilityCategory = "language" | "frontend" | "backend" | "data" | "infra" | "ai" | "tooling";
export type Capability = { id: string; name: string; version?: string; since: number; category: CapabilityCategory };

export type ArchNodeKind = "client" | "edge" | "service" | "worker" | "db" | "cache" | "queue" | "external";
export type ArchNode = { id: string; label: string; kind: ArchNodeKind; note?: string; col: number; row: number; owned?: boolean };
export type ArchEdge = { from: string; to: string; protocol?: string; async?: boolean };

export type Metric = { label: string; value: string; context?: string };

export type Project = {
  slug: string; title: string; year?: number; role: string; team?: string; summary: string;
  status?: "shipped" | "in-progress"; repo?: string; live?: string;
  stack: CapabilityId[]; metrics: Metric[];
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
  links?: { label: string; href: string }[];
  cover?: { src: string; alt: string; width: number; height: number };
  body: { heading: string; paragraphs: string[] }[];
};

export type Revision = { rev: string; org: string; title: string; start: string; end: string | "present"; changes: string[] };

export type Profile = {
  name: string; role: string; location: string; timeZone: string; email: string;
  links: { label: string; href: string }[];
  statement: string;
  copy: { heroLine: "Daddy's Home."; contactLines: ["Call me, Baby", "for your new website."]; buildLog: string[]; availability: string };
};
```
(Exact literal types for `copy` keep the signature lines from drifting.)

### P7.2 — Capabilities
```ts
export const capabilities = [ { id: "typescript", … }, … ] as const satisfies readonly Capability[];
export type CapabilityId = (typeof capabilities)[number]["id"];
```

### P7.3 — Data files
- `projects` typed `satisfies readonly Project[]`; an unknown stack id must fail type-check. An edge
  referencing a missing node fails the plain script `scripts/validate-content.ts` (run by Node's
  built-in type stripping, `npm run validate:content`, chained into `npm run lint`). The script also
  checks unique slugs, unique node ids per project, stack ids (again), revision letter order and
  leftover `TODO(content)`. Its `.ts` imports need tsconfig `allowImportingTsExtensions`; files in
  `src/content` import each other type-only so Node can load them without the `@/` alias.
- `experience` ordered newest first; `rev` letters assigned oldest = A.
- Owner content is available (see P7.5), so write real data from the dossier directly instead of placeholders.

### P7.4 — Selectors (`src/content/index.ts`)
`getProject(slug)`, `projectSlugs()`, `capabilityUsage(id) → Project[]`, `capabilitiesByCategory()`,
plus `sortedProjects()` (work-index order = file order, includes in-progress), `hasCasePage(project)`
(false for in-progress; `projectSlugs()` uses it), `getCapability(id)`, `revisions()` (newest
first) and the `profile` object re-exported. `capabilityUsage` includes in-progress projects;
callers link only those with `hasCasePage`.

### P7.5 — Ingestion
Source: `implementation plan/content/owner-content.md` (extracted from the resume PDF and the
owner's GitHub repos on 2026-10-08). Map it field by field; keep every `VERIFY(owner)` item as a
`// VERIFY(owner)` comment until the owner confirms it (all were resolved on 2026-10-08). Steps:
1. Map each role → `Revision`, each project → `Project` (draft architecture nodes from described stack;
   flag uncertain parts with `// VERIFY(owner)`).
2. Keep copy in the voice defined in Phase 0 (P0.4).
3. Record in `status.md` which fields still need owner confirmation.

## Validation criteria

- [x] `npm run build` fails if a project references an unknown capability id (test once, then revert).
- [x] Content validation script passes; it fails on a dangling edge (test once, then revert).
- [x] No component imports raw arrays — only selectors from `src/content/index.ts`.
- [x] `grep -rn "TODO(content)" src/content` empty after P7.5.

### Validation result — 2026-10-08
- Unknown stack id (`"cobol"` added to laptop-sentinel): `npm run build` → "Failed to type check."
  with `src/content/projects.ts(318,23): error TS2322: Type '"cobol"' is not assignable to type
  '"typescript" | "javascript" | … | "pino"'.` (same from `tsc --noEmit`). Reverted.
- Dangling edge (`bot → ghost` in laptop-sentinel): validation script exits 1 with
  `Content validation failed (1):` / `- projects[laptop-sentinel]: edge bot → ghost references missing
  node "ghost"`; `npm run lint` exits 1. Reverted.
- Extra: changing `heroLine` to "Daddys Home." fails tsc (`Type '"Daddys Home."' is not assignable to
  type '"Daddy's Home."'`). Reverted.
- `npm run lint` passes (eslint + "Content valid: 46 capabilities, 5 projects, 3 revisions.");
  `npm run build` passes, routes `/`, `/_not-found`, `/system` all ○.
- No file outside `src/content` imports content (no components use it yet; the validation script
  imports the data files directly by design). `TODO(content)` grep empty. Phone number and CGPA
  absent from `src/`.
