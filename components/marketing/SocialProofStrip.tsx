"use client";

import { Eye, Layers3, LockKeyhole, MessageCircle } from "lucide-react";

const proofItems = [
  { label: "Interaction formats", value: "10", icon: Layers3, tone: "pink" },
  { label: "Built for honest replies", value: "∞", icon: MessageCircle, tone: "blue" },
  { label: "Identity shown to recipient", value: "No", icon: LockKeyhole, tone: "violet" },
  { label: "Ways to get curious", value: "Many", icon: Eye, tone: "coral" },
];

export function SocialProofStrip() {
  return <section className="social-proof" aria-label="SEKRETLY product highlights"><div className="social-proof__intro"><span className="scribble-star">✦</span><p>no names. just vibes.</p></div><div className="social-proof__items">{proofItems.map(({ label, value, icon: Icon, tone }) => <div className={`proof-chip proof-chip--${tone}`} key={label}><span className="proof-chip__icon"><Icon size={18} /></span><strong>{value}</strong><span>{label}</span></div>)}</div></section>;
}
