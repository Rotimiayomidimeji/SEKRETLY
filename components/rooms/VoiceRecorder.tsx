"use client";

import { useEffect, useRef, useState } from "react";

import { decode, disguise, DISGUISES, MicRecorder, peaksOf, playBuffer, toWav, type DisguiseId } from "@/lib/voice";

// The voice sheet in a room. Two uses:
//   "tip"  a reader's voice tip: record → pick a disguise (always) → caption → hand back for sending
//   "take" the host's own take: record → hand back as is (his own voice, no disguise)
// Only the processed file is uploaded; the raw recording stays on the phone.

export type VoiceResult = { url: string; sec: number; peaks: number[]; disguise: string; caption: string };

async function upload(file: Blob, linkId: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const fd = new FormData();
  fd.append("file", new File([file], "voice.wav", { type: "audio/wav" }));
  fd.append("linkId", linkId);
  try {
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({ ok: false, error: "Couldn’t upload (error " + r.status + ")." }));
    return j.ok ? { ok: true, url: j.url } : { ok: false, error: j.error || "Couldn’t upload that." };
  } catch {
    return { ok: false, error: "Couldn’t upload. Check your connection." };
  }
}

const fmt = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export function VoiceRecorder({ mode, linkId, maxSec, onDone, onClose }: { mode: "tip" | "take"; linkId: string; maxSec: number; onDone: (r: VoiceResult) => Promise<string | null> | string | null; onClose: () => void }) {
  const [step, setStep] = useState<"record" | "disguise" | "busy">("record");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [meter, setMeter] = useState<number[]>(() => Array(48).fill(4));
  const [raw, setRaw] = useState<AudioBuffer | null>(null);
  const [voice, setVoice] = useState<DisguiseId>("deep");
  const [out, setOut] = useState<AudioBuffer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyWord, setBusyWord] = useState("");
  const mic = useRef<MicRecorder | null>(null);
  const stopPlay = useRef<(() => void) | null>(null);
  const tick = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (tick.current) window.clearInterval(tick.current);
      mic.current?.cancel();
      stopPlay.current?.();
    },
    [],
  );

  const preview = async (buf: AudioBuffer, id: DisguiseId) => {
    stopPlay.current?.();
    setPlaying(false);
    const d = await disguise(buf, id);
    setOut(d);
    stopPlay.current = playBuffer(d, () => setPlaying(false));
    setPlaying(true);
  };

  const finish = async () => {
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
    setRecording(false);
    if (!mic.current) return;
    const blob = await mic.current.stop();
    try {
      const buf = await decode(blob);
      if (buf.duration < 1) {
        setError("That was too short. Talk a little longer.");
        return;
      }
      setRaw(buf);
      if (mode === "tip") {
        setStep("disguise");
        await preview(buf, voice);
      }
    } catch {
      setError("Couldn’t read that recording. Try again.");
    }
  };

  const start = async () => {
    setError(null);
    if (!MicRecorder.supported()) {
      setError("This browser can’t record. Try Chrome or Safari.");
      return;
    }
    try {
      mic.current = new MicRecorder();
      await mic.current.start();
    } catch {
      setError("Allow the microphone to record: check this site’s permission in your browser.");
      return;
    }
    setRaw(null);
    setOut(null);
    setRecording(true);
    setElapsed(0);
    setMeter(Array(48).fill(4));
    tick.current = window.setInterval(() => {
      const m = mic.current;
      if (!m) return;
      const s = (Date.now() - m.started) / 1000;
      setElapsed(s);
      setMeter((prev) => [...prev.slice(1), Math.max(4, m.level())]);
      if (s >= maxSec) void finish();
    }, 100);
  };

  const togglePlay = () => {
    if (playing) {
      stopPlay.current?.();
      setPlaying(false);
    } else if (out) {
      stopPlay.current = playBuffer(out, () => setPlaying(false));
      setPlaying(true);
    }
  };

  const send = async () => {
    const buf = mode === "tip" ? out : raw;
    if (!buf) return;
    stopPlay.current?.();
    setPlaying(false);
    setStep("busy");
    setError(null);
    let final = buf;
    if (mode === "take") {
      setBusyWord("Getting your take ready…");
      // the host's own voice, just made small (8 kHz mono) like the tips
      const ctx = new OfflineAudioContext(1, Math.ceil(buf.duration * 8000), 8000);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
      final = await ctx.startRendering();
    }
    setBusyWord("Uploading…");
    const up = await upload(toWav(final), linkId);
    if (!up.ok) {
      setError(up.error);
      setStep(mode === "tip" ? "disguise" : "record");
      return;
    }
    setBusyWord(mode === "tip" ? "Sending to the editor’s desk…" : "Saving…");
    const err = await onDone({ url: up.url, sec: Math.max(1, Math.round(final.duration)), peaks: peaksOf(final), disguise: mode === "tip" ? voice : "host", caption: caption.trim() });
    if (err) {
      setError(err);
      setStep(mode === "tip" ? "disguise" : "record");
    }
  };

  const hasTake = !recording && !!raw;
  const outPeaks = out ? peaksOf(out, 40) : Array(40).fill(10);
  return (
    <div className="rm-scrim" onClick={onClose}>
      <div className="rm-sheet" role="dialog" aria-label={mode === "tip" ? "Record a voice tip" : "Record your take"} onClick={(e) => e.stopPropagation()}>
        <div className="rm-row">
          <span className="rm-pill" style={{ flex: 1 }}>{mode === "take" ? "Your take · your own voice" : step === "record" ? "Voice tip · record" : "Voice tip · disguise and send"}</span>
          <button className="rm-iconbtn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {step === "record" && (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <div className="rm-timer" style={{ fontSize: 56 }}>{fmt(elapsed)}</div>
            <div className="rm-muted" style={{ opacity: 0.7 }}>
              of {fmt(maxSec)}
              {mode === "tip" ? " · the room’s limit" : ""}
            </div>
            <div className="rm-meter" style={{ marginTop: 16 }} aria-hidden="true">
              {meter.map((m, i) => (
                <i key={i} style={{ height: m + "%" }} />
              ))}
            </div>
            <button className={"rm-rec " + (recording ? "on" : "")} onClick={recording ? () => void finish() : () => void start()} aria-label={recording ? "Stop recording" : "Start recording"} style={{ margin: "22px auto 0" }}>
              {recording ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" /></svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
              )}
            </button>
            <p className="rm-ui" style={{ fontWeight: 800, marginTop: 14 }}>{recording ? "Tap to stop" : hasTake ? "Tap to record again" : "Tap to start talking"}</p>
            {mode === "tip" && !recording && !raw && <p className="rm-ui" style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>Your real voice stays on this phone. We disguise it here before anything is sent.</p>}
            {mode === "take" && hasTake && raw && (
              <button className="rm-btn" onClick={() => void send()} style={{ width: "100%", marginTop: 16 }}>
                Use this take ({fmt(raw.duration)})
              </button>
            )}
          </div>
        )}

        {step === "disguise" && (
          <div>
            <h2 className="rm-sent" style={{ fontSize: 26, marginTop: 8 }}>Pick your disguise</h2>
            <p className="rm-ui" style={{ fontSize: 13.5, marginTop: 4, color: "var(--muted)" }}>Tap one to hear yourself in it. There’s no “no disguise” option.</p>
            <div className="rm-voices" style={{ marginTop: 12 }}>
              {DISGUISES.map((d) => (
                <button
                  key={d.id}
                  className="rm-vc"
                  aria-pressed={voice === d.id}
                  onClick={() => {
                    setVoice(d.id);
                    if (raw) void preview(raw, d.id);
                  }}
                >
                  {d.name}
                  <small>{d.sub}</small>
                </button>
              ))}
            </div>
            <div className="rm-voice" style={{ marginTop: 14 }}>
              <button className="rm-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play the disguised voice"} disabled={!out}>
                {playing ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <div className="rm-wave" aria-hidden="true">
                {outPeaks.map((h, i) => (
                  <i key={i} className={playing ? "on" : ""} style={{ height: h + "%" }} />
                ))}
              </div>
              <span className="rm-time">{fmt(out?.duration ?? 0)}</span>
            </div>
            <label className="rm-label" htmlFor="vr-cap" style={{ marginTop: 14 }}>One line for the editor (optional)</label>
            <input id="vr-cap" className="rm-field" value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 140))} maxLength={140} placeholder="What’s it about?" />
            <div className="rm-row" style={{ gap: 8, marginTop: 14 }}>
              <button
                className="rm-btn ghost"
                onClick={() => {
                  stopPlay.current?.();
                  setPlaying(false);
                  setStep("record");
                  setRaw(null);
                  setOut(null);
                  setElapsed(0);
                }}
              >
                Re-record
              </button>
              <button className="rm-btn" onClick={() => void send()} disabled={!out} style={{ flex: 1 }}>
                Send voice tip
              </button>
            </div>
          </div>
        )}

        {step === "busy" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span className="rm-sent" style={{ fontSize: 20 }}>Hold on</span>
            <p className="rm-ui" style={{ marginTop: 16, fontWeight: 800 }}>{busyWord}</p>
          </div>
        )}

        {error && (
          <p className="rm-ui" role="alert" style={{ marginTop: 12, color: "#ff4f6d", fontWeight: 800, fontSize: 14 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
