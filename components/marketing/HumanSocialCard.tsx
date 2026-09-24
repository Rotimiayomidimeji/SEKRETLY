"use client";

import { ArrowUpRight, Heart } from "lucide-react";

export function HumanSocialCard() {
  return <article className="human-social-card"><div className="human-social-card__portrait" aria-label="Local portrait asset slot for a public discovery card"><span>portrait slot</span><strong>@maya</strong></div><div className="human-social-card__copy"><span>RATE ME / public demo</span><p>be brutal. like actually honest.</p><div><span>♡ 342 reactions</span><Heart size={14} fill="currentColor" /><ArrowUpRight size={14} /></div></div></article>;
}
