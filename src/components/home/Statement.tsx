import { Container } from "@/components/layout/Container";
import { Grid, GridCell } from "@/components/layout/Grid";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { ScrubText } from "@/components/motion/ScrubText";
import { Text } from "@/components/type/Text";
import { profile } from "@/content";

const SCENE_ID = "statement";

/**
 * Sheet 02 — the statement (P9.6). Paper; the statement in large serif across
 * columns 2–10, inked word by word with the scroll (ScrubText), one muted mono
 * margin note. The heading is for assistive tech only: an eyebrow label above
 * the statement is a design ban.
 */
export function Statement() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 02 — Notes" surface="paper">
      {/* Trace via: centred in the left page margin, level with the top of the content. */}
      <span data-via="left" aria-hidden="true" className="absolute top-section left-0 h-0 w-margin" />
      <Container>
        <Grid className="gap-y-7">
          <h2 id={sceneTitleId(SCENE_ID)} className="sr-only">
            Notes
          </h2>
          <GridCell start={{ md: 1, lg: 2 }} span={{ base: 4, md: 7, lg: 9 }}>
            {/* h3 size, the lede's text weight: serif statement, never a bold paragraph. */}
            <ScrubText className="font-text text-h3 font-(--text-lede--font-weight) text-pretty">
              {profile.statement}
            </ScrubText>
          </GridCell>
          <GridCell as="p" start={{ lg: 11 }} span={{ base: 4, md: 8, lg: 2 }}>
            <Text variant="data" tone="muted" className="block">
              {profile.location}
            </Text>
            <Text variant="data" tone="muted" className="block">
              Rev. current
            </Text>
          </GridCell>
        </Grid>
      </Container>
    </Scene>
  );
}
