import { Container } from "@/components/layout/Container";
import { Rule } from "@/components/layout/Rule";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Pin } from "@/components/motion/Pin";
import { RuleDraw } from "@/components/motion/RuleDraw";
import { Text } from "@/components/type/Text";
import { revisions, type Revision } from "@/content";
import { PixelSeam } from "@/components/motion/PixelSeam";

const SCENE_ID = "revisions";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** "2026-06" → "Jun 2026", "2022" → "2022". String parsing: no Date in a Server Component. */
function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const name = month === undefined ? undefined : MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : value;
}

/*
 * Track (Pin): a vertical list by default — phones, tablets, reduced motion,
 * no JS — with each card's own drawn rule as the separator. While the pin is
 * live (`data-pinned`, ≥ 1024px with motion) the cards sit in a row, one
 * lede measure wide, --space-12 apart (design.md §5: desktop pinned track).
 * The pinned section clears the fixed sheet strip with --strip-h of padding.
 */
const revisionClasses = {
  pin: "lg:pt-strip",
  track: "*:shrink-0 *:pb-7 data-pinned:gap-12 data-pinned:*:w-lede data-pinned:*:pb-0",
  card: "flex flex-col gap-5",
  letter: "pt-5",
  changes: "flex flex-col gap-2",
} as const;

function RevisionCard({ revision }: { revision: Revision }) {
  const titleId = `${SCENE_ID}-rev-${revision.rev.toLowerCase()}`;
  return (
    <article aria-labelledby={titleId} className={revisionClasses.card}>
      <Rule />
      <Text variant="h1" as="h3" id={titleId} className={revisionClasses.letter}>
        Rev. {revision.rev}
      </Text>
      <div>
        <Text variant="lede">{revision.org}</Text>
        <Text variant="body" tone="muted">
          {revision.title}
        </Text>
      </div>
      <Text as="p" variant="data" tone="muted">
        <time dateTime={revision.start}>{formatMonth(revision.start)}</time>
        {" – "}
        {revision.end === "present" ? "present" : <time dateTime={revision.end}>{formatMonth(revision.end)}</time>}
      </Text>
      <ul className={revisionClasses.changes}>
        {revision.changes.map((change) => (
          <Text as="li" variant="small" key={change}>
            {change}
          </Text>
        ))}
      </ul>
    </article>
  );
}

/**
 * Sheet 05 — revision history (P10.5). Ink. Rev. C → A, newest first. On
 * desktop with motion the cards pin and slide horizontally; elsewhere they
 * stack. One via for the scene, outside the moving track (Phase 6 rule).
 */
export function Revisions() {
  return (
    <Scene id={SCENE_ID} sheet="Sheet 05 — Revision history" surface="ink">
      {/* Trace via: left margin rail, level with the top of the content. */}
      <span data-via="left" aria-hidden="true" className="absolute top-section left-0 h-0 w-margin" />
      <Container>
        <Stack gap={7}>
          <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
            Revision history
          </Text>
          <RuleDraw>
            <Pin className={revisionClasses.pin} trackClassName={revisionClasses.track}>
              {revisions().map((revision) => (
                <RevisionCard key={revision.rev} revision={revision} />
              ))}
            </Pin>
          </RuleDraw>
        </Stack>
      </Container>
      {/* P11c.6: the boundary into the next scene dissolves in its colour. */}
      <PixelSeam to="signal" seed={37} />
    </Scene>
  );
}
