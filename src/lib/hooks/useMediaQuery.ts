import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = () => false;

/** Non-hook read of a media query; false on the server. */
export function matchesMediaQuery(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

/**
 * Live `matchMedia(query).matches`. The server snapshot is `false`, so the
 * server HTML and the hydration render agree; the real value arrives in the
 * render right after hydration. Callers must render something valid for
 * `false` (Principle 7: everything works without the show).
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
