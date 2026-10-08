"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Trace } from "@/components/motion/Trace";

/* Opens the trace's start gate. Default no-op: a scene rendered outside TracedScenes. */
const ArmTraceContext = createContext<() => void>(() => {});

/** The hero calls this when its compile sequence ends (P9.4): the trace starts from its via. */
export function useArmTrace() {
  return useContext(ArmTraceContext);
}

/**
 * The positioned wrapper every home scene sits in, with the one signal trace
 * routed through each scene's `[data-via]` (document order). Scenes stay
 * Server Components; they are passed through as children.
 */
export function TracedScenes({ children }: { children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  const arm = useCallback(() => setArmed(true), []);
  return (
    <ArmTraceContext value={arm}>
      <div className="relative">
        {children}
        <Trace armed={armed} />
      </div>
    </ArmTraceContext>
  );
}
