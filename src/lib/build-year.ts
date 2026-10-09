/**
 * The calendar year the site was built in (set in next.config.ts `env`, inlined
 * at build time), for the "Approved for build" stamp and the bill of materials'
 * years. Server Components may not read the clock during prerender, and a
 * cached clock read would make the page revalidate; the build year is static.
 */
function readBuildYear(): number {
  const year = Number(process.env.BUILD_YEAR);
  // Fail the build loudly rather than print "NaN" on the sheet.
  if (!Number.isInteger(year)) throw new Error("BUILD_YEAR is not set (next.config.ts env)");
  return year;
}

export const BUILD_YEAR = readBuildYear();
