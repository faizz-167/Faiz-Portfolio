import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Drawing-plate parts shared by the case-page plates (P11b.6), the home
 * assembly cards (P11c.2) and the portrait (P11c.5): a hairline frame with a
 * registration tick on each corner, and the hatched "Screenshot pending" fill.
 */
const plateClasses = {
  /* Ticks overhang the frame by half their size, so the frame is the positioned box. */
  frame: "relative border-hair border-fg-muted",
  /* Media is clipped here, not on the frame, so the ticks stay visible. */
  clip: "absolute inset-0 overflow-hidden",
  tick: "pointer-events-none absolute size-4",
  tickH: "absolute inset-x-0 top-1/2 h-0 border-t-(length:--border-hair) border-fg",
  tickV: "absolute inset-y-0 left-1/2 w-0 border-l-(length:--border-hair) border-fg",
  /* The hatch is decorative; the label sits on a surface chip so it reads over the lines. */
  hatch: "absolute inset-0 size-full text-fg-muted",
  pending: "absolute inset-0 flex items-center justify-center",
  pendingLabel: "bg-surface px-3 py-2 font-mono text-data text-fg",
} as const;

/* Each tick is a small cross centred on its corner. */
const corners = ["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"] as const;

/** Hatch spacing in px: a 45° line every 12px (--space-3). */
const HATCH = 12;

export type PlateFrameProps = {
  /** Aspect ratio utility, e.g. `aspect-[16/10]`. */
  className?: string;
  /** Media, already sized to fill the clip box. */
  children: ReactNode;
};

/** Hairline frame + corner ticks. Children fill a clipped box inside it. */
export function PlateFrame({ className, children }: PlateFrameProps) {
  return (
    <div className={cn(plateClasses.frame, className)}>
      <div className={plateClasses.clip}>{children}</div>
      {corners.map((corner) => (
        <span key={corner} aria-hidden="true" className={cn(plateClasses.tick, corner)}>
          <span className={plateClasses.tickH} />
          <span className={plateClasses.tickV} />
        </span>
      ))}
    </div>
  );
}

export type PlatePendingProps = {
  /** Unique per page: the SVG pattern id. */
  id: string;
  /**
   * Accessible name of the placeholder image. Omit when the placeholder is
   * decorative (inside a link already named by its title).
   */
  label?: string;
};

/** The placeholder fill: 45° `--fg-muted` hatch, "Screenshot pending" centred. No image element. */
export function PlatePending({ id, label }: PlatePendingProps) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="absolute inset-0"
    >
      <svg aria-hidden="true" className={plateClasses.hatch}>
        <defs>
          <pattern id={id} width={HATCH} height={HATCH} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2={HATCH} stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div aria-hidden="true" className={plateClasses.pending}>
        <span className={plateClasses.pendingLabel}>Screenshot pending</span>
      </div>
    </div>
  );
}
