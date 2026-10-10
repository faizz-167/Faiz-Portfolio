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
      "Typed React and Next.js front ends that do real work: an in-browser audio recorder, a drag-and-drop plan board, live dashboards. State lives in Zustand and TanStack Query, styles in Tailwind, and nothing ships until it reads cleanly on a phone.",
  },
  {
    id: "systems",
    name: "Systems",
    categories: ["language", "backend", "data", "infra"],
    paragraph:
      "APIs, auth and data models in Node, Express and FastAPI, backed by PostgreSQL and Redis. Background work runs in Celery, files sit in blob storage, and services stay up under systemd on Linux.",
  },
  {
    id: "ai",
    name: "AI",
    categories: ["ai"],
    paragraph:
      "Models wired into products, not demos. Whisper, HuBERT and SpeechBrain score speech in real time; OpenAI and Azure OpenAI answer through the Vercel AI SDK and an MCP server; pgvector gives retrieval its memory.",
  },
  {
    id: "tooling",
    name: "Tooling",
    categories: ["tooling"],
    paragraph:
      "The bench around the build: Git and GitHub, Figma for the first sketch, esbuild and Pino for the runtime, Claude Code for the long stretches, and UiPath and Telegram bots when the job is automation.",
  },
] as const satisfies readonly ToolkitFace[];
