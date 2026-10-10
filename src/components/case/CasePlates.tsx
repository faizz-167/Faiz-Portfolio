import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Text } from "@/components/type/Text";
import type { Plate, Project } from "@/content";
import { cn } from "@/lib/cn";

const SCENE_ID = "plates";

/*
 * Drawing plates (P11b.6), after the Etienne Studio archive reference: a
 * hairline frame fixed at 16:10 with a registration tick on each corner, and
 * a mono caption strip under it. Plate 1 spans the content width; plates 2–4
 * sit three across from 1024px and stack below that.
 */
const plateClasses = {
  list: "grid grid-cols-1 gap-x-gutter gap-y-8 lg:grid-cols-3",
  first: "lg:col-span-3",
  /* Ticks overhang the frame by half their size, so the frame is the positioned box. */
  frame: "relative aspect-[16/10] border-hair border-fg-muted",
  image: "absolute inset-0 size-full object-cover",
  /* The hatch is decorative; the label sits on a surface chip so it reads over the lines. */
  hatch: "absolute inset-0 size-full text-fg-muted",
  pending: "absolute inset-0 flex items-center justify-center",
  pendingLabel: "bg-surface px-3 py-2 font-mono text-data text-fg",
  tick: "pointer-events-none absolute size-4",
  tickH: "absolute inset-x-0 top-1/2 h-0 border-t-(length:--border-hair) border-fg",
  tickV: "absolute inset-y-0 left-1/2 w-0 border-l-(length:--border-hair) border-fg",
  /* The plate number never wraps under the caption; a long caption wraps on its own side. */
  caption: "flex justify-between gap-4 pt-3 font-mono text-data",
  plateNo: "shrink-0 text-fg-muted",
} as const;

/* Each tick is a small cross centred on its corner. */
const corners = ["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"] as const;

/** Hatch spacing in px: a 45° line every 12px (--space-3). */
const HATCH = 12;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Image sizes: plate 1 is the content width, the rest a third of it from 1024px. */
function sizesFor(n: number) {
  return n === 1 ? "(min-width: 1024px) 92vw, 100vw" : "(min-width: 1024px) 30vw, 100vw";
}

function PlateFigure({ plate, n, count, slug }: { plate: Plate; n: number; count: number; slug: string }) {
  const hatchId = `plate-hatch-${slug}-${n}`;
  return (
    <figure>
      <div className={plateClasses.frame}>
        {plate.image ? (
          <Image
            src={plate.image.src}
            alt={plate.alt}
            width={plate.image.width}
            height={plate.image.height}
            sizes={sizesFor(n)}
            className={plateClasses.image}
          />
        ) : (
          // Placeholder: no image element. One accessible image, named by plate and caption.
          <div role="img" aria-label={`Plate ${n}: ${plate.caption} (screenshot pending)`} className="absolute inset-0">
            <svg aria-hidden="true" className={plateClasses.hatch}>
              <defs>
                <pattern
                  id={hatchId}
                  width={HATCH}
                  height={HATCH}
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line x1="0" y1="0" x2="0" y2={HATCH} stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${hatchId})`} />
            </svg>
            <div aria-hidden="true" className={plateClasses.pending}>
              <span className={plateClasses.pendingLabel}>Screenshot pending</span>
            </div>
          </div>
        )}
        {corners.map((corner) => (
          <span key={corner} aria-hidden="true" className={cn(plateClasses.tick, corner)}>
            <span className={plateClasses.tickH} />
            <span className={plateClasses.tickV} />
          </span>
        ))}
      </div>
      <figcaption className={plateClasses.caption}>
        <span>
          Fig. {pad(n)} — {plate.caption}
        </span>
        <span className={plateClasses.plateNo}>
          Plate {n} of {count}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Sheet 03 — plates (P11b.6). Ink, between the system drawing and the notes.
 * Projects without plates render nothing (and their notes stay Sheet 03).
 */
export function CasePlates({ project }: { project: Project }) {
  // The tuple's optional slots widen to `Plate | undefined`; keep only the filled ones.
  const slots: readonly (Plate | undefined)[] = project.plates ?? [];
  const plates = slots.filter((plate): plate is Plate => plate !== undefined);
  if (plates.length === 0) return null;
  return (
    <Scene id={SCENE_ID} sheet="Sheet 03 — Plates" surface="ink">
      <Container>
        <Stack gap={7}>
          <Text variant="h2" id={sceneTitleId(SCENE_ID)}>
            Plates
          </Text>
          <ol className={plateClasses.list}>
            {plates.map((plate, i) => (
              <li key={plate.caption} className={i === 0 ? plateClasses.first : undefined}>
                <PlateFigure plate={plate} n={i + 1} count={plates.length} slug={project.slug} />
              </li>
            ))}
          </ol>
        </Stack>
      </Container>
    </Scene>
  );
}

/** The notes sheet follows the plates when there are any. */
export function hasPlates(project: Project) {
  return (project.plates?.length ?? 0) > 0;
}
