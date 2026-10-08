import type { Metadata, Viewport } from "next";
import { Anybody, Martian_Mono, Newsreader } from "next/font/google";
import { Footer } from "@/components/chrome/Footer";
import { CONTENT_ID, SiteChrome } from "@/components/chrome/SiteChrome";
import { cn } from "@/lib/cn";
import { MotionProvider } from "@/providers/MotionProvider";
import "./globals.css";

// Display: width axis is the concept (design.md §3.1). wght is included by default.
const display = Anybody({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Arial Narrow", "Helvetica Neue", "Arial", "sans-serif"],
});

// Text: optical sizing + italic for in-sentence emphasis.
const text = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-text",
  display: "swap",
  fallback: ["Iowan Old Style", "Georgia", "Times New Roman", "serif"],
});

// Data: labels and values. Not preloaded — it is never the LCP text.
const mono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Portfolio",
};

// `cover` makes env(safe-area-inset-*) non-zero on notched phones (the dock pads with it).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(display.variable, text.variable, mono.variable)}
    >
      <body data-surface="ink">
        <MotionProvider>
          {/* Chrome and landmarks live here, once: under <Activity> pages stay
              mounted while hidden, so a per-page <main id> would be duplicated. */}
          <SiteChrome />
          {/* tabIndex -1: the skip link moves focus here. No ring on a container. */}
          <main id={CONTENT_ID} tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
