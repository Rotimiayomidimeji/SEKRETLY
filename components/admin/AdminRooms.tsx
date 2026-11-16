"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminShell, ColorPicker, LogoUpload, ThemePicker } from "@/components/admin/AdminShell";
import type { AdminRoomView, ReportedPost } from "@/features/rooms/queries";
import { useHost } from "@/lib/use-host";

// Admin › Rooms: make a room for a big channel (its host gets a one-time login), pick its look and colour,
// watch and control every room, and act on what readers report.

type R = { ok: boolean; error?: string };
type Created = { ok: true; username: string; password: string; handle: string } | { ok: false; error: string };
type Actions = {
  create: (i: { name: string; handle: string; accent: string; theme: string; takesAllowed: boolean; voiceAllowed: boolean }) => Promise<Created>;
  reset: (id: string) => Promise<{ ok: true; username: string; password: string } | { ok: false; error: string }>;
  set: (id: string, patch: { status?: "LIVE" | "CLOSED" | "SUSPENDED"; takesAllowed?: boolean; voiceAllowed?: boolean; theme?: string; accent?: string; logoUrl?: string | null }) => Promise<R>;
  remove: (id: string) => Promise<R>;
  post: (id: string, a: "remove" | "keep") => Promise<R>;
};

const STATUS: Record<string, [string, string, string]> = {
  LIVE: ["Open", "rgba(91,224,160,.16)", "var(--ok)"],
  CLOSED: ["Closed", "var(--card2)", "var(--muted)"],
  SUSPENDED: ["Suspended", "#c4213a", "#ffffff"],
};
const THEME_NAME: Record<string, string> = { press: "Press", neon: "Neon", stack: "Stack", chat: "Chat", pop: "Pop" };
const blank = { name: "", handle: "", accent: "#ff3b8d", theme: "neon", takesAllowed: true, voiceAllowed: true };

export function AdminRooms({ rooms, reported, mode, reviewCount, actions }: { rooms: AdminRoomView[]; reported: ReportedPost[]; mode: string; reviewCount: number; actions: Actions }) {
  const router = useRouter();
  const host = useHost();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cred, setCred] = useState<{ username: string; password: string; handle: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [delAsk, setDelAsk] = useState(false);
  const [look, setLook] = useState<{ theme: string; accent: string } | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2400);
  };
  const handle = (form.handle || form.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")).slice(0, 24);
  const shown = rooms.filter((r) => !q || (r.name + " " + r.handle).toLowerCase().includes(q.toLowerCase()));
  const room = sel ? (rooms.find((r) => r.id === sel) ?? null) : null;
  const credText = cred ? `Your Sekretly room is ready.\nLog in at ${host}/login\nUsername: ${cred.username}\nOne-time password: ${cred.password}\nYour room: ${host}/${cred.handle}\nYou'll pick your own password the first time you log in.` : "";
  const run = async (p: Promise<R>, ok: string) => {
    const r = await p;
    flash(r.ok ? ok : r.error || "That didn’t work.");
    router.refresh();
  };
  const openRoom = (id: string) => {
    const r = rooms.find((x) => x.id === id)!;
    setSel(id);
    setCred(null);
    setDelAsk(false);
    setLook({ theme: r.theme, accent: r.accent });
  };
  const openReports = reported.filter((p) => !done[p.id]);
  const copyCred = () => {
    void navigator.clipboard?.writeText(credText);
    setCopied(true);
  };

  return (
    <AdminShell
      page="rooms"
      mode={mode}
      reviewCount={reviewCount}
      title="Rooms"
      sub="Verified rooms for big channels. We make them, the host runs them. No self sign-up."
      action={
        <button
          className="btn btn-cta tap"
          onClick={() => {
            setCreating(true);
            setErr(null);
            setCred(null);
            setForm(blank);
          }}
        >
          + New room
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {[
          ["Open rooms", String(rooms.filter((r) => r.status === "LIVE").length), rooms.length + (rooms.length === 1 ? " room" : " rooms") + " in all"],
          ["In rooms now", rooms.reduce((a, r) => a + r.reading, 0).toLocaleString("en-US"), "people reading"],
          ["Messages today", String(rooms.reduce((a, r) => a + r.tipsToday, 0)), "sent to rooms"],
          ["Waiting for hosts", String(rooms.reduce((a, r) => a + r.onDesk, 0)), "not posted yet"],
          ["Reported posts", String(openReports.length), openReports.length ? "need a look" : "all clear"],
        ].map(([l, v, s]) => (
          <div key={l} className="card kpi">
            <div className="muted" style={{ fontSize: 12.5 }}>{l}</div>
            <div className="v">{v}</div>
            <div className="muted" style={{ fontSize: 12 }}>{s}</div>
          </div>
        ))}
      </div>

      {openReports.length > 0 && (
        <section className="card" style={{ marginTop: 12, padding: 18, borderColor: "var(--bad)" }}>
          <div className="row">
            <h2 className="grow" style={{ fontSize: 18 }}>Reported posts</h2>
            <span className="muted" style={{ fontSize: 12.5 }}>The host sees these too and can take them down</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {openReports.map((p) => (
              <div key={p.id} className="card" style={{ padding: 14, background: "var(--card2)" }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <b>{p.room}</b>
                  <span className="muted" style={{ fontSize: 12.5 }}>/{p.handle} · #{p.number} · {p.kind === "voice" ? "voice note" : p.kind} · {p.age}</span>
                  <span className="grow" />
                  <span style={{ padding: "3px 9px", borderRadius: 99, background: "rgba(255,79,109,.16)", color: "var(--bad)", fontWeight: 800, fontSize: 12 }}>{p.reports} {p.reports === 1 ? "report" : "reports"}</span>
                </div>
                {p.text && <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.45, whiteSpace: "pre-line" }}>{p.text}</p>}
                {p.audioUrl && <audio controls preload="none" src={p.audioUrl} style={{ width: "100%", marginTop: 8 }} />}
                {p.take && <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>Host’s reply: {p.take}</p>}
                <div className="row" style={{ gap: 8, marginTop: 10 }}>
                  <Link href={"/" + p.handle} target="_blank" className="btn btn-sm">See it in the room</Link>
                  <span className="grow" />
                  <button
                    className="btn btn-sm tap"
                    onClick={async () => {
                      setDone({ ...done, [p.id]: "keep" });
                      await run(actions.post(p.id, "keep"), "Kept. Reports cleared.");
                    }}
                  >
                    Keep it
                  </button>
                  <button
                    className="btn btn-sm btn-danger tap"
                    onClick={async () => {
                      setDone({ ...done, [p.id]: "remove" });
                      await run(actions.post(p.id, "remove"), "Removed from the room");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "14px 16px", gap: 10, flexWrap: "wrap" }}>
          <h2 className="grow" style={{ fontSize: 18 }}>All rooms</h2>
          <input className="field" aria-label="Search rooms" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or handle" style={{ minHeight: 42, maxWidth: 240, fontSize: 14 }} />
        </div>
        {rooms.length === 0 ? (
          <p className="muted" style={{ padding: "26px 16px", textAlign: "center" }}>No rooms yet. Tap “New room” to make the first one.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 900 }}>
              <thead>
                <tr className="muted" style={{ textAlign: "left", fontSize: 12 }}>
                  {["Room", "Look", "Host", "Status", "In now", "Today", "Waiting", "Posts", "Reports", "Host last in"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} onClick={() => openRoom(r.id)} style={{ cursor: "pointer", borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: 12 }}>
                      <div className="row" style={{ gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: 10, background: r.accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900 }}>{r.name.slice(0, 1).toUpperCase()}</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <b>{r.name}</b>
                          <div className="muted" style={{ fontSize: 12.5 }}>/{r.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>{THEME_NAME[r.theme] ?? r.theme}</td>
                    <td style={{ padding: 12 }}>
                      @{r.host}
                      {!r.ready && <div style={{ fontSize: 12, color: "var(--warn)", fontWeight: 700 }}>first login pending</div>}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 800, background: STATUS[r.status][1], color: STATUS[r.status][2] }}>{STATUS[r.status][0]}</span>
                    </td>
                    <td style={{ padding: 12 }}><b>{r.reading}</b></td>
                    <td style={{ padding: 12 }}>{r.tipsToday}</td>
                    <td style={{ padding: 12 }}>{r.onDesk}</td>
                    <td style={{ padding: 12 }}>{r.posts}</td>
                    <td style={{ padding: 12, color: r.reports > 0 ? "var(--bad)" : undefined, fontWeight: 700 }}>{r.reports}</td>
                    <td style={{ padding: 12 }} className="muted">{r.lastIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {room && look && (
        <div className="scrim" style={{ alignItems: "stretch", justifyContent: "flex-end", zIndex: 55 }} onClick={() => setSel(null)}>
          <aside onClick={(e) => e.stopPropagation()} aria-label="Room details" style={{ width: "min(560px, 100%)", background: "var(--card)", borderLeft: "1px solid var(--line)", overflowY: "auto", padding: 20 }}>
            <div className="row" style={{ gap: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, background: look.accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 22 }}>{room.name.slice(0, 1).toUpperCase()}</span>
              <div className="grow" style={{ minWidth: 0 }}>
                <b style={{ fontSize: 20 }}>{room.name}</b>
                <div className="muted" style={{ fontSize: 13 }}>{host}/{room.handle} · host @{room.host} · since {room.created}</div>
              </div>
              <button className="icon-btn tap" onClick={() => setSel(null)} aria-label="Close">✕</button>
            </div>
            <Link className="btn btn-sm" href={"/" + room.handle} target="_blank" style={{ marginTop: 12 }}>Open the room</Link>

            <h3 style={{ fontSize: 15, marginTop: 18 }}>Look</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
              <LogoUpload value={room.logoUrl} name={room.name} accent={look.accent} linkId={room.linkId} onChange={(url) => run(actions.set(room.id, { logoUrl: url }), url ? "Logo saved" : "Logo removed")} />
              <ThemePicker value={look.theme} accent={look.accent} onChange={(t) => setLook({ ...look, theme: t })} />
              <ColorPicker value={look.accent} onChange={(c) => setLook({ ...look, accent: c })} label="Room colour" />
              <button className="btn btn-cta tap" disabled={look.theme === room.theme && look.accent === room.accent} onClick={() => void run(actions.set(room.id, { theme: look.theme, accent: look.accent }), "Look saved. The room shows it now.")}>Save the look</button>
            </div>

            <h3 style={{ fontSize: 15, marginTop: 20 }}>Controls</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              {(
                [
                  ["open", "Room open for messages", room.status === "LIVE", room.status === "SUSPENDED"],
                  ["takesAllowed", "Host can reply to posts", room.takesAllowed, false],
                  ["voiceAllowed", "Voice notes allowed", room.voiceAllowed, false],
                ] as const
              ).map(([k, l, on, locked]) => (
                <div key={k} className="row" style={{ gap: 12, padding: "8px 0" }}>
                  <b className="grow" style={{ fontSize: 14 }}>{l}</b>
                  <button className="switch" role="switch" aria-checked={on} aria-label={l} disabled={locked} onClick={() => void run(actions.set(room.id, k === "open" ? { status: on ? "CLOSED" : "LIVE" } : { [k]: !on }), "Saved")} />
                </div>
              ))}
              <button
                className="btn btn-block tap"
                style={{ marginTop: 8 }}
                onClick={async () => {
                  const r = await actions.reset(room.id);
                  if (r.ok) {
                    setCred({ username: r.username, password: r.password, handle: room.handle });
                    setCopied(false);
                  } else flash(r.error);
                }}
              >
                Reset the host’s password
              </button>
              <button className="btn btn-block tap" style={{ color: "var(--warn)", borderColor: "var(--warn)", marginTop: 8 }} onClick={() => void run(actions.set(room.id, { status: room.status === "SUSPENDED" ? "CLOSED" : "SUSPENDED" }), room.status === "SUSPENDED" ? "Suspension lifted. Open the room when you’re ready." : "Suspended. The room shows “unavailable”.")}>
                {room.status === "SUSPENDED" ? "Lift the suspension" : "Suspend the room"}
              </button>
              <button
                className="btn btn-block btn-danger tap"
                style={{ marginTop: 8 }}
                onClick={async () => {
                  if (!delAsk) return setDelAsk(true);
                  setSel(null);
                  await run(actions.remove(room.id), "Room and host account deleted");
                }}
              >
                {delAsk ? "Tap again: deletes the room, its posts and the host account" : "Delete the room"}
              </button>
            </div>
            {cred && <Cred text={credText} cred={cred} copied={copied} onCopy={copyCred} />}
          </aside>
        </div>
      )}

      {creating && (
        <div className="scrim" style={{ zIndex: 65 }} onClick={() => setCreating(false)}>
          <div className="sheet" role="dialog" aria-label="New room" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="row">
              <h2 className="grow" style={{ fontSize: 22 }}>{cred ? "The room is ready" : "New room"}</h2>
              <button className="icon-btn tap" onClick={() => setCreating(false)} aria-label="Close">✕</button>
            </div>
            {!cred ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                <div>
                  <label className="label" htmlFor="nr-name">Room name</label>
                  <input id="nr-name" className="field" style={{ minHeight: 48 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 40) })} placeholder="The channel’s name" />
                </div>
                <div>
                  <label className="label" htmlFor="nr-handle">Handle</label>
                  <input id="nr-handle" className="field" style={{ minHeight: 48 }} value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24) })} placeholder={handle || "channel.name"} />
                  <div className="hint">Room link: {host}/{handle || "channel.name"}</div>
                </div>
                <ThemePicker value={form.theme} accent={form.accent} onChange={(t) => setForm({ ...form, theme: t })} />
                <ColorPicker value={form.accent} onChange={(c) => setForm({ ...form, accent: c })} label="Room colour" />
                {(
                  [
                    ["takesAllowed", "Host can reply to posts", "His reply, typed or recorded, under what he posts"],
                    ["voiceAllowed", "Voice notes", "Signed-in people can send voice notes, up to 3 minutes"],
                  ] as const
                ).map(([k, l, s]) => (
                  <div key={k} className="row" style={{ gap: 12 }}>
                    <div className="grow">
                      <b style={{ fontSize: 14.5 }}>{l}</b>
                      <div className="muted" style={{ fontSize: 12.5 }}>{s}</div>
                    </div>
                    <button className="switch" role="switch" aria-checked={form[k]} aria-label={l} onClick={() => setForm({ ...form, [k]: !form[k] })} />
                  </div>
                ))}
                {err && <p role="alert" style={{ color: "var(--bad)", fontWeight: 800, fontSize: 14 }}>{err}</p>}
                <button
                  className="btn btn-cta btn-lg tap"
                  disabled={busy || form.name.trim().length < 2 || handle.length < 3}
                  onClick={async () => {
                    setBusy(true);
                    setErr(null);
                    const r = await actions.create({ ...form, handle });
                    setBusy(false);
                    if (!r.ok) return setErr(r.error);
                    setCred({ username: r.username, password: r.password, handle: r.handle });
                    setCopied(false);
                    router.refresh();
                  }}
                >
                  {busy ? "Making the room…" : "Create room and host login"}
                </button>
              </div>
            ) : (
              <Cred text={credText} cred={cred} copied={copied} onCopy={copyCred} />
            )}
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status" style={{ animation: "none", transform: "translateX(-50%)" }}>{toast}</div>}
    </AdminShell>
  );
}

function Cred({ text, cred, copied, onCopy }: { text: string; cred: { username: string; password: string }; copied: boolean; onCopy: () => void }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="label">Login details for the host</div>
      <div className="card" style={{ padding: 12, background: "var(--card2)", fontFamily: "ui-monospace, monospace", fontSize: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        <div>Username: <b>{cred.username}</b></div>
        <div>One-time password: <b>{cred.password}</b></div>
      </div>
      <button className="btn btn-cta btn-block tap" style={{ marginTop: 10 }} onClick={onCopy}>{copied ? "Copied ✓" : "Copy the message to send"}</button>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.45, whiteSpace: "pre-line" }}>{"Send it only to the channel’s official account. It’s shown once; reset it from the room if it’s lost.\n\n" + text}</p>
    </div>
  );
}
