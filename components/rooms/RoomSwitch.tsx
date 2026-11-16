"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Only for room owners: a "My room" button on their normal Sekretly screens, so they always know their
// login also runs a room, and can jump to its desk (the desk has "My Sekretly" to come back).
export function RoomSwitch({ name, logoUrl, accent }: { name: string; logoUrl: string | null; accent: string }) {
  const path = usePathname();
  if (path.startsWith("/desk") || path.startsWith("/onboarding")) return null;
  return (
    <Link
      href="/desk"
      aria-label={"Go to your room, " + name}
      style={{ position: "fixed", left: 12, bottom: 86, zIndex: 25, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 6px", borderRadius: 99, background: "rgba(20,14,26,.94)", color: "#fff", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 12px 30px rgba(0,0,0,.4)", textDecoration: "none", fontWeight: 800, fontSize: 13.5, fontFamily: "var(--font-body), system-ui, sans-serif" }}
    >
      <span style={{ width: 30, height: 30, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", overflow: "hidden", fontSize: 12, flex: "none" }}>
        {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.slice(0, 1).toUpperCase()}
      </span>
      My room
    </Link>
  );
}
