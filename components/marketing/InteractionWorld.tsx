"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Flame, Heart, MessageCircle, Sparkles, Star } from "lucide-react";
import { useState } from "react";

const modes = [
  { slug: "confession", label: "Confession", prompt: "Say the thing you have been holding back.", example: "What is something you have never told me?", emoji: "♡", tone: "wine", icon: Heart },
  { slug: "rate-me", label: "Rate Me", prompt: "Get the honest version, without the awkward pause.", example: "How would you rate my personality?", emoji: "★", tone: "gold", icon: Star },
  { slug: "ama", label: "Ask Me Anything", prompt: "Open the door to questions people usually avoid.", example: "What have you always wanted to ask me?", emoji: "?", tone: "violet", icon: MessageCircle },
  { slug: "hot-takes", label: "Hot Takes", prompt: "Invite the opinion that never makes the group chat.", example: "What opinion would get you cancelled here?", emoji: "↯", tone: "coral", icon: Flame },
  { slug: "describe-me", label: "Describe Me", prompt: "Find out the impression you actually leave behind.", example: "Describe me in three words.", emoji: "✦", tone: "blue", icon: Sparkles },
];

export function InteractionWorld() {
  const [active, setActive] = useState(0);
  const mode = modes[active];

  return <div className={`interaction-world interaction-world--${mode.tone}`}><div className="interaction-world__ambient" /><div className="interaction-world__modes" role="tablist" aria-label="Interaction types">{modes.map((item, index) => { const Icon = item.icon; return <button key={item.slug} type="button" role="tab" aria-selected={index === active} aria-controls="prompt-preview" className={index === active ? "is-active" : ""} onClick={() => setActive(index)}><Icon size={17} /><span>{item.label}</span></button>; })}</div><div className="interaction-world__stage"><AnimatePresence mode="wait"><motion.div id="prompt-preview" role="tabpanel" key={mode.slug} className="interaction-world__active" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.28 }}><div className="interaction-world__object" aria-hidden="true"><span>{mode.emoji}</span><div /></div><div className="interaction-world__active-copy"><small>selected prompt</small><h3>{mode.label}</h3><p>{mode.prompt}</p><blockquote>“{mode.example}”</blockquote><a href={`/signup?type=${mode.slug}`}>Create this prompt <ArrowUpRight size={15} /></a></div></motion.div></AnimatePresence></div><p className="interaction-world__hint">Five ways to start an honest conversation.</p></div>;
}
