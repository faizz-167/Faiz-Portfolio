import { useMediaQuery } from "./useMediaQuery";

export const POINTER_FINE_QUERY = "(pointer: fine)";

/**
 * True with a mouse/trackpad as the primary pointer. False on the server and
 * during hydration, so cursor-only UI (Crosshair, coordinates) mounts after it.
 */
export function usePointerFine() {
  return useMediaQuery(POINTER_FINE_QUERY);
}
