"use client";

import { motion } from "framer-motion";
import { Ban, Check, Flag, LockKeyhole, Pause, ShieldCheck } from "lucide-react";
import { Reveal } from "./ExperiencePrimitives";

const controls = [{ label: "Report harmful messages", icon: Flag }, { label: "Block abusive users", icon: Ban }, { label: "Filter words", icon: Check }, { label: "Pause interactions", icon: Pause }, { label: "Privacy controls", icon: LockKeyhole }];

export function SafetyExperience() {
  return <section className="safety-section section-band" id="safety"><div className="safety-layout"><Reveal><div className="safety-visual"><motion.div className="safety-rings" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 9, repeat: Infinity }} /><motion.div className="safety-shield"><ShieldCheck size={54} strokeWidth={1.2} /></motion.div><span className="safety-particle safety-particle--one">be kind</span><span className="safety-particle safety-particle--two">blocked</span><span className="safety-particle safety-particle--three">nope</span></div></Reveal><Reveal delay={.12}><p className="eyebrow">the quiet promise</p><h2>UNKNOWN<br /><em>DOESN’T MEAN</em><br />UNCONTROLLED.</h2><p className="section-intro">Your identity isn’t shown to the recipient. You still decide what stays in your space.</p><div className="safety-controls">{controls.map(({ label, icon: Icon }) => <span key={label}><Icon size={17} />{label}</span>)}</div></Reveal></div></section>;
}
