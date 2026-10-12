import Image from "next/image";
import NextLink from "next/link";
import { CARD_CURSOR_LABEL } from "@/components/home/WorkCards";
import { assemblyCount } from "@/components/home/WorkIndex";
import { Floating } from "@/components/motion/Floating";
import { PlateFrame, PlatePending } from "@/components/plate/Plate";
import { Text } from "@/components/type/Text";
import { Button } from "@/components/ui/Button";
import { caseHref, type Project } from "@/content";
import { cn } from "@/lib/cn";

/** Status line for projects without a case page (design.md §2.3 status-progress). */
const IN_PROGRESS_LABEL = "On the drawing board";

/*
 * Hand placement from 640px (P12c.3, P12d.4), by percentage of the band, in
 * project order. Each slot stays clear of the centred title and count even at
 * full drift (depth × 24px). Sizes and aspects differ so the field reads as
 * scattered sheets; they are wider below 1024px so the plates stay legible.
 * Below 640px every plate stacks at full width and 16:10 (P12d.5).
 */
type Slot = { place: string; width: string; aspect: string; depth: number };
const slots: readonly Slot[] = [
  { place: "sm:top-[12%] sm:left-[4%]", width: "sm:w-[30%] lg:w-[15%]", aspect: "sm:aspect-[16/10]", depth: 1 },
  { place: "sm:top-0 sm:right-[6%]", width: "sm:w-[20%] lg:w-[11%]", aspect: "sm:aspect-[4/5]", depth: 2 },
  { place: "sm:bottom-[4%] sm:left-[12%]", width: "sm:w-[22%] lg:w-[14%]", aspect: "sm:aspect-square", depth: 0.5 },
  { place: "sm:bottom-[8%] sm:right-[2%] lg:right-[14%]", width: "sm:w-[30%] lg:w-[20%]", aspect: "sm:aspect-[16/10]", depth: 1.5 },
  { place: "sm:bottom-0 sm:left-[42%]", width: "sm:w-[18%] lg:w-[11%]", aspect: "sm:aspect-[16/10]", depth: 0.75 },
];

const fieldClasses = {
  /* Phones: one column. From 640px: a fixed-height band the plates float in. */
  band: "group/field relative flex flex-col gap-7 sm:block sm:h-[70svh] lg:h-[80svh]",
  back: "self-start sm:absolute sm:top-0 sm:left-0 sm:z-content",
  /* Above the plates in stacking order; never covered. The layer spans the band, so it lets the
     pointer through to the plates; only its text takes it. */
  title: [
    "pointer-events-none relative z-content flex flex-col items-center gap-3 text-center",
    "sm:absolute sm:inset-0 sm:justify-center",
  ].join(" "),
  titleText: "pointer-events-auto",
  /* Siblings of a hovered plate fade to the muted mix, as on the home cards. */
  item: [
    "relative w-full sm:absolute",
    "transition-opacity duration-(--dur-base) ease-out",
    "fine-motion:group-has-[[data-float-plate]:hover]/field:not-hover:opacity-(--muted-mix)",
  ].join(" "),
  plate: "group/float flex flex-col gap-2",
  zoom: [
    "absolute inset-0 transition-transform duration-(--dur-slow) ease-out",
    "fine-motion:group-hover/float:scale-[1.04]",
  ].join(" "),
  image: "absolute inset-0 size-full object-cover",
  pendingFrame: "aspect-[16/10] border-hair border-dashed border-fg-muted",
  caption: "flex flex-col font-mono text-data text-fg-muted",
} as const;

export type FloatingEntry = { project: Project; number: string };

function PlateMedia({ project, aspect }: { project: Project; aspect: string }) {
  const plate = project.plates?.[0];
  return (
    <PlateFrame className={cn("aspect-[16/10]", aspect)}>
      <div className={fieldClasses.zoom}>
        {plate?.image ? (
          <Image
            src={plate.image.src}
            alt=""
            width={plate.image.width}
            height={plate.image.height}
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 100vw"
            className={fieldClasses.image}
          />
        ) : (
          // Decorative inside the link: the link is named by the full title.
          <PlatePending id={`float-hatch-${project.slug}`} />
        )}
      </div>
    </PlateFrame>
  );
}

/**
 * /work (P12c, P12d): the h1 and the count in the centre, every project as a
 * plate floating around it. The plates are the page's index: linked plates are
 * ordinary links named by the full title; an in-progress project (no case
 * page) floats as a dashed, unlinked plate.
 */
export function FloatingField({ entries, titleId }: { entries: readonly FloatingEntry[]; titleId: string }) {
  return (
    <Floating className={fieldClasses.band}>
      <Button variant="ghost" icon="none" href="/" className={fieldClasses.back}>
        Back to home
      </Button>
      <div className={fieldClasses.title}>
        <Text variant="h1" id={titleId} className={fieldClasses.titleText}>
          All assemblies
        </Text>
        <Text variant="data" tone="muted" className={fieldClasses.titleText}>
          {assemblyCount(entries.length)}
        </Text>
        <Text variant="small" tone="muted" className={fieldClasses.titleText}>
          Each plate opens its drawing.
        </Text>
      </div>
      {entries.map(({ project, number }, i) => {
        // Five slots for five projects; a sixth would need its own placement.
        const slot = slots[i];
        if (!slot) return null;
        const href = caseHref(project);
        const short = project.indexTitle ?? project.title;
        const metaId = `float-${project.slug}-meta`;
        const meta = [project.role, project.team ?? null].filter((part): part is string => part !== null);
        return (
          <div
            key={project.slug}
            data-depth={slot.depth}
            data-float-cut=""
            className={cn(fieldClasses.item, slot.place, slot.width)}
          >
            {href ? (
              <NextLink
                href={href}
                data-float-plate=""
                data-cursor-label={CARD_CURSOR_LABEL}
                aria-label={project.title}
                aria-describedby={metaId}
                className={fieldClasses.plate}
              >
                <PlateMedia project={project} aspect={slot.aspect} />
                <span className={fieldClasses.caption}>
                  {number} {short}
                </span>
                <span id={metaId} className="sr-only">
                  {meta.join(" · ")}
                </span>
              </NextLink>
            ) : (
              <div className={fieldClasses.plate}>
                <div aria-hidden="true" className={cn(fieldClasses.pendingFrame, slot.aspect)} />
                <span className={fieldClasses.caption}>
                  <span>
                    {number} {project.title}
                  </span>
                  <span>{IN_PROGRESS_LABEL}</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </Floating>
  );
}
