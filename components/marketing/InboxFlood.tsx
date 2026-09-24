"use client";

import { motion } from "framer-motion";
import { Bell, Heart, MessageCircle } from "lucide-react";

const messages = [
  { label: "CONFESSION", text: "I had a crush on you first year 😭", tone: "pink" },
  { label: "HONEST OPINION", text: "you make every room less awkward", tone: "blue" },
  { label: "3 WORDS", text: "smart / funny / chaos", tone: "violet" },
  { label: "HOT TAKE", text: "brunch is expensive lunch", tone: "coral" },
];

export function InboxFlood() {
  return <section className="inbox-flood section-band"><div className="inbox-flood__heading"><p className="eyebrow">your link. their thoughts.</p><h2>FLOOD<br /><em>YOUR INBOX.</em></h2><p className="section-intro">One little link. Then suddenly everyone has something to say.</p></div><div className="inbox-flood__stage"><div className="inbox-phone"><div className="inbox-phone__notch" /><div className="inbox-phone__screen"><span className="inbox-phone__logo">S</span><small>SEKRETLY / inbox</small><strong>someone has something to say...</strong><div className="inbox-phone__notification"><Bell size={14} /> 4 new sekrets</div></div></div>{messages.map((message, index) => <motion.div key={message.label} className={`inbox-message inbox-message--${message.tone}`} animate={{ y: [0, index % 2 ? 10 : -8, 0], rotate: [index * 2 - 3, index * 2, index * 2 - 3] }} transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}><small>{message.label}</small><p>{message.text}</p><span>{index % 2 ? <MessageCircle size={14} /> : <Heart size={14} fill="currentColor" />}</span></motion.div>)}</div></section>;
}
