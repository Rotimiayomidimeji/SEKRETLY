import type { ReactNode } from "react";
export function AdSurface({ children }: { children?: ReactNode }) { return <aside aria-label="Sponsored content" className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-4 text-xs text-white/35">{children ?? "Ad surface reserved for eligible public discovery content."}</aside>; }
