import type { Metadata } from "next";
import { Anybody, Martian_Mono, Newsreader } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(display.variable, text.variable, mono.variable)}
    >
      <body data-surface="ink">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
