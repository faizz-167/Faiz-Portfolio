import type { Revision } from "./types";

// Source: implementation plan/content/owner-content.md §2. Newest first; letters are assigned
// oldest = A, so they read C → B → A down the list (checked by scripts/validate-content.ts).
export const experience = [
  {
    rev: "C",
    org: "Multimeta.AI Tech & Consulting",
    title: "Full-stack developer intern",
    start: "2026-06",
    end: "present",
    // Owner disclosure limit: only that he works on these two projects, one line each.
    // No features, architecture or screenshots. "Faczonline" spelled as the owner gave it.
    changes: [
      "Works on Faczonline, a social media app where only verified, trusted facts and content get published.",
      "Works on a women's safety SOS app.",
    ],
  },
  {
    rev: "B",
    org: "Zingbizz Digital Solution",
    title: "Full-stack developer intern",
    start: "2026-03",
    end: "2026-05",
    changes: [
      "Built ZingDesk, a RAG customer-support chatbot SaaS.",
      "Retrieval pipeline, semantic search, ingestion queue and an embeddable widget.",
    ],
  },
  {
    rev: "A",
    org: "Rajalakshmi Engineering College, Chennai",
    title: "B.E. Computer Science",
    start: "2022",
    end: "2026",
    // Grade is deliberately absent (owner decision).
    changes: [
      "Graduated 2026.",
      "Certification: Introduction to Model Context Protocol (Anthropic).",
      "Certification: UiPath Automation Developer Associate.",
      "Certification: Next.js Full Stack Bootcamp (JavaScript Mastery).",
    ],
  },
] satisfies readonly Revision[];
