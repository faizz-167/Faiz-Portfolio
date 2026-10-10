import { PortraitBand } from "@/components/home/PortraitBand";
import { Container } from "@/components/layout/Container";
import { Grid, GridCell } from "@/components/layout/Grid";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { ScrubText } from "@/components/motion/ScrubText";
import { profile } from "@/content";

const SCENE_ID = "statement";

const statementClasses = {
  /* The band opens the scene, meeting the hero with a hard edge: no top padding. */
  scene: "pt-0",
  /* The note wraps under the figure label on narrow screens instead of squeezing it. */
  caption: "flex flex-wrap justify-between gap-x-4 gap-y-1 pt-3 font-mono text-data",
  note: "text-fg-muted",
  /* The trace via sits in this block's left margin, below the photo. */
  body: "relative pt-9",
} as const;

/**
 * Sheet 02 — the about sheet (P9.6, P11c.4, P11d). Paper. It opens with the
 * owner's portrait as a full-bleed band carrying the three role words
 * (PortraitBand), then a mono caption strip, then the statement in large serif
 * across columns 2–10, inked word by word with the scroll through an accent
 * band (ScrubText). The heading is for assistive tech only: an eyebrow label
 * above the statement is a design ban.
 */
export function Statement() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 02 — Notes" surface="paper" className={statementClasses.scene}>
      <h2 id={sceneTitleId(SCENE_ID)} className="sr-only">
        Notes
      </h2>
      <PortraitBand portrait={profile.portrait} roleWords={profile.roleWords} />
      <Container>
        <p className={statementClasses.caption}>
          <span>Fig. 01 — {profile.name}</span>
          <span className={statementClasses.note}>{profile.location} · Rev. current</span>
        </p>
      </Container>
      <div className={statementClasses.body}>
        {/* Trace via: centred in the left page margin, level with the top of the statement. */}
        <span data-via="left" aria-hidden="true" className="absolute top-9 left-0 h-0 w-margin" />
        <Container>
          <Grid>
            <GridCell start={{ md: 1, lg: 2 }} span={{ base: 4, md: 8, lg: 9 }}>
              {/* h3 size, the lede's text weight: serif statement, never a bold paragraph. */}
              <ScrubText className="font-text text-h3 font-(--text-lede--font-weight) text-pretty">
                {profile.statement}
              </ScrubText>
            </GridCell>
          </Grid>
        </Container>
      </div>
    </Scene>
  );
}
