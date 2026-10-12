import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { FloatingField } from "@/components/work/FloatingField";
import { sortedProjects } from "@/content";

/** The page's one scene; `top` like the case headers, so #top means the top of the sheet. */
const SCENE_ID = "top";

/** Drawing number in project order: A-01, A-02… */
function drawingNumber(index: number) {
  return `A-${String(index + 1).padStart(2, "0")}`;
}

/**
 * /work — the floating field (P12c, P12d). Ink. Every project floats as a
 * plate around the title; the field is the page's index.
 */
export function AllAssemblies() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Assemblies (full index)" surface="ink">
      <Container>
        <FloatingField
          titleId={sceneTitleId(SCENE_ID)}
          entries={sortedProjects().map((project, index) => ({ project, number: drawingNumber(index) }))}
        />
      </Container>
    </Scene>
  );
}
