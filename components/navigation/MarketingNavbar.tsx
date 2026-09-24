import Link from "next/link";
import { siteConfig } from "@/config/site";
export function MarketingNavbar() { return <header className="flex items-center justify-between py-5"><Link href="/" className="font-black tracking-[.2em] text-white">{siteConfig.name}</Link><nav className="hidden gap-6 text-sm text-white/60 sm:flex"><Link href="/explore">Explore</Link><Link href="/how-it-works">How it works</Link><Link href="/safety">Safety</Link></nav></header>; }
