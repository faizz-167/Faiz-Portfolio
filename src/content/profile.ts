import type { Profile } from "./types";

// Source: implementation plan/content/owner-content.md §1. The phone number on the resume is
// deliberately not published (Decisions log 2026-10-08).
export const profile = {
  name: "Mohamed Faiz",
  role: "Full-stack engineer",
  location: "Chennai, India",
  timeZone: "Asia/Kolkata",
  email: "faizmohammed176@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/faizz-167" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mohd-faizz167" },
    { label: "Resume", href: "/assets/MdFaizResume.pdf" },
  ],
  statement:
    "I build the parts of software you don't see until they break: queues that survive a restart, retrieval that knows when it doesn't know, interfaces that keep up with a live stream of results. Then I make the part you do see feel inevitable.",
  portrait: {
    src: "/assets/portrait.jpg",
    width: 3452,
    height: 2588,
    alt: "Mohamed Faiz, black-and-white portrait, glasses, looking to the right.",
  },
  roleWords: ["Systems", "Retrieval", "Interfaces"],
  copy: {
    heroLine: "Daddy's Home.",
    contactLines: ["Call me, Baby", "for your new website."],
    buildLog: [
      "resolving dependencies… ok",
      "training rag index (1536 dims)… ok",
      "streaming live scores over websocket… ok",
      "linking signal trace… ok",
      "ready.",
    ],
    availability: "Open to full-time roles and freelance builds.",
  },
} satisfies Profile;
