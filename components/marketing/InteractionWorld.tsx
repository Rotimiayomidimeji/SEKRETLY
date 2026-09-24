"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Flame, Heart, MessageCircle, Send, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { interactionTypes } from "@/config/interactions";

const modes = [
  { slug: "confession", label: "Confession", prompt: "Say the thing you've been holding back.", emoji: "♡", tone: "wine", icon: Heart },
  { slug: "rate-me", label: "Rate Me", prompt: "How would you rate my personality?", emoji: "★", tone: "gold", icon: Star },
  { slug: "ama", label: "Ask Me Anything", prompt: "What's something you've always wanted to ask?", emoji: "?", tone: "violet", icon: MessageCircle },
  { slug: "hot-takes", label: "Hot Takes", prompt: "Drop the opinion that gets you cancelled.", emoji: "↯", tone: "coral", icon: Flame },
  { slug: "describe-me", label: "Describe Me", prompt: "Describe me in three words.", emoji: "✳", tone: "blue", icon: Sparkles },
];

export function InteractionWorld() {
  const [active, setActive] = useState(0);
  const [value, setValue] = useState("");
  const mode = modes[active];
  const allItems = interactionTypes.filter((item) => item.slug !== "anonymous-message");
  return <div className={`interaction-world interaction-world--${mode.tone}`}><div className="interaction-world__ambient" /><div className="interaction-world__modes">{modes.map((item, index) => { const Icon = item.icon; return <button key={item.slug} className={index === active ? "is-active" : ""} onClick={() => { setActive(index); setValue(""); }}><Icon size={17} /><span>{item.label}</span></button>; })}</div><div className="interaction-world__stage"><AnimatePresence mode="wait"><motion.div key={mode.slug} className="interaction-world__active" initial={{ opacity: 0, scale: .82, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: .82, rotate: 8 }} transition={{ type: "spring", stiffness: 180, damping: 18 }}><div className="interaction-world__object"><span>{mode.emoji}</span><div /></div><div className="interaction-world__active-copy"><small>selected / game mode</small><h3>{mode.label}</h3><p>{mode.prompt}</p><textarea aria-label={`${mode.label} response`} value={value} onChange={(event) => setValue(event.target.value)} placeholder="say it here..." /><button disabled={!value.trim()} onClick={() => setValue("")}>Send anonymously <Send size={15} /></button></div></motion.div></AnimatePresence>{allItems.filter((item) => item.slug !== mode.slug).slice(0, 4).map((item, index) => <button key={item.id} className={`interaction-world__satellite interaction-world__satellite--${index + 1}`} onClick={() => { const next = modes.findIndex((candidate) => candidate.slug === item.slug); if (next >= 0) setActive(next); }}>{item.theme.emoji}<span>{item.shortName}</span></button>)}</div><p className="interaction-world__hint">tap an object to switch the question <ArrowUpRight size={14} /></p></div>;
}
