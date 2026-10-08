"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** How long the "Copied" label stays (design: 1.6s). */
const COPIED_MS = 1600;

type CopyStatus = "idle" | "copied" | "failed";

const copyClasses = {
  root: "inline-flex flex-wrap items-center gap-x-4 gap-y-2",
  /* Always mounted so assistive tech registers the region before it changes. */
  status: "font-mono text-data",
  failed: "text-error",
} as const;

export type CopyButtonProps = {
  /** Text written to the clipboard. */
  value: string;
  /** Sentence-case label. Default "Copy". */
  label?: string;
  /** Default "outline". */
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * Copies `value` with `navigator.clipboard.writeText`. Success: the label reads
 * "Copied" for 1.6s. Failure (no permission / insecure context): a visible
 * "Copy failed — select manually" in the surface's error colour. Both are
 * announced through an aria-live="polite" status region.
 * No browser API runs during render, so it prerenders under ensureStatic.
 */
export function CopyButton({
  value,
  label = "Copy",
  variant = "outline",
  size = "md",
  className,
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Routes stay mounted but hidden (<Activity>): effect cleanup runs on hide,
  // so clear the timer and drop transient feedback there.
  useLayoutEffect(() => {
    const pending = timer;
    return () => {
      clearTimeout(pending.current);
      pending.current = undefined;
      setStatus("idle");
    };
  }, []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), COPIED_MS);
    } catch {
      setStatus("failed");
    }
  }, [value]);

  return (
    <span className={cn(copyClasses.root, className)}>
      <Button variant={variant} size={size} icon="copy" onClick={copy}>
        {status === "copied" ? "Copied" : label}
      </Button>
      <span role="status" aria-live="polite" className={copyClasses.status}>
        {status === "copied" && <span className="sr-only">Copied to clipboard</span>}
        {status === "failed" && (
          <span className={copyClasses.failed}>Copy failed — select manually</span>
        )}
      </span>
    </span>
  );
}
