"use client";

import { useState } from "react";

import { saveMode, SkLink } from "@/lib/sk/runtime";
import { uploadMedia } from "@/lib/upload-client";

// The admin frame (side menu on wide screens, bottom bar + "More" sheet on phones, the top tabs and the
// light/dark switch), the same as Overview, Traffic, Users and Reports.

type Page = "overview" | "traffic" | "users" | "rooms" | "reports" | "categories" | "ads";
const PAGES: [Page, string, string, string][] = [
  ["overview", "/admin", "Overview", "Overview"],
  ["traffic", "/admin/traffic", "Traffic manager", "Traffic"],
  ["users", "/admin/users", "Users", "Users"],
  ["rooms", "/admin/rooms", "Rooms", "Rooms"],
  ["reports", "/admin/reports", "Reports & warnings", "Reports"],
  ["categories", "/admin/categories", "Report categories", "Categories"],
  ["ads", "/admin/ads", "Ads & AdSense", "Ads"],
];
const ICON: Partial<Record<Page, React.ReactNode>> = {
  overview: <><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>,
  traffic: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  rooms: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>,
  reports: <><path d="M5 22V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
};

export function AdminShell({ page, mode: initial, reviewCount, title, sub, action, children }: { page: Page; mode: string; reviewCount: number; title: string; sub: string; action?: React.ReactNode; children: React.ReactNode }) {
  const [mode, setMode] = useState(initial === "light" ? "light" : "dark");
  const dark = mode !== "light";
  return (
    <div className="sk" data-mode={mode}>
      <div className="shell">
        <nav className="side" aria-label="Admin">
          <SkLink href="/admin" className="logo" style={{ padding: "0 10px 4px" }}>
            <span className="logo-mark">S</span>
            <span className="logo-word">Admin</span>
          </SkLink>
          <span className="muted" style={{ fontSize: 12, padding: "0 12px 16px" }}>admin · full access</span>
          {PAGES.map(([k, href, label]) => (
            <SkLink key={k} href={href} className="nav-i" aria-current={page === k ? "page" : undefined}>
              {label}
              {k === "reports" && reviewCount > 0 && <span className="count">{reviewCount}</span>}
            </SkLink>
          ))}
          <SkLink href="/admin/account" className="nav-i" style={{ marginTop: "auto" }}>Account & log out</SkLink>
        </nav>
        <nav className="anav" aria-label="Admin">
          {(["overview", "traffic", "rooms", "reports"] as Page[]).map((k) => {
            const p = PAGES.find((x) => x[0] === k)!;
            return (
              <SkLink key={k} href={p[1]} className="anav-i" aria-current={page === k ? "page" : undefined}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[k]}</svg>
                <span>{p[3]}</span>
                {k === "reports" && reviewCount > 0 && <b className="anav-badge">{reviewCount}</b>}
              </SkLink>
            );
          })}
          <details className="anav-more">
            <summary className="anav-i">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
              <span>More</span>
            </summary>
            <div className="anav-sheet">
              <div className="anav-grab" aria-hidden="true" />
              <SkLink href="/admin/users" className="anav-s">Users</SkLink>
              <SkLink href="/admin/categories" className="anav-s">Report categories</SkLink>
              <SkLink href="/admin/ads" className="anav-s">Ads & AdSense</SkLink>
              <SkLink href="/admin/account" className="anav-s" style={{ color: "var(--muted)" }}>Account & log out</SkLink>
            </div>
          </details>
        </nav>
        <div className="main" style={{ paddingBottom: 40 }}>
          <div className="wrap" style={{ maxWidth: 1180 }}>
            <header className="topbar" style={{ flexWrap: "wrap" }}>
              <div className="grow">
                <h1 style={{ fontSize: 28 }}>{title}</h1>
                <div className="muted" style={{ fontSize: 13 }}>{sub}</div>
              </div>
              {action}
              <button
                className="mode-btn tap"
                onClick={() => {
                  const n = dark ? "light" : "dark";
                  saveMode(n);
                  setMode(n);
                }}
                aria-label={"Switch to " + (dark ? "light" : "dark") + " mode"}
              >
                {dark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2z" /></svg>
                )}
              </button>
            </header>
            <div className="rail adm-nav-rail" style={{ gap: 8, marginBottom: 14 }}>
              {PAGES.map(([k, href, , chip]) => (
                <SkLink key={k} href={href} className={"chip" + (page === k ? " on" : "")}>{chip}</SkLink>
              ))}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Any colour: drag in the picker, type a hex code, or tap a preset. */
export function ColorPicker({ value, onChange, label = "Colour" }: { value: string; onChange: (hex: string) => void; label?: string }) {
  const [text, setText] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setText(value);
  }
  const PRESETS = ["#ff3b8d", "#e0115f", "#7a3cff", "#1f4fd8", "#14b8ff", "#0f9f6e", "#9be22f", "#ffb02e", "#ff6b2c", "#151113"];
  return (
    <div>
      <div className="label">{label}</div>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <label style={{ position: "relative", width: 52, height: 52, borderRadius: 14, background: value, border: "2px solid var(--line)", cursor: "pointer", flex: "none" }} title="Pick any colour">
          <input type="color" aria-label={label + ": pick any colour"} value={value} onChange={(e) => onChange(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
        </label>
        <input
          className="field"
          aria-label={label + " hex code"}
          value={text}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
            setText(v);
            if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
          }}
          style={{ minHeight: 48, width: 120, fontFamily: "ui-monospace, monospace", fontSize: 15 }}
        />
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((c) => (
            <button key={c} type="button" className="tap" aria-label={"Use " + c} aria-pressed={value.toLowerCase() === c} onClick={() => onChange(c)} style={{ width: 30, height: 30, borderRadius: 9, background: c, border: value.toLowerCase() === c ? "3px solid var(--ink)" : "2px solid var(--line)", padding: 0 }} />
          ))}
        </div>
      </div>
      <p className="hint">Tap the big square to drag through every colour, or type a code like #ff3b8d.</p>
    </div>
  );
}

/** The five room looks as small previews to pick from. */
export function ThemePicker({ value, onChange, accent }: { value: string; onChange: (t: string) => void; accent: string }) {
  const T: [string, string, string, string, string][] = [
    ["press", "Press", "Newspaper", "#f2ebdd", "#151113"],
    ["neon", "Neon", "On-air booth", "#07050a", "#fbf6fa"],
    ["stack", "Stack", "Swipe cards", "#09090d", "#ffffff"],
    ["chat", "Chat", "Group chat", "#0f1419", "#eef3f6"],
    ["pop", "Pop", "Stickers", "#fff4fb", "#1a0f22"],
  ];
  return (
    <div>
      <div className="label">Room look</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
        {T.map(([id, name, sub, bg, ink]) => (
          <button key={id} type="button" className="tap" aria-pressed={value === id} onClick={() => onChange(id)} style={{ padding: 0, borderRadius: 16, overflow: "hidden", border: value === id ? "3px solid var(--pink)" : "2px solid var(--line)", background: "var(--card)", textAlign: "left", color: "var(--ink)" }}>
            <span style={{ display: "block", height: 64, background: bg, position: "relative" }}>
              <span style={{ position: "absolute", left: 10, right: 10, top: 12, height: 10, borderRadius: id === "press" ? 0 : 6, background: ink, opacity: 0.85 }} />
              <span style={{ position: "absolute", left: 10, width: "58%", top: 30, height: 22, borderRadius: id === "press" ? 0 : id === "chat" ? "4px 12px 12px 12px" : 8, background: accent, transform: id === "pop" ? "rotate(-3deg)" : undefined, border: id === "pop" ? "2px solid #1a0f22" : undefined }} />
            </span>
            <span style={{ display: "block", padding: "6px 8px 8px" }}>
              <b style={{ display: "block", fontSize: 13 }}>{name}</b>
              <span className="muted" style={{ fontSize: 11.5 }}>{sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The channel's logo: upload a picture (it replaces the initials everywhere in the room), or remove it. */
export function LogoUpload({ value, name, accent, linkId, onChange }: { value: string | null; name: string; accent: string; linkId: string; onChange: (url: string | null) => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <div className="label">Channel logo</div>
      <div className="row" style={{ gap: 12 }}>
        <span style={{ width: 64, height: 64, borderRadius: 18, background: accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 22, overflow: "hidden", flex: "none" }}>
          {value ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.slice(0, 2).toUpperCase()}
        </span>
        <label className="btn btn-sm tap" style={{ cursor: "pointer" }}>
          {busy ? "Uploading…" : value ? "Change logo" : "Upload logo"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              setErr(null);
              const fd = new FormData();
              fd.append("file", f);
              fd.append("linkId", linkId);
              const r = await uploadMedia(fd);
              if (!r.ok) setErr(r.error);
              else if (r.kind !== "photo") setErr("Use a picture (JPG, PNG or WebP).");
              else await onChange(r.url);
              setBusy(false);
            }}
          />
        </label>
        {value && <button className="btn btn-sm btn-ghost tap" onClick={() => void onChange(null)}>Remove</button>}
      </div>
      {err ? <p className="hint" style={{ color: "var(--bad)" }}>{err}</p> : <p className="hint">Square works best. It shows in the room header, on the host’s replies and on voice notes.</p>}
    </div>
  );
}
