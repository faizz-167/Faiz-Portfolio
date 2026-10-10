import { ToolkitGauge } from "@/components/home/ToolkitGauge";
import {
  FaceParagraph,
  FaceWord,
  pad2,
  ToolUsage,
  type GaugeFace,
  type ToolData,
} from "@/components/home/ToolkitParts";
import { Container } from "@/components/layout/Container";
import { Rule } from "@/components/layout/Rule";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { RuleDraw } from "@/components/motion/RuleDraw";
import { Text } from "@/components/type/Text";
import {
  capabilityUsage,
  caseHref,
  toolkit,
  type CapabilityCategory,
  type CapabilityEntry,
  type ToolkitFaceEntry,
} from "@/content";
import { BUILD_YEAR } from "@/lib/build-year";

/* The id stays `materials`: nav links and the trace via are unchanged (P11b.2). */
const SCENE_ID = "materials";
const TITLE = "Services & toolkit";

/** Category names in sentence case, for each face's small label. */
const categoryLabels: Record<CapabilityCategory, string> = {
  language: "Language",
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  infra: "Infra",
  ai: "AI",
  tooling: "Tooling",
};

const listClasses = {
  faces: "flex flex-col gap-9",
  face: "flex flex-col gap-5",
  label: "flex justify-between gap-4 pt-3 font-mono text-data text-fg-muted",
  word: "leading-hero",
  tools: "grid grid-cols-1 gap-x-gutter gap-y-4 pt-2 sm:grid-cols-2 lg:grid-cols-3",
  tool: "font-text text-body",
  usage: "font-mono text-data text-fg-muted",
} as const;

function toolData(capability: CapabilityEntry): ToolData {
  return {
    id: capability.id,
    name: capability.name,
    // Counted inclusively: a tool first used this year has been used for 1.
    years: BUILD_YEAR - capability.since + 1,
    // Generated from project stacks; only projects with a case page link.
    usedIn: capabilityUsage(capability.id).map((project) => ({
      slug: project.slug,
      label: project.indexTitle ?? project.title,
      href: caseHref(project),
    })),
  };
}

function faceLabel(face: ToolkitFaceEntry) {
  return face.categories.map((category) => categoryLabels[category]).join(" · ");
}

/**
 * Sheet 04 — services & toolkit (P11b.2–P11b.3). Paper. The readable layer is
 * one block per face (label + index, the face word as an h3, the paragraph,
 * the tools with their years and "Used in" links); it is what renders below
 * 1024px, without JS and under reduced motion, and what screen readers get in
 * every mode. ToolkitGauge adds the pinned gauge on top from 1024px with motion.
 */
export function Materials() {
  const faces = toolkit();
  const tools = faces.map((face) => face.tools.map(toolData));

  const gaugeFaces: GaugeFace[] = faces.map((face, i) => ({
    id: face.id,
    name: face.name,
    paragraph: face.paragraph,
    label: faceLabel(face),
    index: face.index,
    tools: tools[i] ?? [],
  }));

  return (
    <Scene id={SCENE_ID} sheet="Sheet 04 — Toolkit" surface="paper">
      {/* Trace via: right margin rail, level with the top of the content; outside the moving track. */}
      <span data-via="right" aria-hidden="true" className="absolute top-section right-0 h-0 w-margin" />
      <ToolkitGauge title={TITLE} faces={gaugeFaces}>
        <Container>
          <div className="flex flex-col gap-7">
            <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
              {TITLE}
            </Text>
            <RuleDraw className={listClasses.faces}>
              {gaugeFaces.map((face) => {
                const wordId = `${SCENE_ID}-${face.id}`;
                return (
                  <section key={face.id} aria-labelledby={wordId} className={listClasses.face} data-face={face.id}>
                    <div>
                      <Rule />
                      <p className={listClasses.label}>
                        <span>{face.label}</span>
                        <span>{pad2(face.index)}</span>
                      </p>
                    </div>
                    <Text variant="h1" as="h3" id={wordId} className={listClasses.word}>
                      <FaceWord name={face.name} />
                    </Text>
                    <Text variant="body">
                      <FaceParagraph face={face} />
                    </Text>
                    <ul className={listClasses.tools}>
                      {face.tools.map((tool) => (
                        <li key={tool.id} data-tool={tool.id} className={listClasses.tool}>
                          {tool.name} <ToolUsage tool={tool} className={listClasses.usage} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </RuleDraw>
          </div>
        </Container>
      </ToolkitGauge>
    </Scene>
  );
}
