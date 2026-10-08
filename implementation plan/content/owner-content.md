# Owner Content Dossier

> Source material for **P7.5 (Ingest owner content)**. Extracted on 2026-10-08 from
> `public/assets/MdFaizResume.pdf` and the four GitHub repositories the owner provided.
> Items marked **VERIFY(owner)** are inferences that the owner must confirm before launch.
> Map this file into `src/content/*.ts` exactly; do not invent facts beyond it.

---

## 1. Profile → `src/content/profile.ts`

| Field | Value | Source |
|---|---|---|
| name | Mohamed Faiz | owner confirmed "MOHAMED FAIZ" (no initial). Store proper case; uppercase is a styling choice |
| role | Full-stack engineer | resume summary + internships |
| location | Chennai, India | resume |
| timeZone | `Asia/Kolkata` | derived from location |
| email | faizmohammed176@gmail.com | resume |
| phone | **Do not publish** | resume contains it; not shown on site unless owner asks |
| links | GitHub `https://github.com/faizz-167`, LinkedIn `https://www.linkedin.com/in/mohd-faizz167`, Resume `/assets/MdFaizResume.pdf` | owner confirmed |
| availability | "Open to full-time roles and freelance builds." | default (graduating 2026) |

**Signature copy (locked, from Phase 0 P0.4):**
- `heroLine`: "Daddy's Home."
- `contactLines`: ["Call me, Baby", "for your new website."]

**Build log (hero, P9.2)** — draft, references real work:
```
resolving dependencies… ok
training rag index (1536 dims)… ok
streaming live scores over websocket… ok
linking signal trace… ok
ready.
```

**Statement (S2)** — final (owner accepted the recommendation):
> I build the parts of software you don't see until they break: queues that survive a restart,
> retrieval that knows when it doesn't know, interfaces that keep up with a live stream of results.
> Then I make the part you do see feel inevitable.

Every clause maps to the owner's own work: durable queue + retrieval thresholds (ZingDesk, solo),
live-result interfaces (SpeechPath frontend).

---

## 2. Revisions (experience + education) → `src/content/experience.ts`

Oldest = Rev. A. Display newest first.

| rev | org | title | start | end | changes |
|---|---|---|---|---|---|
| A | Rajalakshmi Engineering College, Chennai | B.E. Computer Science | 2022 | 2026 | Graduated 2026 (CGPA is NOT shown — owner decision); certifications: Introduction to Model Context Protocol (Anthropic), UiPath Automation Developer Associate, Next.js Full Stack Bootcamp (JavaScript Mastery) |
| B | Zingbizz Digital Solution | Full-stack developer intern | 2026-03 | 2026-05 | Built ZingDesk, a RAG customer-support chatbot SaaS: retrieval pipeline, semantic search, ingestion queue, embeddable widget |
| C | Multimeta.AI Tech & Consulting | Full-stack developer intern | 2026-06 | present | Working across two products: **Faczonline**, a social media app where only verified, trusted facts and content get published; and a **women's safety SOS app** |

Disclosure rule (owner decision): say only that he works on these two projects, with the one-line
descriptions above. No features beyond that, no architecture, no screenshots, no case pages.
Spelling "Faczonline" as given by the owner — confirm capitalisation if it ever appears in a logo.

---

## 3. Projects → `src/content/projects.ts`

Order on the work index: 1 → 5. Projects 1–2 are flagship (full case pages with diagrams).

### 3.1 SpeechPath — Emotion-aware speech therapy platform
- **slug** `speechpath` · **year** 2026 · **role** "Frontend engineer" · **team** "Team of 2" (owner built the frontend; teammate built the backend/ML)
- **repo** https://github.com/faizz-167/speech-therapy-final
- **summary** A speech-therapy platform where every spoken attempt is transcribed, scored and
  emotion-tagged by an ML pipeline, and the therapy plan adapts in real time.
- **stack** nextjs, react, typescript, tailwind, zustand, tanstack-query, fastapi, python,
  postgresql, sqlalchemy, celery, redis, websockets, whisper, hubert, speechbrain, spacy, pytorch
- **metrics** (all from repo docs, factual, no inflation):
  - "Pipeline stages" — "9" — "ASR → phonemes → fluency → emotion → derived metrics → scoring → adaptive decision → persist → push"
  - "Emotion labels" — "8"
  - "Score dimensions" — "3" — "speech, behavioural, engagement"
  - "Roles" — "2" — "therapist, patient"
- **body sections**
  1. *The problem* — static exercises ignore how a patient is actually doing on a given day.
  2. *The pipeline* — each attempt is a Celery job: Whisper transcribes with confidence, HuBERT
     aligns phonemes, spaCy scores disfluency and pauses, SpeechBrain classifies emotion; derived
     metrics (speech rate, response latency, answer relevance) feed a weighted scoring engine whose
     weights live per-task in the database.
  3. *Adapting in real time* — the final score is compared against per-task (or per-prompt)
     thresholds to move the patient up or down a level; results are published over Redis pub/sub
     to a WebSocket so feedback lands in the browser while the patient is still in the session.
  4. *Two sides of the product* — therapists approve patients, build weekly plans on a kanban
     board and review AI-flagged attempts; patients take a baseline assessment, then daily sessions.
  5. *My part: the frontend* — both apps (therapist + patient) in Next.js App Router with Zustand
     and TanStack Query; the in-browser audio recorder; live score delivery over WebSocket; the
     drag-and-drop kanban plan board (@dnd-kit) and progress charts (Recharts).

  **Honesty rule:** sections 2–3 describe the system as a whole and must be written as "the
  pipeline…/the backend…", never "I built…". Only section 5 uses first person.
- **architecture**
  | id | label | kind | col | row | note |
  |---|---|---|---|---|---|
  | browser | Next.js client **(owned)** | client | 0 | 1 | Zustand + TanStack Query; recorder |
  | api | FastAPI | service | 1 | 1 | JWT, role-based deps, 7 routers |
  | ws | WebSocket hub | edge | 1 | 0 | live score delivery |
  | redis | Redis | queue | 2 | 0 | Celery broker + pub/sub |
  | workers | Celery workers | worker | 2 | 1 | analysis, baseline, persistence, plan regeneration |
  | ml | ML models | service | 3 | 1 | Whisper · HuBERT · SpeechBrain · spaCy |
  | engine | Scoring engine | service | 3 | 2 | weighted speech/behavioural/engagement |
  | db | PostgreSQL (Neon) | db | 2 | 2 | SQLAlchemy async, Alembic |

  Edges: browser→api (HTTPS/REST) · browser→ws (WebSocket) · api→db (asyncpg) ·
  api→redis (enqueue, async) · redis→workers (task, async) · workers→ml (inference) ·
  workers→engine (scores) · workers→db (persist) · workers→redis (publish, async) · redis→ws (pub/sub, async)

### 3.2 ZingDesk — RAG customer-support chatbot SaaS
- **slug** `zingdesk` · **year** 2026 · **role** "Full-stack developer intern, Zingbizz" · **team** "Solo" (every node owned)
- **repo** https://github.com/Zingbizz-Interns/zingbizz-supportBot · **live** https://zingbizz-support-bot.vercel.app
- **summary** Businesses scrape their site or upload documents, train a retrieval index, and embed
  a support bot on any website with one script tag.
- **stack** nextjs, react, typescript, tailwind, nextauth, postgresql, pgvector, drizzle,
  openai-api, vercel-ai-sdk, redis, vercel-blob, esbuild
- **metrics** (from repo CLAUDE.md):
  - "Answer threshold" — "0.75" — "cosine similarity needed to mark a query answered"
  - "Context floor" — "0.45" — "lowest similarity still allowed into the prompt"
  - "Embedding width" — "1536" — "text-embedding-3-small"
  - "Upload formats" — "6" — "pdf, txt, md, docx, xlsx, csv"
- **body sections**
  1. *Ingestion that survives restarts* — training is a durable Postgres-backed job queue with
     leased workers; content is chunked, embedded in batches and stored as pgvector rows. Original
     files stay in Vercel Blob, namespaced per tenant.
  2. *Retrieval that knows when it doesn't know* — top-5 cosine search, sanitised and de-duplicated
     chunks; a query counts as answered only above 0.75 similarity, which drives the insights page.
  3. *A public endpoint without a blank cheque* — `/api/chat` is unauthenticated, so history is
     bounded (20 messages, 8,000-character budget), bodies capped at 256 KB, and Redis sliding-window
     rate limits (Lua, atomic) fail closed. Per-bot embed domain allowlist.
  4. *The widget* — framework-free TypeScript bundled with esbuild into one script; only boots when
     the bot reports ready.
- **architecture**
  | id | label | kind | col | row | note |
  |---|---|---|---|---|---|
  | site | Customer website | client | 0 | 0 | embeds widget.js |
  | dash | Dashboard (Next.js) | client | 0 | 2 | sources, customise, insights |
  | chat | /api/chat | edge | 1 | 0 | public, CORS, domain allowlist |
  | train | /api/train | edge | 1 | 2 | auth'd, enqueues job |
  | rl | Redis rate limiter | cache | 2 | 0 | sliding window, fails closed |
  | rag | RAG orchestrator | service | 2 | 1 | embed → search → sanitise → answer |
  | queue | Training queue | worker | 2 | 2 | leased jobs in Postgres |
  | blob | Vercel Blob | external | 3 | 2 | per-tenant uploads |
  | db | Neon Postgres + pgvector | db | 3 | 1 | documents, queries, jobs |
  | openai | OpenAI | external | 3 | 0 | embeddings + chat |

  Edges: site→chat (HTTPS, stream) · chat→rl (check) · chat→rag · rag→openai (embed + complete) ·
  rag→db (cosine top-5) · dash→train (HTTPS) · train→queue (enqueue, async) · queue→blob (fetch files) ·
  queue→openai (batch embed) · queue→db (write vectors)

### 3.3 Smart Academic ERP & Analytics Dashboard
- **slug** `academic-erp` · **year** none (owner gave no year — omit it in UI) · **role** "Full-stack engineer" (resume: "architected") · every node owned
- **repo** none, no demo — row + case page without links
- **summary** A cloud academic system where teachers ask questions about student data in plain
  language, answered through an MCP server connected to PostgreSQL.
- **stack** nextjs, typescript, azure-openai, azure-blob, postgresql, mcp
- **metrics** (resume): "Bulk ingest" — "Thousands of rows" — "CSV attendance uploads with validation + de-duplication"
- **architecture**
  | id | label | kind | col | row |
  |---|---|---|---|---|
  | ui | Next.js dashboard | client | 0 | 1 |
  | ingest | CSV ingestion engine | service | 1 | 2 |
  | chatbot | NL query chatbot | service | 1 | 0 |
  | aoai | Azure OpenAI | external | 2 | 0 |
  | mcp | PostgreSQL MCP server | service | 2 | 1 |
  | blob | Azure Blob Storage | external | 2 | 2 |
  | db | PostgreSQL | db | 3 | 1 |

  Edges: ui→chatbot · chatbot→aoai (tool calls) · chatbot→mcp (MCP) · mcp→db (SQL) · ui→ingest (upload) · ingest→blob (store CSV) · ingest→db (validated rows)

### 3.4 Laptop Sentinel — Telegram monitor bot + desktop pet
- **slug** `laptop-sentinel` (repo name "Personal-Bot") · **year** 2026 · **role** "Solo build" · every node owned
- **repo** https://github.com/faizz-167/Personal-Bot
- **summary** A Telegram bot that watches the owner's laptop — health, network, new downloads,
  on-demand screenshots and webcam photos, an anti-theft "who switched me on" snapshot — plus a
  small robot pet that hangs in a corner of the screen.
- **stack** python, telegram-bot-api, tkinter, systemd, linux, windows
- **notes for the page** cross-platform (Fedora/GNOME on Wayland + Windows); screenshots go through
  the desktop portal with fallbacks (spectacle, grim); open apps are counted via systemd scopes
  because Wayland hides other windows; sensitive commands locked to one chat id.
- **architecture**: phone (Telegram) → Telegram Bot API → monitor_bot.py → {system metrics, screenshot portal, webcam, file watcher, desktop pet}. Small diagram, `variant="thumb"` acceptable.
- Treat as the playful entry ("the side project").

### 3.5 IAM backend — multi-tenant identity & access API (in progress)
- **slug** `iam-backend` · **year** 2026 · **status** In progress
- **repo** https://github.com/faizz-167/IAM-backend
- **summary** An Express 5 + TypeScript identity service: organisations, members, roles,
  permissions, sessions and invitations under `/api/v1`.
- **stack** typescript, nodejs, express, zod, jwt, pino
- **state** module routers are scaffolded but not implemented yet. Owner decision: include with
  `status: "in-progress"`, shown as "On the drawing board" (row only, no case page, no metrics).

---

## 4. Capabilities (BOM) → `src/content/capabilities.ts`

`since` years confirmed by the owner (2026-10-08).

| id | name | category | since |
|---|---|---|---|
| typescript | TypeScript | language | 2025 |
| javascript | JavaScript | language | 2023 |
| python | Python | language | 2025 |
| java | Java | language | 2022 |
| sql | SQL | language | 2023 |
| html-css | HTML & CSS | frontend | 2022 |
| react | React | frontend | 2024 |
| nextjs | Next.js | frontend | 2024 |
| tailwind | Tailwind CSS | frontend | 2024 |
| zustand | Zustand | frontend | 2026 |
| tanstack-query | TanStack Query | frontend | 2026 |
| nodejs | Node.js | backend | 2024 |
| express | Express | backend | 2024 |
| fastapi | FastAPI | backend | 2026 |
| nextauth | Auth.js / NextAuth | backend | 2026 |
| zod | Zod | backend | 2025 |
| jwt | JWT auth | backend | 2025 |
| websockets | WebSockets | backend | 2026 |
| postgresql | PostgreSQL | data | 2024 |
| pgvector | pgvector | data | 2026 |
| drizzle | Drizzle ORM | data | 2026 |
| sqlalchemy | SQLAlchemy | data | 2026 |
| redis | Redis | data | 2026 |
| celery | Celery | infra | 2026 |
| vercel-blob | Vercel Blob | infra | 2026 |
| azure-blob | Azure Blob Storage | infra | 2025 |
| openai-api | OpenAI API | ai | 2025 |
| azure-openai | Azure OpenAI | ai | 2025 |
| vercel-ai-sdk | Vercel AI SDK | ai | 2026 |
| mcp | Model Context Protocol | ai | 2025 |
| whisper | Whisper ASR | ai | 2026 |
| hubert | HuBERT / Wav2Vec2 | ai | 2026 |
| speechbrain | SpeechBrain | ai | 2026 |
| spacy | spaCy | ai | 2026 |
| pytorch | PyTorch | ai | 2026 |
| esbuild | esbuild | tooling | 2026 |
| git | Git & GitHub | tooling | 2022 |
| figma | Figma | tooling | 2023 |
| uipath | UiPath | tooling | 2024 |
| claude-code | Claude Code | tooling | 2025 |
| tkinter | Tkinter | tooling | 2026 |
| telegram-bot-api | Telegram Bot API | tooling | 2026 |
| systemd | systemd / Linux | infra | 2026 |
| linux | Linux | infra | 2024 |
| windows | Windows | infra | 2022 |
| pino | Pino | tooling | 2026 |

**Required spec change (apply in Phase 7):** add `"ai"` to `CapabilityCategory` in
`specs/phase7.md` P7.1 (`"language" | "frontend" | "backend" | "data" | "infra" | "ai" | "tooling"`).

---

## 5. Owner answers (2026-10-08) — all questions resolved

1. Name → **Mohamed Faiz** (no initial).
2. CGPA → **not shown**.
3. SpeechPath → **team of 2, owner did the frontend**; ZingDesk → **solo**.
4. Academic ERP → **no link, no year**.
5. IAM backend → **include as in progress**.
6. Multimeta → **only**: works on two projects, Faczonline (verified-facts social media app) and a women's SOS app.
7. LinkedIn URL and BOM years → **confirmed**.
8. Statement → **use the recommendation** (section 1, final).

No `VERIFY(owner)` markers remain except the Faczonline capitalisation note.

## 6. Hygiene notes found while reading the repos (owner's call, not part of the site)

- `IAM-backend/src/routes/index.ts`: `"invitations"` and `"roles"` are mounted without a leading
  slash, unlike the other routes.
- `speech-therapy-final` commits a `.pycache_tmp/` folder containing local Windows paths, and an
  `.agent/` tooling folder; worth adding both to `.gitignore` before recruiters browse it.
- The resume PDF served from `/assets/` includes a phone number; it becomes publicly downloadable
  once the site ships.
