import { WorkCards } from "@/components/home/WorkCards";
import { Cluster } from "@/components/layout/Cluster";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { PixelSeam } from "@/components/motion/PixelSeam";
import { homeProjects, sortedProjects } from "@/content";

const SCENE_ID = "work";

/** The assembly total (home, /work): counted from the data, never typed in. */
export function assemblyCount(count: number) {
  return `${count} ${count === 1 ? "assembly" : "assemblies"}`;
}

/**
 * Sheet 03 — the work index (P10.1–P10.3, P11b.4, P11c.2). Ink. The first three
 * projects in project order as staggered cards, then a link to /work with the
 * total. /work is the drawing register (`work/AllAssemblies`).
 */
export function WorkIndex() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Assemblies" surface="ink">
      {/* Trace via: left margin rail, level with the top of the content. */}
      <span data-via="left" aria-hidden="true" className="absolute top-section left-0 h-0 w-margin" />
      <Container>
        <Stack gap={7}>
          <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
            Selected assemblies
          </Text>
          <Stack gap={9}>
            <WorkCards projects={homeProjects()} />
            <Cluster gap={5} align="center">
              <Button variant="outline" icon="arrow-right" href="/work">
                See all assemblies
              </Button>
              <Text variant="data" tone="muted">
                {assemblyCount(sortedProjects().length)}
              </Text>
            </Cluster>
          </Stack>
        </Stack>
      </Container>
      {/* P11c.6: the boundary into the next scene dissolves in its colour. */}
      <PixelSeam to="paper" seed={23} />
    </Scene>
  );
}
