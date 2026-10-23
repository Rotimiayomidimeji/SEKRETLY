import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

// The UI kit refers to these as var(--font-display) and var(--font-body). Loaded the way the mockup loads them:
// Bricolage with its optical-size axis (big headings change shape), DM Sans capped at 700 (so 800 renders as 700).
const displayFont = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], axes: ["opsz"] });
const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sekretlyy.vercel.app"),
  title: "Sekretly · Say it. Stay unknown.",
  description: "Anonymous messages and party games. Share a link, see what your people really think.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0811",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
