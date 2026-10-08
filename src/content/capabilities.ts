import type { Capability } from "./types";

// `as const` keeps every id as a literal so `CapabilityId` is a closed union: a project stack that
// names an unknown id fails type-check. `since` years confirmed by the owner (2026-10-08).
// No versions are listed: the dossier gives none.
export const capabilities = [
  { id: "typescript", name: "TypeScript", category: "language", since: 2025 },
  { id: "javascript", name: "JavaScript", category: "language", since: 2023 },
  { id: "python", name: "Python", category: "language", since: 2025 },
  { id: "java", name: "Java", category: "language", since: 2022 },
  { id: "sql", name: "SQL", category: "language", since: 2023 },

  { id: "html-css", name: "HTML & CSS", category: "frontend", since: 2022 },
  { id: "react", name: "React", category: "frontend", since: 2024 },
  { id: "nextjs", name: "Next.js", category: "frontend", since: 2024 },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", since: 2024 },
  { id: "zustand", name: "Zustand", category: "frontend", since: 2026 },
  { id: "tanstack-query", name: "TanStack Query", category: "frontend", since: 2026 },

  { id: "nodejs", name: "Node.js", category: "backend", since: 2024 },
  { id: "express", name: "Express", category: "backend", since: 2024 },
  { id: "fastapi", name: "FastAPI", category: "backend", since: 2026 },
  { id: "nextauth", name: "Auth.js / NextAuth", category: "backend", since: 2026 },
  { id: "zod", name: "Zod", category: "backend", since: 2025 },
  { id: "jwt", name: "JWT auth", category: "backend", since: 2025 },
  { id: "websockets", name: "WebSockets", category: "backend", since: 2026 },

  { id: "postgresql", name: "PostgreSQL", category: "data", since: 2024 },
  { id: "pgvector", name: "pgvector", category: "data", since: 2026 },
  { id: "drizzle", name: "Drizzle ORM", category: "data", since: 2026 },
  { id: "sqlalchemy", name: "SQLAlchemy", category: "data", since: 2026 },
  { id: "redis", name: "Redis", category: "data", since: 2026 },

  { id: "celery", name: "Celery", category: "infra", since: 2026 },
  { id: "vercel-blob", name: "Vercel Blob", category: "infra", since: 2026 },
  { id: "azure-blob", name: "Azure Blob Storage", category: "infra", since: 2025 },
  { id: "systemd", name: "systemd / Linux", category: "infra", since: 2026 },
  { id: "linux", name: "Linux", category: "infra", since: 2024 },
  { id: "windows", name: "Windows", category: "infra", since: 2022 },

  { id: "openai-api", name: "OpenAI API", category: "ai", since: 2025 },
  { id: "azure-openai", name: "Azure OpenAI", category: "ai", since: 2025 },
  { id: "vercel-ai-sdk", name: "Vercel AI SDK", category: "ai", since: 2026 },
  { id: "mcp", name: "Model Context Protocol", category: "ai", since: 2025 },
  { id: "whisper", name: "Whisper ASR", category: "ai", since: 2026 },
  { id: "hubert", name: "HuBERT / Wav2Vec2", category: "ai", since: 2026 },
  { id: "speechbrain", name: "SpeechBrain", category: "ai", since: 2026 },
  { id: "spacy", name: "spaCy", category: "ai", since: 2026 },
  { id: "pytorch", name: "PyTorch", category: "ai", since: 2026 },

  { id: "esbuild", name: "esbuild", category: "tooling", since: 2026 },
  { id: "git", name: "Git & GitHub", category: "tooling", since: 2022 },
  { id: "figma", name: "Figma", category: "tooling", since: 2023 },
  { id: "uipath", name: "UiPath", category: "tooling", since: 2024 },
  { id: "claude-code", name: "Claude Code", category: "tooling", since: 2025 },
  { id: "tkinter", name: "Tkinter", category: "tooling", since: 2026 },
  { id: "telegram-bot-api", name: "Telegram Bot API", category: "tooling", since: 2026 },
  { id: "pino", name: "Pino", category: "tooling", since: 2026 },
] as const satisfies readonly Capability[];

export type CapabilityId = (typeof capabilities)[number]["id"];
