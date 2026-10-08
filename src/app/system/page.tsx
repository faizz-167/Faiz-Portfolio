import type { Metadata } from "next";
import { Cluster } from "@/components/layout/Cluster";
import { Container } from "@/components/layout/Container";
import { Grid, GridCell, type GridSpan, type GridStart } from "@/components/layout/Grid";
import { Rule } from "@/components/layout/Rule";
import { Scene, sceneTitleId, type Surface } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Spec } from "@/components/type/Spec";
import { Text, type TextVariant } from "@/components/type/Text";

export const metadata: Metadata = {
  title: "System",
  description: "Token and primitive specimen sheet for visual QA.",
  robots: { index: false, follow: false },
};

const GRID_TOGGLE_ID = "grid-toggle";

/* Literal class strings so Tailwind generates them. */
const specimen = {
  surfaceSwatches: [
    { name: "--bg", className: "bg-surface" },
    { name: "--fg", className: "bg-fg" },
    { name: "--fg-muted", className: "bg-fg-muted" },
    { name: "--rule", className: "bg-rule" },
    { name: "--raised", className: "bg-raised" },
    { name: "--accent", className: "bg-accent" },
    { name: "--fault-c (error)", className: "bg-error" },
  ],
  rawSwatches: [
    { name: "ink", className: "bg-ink" },
    { name: "ink-2", className: "bg-ink-2" },
    { name: "ink-3", className: "bg-ink-3" },
    { name: "paper", className: "bg-paper" },
    { name: "paper-2", className: "bg-paper-2" },
    { name: "signal", className: "bg-signal" },
    { name: "signal-deep", className: "bg-signal-deep" },
    { name: "on-signal", className: "bg-on-signal" },
    { name: "fault", className: "bg-fault" },
    { name: "fault-deep", className: "bg-fault-deep" },
  ],
  spaces: [
    { name: "--space-1", className: "w-1" },
    { name: "--space-2", className: "w-2" },
    { name: "--space-3", className: "w-3" },
    { name: "--space-4", className: "w-4" },
    { name: "--space-5", className: "w-5" },
    { name: "--space-6", className: "w-6" },
    { name: "--space-7", className: "w-7" },
    { name: "--space-8", className: "w-8" },
    { name: "--space-9", className: "w-9" },
    { name: "--space-10", className: "w-10" },
    { name: "--space-11", className: "w-11" },
    { name: "--space-12", className: "w-12" },
  ],
  overlayColumns: [
    "",
    "",
    "",
    "",
    "hidden sm:block",
    "hidden sm:block",
    "hidden sm:block",
    "hidden sm:block",
    "hidden lg:block",
    "hidden lg:block",
    "hidden lg:block",
    "hidden lg:block",
  ],
} as const;

const typeScale: ReadonlyArray<{ variant: TextVariant; spec: string; sample: string }> = [
  { variant: "mega", spec: "text-mega · Anybody 800 · 64 → 220", sample: "Daddy's Home." },
  { variant: "h1", spec: "text-h1 · Anybody 800 · 44 → 112", sample: "Selected assemblies" },
  { variant: "h2", spec: "text-h2 · Anybody 700 · 34 → 64", sample: "Bill of materials" },
  { variant: "h3", spec: "text-h3 · Anybody 600 · 26 → 36", sample: "Backend and data" },
  {
    variant: "lede",
    spec: "text-lede · Newsreader 500 · 21 → 26 · 48ch",
    sample: "A set of engineering drawings for one person: every page a sheet, every project an assembly.",
  },
  {
    variant: "body",
    spec: "text-body · Newsreader 400 · 17 → 19 · 62ch",
    sample:
      "Body copy sits on a measure of sixty-two characters at most, so a line reads in one sweep of the eye. Rules, grids and numbering only appear when they say something true about the work, and the signal colour is kept for the trace, focus and the active state.",
  },
  {
    variant: "small",
    spec: "text-small · Newsreader 400 · 14 → 15 · 62ch",
    sample: "Captions, table cells and notes use the small style. It stays inside its columns.",
  },
  { variant: "data", spec: "text-data · Martian Mono 400 · 11.5 → 12.5", sample: "Rev. B · 2024 · x 0412 · y 0288" },
];

/* Specimens are not document headings: display variants render as div, data as p. */
const specimenElement: Record<TextVariant, "div" | "p"> = {
  mega: "div",
  h1: "div",
  h2: "div",
  h3: "div",
  lede: "p",
  body: "p",
  small: "p",
  data: "p",
};

const gridDemo: ReadonlyArray<{ label: string; span: GridSpan; start?: GridStart }> = [
  { label: "span 4 · 8 · 12", span: { base: "full", md: "full", lg: "full" } },
  { label: "span 4 · 4 · 6", span: { base: 4, md: 4, lg: 6 } },
  { label: "span 4 · 4 · 6", span: { base: 4, md: 4, lg: 6 } },
  { label: "span 2 · 2 · 3", span: { base: 2, md: 2, lg: 3 } },
  { label: "span 2 · 2 · 3", span: { base: 2, md: 2, lg: 3 } },
  { label: "span 2 · 2 · 3", span: { base: 2, md: 2, lg: 3 } },
  { label: "span 2 · 2 · 3", span: { base: 2, md: 2, lg: 3 } },
  { label: "start 2 · 3 · 4, span 3 · 6 · 8", span: { base: 3, md: 6, lg: 8 }, start: { base: 2, md: 3, lg: 4 } },
];

const specItems = [
  { term: "Role", detail: "Frontend, team of 2" },
  { term: "Stack", detail: "Next.js, TypeScript, PostgreSQL" },
  { term: "Year", detail: "2024" },
  { term: "Status", detail: "Shipped" },
] as const;

function GridToggle() {
  return (
    <label
      htmlFor={GRID_TOGGLE_ID}
      className="inline-flex min-h-touch cursor-pointer items-center gap-2 font-mono text-data"
    >
      Show grid overlay
    </label>
  );
}

/** Fixed column overlay; shown by the CSS-only checkbox via :has(). No client JS. */
function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-overlay hidden group-has-[#grid-toggle:checked]:block"
    >
      <Container className="h-full">
        <div className="grid h-full grid-cols-subgrid [outline:var(--border-hair)_solid_var(--accent)]">
          {specimen.overlayColumns.map((visibility, index) => (
            <div
              key={index}
              data-grid-column={index + 1}
              className={`h-full bg-accent/10 ${visibility}`}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

function SceneHeading({ id, children }: { id: string; children: string }) {
  return (
    <Text variant="h2" id={sceneTitleId(id)}>
      {children}
    </Text>
  );
}

function TextSpecimen({ surface }: { surface: Surface }) {
  const id = `text-${surface}`;
  return (
    <Scene id={id} sheet={`System — text on ${surface}`} surface={surface}>
      <Container>
        <Stack gap={7}>
          <SceneHeading id={id}>{`Text on ${surface}`}</SceneHeading>
          <Stack gap={6}>
            {typeScale.map(({ variant, sample }) => (
              <Stack key={variant} gap={2}>
                <Text variant="data" tone="muted">
                  {variant}
                </Text>
                <Text variant={variant} as={specimenElement[variant]}>
                  {sample}
                </Text>
              </Stack>
            ))}
          </Stack>
          <Rule />
          <Stack gap={2}>
            <Text variant="data" tone="muted">
              Tones
            </Text>
            <Cluster gap={6} align="baseline">
              <Text variant="h3" as="p" tone="fg">
                fg
              </Text>
              <Text variant="h3" as="p" tone="muted">
                muted
              </Text>
              <Text variant="h3" as="p" tone="signal">
                signal
              </Text>
              <Text variant="h3" as="p" className="text-error">
                error
              </Text>
            </Cluster>
          </Stack>
        </Stack>
      </Container>
    </Scene>
  );
}

export default function SystemPage() {
  return (
    <main className="group">
      <input
        type="checkbox"
        id={GRID_TOGGLE_ID}
        className="fixed top-3 right-3 z-overlay size-5 cursor-pointer accent-accent"
        aria-label="Show grid overlay"
      />
      <GridOverlay />

      <Scene id="system" sheet="System — specimen" surface="ink">
        <Container>
          <Stack gap={7}>
            <Text variant="h1" id={sceneTitleId("system")}>
              System
            </Text>
            <Text variant="lede" tone="muted">
              Every token and layout primitive on one sheet, for visual QA. This page is not indexed.
            </Text>
            <Cluster gap={2}>
              <Text variant="data" tone="muted">
                Grid overlay: the checkbox in the top-right corner, or
              </Text>
              <GridToggle />
            </Cluster>
          </Stack>
        </Container>
      </Scene>

      <Scene id="colour" sheet="System — colour" surface="paper">
        <Container>
          <Stack gap={7}>
            <SceneHeading id="colour">Colour</SceneHeading>
            <Stack gap={6}>
              {(["ink", "paper", "signal"] as const).map((surface) => (
                <div key={surface} data-surface={surface} className="border-hair border-rule p-5">
                  <Stack gap={5}>
                    <Text variant="data">{`data-surface="${surface}"`}</Text>
                    <Cluster gap={5} align="start">
                      {specimen.surfaceSwatches.map((swatch) => (
                        <Stack key={swatch.name} gap={2}>
                          <div className={`size-8 border-hair border-rule ${swatch.className}`} />
                          <Text variant="data" tone="muted">
                            {swatch.name}
                          </Text>
                        </Stack>
                      ))}
                    </Cluster>
                  </Stack>
                </div>
              ))}
            </Stack>
            <Stack gap={5}>
              <Text variant="h3">Raw palette</Text>
              <Cluster gap={5} align="start">
                {specimen.rawSwatches.map((swatch) => (
                  <Stack key={swatch.name} gap={2}>
                    <div className={`size-8 border-hair border-rule ${swatch.className}`} />
                    <Text variant="data" tone="muted">
                      {swatch.name}
                    </Text>
                  </Stack>
                ))}
              </Cluster>
            </Stack>
          </Stack>
        </Container>
      </Scene>

      <Scene id="type" sheet="System — type scale" surface="ink">
        <Container>
          <Stack gap={7}>
            <SceneHeading id="type">Type scale</SceneHeading>
            <Stack gap={8}>
              {typeScale.map(({ variant, spec, sample }) => (
                <Stack key={variant} gap={3}>
                  <Text variant="data" tone="muted">
                    {spec}
                  </Text>
                  <Text variant={variant} as={specimenElement[variant]}>
                    {sample}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Scene>

      <Scene id="spacing" sheet="System — spacing" surface="paper">
        <Container>
          <Stack gap={7}>
            <SceneHeading id="spacing">Spacing</SceneHeading>
            <Stack gap={3}>
              {specimen.spaces.map((space) => (
                <Cluster key={space.name} gap={4}>
                  <Text variant="data" tone="muted" className="w-9 shrink-0">
                    {space.name}
                  </Text>
                  <div className={`h-3 shrink-0 bg-fg ${space.className}`} />
                </Cluster>
              ))}
            </Stack>
            <Text variant="small" tone="muted">
              Section rhythm: --section-y, applied as block padding on every scene.
            </Text>
          </Stack>
        </Container>
      </Scene>

      <Scene id="grid" sheet="System — grid" surface="ink">
        <Container>
          <Stack gap={7}>
            <SceneHeading id="grid">Grid</SceneHeading>
            <Cluster gap={2}>
              <Text variant="data" tone="muted">
                4 columns below 640px, 8 to 1023px, 12 from 1024px.
              </Text>
              <GridToggle />
            </Cluster>
            <Grid className="gap-y-3">
              {gridDemo.map((cell, index) => (
                <GridCell
                  key={index}
                  span={cell.span}
                  start={cell.start}
                  className="border-hair border-rule bg-raised p-3"
                >
                  <Text variant="data">{cell.label}</Text>
                </GridCell>
              ))}
            </Grid>
            <Stack gap={3}>
              <Text variant="data" tone="muted">
                Subgrid: a Grid spanning 4 · 6 · 8 columns from start 1 · 2 · 3, with cells on the page lines
              </Text>
              <Grid>
                <Grid
                  subgrid
                  span={{ base: 4, md: 6, lg: 8 }}
                  start={{ base: 1, md: 2, lg: 3 }}
                  className="gap-y-3 [outline:var(--border-hair)_solid_var(--rule)]"
                >
                  <GridCell span={{ base: 2, md: 3, lg: 4 }} className="bg-raised p-3">
                    <Text variant="data">2 · 3 · 4</Text>
                  </GridCell>
                  <GridCell span={{ base: 2, md: 3, lg: 4 }} className="bg-raised p-3">
                    <Text variant="data">2 · 3 · 4</Text>
                  </GridCell>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Scene>

      <Scene id="layout" sheet="System — layout primitives" surface="paper">
        <Container>
          <Stack gap={7}>
            <SceneHeading id="layout">Layout primitives</SceneHeading>

            <Stack gap={5}>
              <Text variant="h3">Rule</Text>
              <Stack gap={4}>
                <Text variant="data" tone="muted">
                  hair · 1px · --rule
                </Text>
                <Rule />
                <Text variant="data" tone="muted">
                  active · 1.5px · --accent
                </Text>
                <Rule emphasis="active" />
              </Stack>
              <Cluster gap={4} align="stretch" className="h-8">
                <Text variant="data">Left</Text>
                <Rule orientation="vertical" />
                <Text variant="data">Vertical</Text>
                <Rule orientation="vertical" emphasis="active" />
                <Text variant="data">Right</Text>
              </Cluster>
            </Stack>

            <Stack gap={5}>
              <Text variant="h3">Spec</Text>
              <Spec items={specItems} />
            </Stack>

            <Stack gap={5}>
              <Text variant="h3">Stack and Cluster</Text>
              <Cluster gap={6} align="start">
                <Stack gap={2} className="border-hair border-rule p-4">
                  <Text variant="data" tone="muted">
                    Stack gap 2
                  </Text>
                  <Text variant="small">Label to value</Text>
                </Stack>
                <Stack gap={5} className="border-hair border-rule p-4">
                  <Text variant="data" tone="muted">
                    Stack gap 5
                  </Text>
                  <Text variant="small">Item to item</Text>
                </Stack>
                <Cluster gap={4} justify="between" className="border-hair border-rule p-4">
                  <Text variant="data">Cluster</Text>
                  <Text variant="data" tone="muted">
                    gap 4
                  </Text>
                  <Text variant="data" tone="muted">
                    wraps
                  </Text>
                </Cluster>
              </Cluster>
            </Stack>
          </Stack>
        </Container>
      </Scene>

      <TextSpecimen surface="ink" />
      <TextSpecimen surface="paper" />
      <TextSpecimen surface="signal" />
    </main>
  );
}
