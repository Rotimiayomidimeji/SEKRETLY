import type { ReactNode } from "react";
import { PageContainer } from "./PageContainer";
import { MarketingNavbar } from "@/components/navigation/MarketingNavbar";
export function MarketingShell({ children }: { children: ReactNode }) { return <main className="min-h-screen bg-[var(--background)] text-white"><PageContainer><MarketingNavbar />{children}</PageContainer></main>; }
