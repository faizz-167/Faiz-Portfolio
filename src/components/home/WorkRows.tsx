"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Rule } from "@/components/layout/Rule";
import { HoverPreview, preloadPreview, type PreviewImage } from "@/components/motion/HoverPreview";
import { RuleDraw } from "@/components/motion/RuleDraw";
import { WidthFlex } from "@/components/motion/WidthFlex";
import type { Project } from "@/content";
import { cn } from "@/lib/cn";
import { requestRefresh } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { cubicBeziers, durationsS } from "@/lib/motion/tokens";

/** Desktop hover-intent before a row opens (phase10.md P10.2). */
const HOVER_INTENT_MS = 120;

export type WorkRowData = {
  /** Project slug. */
  id: string;
  title: string;
  /** What the row shows: one display line, stretched on hover. */
  indexTitle: string;
  /** Year (when known), role, team, status — in that order, already filtered. */
  meta: string[];
  inProgress: boolean;
  cover?: Project["cover"];
  /** Open-row content (Server Component output). */
  panel: ReactNode;
};

const rowClasses = {
  list: "relative",
  /*
   * The raised fill bleeds one --space-4 into the page margin so the row's
   * text stays on the content line whether it is open or not. The fill is a
   * cut (no colour tween); Motion moves rows by transform only.
   */
  row: "relative -mx-4 px-4",
  open: "bg-raised",
  /* The status line is said in words and drawn dashed (design.md §2.3). */
  dashed: "border-dashed",
  button: [
    "group/row flex w-full min-h-touch cursor-pointer flex-col items-start gap-3 py-5 text-left",
    "lg:flex-row lg:items-baseline lg:justify-between lg:gap-gutter",
  ].join(" "),
  /* Inactive rows fade to the muted mix (62%), opacity only. */
  title: "min-w-0 font-display text-h1 transition-opacity duration-(--dur-base) ease-out",
  dim: "opacity-(--muted-mix)",
  meta: "font-mono text-data text-fg-muted lg:shrink-0 lg:text-right",
  panel: "pb-6",
  /* Touch layouts show the cover inside the open row instead of the cursor panel. */
  inlineCover: "mb-5 block h-auto w-full border-hair border-fg pointer-fine:hidden",
} as const;

/**
 * Work index rows (P10.1–P10.3): a disclosure list. Each row's title is a
 * `<button aria-expanded aria-controls>`; one row is open at a time. Opens on
 * click/tap/Enter/Space, and with a mouse after 120ms of hover-intent.
 * Rows move with Motion `layout` (transform); the panel fades in through
 * `AnimatePresence`. Without JavaScript every panel prints in a <noscript>.
 *
 * Preview: the cursor panel (HoverPreview) and the touch inline image only
 * exist for projects with a `cover`. None has one yet, so neither renders.
 */
export function WorkRows({ rows }: { rows: readonly WorkRowData[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const intent = useRef<{ id: string; timer: ReturnType<typeof setTimeout> } | null>(null);
  /* A row a mouse click just closed: hover-intent must not reopen it under the pointer. */
  const suppressed = useRef<string | null>(null);
  const baseId = useId();
  const reduced = useReducedMotion();

  const covers: PreviewImage[] = rows.flatMap((row) => (row.cover ? [{ id: row.id, ...row.cover }] : []));

  const cancelIntent = () => {
    if (intent.current) clearTimeout(intent.current.timer);
    intent.current = null;
  };

  // Hidden routes (<Activity>) keep this mounted: the open row and the preview
  // reset on hide, so the page comes back closed.
  useLayoutEffect(() => {
    return () => {
      if (intent.current) clearTimeout(intent.current.timer);
      intent.current = null;
      suppressed.current = null;
      setOpenId(null);
      setPreviewId(null);
    };
  }, []);

  // Opening or closing a row moves every scene below it: re-measure the
  // scroll-driven work (pin, rule draws, sheet tracker) once, coalesced.
  useEffect(() => {
    requestRefresh();
  }, [openId]);

  const onPointerMove = (row: WorkRowData) => (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === "touch") return;
    // Rows slide under a resting pointer while they animate; only a real move counts.
    if (event.movementX === 0 && event.movementY === 0) return;
    if (row.cover) setPreviewId(row.id);
    if (row.id === openId || row.id === suppressed.current || intent.current?.id === row.id) return;
    cancelIntent();
    intent.current = {
      id: row.id,
      timer: setTimeout(() => {
        intent.current = null;
        setOpenId(row.id);
      }, HOVER_INTENT_MS),
    };
  };

  const onPointerEnter = (row: WorkRowData) => (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType !== "touch" && row.cover) preloadPreview({ id: row.id, ...row.cover });
  };

  const onPointerLeave = (row: WorkRowData) => () => {
    if (intent.current?.id === row.id) cancelIntent();
    if (suppressed.current === row.id) suppressed.current = null;
  };

  const onToggle = (row: WorkRowData) => (event: MouseEvent<HTMLButtonElement>) => {
    cancelIntent();
    if (row.id === openId) {
      setOpenId(null);
      // detail 0 = keyboard activation; only a pointer stays over the row.
      if (event.detail > 0) suppressed.current = row.id;
      return;
    }
    suppressed.current = null;
    setOpenId(row.id);
  };

  const layoutTransition = { duration: reduced ? 0 : durationsS.base, ease: cubicBeziers.out };
  const fadeTransition = { duration: reduced ? 0 : durationsS.fast, ease: cubicBeziers.out };

  return (
    <LayoutGroup>
      <RuleDraw as="ul" className={rowClasses.list} onPointerLeave={() => setPreviewId(null)}>
        {rows.map((row) => {
          const open = row.id === openId;
          const buttonId = `${baseId}-${row.id}-button`;
          const panelId = `${baseId}-${row.id}-panel`;
          return (
            <motion.li
              key={row.id}
              layout="position"
              transition={layoutTransition}
              className={cn(rowClasses.row, open && rowClasses.open)}
              onPointerEnter={onPointerEnter(row)}
              onPointerMove={onPointerMove(row)}
              onPointerLeave={onPointerLeave(row)}
            >
              <Rule className={row.inProgress ? rowClasses.dashed : undefined} />
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={onToggle(row)}
                  className={rowClasses.button}
                >
                  <span className={cn(rowClasses.title, openId !== null && !open && rowClasses.dim)}>
                    {/* The short index name is what sighted users see; the full title stays the
                        button's accessible name. */}
                    <WidthFlex
                      mode="hover"
                      // font-display re-reads --wdth on this element (the parent's computed
                      // font-variation-settings would otherwise be inherited unchanged).
                      // Phones have no hover, so titles may wrap there instead of overflowing.
                      className="font-display max-sm:whitespace-normal"
                      aria-hidden={row.indexTitle !== row.title || undefined}
                    >
                      {row.indexTitle}
                    </WidthFlex>
                    {row.indexTitle !== row.title && <span className="sr-only">{row.title}</span>}
                  </span>
                  <span className={rowClasses.meta}>{row.meta.join(" · ")}</span>
                </button>
              </h3>
              <AnimatePresence initial={false} mode="popLayout">
                {open && (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={rowClasses.panel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fadeTransition}
                  >
                    {row.cover && (
                      <Image
                        src={row.cover.src}
                        alt={row.cover.alt}
                        width={row.cover.width}
                        height={row.cover.height}
                        sizes="(pointer: fine) 0px, 100vw"
                        className={rowClasses.inlineCover}
                      />
                    )}
                    {row.panel}
                  </motion.div>
                )}
              </AnimatePresence>
              <noscript>
                <div className={rowClasses.panel}>{row.panel}</div>
              </noscript>
            </motion.li>
          );
        })}
      </RuleDraw>
      {covers.length > 0 && <HoverPreview items={covers} activeId={previewId} surface="paper" />}
    </LayoutGroup>
  );
}
