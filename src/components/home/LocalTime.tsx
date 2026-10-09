"use client";

import { useLocalTime } from "@/lib/hooks/useLocalTime";

/** Live "HH:MM" for a time zone; `--:--` in the static HTML and until hydration. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  return <span>{useLocalTime(timeZone)}</span>;
}
