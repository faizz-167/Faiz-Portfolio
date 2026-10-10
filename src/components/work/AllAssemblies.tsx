import { workRowData } from "@/components/home/WorkIndex";
import { WorkRows } from "@/components/home/WorkRows";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { sortedProjects } from "@/content";

/** The page's one scene; `top` like the case headers, so #top means the top of the sheet. */
const SCENE_ID = "top";

/**
 * /work — every project in project order (P11b.5). Ink. The same rows as the
 * home index (expand, one open, hover intent, touch, IAM in progress); row
 * titles are h2 here because the page heading is the h1.
 */
export function AllAssemblies() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Assemblies (full index)" surface="ink">
      <Container>
        <Stack gap={7}>
          <Button variant="ghost" icon="none" href="/" className="self-start">
            Back to home
          </Button>
          <Text variant="h2" as="h1" id={sceneTitleId(SCENE_ID)}>
            All assemblies
          </Text>
          <WorkRows rows={workRowData(sortedProjects())} headingLevel="h2" />
        </Stack>
      </Container>
    </Scene>
  );
}
