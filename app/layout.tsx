import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, DM_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const accentFont = Caveat({ variable: "--font-accent", subsets: ["latin"] });
const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEKRETLY | Say it. Stay unknown.",
  description:
    "A premium anonymous social space for honest prompts, secret thoughts, and real reactions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`h-full antialiased ${displayFont.variable} ${accentFont.variable} ${bodyFont.variable}`}><body className="min-h-full">{children}</body></html>;
}
