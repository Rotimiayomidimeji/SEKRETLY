"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { RoomPostView } from "@/features/rooms/queries";

// Shared parts of every room theme: audio, the verified badge, emoji reactions, the confession card (paged for
// long posts), the voice-note bar, the host's reply, sheets. Themes only arrange and style them differently.

export const THEMES = [
  { id: "press", name: "Press", sub: "The channel’s own newspaper" },
  { id: "neon", name: "Neon", sub: "A late-night booth, on air" },
  { id: "stack", name: "Stack", sub: "Swipe through big cards" },
  { id: "chat", name: "Chat", sub: "The room as a group chat" },
  { id: "pop", name: "Pop", sub: "Stickers, colour, noise" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];

export const REACTIONS = [
  { label: "Love", img: "/sk/red_heart_3d.png" },
  { label: "Funny", img: "/sk/face_with_tears_of_joy_3d.png" },
  { label: "Shook", img: "/sk/face_screaming_in_fear_3d.png" },
  { label: "Hot", img: "/sk/fire.png" },
];

export const fmt = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

/** One audio element for the whole page, so only one voice plays at a time. */
export function useAudio() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [cur, setCur] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const a = new Audio();
    el.current = a;
    const t = () => setPos(a.currentTime);
    const end = () => {
      setPlaying(false);
      setPos(0);
    };
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener("timeupdate", t);
    a.addEventListener("ended", end);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", t);
      a.removeEventListener("ended", end);
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
    };
  }, []);
  const toggle = useCallback(
    (key: string, url: string) => {
      const a = el.current;
      if (!a) return;
      if (cur === key) {
        if (a.paused) void a.play().catch(() => {});
        else a.pause();
        return;
      }
      a.src = url;
      a.load();
      setCur(key);
      setPos(0);
      // some browsers drop the very first play() while the new file starts loading: try once more
      void a.play().catch(() => window.setTimeout(() => void a.play().catch(() => setPlaying(false)), 250));
    },
    [cur],
  );
  /** Jump to a point (0–1) of a voice note, starting it if needed. */
  const seek = useCallback(
    (key: string, url: string, frac: number, dur: number) => {
      const a = el.current;
      if (!a) return;
      const go = () => {
        a.currentTime = Math.max(0, Math.min(dur, frac * (a.duration && isFinite(a.duration) ? a.duration : dur)));
        setPos(a.currentTime);
      };
      if (cur !== key) {
        a.src = url;
        setCur(key);
        a.addEventListener("loadedmetadata", go, { once: true });
        a.load();
        void a.play().catch(() => {});
      } else go();
    },
    [cur],
  );
  return { cur, pos, playing, toggle, seek };
}
export type AudioCtl = ReturnType<typeof useAudio>;

/** Posts newer than this reader's last visit get a "New" tag (kept on this phone only). */
export function useLastVisit(handle: string) {
  const [since, setSince] = useState<number | null>(null);
  useEffect(() => {
    const key = "sk-room-seen:" + handle;
    let prev: number | null = null;
    try {
      prev = Number(localStorage.getItem(key)) || null;
      localStorage.setItem(key, String(Date.now()));
    } catch {}
    const t = window.setTimeout(() => setSince(prev), 0);
    return () => window.clearTimeout(t);
  }, [handle]);
  return since;
}

export function Verified({ size = 22, label = "Verified room" }: { size?: number; label?: string }) {
  return (
    <span className="rm-verified" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#2f9bff" d="M12 1.5l2.6 1.9 3.2-.2 1 3.1 2.7 1.7-.9 3.1 1 3.1-2.7 1.7-1 3.1-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3.1-2.7-1.7.9-3.1-1-3.1 2.7-1.7 1-3.1 3.2.2z" />
        <path d="m7.5 12.2 3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export const PlayIcon = ({ on, size = 18 }: { on: boolean; size?: number }) =>
  on ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
  );

export function Wave({ peaks, pct, count = 40 }: { peaks: number[]; pct: number; count?: number }) {
  const src = peaks.length ? peaks : Array(48).fill(24);
  const bars = Array.from({ length: count }, (_, i) => src[Math.floor((i / count) * src.length)] ?? 20);
  return (
    <div className="rm-wave" aria-hidden="true">
      {bars.map((h, i) => (
        <i key={i} className={i / count < pct ? "on" : ""} style={{ height: Math.max(10, h) + "%" }} />
      ))}
    </div>
  );
}

/** Splits a long confession into pages at sentence (or word) breaks, so a 2,000-character post reads like a carousel. */
export function pagesOf(text: string, size = 560) {
  const t = text.trim();
  if (t.length <= size + 80) return [t];
  const out: string[] = [];
  let rest = t;
  while (rest.length > size + 80) {
    const slice = rest.slice(0, size + 60);
    let cut = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "), slice.lastIndexOf("\n"));
    if (cut < size * 0.55) cut = slice.lastIndexOf(" ");
    if (cut < 50) cut = size;
    out.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}
const sizeOf = (t: string) => (t.length <= 90 ? "s" : t.length <= 230 ? "m" : "l");

/** The confession as an image-like card: big type when short, smaller from the top when long, with Next for pages. */
export function Art({ post, audio, label, pageSize }: { post: RoomPostView; audio: AudioCtl; label?: string; pageSize?: number }) {
  const pages = useMemo(() => pagesOf(post.text, pageSize), [post.text, pageSize]);
  const [page, setPage] = useState(0);
  const isCur = audio.cur === post.id;
  const text = pages[Math.min(page, pages.length - 1)] ?? "";
  return (
    <div className="rm-art">
      {post.kind === "voice" && post.audioUrl && <VoiceVideo post={post} audio={audio} />}
      {text && <p className={"rm-art-text " + sizeOf(post.text)}>{text}</p>}
      <div className="rm-art-foot">
        <span>{label ?? (post.kind === "letter" ? "From the host" : "#" + post.number)}</span>
        {pages.length > 1 && (
          <div className="rm-pager">
            <div className="rm-dots" aria-hidden="true">
              {pages.map((_, i) => (
                <i key={i} className={i === page ? "on" : ""} />
              ))}
            </div>
            <button className="rm-next" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous part">‹</button>
            <button className="rm-next" onClick={() => setPage(Math.min(pages.length - 1, page + 1))} disabled={page >= pages.length - 1}>
              {page >= pages.length - 1 ? "The end" : "Next ›"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** The room's name and logo, for watermarks and avatars anywhere inside a room page. */
export const BrandContext = createContext<{ name: string; logoUrl: string | null }>({ name: "", logoUrl: null });

/** The channel's logo, or its initials until one is uploaded. */
export function Logo({ className = "rm-logo", style, letters = 2 }: { className?: string; style?: React.CSSProperties; letters?: number }) {
  const b = useContext(BrandContext);
  return (
    <span className={className} style={{ overflow: "hidden", ...style }} aria-hidden="true">
      {b.logoUrl ? <img src={b.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : b.name.slice(0, letters).toUpperCase()}
    </span>
  );
}

/** A voice note as a short "audio video": moving sound bars, the channel's watermark, progress and time. */
function VoiceVideo({ post, audio }: { post: RoomPostView; audio: AudioCtl }) {
  const b = useContext(BrandContext);
  const isCur = audio.cur === post.id, on = isCur && audio.playing;
  const pct = isCur ? audio.pos / Math.max(1, post.audioSec) : 0;
  const peaks = post.peaks.length ? post.peaks : Array(48).fill(40);
  const bars = Array.from({ length: 28 }, (_, i) => peaks[Math.floor((i / 28) * peaks.length)] ?? 40);
  return (
    <div className={"rm-vid" + (on ? " on" : "")}>
      <div className="rm-vid-wm" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <span key={i}>{b.name}</span>)}</div>
      <div className="rm-vid-brand">
        <Logo className="rm-vid-logo" />
        <b>{b.name}</b>
        <Verified size={14} />
        <span className="rm-grow" />
        <span className="rm-vid-tag">{post.voice ? post.voice + " voice" : "Voice"}</span>
      </div>
      <button className="rm-vid-stage" onClick={() => audio.toggle(post.id, post.audioUrl!)} aria-label={on ? "Pause the voice note" : "Play the voice note"}>
        <span className="rm-vid-bars" aria-hidden="true">
          {bars.map((h, i) => (
            <i key={i} style={{ height: Math.max(14, h) + "%", animationDelay: -((i * 137) % 900) + "ms" }} />
          ))}
        </span>
        <span className="rm-vid-play"><PlayIcon on={on} size={26} /></span>
      </button>
      <div className="rm-vid-foot">
        <span
          className="rm-vid-seek"
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={post.audioSec}
          aria-valuenow={Math.round(isCur ? audio.pos : 0)}
          onPointerDown={(e) => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);
            const at = (x: number) => {
              const r = el.getBoundingClientRect();
              audio.seek(post.id, post.audioUrl!, Math.max(0, Math.min(1, (x - r.left) / r.width)), post.audioSec);
            };
            at(e.clientX);
            el.onpointermove = (m) => at(m.clientX);
            el.onpointerup = () => (el.onpointermove = null);
          }}
          onKeyDown={(e) => {
            const now = isCur ? audio.pos : 0;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") audio.seek(post.id, post.audioUrl!, (now + (e.key === "ArrowRight" ? 5 : -5)) / Math.max(1, post.audioSec), post.audioSec);
          }}
        >
          <span className="rm-vid-prog"><i style={{ width: pct * 100 + "%" }} /><b style={{ left: pct * 100 + "%" }} /></span>
        </span>
        <span className="rm-time">{isCur ? fmt(audio.pos) : "0:00"} / {fmt(post.audioSec)}</span>
      </div>
    </div>
  );
}

/** The host's take, as a verified reply. */
export function Take({ post, host, audio }: { post: RoomPostView; host: string; audio: AudioCtl }) {
  if (!post.take && !post.takeAudioUrl) return null;
  const key = post.id + ":take", isCur = audio.cur === key;
  return (
    <div className="rm-take">
      <Logo className="rm-take-av" letters={1} />
      <div className="rm-take-b">
        <div className="rm-take-who">
          @{host} <Verified size={15} label="Verified host" />
        </div>
        {post.takeAudioUrl && (
          <div className="rm-row" style={{ gap: 10, marginTop: 6 }}>
            <button className="rm-play" style={{ width: 38, height: 38 }} onClick={() => audio.toggle(key, post.takeAudioUrl!)} aria-label={isCur && audio.playing ? "Pause the host’s voice" : "Play the host’s voice"}>
              <PlayIcon on={isCur && audio.playing} size={15} />
            </button>
            <Wave peaks={[]} pct={isCur ? audio.pos / Math.max(1, post.takeAudioSec) : 0} count={24} />
            <span className="rm-time">{isCur ? fmt(audio.pos) : fmt(post.takeAudioSec)}</span>
          </div>
        )}
        {post.take && <p className="rm-take-say">{post.take}</p>}
      </div>
    </div>
  );
}

/** Emoji reactions. Each person counts once per emoji; tapping again takes it back. */
export function Reactions({ post, onReact }: { post: RoomPostView; onReact: (k: number) => void }) {
  const [burst, setBurst] = useState<{ k: number; n: number } | null>(null);
  return (
    <div className="rm-reacts">
      {REACTIONS.map((r, k) => (
        <button
          key={r.label}
          className="rm-react"
          aria-pressed={post.mine[k]}
          aria-label={r.label + ", " + post.stamps[k]}
          onClick={() => {
            if (!post.mine[k]) setBurst({ k, n: Date.now() });
            onReact(k);
          }}
        >
          <img src={r.img} alt="" />
          {post.stamps[k] > 0 ? post.stamps[k].toLocaleString("en-US") : ""}
          {burst?.k === k && <img key={burst.n} className="burst" src={r.img} alt="" onAnimationEnd={() => setBurst(null)} />}
        </button>
      ))}
    </div>
  );
}

export function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button className="rm-iconbtn" onClick={onClick} aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
    </button>
  );
}

export function Sheet({ children, onClose, label, center }: { children: React.ReactNode; onClose: () => void; label: string; center?: boolean }) {
  return (
    <div className="rm-scrim" onClick={onClose}>
      <div className="rm-sheet" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()} style={center ? { textAlign: "center" } : undefined}>
        {children}
      </div>
    </div>
  );
}

export const ShareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 3v13" /><path d="m7 8 5-5 5 5" /></svg>
);
export const FlagIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 22V4" /><path d="M5 4h12l-2 4 2 4H5" /></svg>
);
export const MicIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
);
