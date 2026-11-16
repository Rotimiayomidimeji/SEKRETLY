"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ColorPicker, LogoUpload, ThemePicker } from "@/components/admin/AdminShell";
import { Art, BrandContext, fmt, PlayIcon, Take, useAudio, Verified, Wave } from "@/components/rooms/kit";
import { VoiceRecorder } from "@/components/rooms/VoiceRecorder";
import type { DeskView, RoomPostView } from "@/features/rooms/queries";
import { useHost } from "@/lib/use-host";

// The host's desk (/desk): what people sent, posting it with a reply, what's posted (and reported), and settings.

type R = { ok: boolean; error?: string };
type Actions = {
  setPassword: (pw: string) => Promise<R>;
  print: (i: { messageId: string; style: "clip" | "head"; pin: boolean; take?: { text?: string; audioUrl?: string; audioSec?: number } }) => Promise<R>;
  spike: (id: string) => Promise<R>;
  letter: (text: string) => Promise<R>;
  edit: (id: string, patch: { pinned?: boolean; take?: string | null; remove?: boolean }) => Promise<R>;
  keep: (id: string) => Promise<R>;
  settings: (patch: { open?: boolean; voiceOn?: boolean; takesOn?: boolean; maxVoiceSec?: number; tagline?: string; theme?: string; accent?: string; logoUrl?: string | null }) => Promise<R>;
  logout: () => Promise<void>;
};

export function RoomDesk({ desk, mode, actions }: { desk: DeskView; mode: string; actions: Actions }) {
  const router = useRouter();
  const audio = useAudio();
  const host = useHost();
  const r = desk.room;
  const [tab, setTab] = useState<"inbox" | "posted" | "settings">("inbox");
  const [filter, setFilter] = useState<"all" | "voice" | "held">("all");
  const [gone, setGone] = useState<Record<string, true>>({});
  const [posting, setPosting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [voiceTake, setVoiceTake] = useState<{ url: string; sec: number } | null>(null);
  const [recTake, setRecTake] = useState(false);
  const [pin, setPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; take: string } | null>(null);
  const [unAsk, setUnAsk] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pw, setPw] = useState({ a: "", b: "", error: "" });
  const [tagline, setTagline] = useState(r.tagline);
  const [look, setLook] = useState({ theme: r.theme, accent: r.accent });

  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2400);
  };
  const done = (res: R, ok: string) => {
    flash(res.ok ? ok : res.error || "That didn’t work. Try again.");
    router.refresh();
  };
  const repliesOn = r.takesAllowed && r.takesOn;
  const roomUrl = host + "/" + r.handle;
  const inbox = desk.tips.filter((t) => !gone[t.id]);
  const reportedCount = desk.printed.filter((p) => p.reports > 0).length;

  if (!r.ready)
    return (
      <div className="sk" data-mode={mode}>
        <div className="main"><div className="wrap" style={{ maxWidth: 460, paddingTop: 30 }}>
          <div className="row" style={{ gap: 10 }}><span className="logo-mark">S</span><b className="d" style={{ fontSize: 18 }}>{r.name}</b><Verified size={20} /></div>
          <h1 style={{ fontSize: 30, marginTop: 24 }}>Welcome to your room.</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.45 }}>First time in. Swap the one-time password Sekretly sent you for one only you know.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            <div>
              <label className="label" htmlFor="dk-a">New password</label>
              <input id="dk-a" className="field" style={{ minHeight: 50 }} type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} />
              <p className="hint">{pw.a.length < 10 ? "At least 10 characters · " + Math.max(0, 10 - pw.a.length) + " to go" : "Good"}</p>
            </div>
            <div>
              <label className="label" htmlFor="dk-b">Type it again</label>
              <input id="dk-b" className="field" style={{ minHeight: 50 }} type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} />
              {pw.b && pw.b !== pw.a && <p className="hint" style={{ color: "var(--bad)" }}>Those don’t match yet.</p>}
            </div>
            {pw.error && <p role="alert" style={{ color: "var(--bad)", fontWeight: 800 }}>{pw.error}</p>}
            <button className="btn btn-cta btn-lg tap" disabled={busy || pw.a.length < 10 || pw.a !== pw.b} onClick={async () => { setBusy(true); const res = await actions.setPassword(pw.a); setBusy(false); if (!res.ok) setPw({ ...pw, error: res.error || "That didn’t work." }); else router.refresh(); }}>
              Save and open my room
            </button>
          </div>
        </div></div>
      </div>
    );

  const cur = posting ? (desk.tips.find((t) => t.id === posting) ?? null) : null;
  const preview: RoomPostView | null = cur
    ? { id: "preview", number: desk.printed.length + 1, kind: cur.kind, text: cur.text, style: "clip", audioUrl: cur.audioUrl, audioSec: cur.sec, peaks: cur.peaks, voice: cur.voice, take: repliesOn ? note || null : null, takeAudioUrl: repliesOn && voiceTake ? voiceTake.url : null, takeAudioSec: voiceTake?.sec ?? 0, pinned: pin, stamps: [0, 0, 0, 0], mine: [false, false, false, false], age: "now", createdAt: 0, reports: 0 }
    : null;
  const doPost = async () => {
    if (!cur) return;
    setBusy(true);
    const res = await actions.print({ messageId: cur.id, style: "clip", pin, take: repliesOn ? { text: note || undefined, audioUrl: voiceTake?.url, audioSec: voiceTake?.sec } : undefined });
    setBusy(false);
    if (res.ok) {
      setGone({ ...gone, [cur.id]: true });
      setPosting(null);
    }
    done(res, "Posted. It’s live in your room.");
  };
  const tips = inbox.filter((t) => filter === "all" || (filter === "voice" ? t.kind === "voice" : !!t.held));

  return (
    <BrandContext.Provider value={{ name: r.name, logoUrl: r.logoUrl }}>
    <div className="sk" data-mode={mode}>
      <div className="main"><div className="wrap" style={{ maxWidth: 720 }}>
        <header className="topbar">
          <span style={{ width: 44, height: 44, borderRadius: 14, background: r.accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18, flex: "none", overflow: "hidden" }}>{r.logoUrl ? <img src={r.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.name.slice(0, 1).toUpperCase()}</span>
          <div className="grow">
            <div className="row" style={{ gap: 6 }}><h1 style={{ fontSize: 22 }}>{r.name}</h1><Verified size={20} /></div>
            <div className="muted" style={{ fontSize: 12.5 }}>{roomUrl}</div>
          </div>
          <Link href={"/" + r.handle} className="btn btn-sm tap">View room</Link>
          <button className="icon-btn tap" aria-label="Log out" onClick={() => void actions.logout()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
          </button>
        </header>

        <div className="card row" style={{ padding: 14, gap: 12, borderColor: r.open ? "var(--ok)" : "var(--line)" }}>
          <div className="grow">
            <b style={{ fontSize: 15.5 }}>{r.open ? "Your room is open" : "Your room is closed"}</b>
            <div className="muted" style={{ fontSize: 13 }}>{r.open ? "People can send you messages and voice notes." : "People can still read and react, but can’t send."}</div>
          </div>
          <button className="switch" role="switch" aria-checked={r.open} aria-label="Room open" onClick={async () => done(await actions.settings({ open: !r.open }), r.open ? "Room closed" : "Room open")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
          {[["In the room now", desk.reading], ["Messages today", desk.tipsToday], ["Posted", desk.printed.length]].map(([l, v]) => (
            <div key={l as string} className="card kpi" style={{ padding: 12 }}><div className="muted" style={{ fontSize: 12 }}>{l}</div><div className="v" style={{ fontSize: 26 }}>{Number(v).toLocaleString("en-US")}</div></div>
          ))}
        </div>

        <div className="seg" role="tablist" style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {(
            [
              ["inbox", "Inbox · " + inbox.length],
              ["posted", "Posted" + (reportedCount ? " · " + reportedCount + " reported" : "")],
              ["settings", "Settings"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={"chip tap" + (tab === k ? " on" : "")} onClick={() => setTab(k)} style={{ flex: 1, justifyContent: "center" }}>{l}</button>
          ))}
        </div>

        {tab === "inbox" && (
          <div style={{ marginTop: 14 }}>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {(
                [
                  ["all", "All"],
                  ["voice", "Voice notes"],
                  ["held", "Held for you"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={"chip tap" + (filter === k ? " on" : "")} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
              ))}
              <span className="grow" />
              <button className="btn btn-sm tap" onClick={() => setLetter("")}>Write a pinned note</button>
            </div>
            {tips.length === 0 && <p className="muted" style={{ textAlign: "center", padding: "30px 0" }}>Nothing new. Share {roomUrl} and messages land here.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {tips.map((t) => {
                const isCur = audio.cur === t.id;
                return (
                  <article key={t.id} className="card" style={{ padding: 14 }}>
                    <div className="row" style={{ gap: 8, fontSize: 12.5 }}>
                      <b className="pink">{t.kind === "voice" ? "Voice note" : "Message"}</b>
                      {t.held && <span className="pill" style={{ background: "rgba(255,79,109,.16)", color: "var(--bad)" }}>Held · {t.held}</span>}
                      <span className="grow" />
                      <span className="muted">{t.age}</span>
                    </div>
                    {t.kind === "voice" && t.audioUrl && (
                      <div className="row" style={{ gap: 12, marginTop: 10, padding: 10, borderRadius: 14, background: "var(--card2)" }}>
                        <button className="mp-btn tap" style={{ background: "var(--pink)", color: "#fff" }} onClick={() => audio.toggle(t.id, t.audioUrl!)} aria-label={isCur && audio.playing ? "Pause" : "Play"}><PlayIcon on={isCur && audio.playing} /></button>
                        <div className="grow" style={{ color: "var(--ink)" }}>
                          <div className="muted" style={{ fontSize: 11.5, fontWeight: 800 }}>{t.voice} voice</div>
                          <Wave peaks={t.peaks} pct={isCur ? audio.pos / Math.max(1, t.sec) : 0} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 12.5 }}>{isCur ? fmt(audio.pos) : fmt(t.sec)}</span>
                      </div>
                    )}
                    {t.text && <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 10, whiteSpace: "pre-line" }}>{t.text}</p>}
                    <div className="row" style={{ gap: 8, marginTop: 12 }}>
                      <button className="btn btn-sm btn-ghost tap" onClick={async () => { setGone({ ...gone, [t.id]: true }); done(await actions.spike(t.id), "Skipped. It won’t be posted."); }}>Skip</button>
                      <span className="grow" />
                      <button className="btn btn-sm btn-cta tap" onClick={() => { setPosting(t.id); setNote(""); setVoiceTake(null); setPin(false); }}>Post it</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {tab === "posted" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
            {desk.printed.length === 0 && <p className="muted" style={{ textAlign: "center", padding: "24px 0" }}>Nothing posted yet. Post something from your inbox.</p>}
            {desk.printed.map((p) => (
              <div key={p.id} className="card" style={{ padding: 12, borderColor: p.reports > 0 ? "var(--bad)" : undefined }}>
                {p.reports > 0 && <div style={{ marginBottom: 8, padding: "8px 10px", borderRadius: 12, background: "rgba(255,79,109,.14)", color: "var(--bad)", fontWeight: 800, fontSize: 13 }}>Reported {p.reports} {p.reports === 1 ? "time" : "times"}. Keep it or take it down.</div>}
                <div className="rm rm-embed" data-theme={r.theme} style={{ ["--acc" as string]: r.accent, minHeight: 0, borderRadius: 18, padding: 10 }}>
                  <Art post={p} audio={audio} />
                  <Take post={p} host={r.handle} audio={audio} />
                </div>
                <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>{p.stamps.reduce((a, b) => a + b, 0).toLocaleString("en-US")} reactions · {p.age}</span>
                  <span className="grow" />
                  {p.reports > 0 && <button className="btn btn-sm tap" onClick={async () => done(await actions.keep(p.id), "Kept. Reports cleared.")}>Keep it</button>}
                  <button className="btn btn-sm tap" onClick={async () => done(await actions.edit(p.id, { pinned: !p.pinned }), p.pinned ? "Unpinned" : "Pinned to the top")}>{p.pinned ? "Unpin" : "Pin"}</button>
                  {repliesOn && p.kind !== "letter" && <button className="btn btn-sm tap" onClick={() => setEditing({ id: p.id, take: p.take ?? "" })}>{p.take ? "Edit reply" : "Reply"}</button>}
                  <button className="btn btn-sm btn-danger tap" onClick={async () => { if (unAsk !== p.id) return setUnAsk(p.id); setUnAsk(null); done(await actions.edit(p.id, { remove: true }), "Taken down"); }}>{unAsk === p.id ? "Tap to confirm" : "Take down"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            <div className="card" style={{ padding: "4px 16px" }}>
              {(
                [
                  ["open", "Room open", "Turn off to stop new messages. People can still read and react.", r.open, false],
                  ["voiceOn", "Voice notes", r.voiceAllowed ? "Let signed-in people send you voice notes." : "Turned off for your room by Sekretly.", r.voiceOn && r.voiceAllowed, !r.voiceAllowed],
                  ["takesOn", "My replies", r.takesAllowed ? "Add your reply under what you post." : "Turned off for your room by Sekretly.", repliesOn, !r.takesAllowed],
                ] as const
              ).map(([k, label, sub, on, locked]) => (
                <div key={k} className="row" style={{ gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                  <div className="grow"><b style={{ fontSize: 15 }}>{label}</b><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</p></div>
                  <button className="switch" role="switch" aria-checked={on} aria-label={label} disabled={locked} onClick={async () => done(await actions.settings(k === "open" ? { open: !on } : { [k]: !on }), on ? label + " off" : label + " on")} />
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="label">Longest voice note</div>
              <div className="row" style={{ gap: 6 }}>
                {[60, 120, 180].map((s) => (
                  <button key={s} className={"chip tap" + (r.maxVoiceSec === s ? " on" : "")} aria-pressed={r.maxVoiceSec === s} onClick={async () => done(await actions.settings({ maxVoiceSec: s }), "Saved")} style={{ flex: 1, justifyContent: "center" }}>{s / 60} min</button>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <LogoUpload value={r.logoUrl} name={r.name} accent={look.accent} linkId={r.linkId} onChange={async (url) => done(await actions.settings({ logoUrl: url }), url ? "Logo saved" : "Logo removed")} />
              <ThemePicker value={look.theme} accent={look.accent} onChange={(t) => setLook({ ...look, theme: t })} />
              <ColorPicker value={look.accent} onChange={(c) => setLook({ ...look, accent: c })} label="Room colour" />
              <button className="btn btn-cta tap" disabled={look.theme === r.theme && look.accent === r.accent} onClick={async () => done(await actions.settings(look), "Your room has its new look")}>Save the look</button>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <label className="label" htmlFor="dk-tag">Line under your name</label>
              <div className="row" style={{ gap: 8 }}>
                <input id="dk-tag" className="field" style={{ minHeight: 48 }} value={tagline} maxLength={120} onChange={(e) => setTagline(e.target.value)} placeholder="Say what you can’t say out loud." />
                <button className="btn btn-sm tap" onClick={async () => done(await actions.settings({ tagline }), "Saved")}>Save</button>
              </div>
            </div>
            <div className="card row" style={{ padding: 16, gap: 10 }}>
              <div className="grow"><div className="label" style={{ marginBottom: 2 }}>Your room link</div><b style={{ overflowWrap: "anywhere" }}>{roomUrl}</b></div>
              <button className="btn btn-sm tap" onClick={() => void navigator.clipboard?.writeText("https://" + roomUrl).then(() => flash("Link copied"))}>Copy</button>
            </div>
            <p className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>Need a new password or help? Message the Sekretly team.</p>
          </div>
        )}
      </div></div>

      {cur && preview && (
        <div className="scrim" onClick={() => setPosting(null)}>
          <div className="sheet" role="dialog" aria-label="Post it" onClick={(e) => e.stopPropagation()}>
            <div className="row"><h2 className="grow" style={{ fontSize: 22 }}>Post it</h2><button className="icon-btn tap" onClick={() => setPosting(null)} aria-label="Close">✕</button></div>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>This is how it will look in your room.</p>
            <div className="rm rm-embed" data-theme={r.theme} style={{ ["--acc" as string]: r.accent, minHeight: 0, borderRadius: 18, padding: 10, marginTop: 10 }}>
              <Art post={preview} audio={audio} />
              <Take post={preview} host={r.handle} audio={audio} />
            </div>
            {repliesOn && (
              <>
                <label className="label" htmlFor="dk-note" style={{ marginTop: 14 }}>Your reply (optional)</label>
                <div className="row" style={{ gap: 8 }}>
                  <input id="dk-note" className="field" style={{ minHeight: 48 }} value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} maxLength={280} placeholder="Say your piece…" />
                  <button className="icon-btn tap" onClick={() => setRecTake(true)} aria-label="Record your reply instead">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
                  </button>
                </div>
                {voiceTake && <button className="btn btn-sm btn-ghost tap" style={{ marginTop: 8 }} onClick={() => setVoiceTake(null)}>Remove the voice reply ({fmt(voiceTake.sec)})</button>}
              </>
            )}
            <label className="row" style={{ marginTop: 12, gap: 10, minHeight: 44, cursor: "pointer" }}>
              <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} style={{ width: 20, height: 20, accentColor: r.accent }} />
              <b style={{ fontSize: 14 }}>Pin to the top of the room</b>
            </label>
            <button className="btn btn-cta btn-lg btn-block tap" onClick={() => void doPost()} disabled={busy} style={{ marginTop: 12 }}>{busy ? "Posting…" : "Post to my room"}</button>
          </div>
        </div>
      )}

      {recTake && (
        <div className="rm" data-theme="neon" style={{ minHeight: 0, ["--acc" as string]: r.accent }}>
          <VoiceRecorder mode="take" linkId={r.linkId} maxSec={120} onClose={() => setRecTake(false)} onDone={(v) => { setVoiceTake({ url: v.url, sec: v.sec }); setRecTake(false); return null; }} />
        </div>
      )}

      {letter !== null && (
        <div className="scrim" onClick={() => setLetter(null)}>
          <div className="sheet" role="dialog" aria-label="Write a pinned note" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 22 }}>A note from you</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Pinned to the top of your room. Say hello, set the rules, tease what’s coming.</p>
            <textarea className="field" value={letter} onChange={(e) => setLetter(e.target.value.slice(0, 2000))} maxLength={2000} placeholder="Hey everyone…" style={{ marginTop: 10, minHeight: 150 }} />
            <button className="btn btn-cta btn-block tap" style={{ marginTop: 12 }} disabled={busy || letter.trim().length < 2} onClick={async () => { setBusy(true); const res = await actions.letter(letter); setBusy(false); if (res.ok) setLetter(null); done(res, "Posted and pinned"); }}>Post and pin</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="scrim" onClick={() => setEditing(null)}>
          <div className="sheet" role="dialog" aria-label="Your reply" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 22 }}>Your reply</h2>
            <input className="field" style={{ marginTop: 12, minHeight: 48 }} value={editing.take} maxLength={280} onChange={(e) => setEditing({ ...editing, take: e.target.value })} placeholder="Say your piece…" />
            <button className="btn btn-cta btn-block tap" style={{ marginTop: 12 }} onClick={async () => { const res = await actions.edit(editing.id, { take: editing.take || null }); setEditing(null); done(res, "Reply saved"); }}>Save</button>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status" style={{ animation: "none", transform: "translateX(-50%)" }}>{toast}</div>}
    </div>
    </BrandContext.Provider>
  );
}
