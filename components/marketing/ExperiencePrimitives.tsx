"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Flame, Heart, LockKeyhole, MessageCircle, Send, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const demoModes: Array<{ id: string; label: string; prompt: string; cue: string; emoji: string; tone: string; icon: LucideIcon }> = [
  { id: "opinion", label: "Honest Opinion", prompt: "What do you actually think about me? 👀", cue: "be completely honest...", emoji: "◌", tone: "blue", icon: MessageCircle },
  { id: "confession", label: "Confession", prompt: "What's something you've never told me?", cue: "okay... don't judge me 😭", emoji: "♡", tone: "pink", icon: Heart },
  { id: "ama", label: "Ask Me Anything", prompt: "Ask me something you've always wanted to know.", cue: "i've always wanted to ask...", emoji: "?", tone: "violet", icon: MessageCircle },
  { id: "rate", label: "Rate Me", prompt: "How would you rate my personality?", cue: "8.5/10 because...", emoji: "★", tone: "gold", icon: Star },
  { id: "describe", label: "Describe Me", prompt: "Describe me in 3 words.", cue: "chaotic, funny...", emoji: "✳", tone: "cyan", icon: Sparkles },
  { id: "hot", label: "Hot Takes", prompt: "Drop your hottest opinion.", cue: "not gonna lie...", emoji: "↯", tone: "coral", icon: Flame },
  { id: "truth", label: "Truth or Dare", prompt: "Truth or dare?", cue: "truth 👀", emoji: "◆", tone: "lime", icon: Sparkles },
];

export function ScrollProgress() {
  return <motion.div className="scroll-progress" style={{ scaleX: useScrollProgress() }} aria-hidden="true" />;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setProgress(window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return progress;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

export function MagneticButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18 });
  const springY = useSpring(y, { stiffness: 260, damping: 18 });
  return <motion.div style={{ x: springX, y: springY }} onMouseMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); x.set((event.clientX - box.left - box.width / 2) * 0.12); y.set((event.clientY - box.top - box.height / 2) * 0.12); }} onMouseLeave={() => { x.set(0); y.set(0); }}><button className={className} {...props}>{children}</button></motion.div>;
}

export function TiltSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const smoothY = useSpring(rotateY, { stiffness: 180, damping: 22 });
  return <motion.div ref={ref} className={className} style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 900 }} onMouseMove={(event) => { const box = ref.current?.getBoundingClientRect(); if (!box) return; rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 7); rotateX.set(-((event.clientY - box.top) / box.height - 0.5) * 7); }} onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}>{children}</motion.div>;
}

export function AmbientGlyph({ glyph, className = "", label }: { glyph: string; className?: string; label?: string }) {
  return <motion.div aria-label={label} className={`ambient-glyph ${className}`} animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>{glyph}</motion.div>;
}

export function AnonymousDemo() {
  const [modeIndex, setModeIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [cue, setCue] = useState("");
  const [cueVisible, setCueVisible] = useState(true);
  const reduced = useReducedMotion();
  const mode = demoModes[modeIndex];
  const value = drafts[mode.id] ?? "";
  const cueTimer = useRef<number | undefined>(undefined);
  const engage = () => { setEngaged(true); setCueVisible(false); if (cueTimer.current) window.clearTimeout(cueTimer.current); };
  useEffect(() => { if (engaged || sent || reduced) return; const cycle = () => { let index = 0; const tick = () => { const next = mode.cue.slice(0, index); setCue(next); index += 1; if (index <= mode.cue.length) cueTimer.current = window.setTimeout(tick, 58); else cueTimer.current = window.setTimeout(() => { setCue(""); index = 0; tick(); }, 1450); }; tick(); return () => { if (cueTimer.current) window.clearTimeout(cueTimer.current); }; }; cycle(); }, [mode, engaged, sent, reduced]);
  useEffect(() => { if (engaged || sent || reduced) return; const timer = window.setInterval(() => setModeIndex((index) => (index + 1) % demoModes.length), 10000); return () => window.clearInterval(timer); }, [engaged, sent, reduced]);
  const chooseMode = (index: number) => { engage(); setModeIndex(index); };
  return <div className={`demo-device demo-device--${mode.tone}`}><div className="demo-device__top"><span className="demo-camera" /><span>9:41</span><span>•••</span></div>{sent ? <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="demo-success"><div className="demo-success__seal"><Check size={26} /></div><p className="eyebrow">sent <span>🤫</span></p><h3>Crispy has no idea who sent that.</h3><p className="muted">No names. Just vibes.</p><div className="demo-actions"><button onClick={() => { setSent(false); setEngaged(true); }}>Send another</button><a href="/signup">Make mine <ArrowUpRight size={15} /></a></div></motion.div> : <div className="demo-compose"><div className="demo-profile"><span className="demo-avatar">C</span><div><strong>@crispy</strong><span>{mode.label}</span></div><span className="demo-mode-progress" style={{ transform: `scaleX(${engaged ? 0 : 1})` }} /></div><div className="demo-mode-selector" aria-label="Choose an interaction mode">{demoModes.map(({ icon: Icon }, index) => <button key={demoModes[index].id} className={index === modeIndex ? "is-active" : ""} onClick={() => chooseMode(index)} aria-label={demoModes[index].label}><Icon size={15} /></button>)}</div><motion.p key={mode.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="demo-question">{mode.prompt}</motion.p><div className={`demo-input-wrap ${!engaged ? "is-idle" : ""}`}><textarea aria-label={`${mode.label} anonymous message`} value={value} onPointerDown={engage} onFocus={engage} onTouchStart={engage} onChange={(event) => { engage(); setDrafts((current) => ({ ...current, [mode.id]: event.target.value })); }} placeholder="" maxLength={240} />{cueVisible && !value && <span className="demo-idle-cue" aria-hidden="true">{cue}<i /></span>}</div><div className="demo-compose__foot"><span><LockKeyhole size={13} /> Identity hidden</span><span>{value.length}/240</span></div><button disabled={!value.trim()} className="demo-send" onClick={() => setSent(true)}>Send it anonymously <Send size={15} /></button></div>}</div>;
}

export function HoldReveal() {
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  return <div className={`reveal-object ${revealed ? "is-revealed" : ""}`}><div className="reveal-glow" /><motion.div animate={{ rotate: holding && !revealed ? [0, -3, 3, 0] : 0 }} transition={{ duration: .8, repeat: holding ? Infinity : 0 }} className="reveal-envelope"><span>{revealed ? "😭" : "✦"}</span></motion.div>{revealed ? <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="reveal-message">“I had a crush on you first year 😭”</motion.p> : <button className="hold-button" onPointerDown={() => { setHolding(true); window.setTimeout(() => { setRevealed(true); setHolding(false); }, 950); }} onPointerUp={() => setHolding(false)} onPointerLeave={() => setHolding(false)}><span className={holding ? "hold-progress" : ""} />Hold to reveal</button>}<div className="reveal-actions">{revealed && <><button>React</button><button>Reply</button><button>Share</button></>}</div></div>;
}

export function DemoSendIcon() { return <Send size={15} aria-hidden="true" />; }
