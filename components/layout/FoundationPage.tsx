import Link from "next/link";
import { PageContainer } from "./PageContainer";
import { MarketingNavbar } from "@/components/navigation/MarketingNavbar";

export function FoundationPage({ title, description }: { title: string; description: string }) {
  return <main className="min-h-screen bg-[var(--background)] text-white"><PageContainer><MarketingNavbar /><section className="flex min-h-[70vh] flex-col justify-center py-20"><p className="text-xs font-bold uppercase tracking-[.24em] text-[var(--electric-blue)]">SEKRETLY foundation</p><h1 className="mt-5 max-w-3xl text-5xl font-black tracking-[-.06em] sm:text-7xl">{title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)]">{description}</p><Link href="/" className="mt-8 w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-black">Back home</Link></section></PageContainer></main>;
}
