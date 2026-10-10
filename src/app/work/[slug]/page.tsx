import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CasePlates } from "@/components/case/CasePlates";
import { CaseDrawing, CaseHeader, CaseNotes } from "@/components/case/CaseScenes";
import { getProject, hasCasePage, nextCaseProject, projectSlugs } from "@/content";

/*
 * Every case page is prerendered from these params. The spec's
 * `dynamicParams = false` fails the build under Cache Components, so unknown
 * (and in-progress) slugs are rejected with notFound() below instead: a 404.
 */
export function generateStaticParams() {
  return projectSlugs().map((slug) => ({ slug }));
}

async function caseProject(params: PageProps<"/work/[slug]">["params"]) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !hasCasePage(project)) notFound();
  return project;
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = await caseProject(params);
  // OG image: Phase 13.
  return { title: project.title, description: project.summary };
}

/** /work/[slug] — a case study (P11.6). The root layout owns <main>. */
export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const project = await caseProject(params);
  return (
    <>
      <CaseHeader project={project} />
      <CaseDrawing project={project} />
      <CasePlates project={project} />
      <CaseNotes project={project} next={nextCaseProject(project.slug)} />
    </>
  );
}
