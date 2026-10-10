import Image from "next/image";
import NextLink from "next/link";
import type { CSSProperties } from "react";
import { Grid, GridCell, type GridSpan, type GridStart } from "@/components/layout/Grid";
import { PlateDrift } from "@/components/motion/PlateDrift";
import { PlateFrame, PlatePending } from "@/components/plate/Plate";
import { caseHref, getCapability, type Project } from "@/content";
import { cn } from "@/lib/cn";
import { staggersS } from "@/lib/motion/tokens";

/** Read by the Crosshair: the chip it shows over a card (P11c.3). */
export const CARD_CURSOR_LABEL = "Open drawing";
const TAG_COUNT = 3;

/*
 * The produx.design rhythm on our grid (P11c.2): card 1 wide on the left, card 2
 * narrow on the right and bottom-aligned with it, card 3 wide on its own row,
 * set in by one column. Tablet (8 columns) halves the first two. Card 2 is
 * always the shorter plate so it visibly drops: 4:3 + square from 1024px,
 * square + 4:3 when the two are equally wide (as built: the spec's 16:10 /
 * 4:5 made card 2 the taller one).
 */
type Placement = { start?: GridStart; span: GridSpan; aspect: string; align?: string };
const placements: readonly [Placement, ...Placement[]] = [
  { span: { base: "full", md: 4, lg: 7 }, aspect: "aspect-square lg:aspect-[4/3]" },
  { start: { md: 5, lg: 9 }, span: { base: "full", md: 4, lg: 4 }, aspect: "aspect-[4/3] lg:aspect-square", align: "sm:self-end" },
  { start: { lg: 2 }, span: { base: "full", md: "full", lg: 10 }, aspect: "aspect-[16/10]" },
];

const cardClasses = {
  grid: "gap-y-9",
  /*
   * Hover choreography is CSS (transform/opacity transitions), gated by the
   * `fine-motion` variant; focus shows the same marker and tags. The siblings of
   * a hovered card fade to the muted mix, as the rows did.
   */
  card: [
    "group/card flex flex-col gap-4 transition-opacity duration-(--dur-base) ease-out",
    "fine-motion:group-has-[[data-card]:hover]/cards:not-hover:opacity-(--muted-mix)",
  ].join(" "),
  /* The media scales inside the fixed frame; PlateDrift moves the layer inside this one. */
  zoom: [
    "absolute inset-0 transition-transform duration-(--dur-slow) ease-out",
    "fine-motion:group-hover/card:scale-[1.04]",
  ].join(" "),
  image: "absolute inset-0 size-full object-cover",
  /* Meta sits beside the title when both fit, and wraps under it on narrow cards. */
  caption: "flex flex-wrap items-baseline justify-between gap-x-gutter gap-y-2",
  titleRow: "relative flex items-center",
  /* Hidden at rest; grows in front of the title and the title moves aside (transforms only). */
  marker: [
    "absolute top-1/2 left-0 size-3 -translate-y-1/2 scale-0 bg-accent",
    "transition-transform duration-(--dur-base) ease-out",
    "fine-motion:group-hover/card:scale-100 group-focus-visible/card:scale-100",
  ].join(" "),
  title: [
    "font-display text-h3 transition-transform duration-(--dur-base) ease-out",
    "fine-motion:group-hover/card:translate-x-5 group-focus-visible/card:translate-x-5",
  ].join(" "),
  meta: "font-mono text-data text-fg-muted",
  /* Readable list under the caption: everywhere except where the plate copy shows. */
  tags: "flex flex-wrap gap-2 fine-motion:sr-only",
  tag: "border-hair border-rule bg-raised px-2 py-1 font-mono text-data",
  /* The plate copy: slides up into the bottom-right corner on hover or focus. */
  plateTags: "absolute right-4 bottom-4 hidden gap-2 fine-motion:flex",
  plateTag: [
    "translate-y-2 opacity-0 transition-[translate,opacity] duration-(--dur-base) ease-out",
    "group-hover/card:translate-y-0 group-hover/card:opacity-100",
    "group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100",
  ].join(" "),
} as const;

/** Home shows three projects; any extra one takes the first card's placement. */
function placementFor(index: number): Placement {
  return placements[index] ?? placements[0];
}

/** Sizes per placement: the plate's share of the viewport at each tier. */
const sizes = ["(min-width: 1024px) 55vw, (min-width: 640px) 50vw, 100vw", "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw", "(min-width: 1024px) 80vw, 100vw"];

function Plate({ project, aspect, index }: { project: Project; aspect: string; index: number }) {
  const plate = project.plates?.[0];
  const tags = project.stack.slice(0, TAG_COUNT).map((id) => getCapability(id).name);
  return (
    <PlateFrame className={aspect}>
      <div className={cardClasses.zoom}>
        <PlateDrift>
          {plate?.image ? (
            <Image
              src={plate.image.src}
              alt=""
              width={plate.image.width}
              height={plate.image.height}
              sizes={sizes[index] ?? sizes[0]}
              className={cardClasses.image}
            />
          ) : (
            // Decorative inside the link: the link is named by the title.
            <PlatePending id={`card-hatch-${project.slug}`} />
          )}
        </PlateDrift>
      </div>
      <span aria-hidden="true" className={cardClasses.plateTags}>
        {tags.map((tag, i) => (
          <span
            key={tag}
            className={cn(cardClasses.tag, cardClasses.plateTag)}
            style={{ transitionDelay: `${i * staggersS.words}s` } satisfies CSSProperties}
          >
            {tag}
          </span>
        ))}
      </span>
    </PlateFrame>
  );
}

function Card({ project, index }: { project: Project; index: number }) {
  const href = caseHref(project);
  const titleId = `card-${project.slug}-title`;
  const metaId = `card-${project.slug}-meta`;
  const { aspect } = placementFor(index);
  const meta = [project.year !== undefined ? String(project.year) : null, project.role].filter(
    (part): part is string => part !== null,
  );
  const tags = project.stack.slice(0, TAG_COUNT).map((id) => getCapability(id).name);
  const short = project.indexTitle ?? project.title;
  const body = (
    <>
      <Plate project={project} aspect={aspect} index={index} />
      <div className={cardClasses.caption}>
        <h3 id={titleId} className={cardClasses.titleRow}>
          <span aria-hidden="true" className={cardClasses.marker} />
          {/* The short index name is what sighted users see; the full title names the card. */}
          <span aria-hidden={short !== project.title || undefined} className={cardClasses.title}>
            {short}
          </span>
          {short !== project.title && <span className="sr-only">{project.title}</span>}
        </h3>
        <span id={metaId} className={cardClasses.meta}>
          {meta.join(" · ")}
        </span>
      </div>
      <ul className={cardClasses.tags}>
        {tags.map((tag) => (
          <li key={tag} className={cardClasses.tag}>
            {tag}
          </li>
        ))}
      </ul>
    </>
  );
  // Home lists projects with case pages; a project without one still reads, unlinked.
  return href ? (
    <NextLink
      href={href}
      data-card=""
      data-cursor-label={CARD_CURSOR_LABEL}
      aria-labelledby={titleId}
      aria-describedby={metaId}
      className={cardClasses.card}
    >
      {body}
    </NextLink>
  ) : (
    <div className={cardClasses.card}>{body}</div>
  );
}

/** The home assembly cards (P11c.2–3): three projects, staggered, each one link. */
export function WorkCards({ projects }: { projects: readonly Project[] }) {
  return (
    <Grid as="ul" className={cn("group/cards", cardClasses.grid)}>
      {projects.map((project, index) => {
        const place = placementFor(index);
        return (
          <GridCell as="li" key={project.slug} start={place.start} span={place.span} className={place.align}>
            <Card project={project} index={index} />
          </GridCell>
        );
      })}
    </Grid>
  );
}
