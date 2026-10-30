import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

import { AdFiller } from "@/components/layout/AdFiller";
import { Analytics } from "@/components/layout/Analytics";
import { PageLoader } from "@/components/layout/PageLoader";
import { PushBridge } from "@/components/layout/PushBridge";
import { ShareKit } from "@/components/layout/ShareKit";

import "./globals.css";

// The UI kit refers to these as var(--font-display) and var(--font-body). Loaded the way the mockup loads them:
// Bricolage with its optical-size axis (big headings change shape), DM Sans capped at 700 (so 800 renders as 700).
const displayFont = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], axes: ["opsz"] });
const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sekretlyy.vercel.app"),
  title: "Sekretly · Say it. Stay unknown.",
  description: "Anonymous messages and party games. Share a link, see what your people really think.",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Sekretly", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0811",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        {/* light/dark (the sk-mode cookie) on <html> before the first paint, so loading screens match the page */}
        <script dangerouslySetInnerHTML={{ __html: "try{var m=/(?:^|; )sk-mode=(light|dark)/.exec(document.cookie);document.documentElement.dataset.mode=m?m[1]:'dark'}catch(e){}" }} />
      </head>
      <body>
        {children}
        <PageLoader />
        <PushBridge />
        <ShareKit />
        <Analytics />
        <AdFiller />
      </body>
    </html>
  );
}
