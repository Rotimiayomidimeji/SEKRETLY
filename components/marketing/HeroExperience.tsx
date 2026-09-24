"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SekretlyWorld } from "@/components/three/SekretlyWorld";
import { MagneticButton } from "@/components/motion/MagneticButton";

const World = dynamic(() => Promise.resolve(SekretlyWorld), { ssr: false, loading: () => <div className="sekretly-world__fallback">✦</div> });
const mobilePrompts = ["Be honest...", "Confess something 👀", "Rate me...", "Ask me anything"];

export function HeroExperience({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [promptIndex, setPromptIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -85]), { stiffness: 80, damping: 22 });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, .82]), { stiffness: 80, damping: 22 });
  const opacity = useTransform(scrollYProgress, [0, .8, 1], [1, .8, 0]);
  useEffect(() => { if (reduced) return; const timer = window.setInterval(() => setPromptIndex((index) => (index + 1) % mobilePrompts.length), 4200); return () => window.clearInterval(timer); }, [reduced]);
  return <motion.section ref={ref} id="top" className="hero-scene" style={{ opacity: reduced ? 1 : opacity }}><div className="hero-scene__wash" /><div className="hero-scene__grid" /><div className="hero-scene__light hero-scene__light--wine" /><div className="hero-scene__light hero-scene__light--blue" /><motion.div className="hero-copy" style={{ y, scale }}><p className="eyebrow hero-copy__eyebrow"><span className="live-dot" /> the social space for the unsaid</p><h1>say it.<br /><span>STAY</span><br />unknown.</h1><p className="hero-copy__support">ask what people really think 👀<br />no names. no pressure. just vibes.</p><div className="hero-copy__actions hero-copy__actions--desktop"><MagneticButton className="hero-start-button" onClick={onStart}>Start a Sekret <ArrowUpRight size={17} /></MagneticButton><a className="hero-explore-button" href="#universe">Explore anonymously <ChevronRight size={17} /></a></div><p className="hero-copy__note hero-copy__note--desktop"><Check size={14} /> No account needed to answer.</p></motion.div><motion.div className="hero-world-wrap" style={{ y }}><World /></motion.div><div className="hero-messages"><span className="hero-message hero-message--a">What do you actually think about me?</span><span className="hero-message hero-message--b">Confess something 👀</span><span className="hero-message hero-message--c">Rate me</span><span className="hero-message hero-message--d">Describe me in 3 words.</span><AnimatePresence mode="wait"><motion.span key={mobilePrompts[promptIndex]} className="hero-message-mobile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{mobilePrompts[promptIndex]}</motion.span></AnimatePresence></div><div className="hero-mobile-actions"><MagneticButton className="hero-start-button" onClick={onStart}>Start a Sekret <ArrowUpRight size={17} /></MagneticButton><a className="hero-explore-button" href="#universe">Explore anonymously <ChevronRight size={17} /></a><p className="hero-copy__note"><Check size={14} /> No account needed to answer.</p></div><div className="scroll-cue"><span>scroll to get curious</span><ArrowDown size={15} /></div></motion.section>;
}
