import type { Project } from "./types";

// Source: implementation plan/content/owner-content.md §3. Array order is the work index order
// (flagship systems first, side project and work in progress last — Decisions log 2026-10-08).
// Metrics come only from the dossier; diagram cols/rows are the dossier's layout.
export const projects = [
  {
    slug: "speechpath",
    title: "SpeechPath",
    year: 2026,
    // Team project: the owner built the frontend, a teammate built the backend and ML.
    // Only the browser node is `owned`, and only the "My part" section uses first person.
    role: "Frontend engineer",
    team: "Team of 2",
    summary:
      "A speech-therapy platform where every spoken attempt is transcribed, scored and emotion-tagged by an ML pipeline, and the therapy plan adapts in real time.",
    repo: "https://github.com/faizz-167/speech-therapy-final",
    stack: [
      "nextjs",
      "react",
      "typescript",
      "tailwind",
      "zustand",
      "tanstack-query",
      "fastapi",
      "python",
      "postgresql",
      "sqlalchemy",
      "celery",
      "redis",
      "websockets",
      "whisper",
      "hubert",
      "speechbrain",
      "spacy",
      "pytorch",
    ],
    metrics: [
      {
        label: "Pipeline stages",
        value: "9",
        context:
          "ASR → phonemes → fluency → emotion → derived metrics → scoring → adaptive decision → persist → push",
      },
      { label: "Emotion labels", value: "8" },
      { label: "Score dimensions", value: "3", context: "speech, behavioural, engagement" },
      { label: "Roles", value: "2", context: "therapist, patient" },
    ],
    architecture: {
      nodes: [
        {
          id: "browser",
          label: "Next.js client",
          kind: "client",
          col: 0,
          row: 1,
          note: "Zustand + TanStack Query; recorder",
          owned: true,
        },
        { id: "api", label: "FastAPI", kind: "service", col: 1, row: 1, note: "JWT, role-based deps, 7 routers" },
        { id: "ws", label: "WebSocket hub", kind: "edge", col: 1, row: 0, note: "live score delivery" },
        { id: "redis", label: "Redis", kind: "queue", col: 2, row: 0, note: "Celery broker + pub/sub" },
        {
          id: "workers",
          label: "Celery workers",
          kind: "worker",
          col: 2,
          row: 1,
          note: "analysis, baseline, persistence, plan regeneration",
        },
        { id: "ml", label: "ML models", kind: "service", col: 3, row: 1, note: "Whisper · HuBERT · SpeechBrain · spaCy" },
        {
          id: "engine",
          label: "Scoring engine",
          kind: "service",
          col: 3,
          row: 2,
          note: "weighted speech/behavioural/engagement",
        },
        { id: "db", label: "PostgreSQL (Neon)", kind: "db", col: 2, row: 2, note: "SQLAlchemy async, Alembic" },
      ],
      edges: [
        { from: "browser", to: "api", protocol: "HTTPS/REST" },
        { from: "browser", to: "ws", protocol: "WebSocket" },
        { from: "api", to: "db", protocol: "asyncpg" },
        { from: "api", to: "redis", protocol: "enqueue", async: true },
        { from: "redis", to: "workers", protocol: "task", async: true },
        { from: "workers", to: "ml", protocol: "inference" },
        { from: "workers", to: "engine", protocol: "scores" },
        { from: "workers", to: "db", protocol: "persist" },
        { from: "workers", to: "redis", protocol: "publish", async: true },
        { from: "redis", to: "ws", protocol: "pub/sub", async: true },
      ],
    },
    body: [
      {
        heading: "The problem",
        paragraphs: ["Static exercises ignore how a patient is actually doing on a given day."],
      },
      {
        // System-level sections are third person: the owner did not build the pipeline.
        heading: "The pipeline",
        paragraphs: [
          "Each attempt is a Celery job. Whisper transcribes it with confidence, HuBERT aligns phonemes, spaCy scores disfluency and pauses, and SpeechBrain classifies emotion.",
          "Derived metrics (speech rate, response latency, answer relevance) feed a weighted scoring engine whose weights live per task in the database.",
        ],
      },
      {
        heading: "Adapting in real time",
        paragraphs: [
          "The final score is compared against per-task (or per-prompt) thresholds to move the patient up or down a level.",
          "The backend publishes results over Redis pub/sub to a WebSocket, so feedback lands in the browser while the patient is still in the session.",
        ],
      },
      {
        heading: "Two sides of the product",
        paragraphs: [
          "Therapists approve patients, build weekly plans on a kanban board and review AI-flagged attempts. Patients take a baseline assessment, then daily sessions.",
        ],
      },
      {
        heading: "My part: the frontend",
        paragraphs: [
          "I built both apps, therapist and patient, in the Next.js App Router with Zustand and TanStack Query.",
          "I built the in-browser audio recorder, live score delivery over WebSocket, the drag-and-drop kanban plan board (@dnd-kit) and the progress charts (Recharts).",
        ],
      },
    ],
  },
  {
    slug: "zingdesk",
    title: "ZingDesk",
    year: 2026,
    role: "Full-stack developer intern, Zingbizz",
    team: "Solo",
    summary:
      "Businesses scrape their site or upload documents, train a retrieval index, and embed a support bot on any website with one script tag.",
    repo: "https://github.com/Zingbizz-Interns/zingbizz-supportBot",
    live: "https://zingbizz-support-bot.vercel.app",
    stack: [
      "nextjs",
      "react",
      "typescript",
      "tailwind",
      "nextauth",
      "postgresql",
      "pgvector",
      "drizzle",
      "openai-api",
      "vercel-ai-sdk",
      "redis",
      "vercel-blob",
      "esbuild",
    ],
    metrics: [
      { label: "Answer threshold", value: "0.75", context: "cosine similarity needed to mark a query answered" },
      { label: "Context floor", value: "0.45", context: "lowest similarity still allowed into the prompt" },
      { label: "Embedding width", value: "1536", context: "text-embedding-3-small" },
      { label: "Upload formats", value: "6", context: "pdf, txt, md, docx, xlsx, csv" },
    ],
    architecture: {
      // Solo build: every node owned.
      nodes: [
        { id: "site", label: "Customer website", kind: "client", col: 0, row: 0, note: "embeds widget.js", owned: true },
        {
          id: "dash",
          label: "Dashboard (Next.js)",
          kind: "client",
          col: 0,
          row: 2,
          note: "sources, customise, insights",
          owned: true,
        },
        {
          id: "chat",
          label: "/api/chat",
          kind: "edge",
          col: 1,
          row: 0,
          note: "public, CORS, domain allowlist",
          owned: true,
        },
        { id: "train", label: "/api/train", kind: "edge", col: 1, row: 2, note: "auth'd, enqueues job", owned: true },
        {
          id: "rl",
          label: "Redis rate limiter",
          kind: "cache",
          col: 2,
          row: 0,
          note: "sliding window, fails closed",
          owned: true,
        },
        {
          id: "rag",
          label: "RAG orchestrator",
          kind: "service",
          col: 2,
          row: 1,
          note: "embed → search → sanitise → answer",
          owned: true,
        },
        { id: "queue", label: "Training queue", kind: "worker", col: 2, row: 2, note: "leased jobs in Postgres", owned: true },
        { id: "blob", label: "Vercel Blob", kind: "external", col: 3, row: 2, note: "per-tenant uploads" },
        {
          id: "db",
          label: "Neon Postgres + pgvector",
          kind: "db",
          col: 3,
          row: 1,
          note: "documents, queries, jobs",
          owned: true,
        },
        { id: "openai", label: "OpenAI", kind: "external", col: 3, row: 0, note: "embeddings + chat" },
      ],
      edges: [
        { from: "site", to: "chat", protocol: "HTTPS, stream" },
        { from: "chat", to: "rl", protocol: "check" },
        { from: "chat", to: "rag" },
        { from: "rag", to: "openai", protocol: "embed + complete" },
        { from: "rag", to: "db", protocol: "cosine top-5" },
        { from: "dash", to: "train", protocol: "HTTPS" },
        { from: "train", to: "queue", protocol: "enqueue", async: true },
        { from: "queue", to: "blob", protocol: "fetch files" },
        { from: "queue", to: "openai", protocol: "batch embed" },
        { from: "queue", to: "db", protocol: "write vectors" },
      ],
    },
    body: [
      {
        heading: "Ingestion that survives restarts",
        paragraphs: [
          "Training is a durable Postgres-backed job queue with leased workers. Content is chunked, embedded in batches and stored as pgvector rows.",
          "Original files stay in Vercel Blob, namespaced per tenant.",
        ],
      },
      {
        heading: "Retrieval that knows when it doesn't know",
        paragraphs: [
          "Top-5 cosine search returns sanitised, de-duplicated chunks. A query counts as answered only above 0.75 similarity, which drives the insights page.",
        ],
      },
      {
        heading: "A public endpoint without a blank cheque",
        paragraphs: [
          "/api/chat is unauthenticated, so history is bounded (20 messages, 8,000-character budget), bodies are capped at 256 KB, and Redis sliding-window rate limits (Lua, atomic) fail closed.",
          "Each bot has its own embed domain allowlist.",
        ],
      },
      {
        heading: "The widget",
        paragraphs: [
          "Framework-free TypeScript, bundled with esbuild into one script. It only boots when the bot reports ready.",
        ],
      },
    ],
  },
  {
    slug: "academic-erp",
    title: "Smart Academic ERP & Analytics Dashboard",
    indexTitle: "Academic ERP",
    // No year, repo or live link: the owner gave none (owner answers 2026-10-08).
    role: "Full-stack engineer",
    summary:
      "A cloud academic system where teachers ask questions about student data in plain language, answered through an MCP server connected to PostgreSQL.",
    stack: ["nextjs", "typescript", "azure-openai", "azure-blob", "postgresql", "mcp"],
    metrics: [
      {
        label: "Bulk ingest",
        value: "Thousands of rows",
        context: "CSV attendance uploads with validation + de-duplication",
      },
    ],
    architecture: {
      nodes: [
        { id: "ui", label: "Next.js dashboard", kind: "client", col: 0, row: 1, owned: true },
        { id: "ingest", label: "CSV ingestion engine", kind: "service", col: 1, row: 2, owned: true },
        { id: "chatbot", label: "NL query chatbot", kind: "service", col: 1, row: 0, owned: true },
        { id: "aoai", label: "Azure OpenAI", kind: "external", col: 2, row: 0 },
        { id: "mcp", label: "PostgreSQL MCP server", kind: "service", col: 2, row: 1, owned: true },
        { id: "blob", label: "Azure Blob Storage", kind: "external", col: 2, row: 2 },
        { id: "db", label: "PostgreSQL", kind: "db", col: 3, row: 1, owned: true },
      ],
      edges: [
        { from: "ui", to: "chatbot" },
        { from: "chatbot", to: "aoai", protocol: "tool calls" },
        { from: "chatbot", to: "mcp", protocol: "MCP" },
        { from: "mcp", to: "db", protocol: "SQL" },
        { from: "ui", to: "ingest", protocol: "upload" },
        { from: "ingest", to: "blob", protocol: "store CSV" },
        { from: "ingest", to: "db", protocol: "validated rows" },
      ],
    },
    // "The problem" and "What it does" are the owner's own account (2026-10-08); the last two
    // sections restate the summary, metric and diagram edges.
    body: [
      {
        heading: "The problem",
        paragraphs: [
          "In many colleges, teachers and administrators run attendance, student performance and academic reports out of Excel files and manual processes. The result is delayed insight, inconsistent data, no real-time view, and students who need help being noticed too late.",
        ],
      },
      {
        heading: "What it does",
        paragraphs: [
          "One central system with secure access for teachers and admins, where data visibility is restricted by department. Teachers upload attendance as CSV instead of typing it in; the file is parsed and inserted into the database automatically.",
          "Dashboards show academic analytics in real time: attendance rates, performance trends and department-level insights. An AI academic assistant answers questions in natural language using only real student data, so decisions are faster and better informed.",
        ],
      },
      {
        heading: "Questions in plain language",
        paragraphs: [
          "A chatbot takes a teacher's question, calls Azure OpenAI with tool calls, and reads student data through a PostgreSQL MCP server.",
        ],
      },
      {
        heading: "Bulk attendance uploads",
        paragraphs: [
          "CSV attendance files of thousands of rows are stored in Azure Blob Storage, validated and de-duplicated before the rows reach PostgreSQL.",
        ],
      },
    ],
  },
  {
    slug: "laptop-sentinel",
    title: "Laptop Sentinel",
    year: 2026,
    role: "Solo build",
    team: "Solo",
    summary:
      "A Telegram bot that watches the owner's laptop — health, network, new downloads, on-demand screenshots and webcam photos, an anti-theft \"who switched me on\" snapshot — plus a small robot pet that hangs in a corner of the screen.",
    repo: "https://github.com/faizz-167/Personal-Bot",
    stack: ["python", "telegram-bot-api", "tkinter", "systemd", "linux", "windows"],
    metrics: [],
    architecture: {
      // The dossier gives the topology only (phone → Bot API → monitor_bot.py → five modules);
      // cols/rows here are layout, not facts.
      nodes: [
        { id: "phone", label: "Phone (Telegram)", kind: "client", col: 0, row: 2, owned: true },
        { id: "tg", label: "Telegram Bot API", kind: "external", col: 1, row: 2 },
        {
          id: "bot",
          label: "monitor_bot.py",
          kind: "service",
          col: 2,
          row: 2,
          note: "sensitive commands locked to one chat id",
          owned: true,
        },
        {
          id: "metrics",
          label: "System metrics",
          kind: "service",
          col: 3,
          row: 0,
          note: "open apps counted via systemd scopes",
          owned: true,
        },
        {
          id: "screenshot",
          label: "Screenshot portal",
          kind: "external",
          col: 3,
          row: 1,
          note: "desktop portal, falls back to spectacle, grim",
        },
        { id: "webcam", label: "Webcam", kind: "external", col: 3, row: 2 },
        { id: "files", label: "File watcher", kind: "worker", col: 3, row: 3, owned: true },
        { id: "pet", label: "Desktop pet", kind: "client", col: 3, row: 4, owned: true },
      ],
      edges: [
        { from: "phone", to: "tg" },
        { from: "tg", to: "bot" },
        { from: "bot", to: "metrics" },
        { from: "bot", to: "screenshot" },
        { from: "bot", to: "webcam" },
        { from: "bot", to: "files" },
        { from: "bot", to: "pet" },
      ],
    },
    body: [
      {
        heading: "Notes from the build",
        paragraphs: [
          "It runs on Fedora (GNOME on Wayland) and on Windows.",
          "Screenshots go through the desktop portal, with spectacle and grim as fallbacks. Wayland hides other windows, so open apps are counted through systemd scopes.",
          "Sensitive commands are locked to one chat id.",
        ],
      },
    ],
  },
  {
    slug: "iam-backend",
    title: "IAM backend",
    year: 2026,
    // The dossier names no role; "Solo build" follows the other project on the owner's own
    // GitHub account. Flagged for owner confirmation in status.md.
    role: "Solo build",
    status: "in-progress",
    summary:
      "An Express 5 + TypeScript identity service: organisations, members, roles, permissions, sessions and invitations under /api/v1.",
    repo: "https://github.com/faizz-167/IAM-backend",
    stack: ["typescript", "nodejs", "express", "zod", "jwt", "pino"],
    // In progress: row only, no case page, so no metrics, diagram or body (owner decision).
    metrics: [],
    architecture: { nodes: [], edges: [] },
    body: [],
  },
] satisfies readonly Project[];
