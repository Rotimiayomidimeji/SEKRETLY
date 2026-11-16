import { Anton, Caveat, IBM_Plex_Mono, Newsreader } from "next/font/google";

// The Gist Press type: masthead (Anton), body (Newsreader), labels (IBM Plex Mono), the editor's red pen (Caveat).
// Loaded only on room pages (app/[username]/page.tsx, the desk); the CSS reads them as var(--gp-…) (app/sk/boards/Rooms.css).
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--gp-anton", display: "swap" });
const news = Newsreader({ subsets: ["latin"], variable: "--gp-news", style: ["normal", "italic"], display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--gp-mono", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--gp-hand", display: "swap" });

export const roomFonts = [anton.variable, news.variable, mono.variable, hand.variable].join(" ");
