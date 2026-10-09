import { HeroCompile } from "@/components/home/HeroCompile";
import { HeroGuard } from "@/components/home/HeroGuard";
import { Cluster } from "@/components/layout/Cluster";
import { Grid, GridCell } from "@/components/layout/Grid";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { profile } from "@/content";

const SCENE_ID = "top"; // the strip's name links to #top (Phase 8)

/**
 * Sheet 01 — the "Daddy's Home." hero (P9.1). One viewport tall: sparse top
 * (build log, title block), heavy bottom (the display line, then name, role,
 * positioning and actions). The server HTML is the finished hero; the compile
 * sequence is layered on by HeroCompile.
 *
 * `min-h-svh` + flex: the content block stretches to the viewport so the line
 * sits at the bottom; content taller than the viewport grows the scene instead
 * of overflowing it. `overflow-x-clip`: the 140 width cut is wider than the
 * page for 80ms and must not add a scrollbar.
 */
export function Hero() {
  return (
    <Scene
      id={SCENE_ID}
      sheet="Sheet 01 — General arrangement"
      surface="ink"
      className="flex min-h-svh flex-col overflow-x-clip"
      // HeroGuard adds data-hero-guard before hydration.
      suppressHydrationWarning
    >
      <HeroGuard />
      <HeroCompile
        line={profile.copy.heroLine}
        log={profile.copy.buildLog}
        titleId={sceneTitleId(SCENE_ID)}
        titleBlock={
          <TitleBlock
            columns={{ base: 2, md: 2, lg: 3 }}
            cells={[
              { label: "Drawn by", value: profile.name },
              { label: "Location", value: profile.location },
              {
                label: "Status",
                value: (
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-dot bg-accent" />
                    Available
                  </span>
                ),
              },
            ]}
          />
        }
        details={
          <Grid className="mt-7 items-end gap-y-5">
            <GridCell span={{ base: 4, md: 4, lg: 4 }}>
              <Text variant="lede">
                <span className="block">{profile.name}</span>
                <span className="block text-fg-muted">{profile.role}</span>
              </Text>
            </GridCell>
            <GridCell span={{ base: 4, md: 4, lg: 4 }}>
              <Text variant="body" tone="muted">
                {profile.copy.availability}
              </Text>
            </GridCell>
            <GridCell span={{ base: 4, md: 8, lg: 4 }}>
              <Cluster gap={5} className="lg:justify-end">
                <Button variant="outline" href="#work">
                  See the work
                </Button>
                <Link href="#contact">Get in touch</Link>
              </Cluster>
            </GridCell>
          </Grid>
        }
      />
    </Scene>
  );
}
