"use client";

import { useState } from "react";

import { SkLink } from "@/lib/sk/runtime";

type Props = {
  mode: string;
  username: string;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

// /admin/account: the admin account's password, and logging out. The admin isn't a member, so this replaces
// Settings › Account for it.
export default function AdminAccount({ mode, username, changePassword, logout }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    const r = await changePassword(current, next).catch(() => ({ ok: false, error: "Couldn’t save that. Try again." }));
    setBusy(false);
    if (r.ok) {
      setCurrent("");
      setNext("");
    }
    setNote(r.ok ? { ok: true, text: "New password set. Every other device was logged out." } : { ok: false, text: r.error ?? "Couldn’t save that." });
  };

  return (
    <div className="sk" data-mode={mode} style={{ minHeight: "100vh", padding: "32px 16px" }}>
      <main style={{ maxWidth: 440, margin: "0 auto" }}>
        <SkLink href="/admin" className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
          ← Admin overview
        </SkLink>
        <h1 style={{ fontSize: 28, margin: "14px 0 4px" }}>Admin account</h1>
        <p className="muted" style={{ fontSize: 14 }}>Signed in as @{username}. This account only opens the admin pages.</p>

        <form className="card" onSubmit={save} style={{ marginTop: 20, padding: 18, display: "grid", gap: 12 }}>
          <b style={{ fontSize: 16 }}>Change password</b>
          <label style={{ display: "grid", gap: 6, fontSize: 13.5, fontWeight: 700 }}>
            Current password
            <input className="field" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13.5, fontWeight: 700 }}>
            New password (12 characters or more)
            <input className="field" type="password" autoComplete="new-password" minLength={12} value={next} onChange={(e) => setNext(e.target.value)} required />
          </label>
          {note && (
            <p role="status" style={{ fontSize: 14, fontWeight: 700, color: note.ok ? "#5be0a0" : "var(--bad)" }}>
              {note.text}
            </p>
          )}
          <button className={"btn btn-cta btn-block" + (busy ? " sk-busy" : "")} disabled={busy || !current || next.length < 12}>
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>

        <form action={logout} style={{ marginTop: 14 }}>
          <button className="btn btn-block">Log out</button>
        </form>
      </main>
    </div>
  );
}
