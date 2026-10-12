import type { ToolkitFace } from "./types";

// The four faces of the toolkit gauge (P11b.1), in gauge order. Each capability's face comes from
// its category through `categories` below — there is no per-capability face field.
// Paragraphs are owner-editable drafts (owner: "yes, draft them", 2026-10-09); each one is
// rendered after the bold lead word `${name}.`.
export const toolkitFaces = [
  {
    id: "interface",
    name: "Interface",
    categories: ["frontend"],
    paragraph:
      "Typed React and Next.js front ends that do real work, no fluff: an in-browser audio recorder, a drag-and-drop plan board, live dashboards. State stays deliberate, styles stay in Tailwind, and nothing ships until it reads cleanly on a phone.",
  },
  {
    id: "systems",
    name: "Systems",
    categories: ["language", "backend", "data", "infra"],
    paragraph:
      "APIs, auth and data models in Node and Express, backed by PostgreSQL and Redis. Background work stays reliable, files sit in blob storage, and services keep doing their thing on Linux—no drama.",
  },
  {
    id: "ai",
    name: "AI",
    categories: ["ai"],
    paragraph:
      "Models wired into products, not demos. Whisper handles speech in real time; OpenAI answers through the Vercel AI SDK and an MCP server; retrieval gets the context it needs. Useful beats flashy every time.",
  },
  {
    id: "tooling",
    name: "Tooling",
    categories: ["tooling"],
    paragraph:
      "The bench around the build: Git and GitHub, Figma for the first sketch, Claude Code for the long stretches, and UiPath and Telegram bots when the job is automation. The stack stays practical and low-key gets it done.",
  },
] as const satisfies readonly ToolkitFace[];
