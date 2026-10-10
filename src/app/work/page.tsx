import type { Metadata } from "next";
import { AllAssemblies } from "@/components/work/AllAssemblies";
import { profile } from "@/content";

export const metadata: Metadata = {
  title: "All assemblies",
  description:
    `The full index of ${profile.name}'s assemblies: every project with its role, team, stack and a link to its drawing.`,
};

/** /work — the full index of assemblies (P11b.5). Static; the root layout owns <main> and the footer. */
export default function WorkPage() {
  return <AllAssemblies />;
}
