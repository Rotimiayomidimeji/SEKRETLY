"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, LockKeyhole, MessageCircle } from "lucide-react";

const messages = [
  { label: "CONFESSION", text: "I had a crush on you in first year.", tone: "pink" },
  { label: "HONEST OPINION", text: "You make every room less awkward.", tone: "blue" },
  { label: "3 WORDS", text: "smart / funny / chaos", tone: "violet" },
];

export function InboxFlood() {
  const reduced = useReducedMotion();

  return <section id="inbox" className="inbox-flood section-band"><div className="inbox-flood__heading"><p className="eyebrow">your link. their honest answers.</p><h2>WATCH YOUR<br /><em>INBOX LIGHT UP.</em></h2><p className="section-intro">Responses arrive together in one private place. The examples below demonstrate the experience—they are not real testimonials.</p><div className="inbox-proof"><LockKeyhole size={17} /><span>Example responses. No fake users, counts, or activity.</span></div></div><div className="inbox-flood__stage"><div className="inbox-phone"><div className="inbox-phone__notch" /><div className="inbox-phone__screen"><div className="inbox-phone__header"><span className="inbox-phone__logo">S</span><div><small>SEKRETLY</small><strong>Inbox</strong></div></div><p className="inbox-phone__summary">Three example responses</p><div className="inbox-phone__list">{messages.map((message) => <article key={message.label}><span className={`inbox-phone__dot inbox-phone__dot--${message.tone}`} /><div><small>{message.label}</small><p>{message.text}</p></div></article>)}</div><div className="inbox-phone__notification"><MessageCircle size={14} /> Responses stay private until you choose to share.</div></div></div>{messages.map((message, index) => <motion.div key={message.label} className={`inbox-message inbox-message--${message.tone}`} animate={reduced ? undefined : { y: [0, index % 2 ? 8 : -7, 0], rotate: [index * 2 - 3, index * 2, index * 2 - 3] }} transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}><small>{message.label}</small><p>{message.text}</p><span><Heart size={14} aria-hidden="true" /></span></motion.div>)}</div></section>;
}
