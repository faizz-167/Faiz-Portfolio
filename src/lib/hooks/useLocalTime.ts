import { useCallback, useSyncExternalStore } from "react";

/** Rendered on the server and during hydration (no `Date` in prerender). */
export const LOCAL_TIME_PLACEHOLDER = "--:--";

const MINUTE = 60_000;
const formatters = new Map<string, Intl.DateTimeFormat>();
const cache = new Map<string, { minute: number; value: string }>();

function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** "HH:MM" for `timeZone`, cached per minute so repeated snapshots are equal. */
function readTime(timeZone: string) {
  const now = Date.now();
  const minute = Math.floor(now / MINUTE);
  const hit = cache.get(timeZone);
  if (hit && hit.minute === minute) return hit.value;
  const value = formatter(timeZone).format(now);
  cache.set(timeZone, { minute, value });
  return value;
}

/** Calls `onTick` on every wall-clock minute boundary and when the tab returns. */
function subscribeMinutes(onTick: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    // Re-aligned each minute, so timer drift never accumulates.
    timer = setTimeout(() => {
      onTick();
      schedule();
    }, MINUTE - (Date.now() % MINUTE) + 50);
  };
  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    clearTimeout(timer);
    onTick();
    schedule();
  };
  schedule();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

const getServerSnapshot = () => LOCAL_TIME_PLACEHOLDER;

/**
 * Local time in `timeZone` (IANA, e.g. "Asia/Kolkata") as 24-hour "HH:MM".
 * Returns "--:--" on the server and during hydration, then the real time;
 * updates on minute boundaries. Hidden routes (<Activity>) unsubscribe, so no
 * timer runs off-screen.
 */
export function useLocalTime(timeZone: string) {
  const getSnapshot = useCallback(() => readTime(timeZone), [timeZone]);
  return useSyncExternalStore(subscribeMinutes, getSnapshot, getServerSnapshot);
}
