"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Art, BrandContext, CloseX, FlagIcon, Logo, MicIcon, Reactions, Sheet, ShareIcon, Take, useAudio, useLastVisit, Verified, type ThemeId } from "@/components/rooms/kit";
import { VoiceRecorder, type VoiceResult } from "@/components/rooms/VoiceRecorder";
import type { RoomPostView, RoomView as Room } from "@/features/rooms/queries";
import { useHost } from "@/lib/use-host";

// The public room (sekretly.app/<handle>) in its five looks. Same features in every theme: anonymous messages
// (2,000 characters, no account), voice notes (account needed, disguised on the phone), emoji reactions,
// the host's verified replies, sharing, reporting. Only the layout and flow change with the theme.

type Actions = {
  send: (input: { linkId: string; payload: { text?: string; mediaUrl?: string; voice?: { sec: number; peaks: number[]; disguise: string } } }) => Promise<{ ok: true; receipt: string } | { ok: false; error: string }>;
  stamp: (postId: string, k: number) => Promise<{ ok: boolean; on?: boolean }>;
  report: (postId: string, reason: string) => Promise<{ ok: boolean }>;
  quickJoin: (i: { username: string; password: string; adult: boolean }) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const SEEN_KEY = "sk-room-voice-seen";
const seenVoice = () => {
  try {
    return !!localStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
};

export function RoomView({ room, signedIn, actions }: { room: Room; signedIn: boolean; actions: Actions }) {
  const router = useRouter();
  const audio = useAudio();
  const theme = room.theme as ThemeId;
  const since = useLastVisit(room.handle);
  const host = useHost();
  const roomUrl = (host.startsWith("localhost") ? "http://" : "https://") + host + "/" + room.handle;

  const [posts, setPosts] = useState<RoomPostView[]>(room.posts);
  const [seen, setSeen] = useState(room.posts);
  if (seen !== room.posts) {
    setSeen(room.posts);
    setPosts(room.posts);
  }
  const [tab, setTab] = useState<"latest" | "voice" | "top">("latest");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState(false);
  const [sheet, setSheet] = useState<null | "compose" | "sent" | "gate" | "rec" | "share" | "report">(null);
  const [receipt, setReceipt] = useState<{ code: string; voice: boolean } | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [join, setJoin] = useState({ username: "", password: "", adult: false, error: "", busy: false });
  const [isSigned, setSigned] = useState(signedIn);
  const toastT = useRef<number | null>(null);
  const [slide, setSlide] = useState(0);

  const flash = (t: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast(t);
    toastT.current = window.setTimeout(() => setToast(null), 2400);
  };
  const markVoiceSeen = () => {
    setInvite(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };
  const openVoice = () => {
    markVoiceSeen();
    setSheet(isSigned ? "rec" : "gate");
  };
  const onFocus = () => {
    if (room.voice && !seenVoice()) setInvite(true);
  };

  const sendText = async () => {
    if (text.trim().length < 2 || busy) return;
    setBusy(true);
    setError(null);
    const r = await actions.send({ linkId: room.linkId, payload: { text } });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setText("");
    setReceipt({ code: r.receipt, voice: false });
    setSheet("sent");
  };
  const sendVoice = async (v: VoiceResult) => {
    const r = await actions.send({ linkId: room.linkId, payload: { text: v.caption, mediaUrl: v.url, voice: { sec: v.sec, peaks: v.peaks, disguise: v.disguise } } });
    if (!r.ok) return r.error;
    setReceipt({ code: r.receipt, voice: true });
    setSheet("sent");
    return null;
  };
  const doJoin = async () => {
    setJoin((j) => ({ ...j, busy: true, error: "" }));
    const r = await actions.quickJoin({ username: join.username, password: join.password, adult: join.adult });
    if (!r.ok) return setJoin((j) => ({ ...j, busy: false, error: r.error }));
    setSigned(true);
    setJoin((j) => ({ ...j, busy: false }));
    setSheet("rec");
    flash("You’re in. Now say it.");
    router.refresh();
  };
  const react = (id: string, k: number) => {
    // at most 2 reactions per person per post: a third replaces one already picked
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        const adding = !p.mine[k];
        const drop = adding && p.mine.filter(Boolean).length >= 2 ? p.mine.findIndex((m, i) => m && i !== k) : -1;
        return { ...p, mine: p.mine.map((m, i) => (i === k ? adding : i === drop ? false : m)), stamps: p.stamps.map((n, i) => (i === k ? Math.max(0, n + (adding ? 1 : -1)) : i === drop ? Math.max(0, n - 1) : n)) };
      }),
    );
    void actions.stamp(id, k);
  };
  const share = (id: string) => {
    setTarget(id);
    setSheet("share");
  };
  const report = (id: string) => {
    setTarget(id);
    setSheet("report");
  };

  const shown = useMemo(() => {
    if (tab === "voice") return posts.filter((p) => p.kind === "voice");
    if (tab === "top") return [...posts].filter((p) => p.kind !== "letter").sort((a, b) => b.stamps.reduce((x, y) => x + y, 0) - a.stamps.reduce((x, y) => x + y, 0));
    return posts;
  }, [posts, tab]);
  const isNew = (p: RoomPostView) => since != null && p.createdAt > since && p.kind !== "letter";
  const newCount = posts.filter(isNew).length;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  /* ── pieces ── */
  const nameRow = (size: number) => (
    <span className="rm-row" style={{ gap: 8, justifyContent: "inherit" }}>
      <span>{room.name}</span>
      <Verified size={size} />
    </span>
  );
  const live = (
    <span className="rm-live">
      <b />
      {room.reading.toLocaleString("en-US")} here now
    </span>
  );
  const topBar = (
    <div className="rm-top">
      <Link href="/" className="rm-brand"><i>S</i>Sekretly</Link>
      <span className="rm-grow" />
      {live}
      <button className="rm-iconbtn" aria-label="Share this room" onClick={() => (navigator.share ? void navigator.share({ title: room.name, text: "Send me something anonymous", url: roomUrl }).catch(() => {}) : void navigator.clipboard?.writeText(roomUrl).then(() => flash("Link copied")))}>
        <ShareIcon />
      </button>
    </div>
  );
  const tagline = room.tagline || "Say what you can’t say out loud. Nobody will know it was you.";

  const header =
    theme === "press" ? (
      <>
        {topBar}
        <header className="rm-mast">
          <div className="rm-mast-the">THE</div>
          <h1 className="rm-mast-name">{room.name}</h1>
          <div className="rm-row rm-ui" style={{ justifyContent: "center", gap: 6, marginTop: 8, fontWeight: 800, fontSize: 13 }}>
            Verified room <Verified size={18} />
          </div>
          <p style={{ fontStyle: "italic", fontSize: 16, marginTop: 6 }}>{tagline}</p>
          <div className="rm-mast-strap">
            <span>No. {room.volume.toLocaleString("en-US")}</span>
            <span>{today}</span>
            <span>@{room.host}</span>
          </div>
        </header>
      </>
    ) : theme === "neon" ? (
      <div className="rm-neonhero">
        {topBar}
        <div className="rm-row" style={{ gap: 14, marginTop: 16, alignItems: "flex-end" }}>
          <Logo />
          <div className="rm-grow">
            <h1 className="rm-head" style={{ fontSize: 28, lineHeight: 1.05 }}>{nameRow(22)}</h1>
            <div className="rm-muted" style={{ fontSize: 13.5, marginTop: 3 }}>@{room.host} · verified room</div>
          </div>
        </div>
        <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.45 }}>{tagline}</p>
        <div className="rm-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
          <span className={"rm-onair " + (room.open ? "" : "off")}><b />{room.open ? "On air" : "Off air"}</span>
          <span className="rm-pill">{room.volume.toLocaleString("en-US")} {room.volume === 1 ? "message" : "messages"}</span>
        </div>
      </div>
    ) : theme === "pop" ? (
      <>
        {topBar}
        <header className="rm-pophead">
          <Logo />
          <h1 className="rm-head" style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.03em", marginTop: 16, display: "flex", justifyContent: "center" }}>{nameRow(26)}</h1>
          <p style={{ fontSize: 15.5, marginTop: 6, fontWeight: 600 }}>{tagline}</p>
          <div style={{ marginTop: 12 }}><span className="rm-sticker">{room.open ? "Spill it here" : "Closed for now"}</span></div>
        </header>
      </>
    ) : theme === "stack" ? (
      <>
        {topBar}
        <div className="rm-row" style={{ gap: 12 }}>
          <Logo style={{ width: 52, height: 52, borderRadius: 16, fontSize: 20 }} />
          <div className="rm-grow">
            <h1 className="rm-head" style={{ fontSize: 24, fontWeight: 800 }}>{nameRow(20)}</h1>
            <div className="rm-muted" style={{ fontSize: 13 }}>{tagline}</div>
          </div>
        </div>
      </>
    ) : (
      <div className="rm-chathead">
        <Link href="/" className="rm-iconbtn" aria-label="Sekretly home" style={{ border: 0, background: "transparent" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
        </Link>
        <Logo letters={1} />
        <div className="rm-grow" style={{ lineHeight: 1.2 }}>
          <b style={{ fontSize: 16 }}>{nameRow(17)}</b>
          <div className="rm-muted" style={{ fontSize: 12.5 }}>{room.reading.toLocaleString("en-US")} here now · anonymous</div>
        </div>
      </div>
    );

  const inviteCard = invite && room.voice && (
    <div className="rm-invite" role="note">
      <b style={{ fontSize: 17 }}>New: say it with your voice</b>
      <p style={{ fontSize: 14, marginTop: 4, lineHeight: 1.45 }}>Record a voice note up to {Math.round(room.maxVoiceSec / 60)} minutes. Your voice is disguised on your phone before it’s sent, so even the host can’t tell it’s you.</p>
      <div className="rm-row" style={{ gap: 8, marginTop: 12 }}>
        <button className="rm-btn sm" onClick={openVoice} style={{ background: "#fff", color: "#111" }}><MicIcon /> Try it</button>
        <button className="rm-btn sm ghost" onClick={markVoiceSeen} style={{ color: "#fff", borderColor: "rgba(255,255,255,.5)" }}>Not now</button>
      </div>
    </div>
  );

  const composer = !room.open ? (
    <div className="rm-closed">
      <b style={{ fontSize: 16 }}>This room is closed for new messages right now</b>
      <p className="rm-muted" style={{ fontSize: 14, marginTop: 4 }}>You can still read, listen and react.</p>
    </div>
  ) : (
    <>
      <section className="rm-composer" aria-label="Send an anonymous message">
        <div className="rm-row">
          <label htmlFor="rm-msg" className="rm-ui" style={{ fontWeight: 800, fontSize: 14, flex: 1 }}>Send @{room.host} something anonymous</label>
          <span className="rm-count">{text.length.toLocaleString("en-US")}/2000</span>
        </div>
        <textarea id="rm-msg" className="rm-textarea" value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} onFocus={onFocus} maxLength={2000} placeholder="Say what you can’t say out loud…" />
        <div className="rm-row" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
          <button className="rm-btn" onClick={() => void sendText()} disabled={text.trim().length < 2 || busy} style={{ flex: 1 }}>{busy ? "Sending…" : "Send anonymously"}</button>
          {room.voice && (
            <button className="rm-mic" onClick={openVoice} aria-label="Record a voice note instead">
              <MicIcon /> Voice <span className="rm-new">NEW</span>
            </button>
          )}
        </div>
        {error && <p className="rm-ui" role="alert" style={{ color: "#ff4f6d", fontWeight: 800, fontSize: 14, marginTop: 10 }}>{error}</p>}
        <p className="rm-ui rm-muted" style={{ fontSize: 12.5, marginTop: 10 }}>The host sees it first and picks what goes up. Nobody, not even the host, sees who sent it.</p>
      </section>
      {inviteCard}
    </>
  );

  const tabs = (
    <div className="rm-tabs" role="group" aria-label="Sort">
      {(
        [
          ["latest", newCount ? "Latest · " + newCount + " new" : "Latest"],
          ["voice", "Voice notes"],
          ["top", "Most loved"],
        ] as const
      ).map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k}>{l}</button>
      ))}
    </div>
  );

  const actsRow = (p: RoomPostView) => (
    <div className="rm-acts">
      <button className="rm-ia" onClick={() => share(p.id)}><ShareIcon /> Share</button>
      <span className="rm-grow" />
      {p.kind !== "letter" && <button className="rm-ia" aria-label="Report" onClick={() => report(p.id)}><FlagIcon /></button>}
    </div>
  );
  const cardTop = (p: RoomPostView) => (
    <div className="rm-card-top">
      {isNew(p) && <span className="rm-newtag">NEW</span>}
      {p.pinned && p.age !== "Pinned" && <span>Pinned</span>}
      <span className="rm-grow" />
      <span>{p.age}</span>
    </div>
  );
  const empty = <p className="rm-ui rm-muted" style={{ textAlign: "center", padding: "26px 0" }}>{posts.length ? "Nothing here yet." : "Nothing posted yet. Send something and you might be first."}</p>;

  const listFeed = (
    <div className="rm-feed">
      {shown.length === 0 && empty}
      {shown.map((p) => (
        <article key={p.id} className="rm-card" aria-label={p.kind === "letter" ? "From the host" : "Post " + p.number}>
          {cardTop(p)}
          <Art post={p} audio={audio} />
          <Take post={p} host={room.host} audio={audio} />
          <Reactions post={p} onReact={(k) => react(p.id, k)} />
          {actsRow(p)}
        </article>
      ))}
    </div>
  );

  const stackFeed = (
    <>
      <div
        className="rm-deck"
        onScroll={(e) => {
          const el = e.currentTarget;
          setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth - 28)));
        }}
      >
        {shown.length === 0 && <div className="rm-slide" style={{ justifyContent: "center", textAlign: "center" }}>{empty}</div>}
        {shown.map((p) => (
          <article key={p.id} className="rm-slide" aria-label={"Post " + p.number}>
            {cardTop(p)}
            <Art post={p} audio={audio} pageSize={360} />
            <Take post={p} host={room.host} audio={audio} />
            <Reactions post={p} onReact={(k) => react(p.id, k)} />
            {actsRow(p)}
          </article>
        ))}
      </div>
      {shown.length > 1 && (
        <div className="rm-progress" aria-hidden="true">
          {shown.slice(0, 20).map((p, i) => (
            <i key={p.id} className={i <= slide ? "on" : ""} />
          ))}
        </div>
      )}
      <p className="rm-ui rm-muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 10 }}>Swipe for more · {shown.length} posts</p>
    </>
  );

  const chatFeed = (
    <div className="rm-thread">
      <span className="rm-day">{today}</span>
      {shown.length === 0 && empty}
      {[...shown].reverse().map((p) => (
        <div key={p.id} style={{ display: "contents" }}>
          <div className={"rm-bubble" + (p.kind === "letter" ? " host" : "")}>
            <div className="rm-row" style={{ gap: 6 }}>
              <span className="rm-anon" style={p.kind === "letter" ? { color: "#fff" } : undefined}>{p.kind === "letter" ? "@" + room.host : "Anonymous #" + p.number}</span>
              {isNew(p) && <span className="rm-newtag">NEW</span>}
            </div>
            <Art post={p} audio={audio} label={p.kind === "voice" ? "Voice note" : p.kind === "letter" ? "From the host" : "Anonymous"} pageSize={360} />
            <Reactions post={p} onReact={(k) => react(p.id, k)} />
            <div className="rm-bubble-meta">
              <button className="rm-ia" style={{ minHeight: 30, padding: "0 6px", color: "inherit" }} onClick={() => share(p.id)}><ShareIcon /></button>
              {p.kind !== "letter" && <button className="rm-ia" style={{ minHeight: 30, padding: "0 6px", color: "inherit" }} aria-label="Report" onClick={() => report(p.id)}><FlagIcon /></button>}
              <span>{p.age}</span>
            </div>
          </div>
          {(p.take || p.takeAudioUrl) && p.kind !== "letter" && (
            <div className="rm-bubble host">
              <Take post={p} host={room.host} audio={audio} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const chatBar = room.open ? (
    <div className="rm-chatbar">
      {room.voice && <button className="rm-round soft" onClick={openVoice} aria-label="Record a voice note"><MicIcon size={20} /></button>}
      <textarea className="rm-textarea" aria-label="Message" value={text} onFocus={onFocus} onChange={(e) => setText(e.target.value.slice(0, 2000))} maxLength={2000} placeholder="Message anonymously…" rows={1} />
      <button className="rm-round" onClick={() => void sendText()} disabled={text.trim().length < 2 || busy} aria-label="Send anonymously">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z" /></svg>
      </button>
    </div>
  ) : (
    <div className="rm-closed">The room is closed for new messages right now.</div>
  );

  return (
    <BrandContext.Provider value={{ name: room.name, logoUrl: room.logoUrl }}>
    <div className="rm" data-theme={theme} style={{ ["--acc" as string]: room.accent }}>
      <div className="rm-wrap" style={theme === "chat" ? { paddingBottom: 0, minHeight: "100vh", display: "flex", flexDirection: "column" } : theme === "stack" ? { paddingBottom: 100 } : undefined}>
        {header}
        {theme === "chat" ? (
          <>
            <div className="rm-grow">{chatFeed}</div>
            {error && <p role="alert" style={{ color: "#ff4f6d", fontWeight: 800, fontSize: 14 }}>{error}</p>}
            {inviteCard}
            {chatBar}
          </>
        ) : theme === "stack" ? (
          <>
            {tabs}
            {stackFeed}
          </>
        ) : (
          <>
            {composer}
            {tabs}
            {listFeed}
          </>
        )}
        {theme !== "chat" && (
          <footer className="rm-ui" style={{ marginTop: 36, textAlign: "center" }}>
            <p className="rm-muted" style={{ fontSize: 12.5 }}>Anonymous rooms by Sekretly</p>
            <Link href="/signup" className="rm-btn ghost sm" style={{ marginTop: 10 }}>Get your own Sekretly link</Link>
          </footer>
        )}
      </div>

      {theme === "stack" && room.open && (
        <button className="rm-fab" onClick={() => setSheet("compose")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Send yours
        </button>
      )}
      {sheet === "compose" && (
        <Sheet onClose={() => setSheet(null)} label="Send something anonymous">
          <div className="rm-row"><b className="rm-grow" style={{ fontSize: 18 }}>Send something anonymous</b><CloseX onClick={() => setSheet(null)} /></div>
          {composer}
        </Sheet>
      )}

      {sheet === "sent" && receipt && (
        <Sheet onClose={() => setSheet(null)} label="Sent" center>
          <img src="/sk/shushing_face.png" alt="" style={{ width: 72, height: 72 }} />
          <p className="rm-sent" style={{ marginTop: 8 }}>Sent anonymously</p>
          <p style={{ fontSize: 15.5, marginTop: 8, lineHeight: 1.45 }}>Your {receipt.voice ? "voice note" : "message"} is with @{room.host}. If they post it, it shows up here, maybe with their reply.</p>
          {receipt.code && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 16, background: "var(--card2)", textAlign: "left" }}>
              <div className="rm-label">Your receipt</div>
              <div className="rm-row"><b className="rm-code rm-grow">{receipt.code}</b><button className="rm-btn sm soft" onClick={() => void navigator.clipboard?.writeText(receipt.code).then(() => flash("Copied"))}>Copy</button></div>
              <p className="rm-muted" style={{ fontSize: 12.5, marginTop: 6 }}>The only thing that links you to it. Check on it at {host}/receipt.</p>
            </div>
          )}
          <button className="rm-btn block" onClick={() => setSheet(null)} style={{ marginTop: 14 }}>Back to the room</button>
        </Sheet>
      )}

      {sheet === "gate" && (
        <Sheet onClose={() => setSheet(null)} label="Make an account for voice notes">
          <div className="rm-row"><b className="rm-grow" style={{ fontSize: 20 }}>Voice notes need an account</b><CloseX onClick={() => setSheet(null)} /></div>
          <p style={{ fontSize: 14.5, marginTop: 6, lineHeight: 1.45 }}>Ten seconds. No phone number, no real name, and the host still never sees who sent it. Text messages don’t need one.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            <div><label className="rm-label" htmlFor="rj-u">Username</label><input id="rj-u" className="rm-field" autoComplete="username" value={join.username} onChange={(e) => setJoin({ ...join, username: e.target.value.slice(0, 20) })} placeholder="pick anything" /></div>
            <div><label className="rm-label" htmlFor="rj-p">Password</label><input id="rj-p" className="rm-field" type="password" autoComplete="new-password" value={join.password} onChange={(e) => setJoin({ ...join, password: e.target.value })} placeholder="8 characters or more" /></div>
            <label className="rm-row" style={{ minHeight: 48, gap: 10, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={join.adult} onChange={(e) => setJoin({ ...join, adult: e.target.checked })} style={{ width: 20, height: 20, accentColor: room.accent }} />
              <span>I’m 16 or older and accept the <Link href="/legal" style={{ color: "inherit" }}>rules</Link></span>
            </label>
            {join.error && <p role="alert" style={{ color: "#ff4f6d", fontWeight: 800, fontSize: 14 }}>{join.error}</p>}
            <button className="rm-btn" onClick={() => void doJoin()} disabled={join.busy || join.username.length < 3 || join.password.length < 8 || !join.adult}>{join.busy ? "One moment…" : "Create account and record"}</button>
            <Link href={"/login?next=/" + room.handle} style={{ fontSize: 13.5, textAlign: "center", color: "inherit" }}>I already have an account</Link>
          </div>
        </Sheet>
      )}

      {sheet === "rec" && <VoiceRecorder mode="tip" linkId={room.linkId} maxSec={room.maxVoiceSec} onDone={sendVoice} onClose={() => setSheet(null)} />}
      {sheet === "share" && target && <ShareSheet post={posts.find((p) => p.id === target)!} room={room} url={roomUrl} onClose={() => setSheet(null)} flash={flash} />}
      {sheet === "report" && (
        <Sheet onClose={() => setSheet(null)} label="Report">
          <b style={{ fontSize: 20 }}>What’s wrong with it?</b>
          <p className="rm-muted" style={{ fontSize: 13.5, marginTop: 4 }}>The host and the Sekretly team both see reports. Nobody sees who reported.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
            {["Names or exposes a real person", "Threats or bullying", "Hate or slurs", "Sexual content", "Someone may be at risk"].map((r) => (
              <button key={r} className="rm-btn ghost" style={{ justifyContent: "flex-start" }} onClick={() => { if (target) void actions.report(target, r); setSheet(null); flash("Reported. Thank you."); }}>{r}</button>
            ))}
          </div>
        </Sheet>
      )}
      {toast && <div className="rm-toast" role="status">{toast}</div>}
    </div>
    </BrandContext.Provider>
  );
}

/** A 9:16 card for status / stories, saved as an image with the room's name, badge and link. */
function ShareSheet({ post, room, url, onClose, flash }: { post: RoomPostView; room: Room; url: string; onClose: () => void; flash: (t: string) => void }) {
  const card = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const short = post.text.length > 300 ? post.text.slice(0, 280).replace(/\s+\S*$/, "") + "…" : post.text;
  const name = room.handle + "-" + post.number + ".png";
  const make = async () => {
    if (!card.current) return null;
    const { toBlob } = await import("html-to-image");
    return toBlob(card.current, { pixelRatio: 3, cacheBust: true });
  };
  const download = (blob: Blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };
  const go = async (mode: "share" | "save") => {
    setBusy(true);
    try {
      const blob = await make();
      if (!blob) return;
      const file = new File([blob], name, { type: "image/png" });
      if (mode === "share" && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: url });
      else {
        download(blob);
        flash("Image saved");
      }
    } catch {
      /* closed the share sheet */
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet onClose={onClose} label="Share">
      <div className="rm-row"><b className="rm-grow" style={{ fontSize: 20 }}>Share it</b><CloseX onClick={onClose} /></div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <div ref={card} style={{ width: 270, aspectRatio: "9 / 16", borderRadius: 22, padding: "18px 16px", display: "flex", flexDirection: "column", color: "#fff", background: `linear-gradient(160deg, ${room.accent} 0%, #7a3cff 75%, #22094a 100%)`, fontFamily: "var(--font-body), system-ui, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: 14 }}>{room.name} <Verified size={16} /></div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>anonymous · {post.kind === "voice" ? "voice note" : "#" + post.number}</div>
          <div style={{ flex: 1 }} />
          <p style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 800, fontSize: short.length > 160 ? 16 : 22, lineHeight: 1.22, whiteSpace: "pre-line" }}>{short}</p>
          {post.take && (
            <div style={{ marginTop: 12, background: "rgba(0,0,0,.25)", borderRadius: 14, padding: "8px 10px", fontSize: 12.5 }}>
              <b style={{ display: "flex", alignItems: "center", gap: 4 }}>@{room.host} <Verified size={12} /></b>
              {post.take}
            </div>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, fontWeight: 800, textAlign: "center", background: "rgba(0,0,0,.25)", borderRadius: 12, padding: "8px 6px" }}>Send yours · {url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 16 }}>
        <button className="rm-btn sm" onClick={() => void go("share")} disabled={busy}>Status</button>
        <button className="rm-btn sm soft" onClick={() => void navigator.clipboard?.writeText(url).then(() => flash("Link copied"))}>Copy link</button>
        <button className="rm-btn sm soft" onClick={() => void go("save")} disabled={busy}>Save</button>
      </div>
    </Sheet>
  );
}
