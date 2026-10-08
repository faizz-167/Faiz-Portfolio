import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { TracedScenes } from "@/components/home/TracedScenes";

// The root layout owns <main>. Phase 10 adds Work, BOM, Revisions and Contact
// as further children of TracedScenes (one [data-via] each).
export default function Home() {
  return (
    <TracedScenes>
      <Hero />
      <Statement />
    </TracedScenes>
  );
}
