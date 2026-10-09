import { FooterLinks } from "@/components/chrome/Footer";
import { LocalTime } from "@/components/home/LocalTime";
import { Container } from "@/components/layout/Container";
import { Scene, sceneTitleId } from "@/components/layout/Scene";
import { Stack } from "@/components/layout/Stack";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { WidthFlex } from "@/components/motion/WidthFlex";
import { Text } from "@/components/type/Text";
import { CopyButton } from "@/components/ui/CopyButton";
import { Link } from "@/components/ui/Link";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { profile } from "@/content";
import { BUILD_YEAR } from "@/lib/build-year";

const SCENE_ID = "contact";
const HOME = "/";

const contactClasses = {
  /*
   * - Every text here stays ≥ 7:1 (phase10 criterion): the signal surface's
   *   muted mix is 5.9:1, so muted resolves to --fg in this scene.
   * - The footer is folded in (owner decision): below 1024px the scene also
   *   reserves the dock height + safe area so the last line clears the dock.
   * - overflow-x-clip: a keyboard-focus stretch of the email on a touch
   *   device (sized for rest width there) must not add a page scrollbar.
   */
  scene: [
    "overflow-x-clip [--fg-muted:var(--fg)]",
    "pb-[calc(var(--section-y)+var(--dock-h)+env(safe-area-inset-bottom))] lg:pb-section",
  ].join(" "),
  /*
   * Mega, flush left; hanging punctuation per design.md §3.1. 0.9 leading:
   * at 0.82 the "y" of "Baby" meets "for". Size cap: globals.css "P10.6".
   */
  lines: "leading-hero [hanging-punctuation:first_last]",
  line: "block",
  /* The email's fit container (globals.css "P10.6 — Contact email"). */
  email: "flex flex-col items-start gap-5",
  emailLink: "block",
  emailLine: "font-display text-h2",
  links: "flex flex-col items-start",
  stamp: "flex items-center",
  /* Trace terminus: the right edge of the stamp cell's content, centred on the year. */
  via: "ml-auto size-0",
  footer: "flex flex-col gap-6",
} as const;

/**
 * Sheet 06 — Approval (P10.6). Signal. The two contact lines from
 * `profile.copy.contactLines` in mega, revealed line by line; the email (copy
 * button + mailto); the title block that ends the page and carries the folded
 * footer. The trace ends at the via in the "Approved for build" cell.
 */
export function Contact() {
  const [firstLine, secondLine] = profile.copy.contactLines;
  const links = profile.links.map((link) => (
    // The resume is a PDF in /public: a plain new-tab link, never a client route.
    <Link key={link.label} href={link.href} external>
      {link.label}
    </Link>
  ));

  return (
    <Scene id={SCENE_ID} sheet="Sheet 06 — Approval" surface="signal" className={contactClasses.scene}>
      <Container>
        <Stack gap={9}>
          <Text
            variant="mega"
            as="h2"
            id={sceneTitleId(SCENE_ID)}
            data-contact-lines=""
            className={contactClasses.lines}
          >
            <SplitReveal as="span" data-contact-line="" className={contactClasses.line}>
              {firstLine}
            </SplitReveal>
            <SplitReveal as="span" data-contact-line="" className={contactClasses.line}>
              {secondLine}
            </SplitReveal>
          </Text>

          <div data-email-fit="" className={contactClasses.email}>
            <Magnetic>
              <Link variant="plain" href={`mailto:${profile.email}`} className={contactClasses.emailLink}>
                <WidthFlex
                  mode="hover"
                  data-email-line=""
                  style={{ "--email-chars": profile.email.length }}
                  className={contactClasses.emailLine}
                >
                  {profile.email}
                </WidthFlex>
              </Link>
            </Magnetic>
            <CopyButton value={profile.email} label="Copy email" />
          </div>

          <footer className={contactClasses.footer}>
            <TitleBlock
              columns={{ base: 2, md: 3, lg: 6 }}
              cells={[
                { label: "Drawn by", value: profile.name },
                {
                  label: "Location",
                  value: (
                    <>
                      <span className="block">{profile.location}</span>
                      <LocalTime timeZone={profile.timeZone} />
                    </>
                  ),
                },
                { label: "Availability", value: profile.copy.availability, span: 2 },
                { label: "Links", value: <span className={contactClasses.links}>{links}</span> },
                {
                  label: "Approved for build",
                  value: (
                    <span className={contactClasses.stamp}>
                      {BUILD_YEAR}
                      <span data-via="right" aria-hidden="true" className={contactClasses.via} />
                    </span>
                  ),
                },
              ]}
            />
            <FooterLinks pathname={HOME} />
          </footer>
        </Stack>
      </Container>
    </Scene>
  );
}
