import { Contact } from "@/components/home/Contact";
import { Hero } from "@/components/home/Hero";
import { Materials } from "@/components/home/Materials";
import { Revisions } from "@/components/home/Revisions";
import { Statement } from "@/components/home/Statement";
import { TracedScenes } from "@/components/home/TracedScenes";
import { WorkIndex } from "@/components/home/WorkIndex";

// The root layout owns <main>. Scenes in page order, one [data-via] each.
export default function Home() {
  return (
    <TracedScenes>
      <Hero />
      <Statement />
      <WorkIndex />
      <Materials />
      <Revisions />
      <Contact />
    </TracedScenes>
  );
}
