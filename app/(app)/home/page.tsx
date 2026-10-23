import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { logout } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Home" };

// Interim page until the Home screen is ported (Phase 3). It proves the account and session work end to end.
export default async function HomePage() {
  const user = await requireUser("/home");
  return (
    <div className="sk" data-mode={await getMode()} style={{ background: "var(--hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card rise" style={{ width: "100%", maxWidth: 420, padding: 24, textAlign: "center", boxShadow: "var(--shadow)" }}>
        <Image src={`/sk/${user.avatar}.png`} alt="" width={72} height={72} />
        <h1 style={{ marginTop: 10, fontSize: 28 }}>You’re in, @{user.username}</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
          Your account works. Your home screen, links and inbox are the next part of the build.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
          <Link href="/onboarding" className="btn btn-lg btn-block tap">Notifications &amp; install</Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ink btn-lg btn-block tap">Log out</button>
          </form>
        </div>
      </div>
    </div>
  );
}
