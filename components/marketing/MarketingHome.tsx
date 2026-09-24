"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Flame, Heart, Instagram, LockKeyhole, Menu, MessageCircle, MoreHorizontal, X, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { AdPlaceholder } from "@/components/ads/AdPlaceholder";
import { AnonymousDemo, AmbientGlyph, HoldReveal, MagneticButton, Reveal, ScrollProgress, TiltSurface } from "./ExperiencePrimitives";
import { HeroExperience } from "./HeroExperience";
import { ScrollStory } from "@/components/motion/ScrollStory";
import { HumanSocialCard } from "./HumanSocialCard";
import { SocialProofStrip } from "./SocialProofStrip";
import { HowItWorksExperience } from "./HowItWorksExperience";
import { SafetyExperience } from "./SafetyExperience";
import { TopMarquee } from "./TopMarquee";
import { InteractionWorld } from "./InteractionWorld";
import { HumanMoment } from "./HumanMoment";
import { InboxFlood } from "./InboxFlood";

const themes = [
  { name: "Liquid Wine", background: "linear-gradient(150deg,#55152e,#170c18 62%,#09070b)", ink: "#ffe8ef" },
  { name: "Midnight", background: "linear-gradient(150deg,#1f263e,#070912 70%)", ink: "#e6ebff" },
  { name: "Chrome", background: "linear-gradient(150deg,#d8dde0,#555b65 55%,#1a1d22)", ink: "#101317" },
  { name: "Electric", background: "linear-gradient(150deg,#083d58,#071217 70%)", ink: "#dff8ff" },
  { name: "Soft", background: "linear-gradient(150deg,#ead7dd,#af93a9 58%,#584258)", ink: "#241923" },
];
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--electric-blue)]";

export function MarketingHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const router = useRouter();
  const theme = themes[themeIndex];

  return <main className="experience-shell">
    <ScrollProgress />
    <ScrollStory />
    <TopMarquee />
    <nav className={`experience-nav ${menuOpen ? "is-open" : ""}`}>
      <a href="#top" className="wordmark" aria-label="Sekretly home"><span>S</span>{SITE_NAME}</a>
      <div className="experience-nav__links"><a href="#universe">Explore</a><a href="#loop">How it works</a><a href="#safety">Safety</a><a href="#stories">Stories</a></div>
      <div className="experience-nav__actions"><a className="nav-signin" href="/login">Sign in</a><a className="nav-cta" href="/signup">Start a Sekret <ArrowUpRight size={14} /></a></div>
      <button className="nav-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      {menuOpen && <div className="mobile-sheet"><span className="mobile-sheet__eyebrow">SEKRETLY / the quiet side</span><a href="#universe" onClick={() => setMenuOpen(false)}>Explore <ArrowUpRight size={18} /></a><a href="#loop" onClick={() => setMenuOpen(false)}>How it works <ArrowUpRight size={18} /></a><a href="#safety" onClick={() => setMenuOpen(false)}>Safety <ArrowUpRight size={18} /></a><a href="#stories" onClick={() => setMenuOpen(false)}>Stories <ArrowUpRight size={18} /></a><a className="mobile-sheet__button" href="/signup">Start a Sekret <ArrowUpRight size={16} /></a></div>}
    </nav>

    <HeroExperience onStart={() => router.push("/signup")} />
    <SocialProofStrip />

    <section id="universe" className="universe-section section-band"><Reveal><p className="eyebrow">scene 02 / pick your curiosity</p><h2>WHAT ARE WE<br /><em>ASKING TODAY? 👀</em></h2><p className="section-intro">Tap a mode. Change the atmosphere. Say the thing you have been holding back.</p></Reveal><InteractionWorld /></section>

    <section className="demo-section section-band"><div className="section-kicker"><span>02 / feel it first</span><span className="section-kicker__line" /></div><div className="demo-layout"><Reveal><p className="eyebrow">okay, your turn</p><h2>TRY IT.<br /><em>NO ONE’S WATCHING.</em></h2><p className="section-intro">Say the thing to Crispy. It’s just a demo, but the feeling is real.</p><div className="trust-note"><LockKeyhole size={16} /><span>Your identity isn’t shown to the recipient.</span></div></Reveal><Reveal delay={.14}><AnonymousDemo /></Reveal></div></section>

    <HowItWorksExperience />

    <HumanMoment />

    <InboxFlood />

    <section id="stories" className="share-section section-band"><div className="share-layout"><Reveal><p className="eyebrow">The answer, remixed</p><h2>TOO GOOD<br /><em>NOT TO SHARE.</em></h2><p className="section-intro">Turn the ones that hit different into something worth posting. Keep the sender secret. Keep the feeling.</p><div className="theme-picker" role="group" aria-label="Share card themes">{themes.map((item, index) => <button key={item.name} className={themeIndex === index ? "is-active" : ""} onClick={() => setThemeIndex(index)}><span style={{ background: item.background }} />{item.name}</button>)}</div><div className="share-actions"><button><span>◉</span> WhatsApp</button><button><Instagram size={15} /> Instagram</button><button><ArrowUpRight size={15} /> Copy link</button></div></Reveal><Reveal delay={.14}><div className="story-stage"><motion.div className="story-card" animate={{ background: theme.background, color: theme.ink }} transition={{ duration: .5 }}><div className="story-card__grain" /><div className="story-card__top"><span>SEKRETLY</span><span>01 / 08</span></div><div className="story-card__center"><span className="story-card__spark">✦</span><p>“You’re actually way nicer than people think 😂”</p><small>anonymous / sent with a little courage</small></div><div className="story-card__bottom"><span>say it. stay unknown.</span><Heart size={15} fill="currentColor" /></div></motion.div><div className="story-stage__reflection" /></div></Reveal></div></section>

    <section className="feed-section section-band"><Reveal><p className="eyebrow">A little peek outside</p><h2>THERE’S ALWAYS<br /><em>SOMETHING TO SAY.</em></h2></Reveal><div className="feed-layout"><TiltSurface className="feed-card feed-card--large"><div className="feed-card__meta"><span className="feed-pill feed-pill--wine">CONFESSION</span><span>demo / 12.4K responses</span></div><h3>What’s something you’ve never told anyone?</h3><div className="feed-card__footer"><span>asked by <b>@nocturne</b></span><MessageCircle size={16} /></div></TiltSurface><div className="feed-rail"><TiltSurface className="feed-card feed-card--hot"><div className="feed-card__meta"><span className="feed-pill feed-pill--gold"><Flame size={13} /> HOT TAKES</span><span>demo</span></div><h3>Drop the opinion that gets you cancelled in the group chat.</h3><div className="feed-card__footer"><span>demo reactions</span><Zap size={16} /></div></TiltSurface><TiltSurface className="feed-card feed-card--date"><div className="feed-card__meta"><span className="feed-pill feed-pill--blue">WHO SHOULD I DATE?</span><MoreHorizontal size={16} /></div><h3>Interactive prompt <span>↗</span></h3><div className="date-pair"><span>J</span><span>+</span><span>M</span></div></TiltSurface><HumanSocialCard /></div><AdPlaceholder /></div></section>

    <section className="reveal-section section-band"><div className="reveal-layout"><Reveal><p className="eyebrow">the signature move</p><h2>YOUR SEKRETS<br /><em>HIT DIFFERENT.</em></h2><p className="section-intro">hold it... don’t be scared 👀</p></Reveal><Reveal delay={.12}><HoldReveal /></Reveal></div></section>

    <SafetyExperience />

    <section className="final-section section-band"><div className="final-section__lights" /><AmbientGlyph glyph="🤫" className="final-glyph final-glyph--one" /><AmbientGlyph glyph="♡" className="final-glyph final-glyph--two" /><div className="final-section__copy"><p className="eyebrow">Your turn</p><h2>SO...<br />WHAT DO THEY<br /><em>REALLY THINK?</em></h2><div className="final-actions"><MagneticButton className={`${buttonClass} bg-white text-[var(--background)]`} onClick={() => router.push("/signup")}>Start a Sekret <ArrowUpRight size={17} /></MagneticButton><a className={`${buttonClass} border border-white/15 bg-white/5 text-white`} href="#universe">Explore first <ChevronRight size={17} /></a></div></div></section>

    <footer className="experience-footer"><div className="experience-footer__brand"><a href="#top" className="wordmark"><span>S</span>{SITE_NAME}</a><p>{SITE_TAGLINE}</p></div><div className="experience-footer__links"><div><b>Product</b><a href="#universe">Explore</a><a href="/trending">Trending</a><a href="#loop">How it works</a></div><div><b>Company</b><a href="/about">About</a><a href="/stories">Stories</a></div><div><b>Safety</b><a href="#safety">Safety</a><a href="/help">Help</a></div><div><b>Legal</b><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div><div className="experience-footer__base"><span>© 2026 Sekretly</span><span>Built for the things you almost said.</span></div></footer>
  </main>;
}
