import { Fragment } from "react";
import { Link } from "@/components/ui/Link";

/** One "Used in" project: a link when it has a case page, plain text otherwise (IAM, in progress). */
export type ToolUsageItem = { slug: string; label: string; href?: string };

/** A toolkit face as both layers render it. */
export type GaugeFace = {
  id: string;
  name: string;
  paragraph: string;
  /** The face's categories in sentence case, e.g. "Language · Backend · Data · Infra". */
  label: string;
  /** 1-based position ("01"). */
  index: number;
  tools: ToolData[];
};

/** A tool's data as the toolkit shows it, computed on the server from content (P11b.2). */
export type ToolData = {
  id: string;
  name: string;
  /** Build year − since + 1 (inclusive), from the data. */
  years: number;
  usedIn: ToolUsageItem[];
};

export function yearsLabel(years: number) {
  return `${years} ${years === 1 ? "year" : "years"}`;
}

/*
 * Parts shared by the toolkit's readable list (server) and gauge (client).
 * No server or client APIs, so they render in either tree.
 */

/**
 * "3 years · Used in SpeechPath, ZingDesk" in mono. Shared by the readable
 * list (inline after the tool name) and the gauge readout, so both say the same.
 * No server or client APIs: renders in either tree.
 */
export function ToolUsage({ tool, className }: { tool: ToolData; className?: string }) {
  return (
    <span className={className}>
      <span data-tool-years={tool.years}>{yearsLabel(tool.years)}</span>
      {" · Used in "}
      {tool.usedIn.length === 0 ? (
        <>
          <span aria-hidden="true">—</span>
          <span className="sr-only">no listed project</span>
        </>
      ) : (
        tool.usedIn.map((item, i) => (
          <Fragment key={item.slug}>
            {i > 0 && ", "}
            {item.href ? (
              <Link variant="inline" href={item.href} data-tool-usage={item.slug}>
                {item.label}
              </Link>
            ) : (
              <span data-tool-usage={item.slug}>{item.label}</span>
            )}
          </Fragment>
        ))
      )}
    </span>
  );
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** The face word with its accent full stop (design.md: sentence case, never caps). */
export function FaceWord({ name }: { name: string }) {
  return (
    <>
      {name}
      <span className="text-accent">.</span>
    </>
  );
}

/** The face paragraph, opening with the bold lead word. */
export function FaceParagraph({ face }: { face: Pick<GaugeFace, "name" | "paragraph"> }) {
  return (
    <>
      <strong>{face.name}.</strong> {face.paragraph}
    </>
  );
}
