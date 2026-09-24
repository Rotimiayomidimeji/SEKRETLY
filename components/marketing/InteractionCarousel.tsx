"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Flame, Heart, MessageCircle, Star } from "lucide-react";
import { interactionTypes } from "@/config/interactions";

const items = interactionTypes.filter((item) => ["honest-opinion", "confession", "rate-me", "ama", "who-should-i-date", "describe-me", "hot-takes", "truth-or-dare"].includes(item.slug));
const objectIcons = [MessageCircle, Heart, Star, MessageCircle, Heart, MessageCircle, Flame, Star];

export function InteractionCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const moveTo = (index: number) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    const rail = railRef.current;
    const slide = rail?.children[next] as HTMLElement | undefined;
    if (!rail || !slide) return;
    const left = slide.offsetLeft - (rail.clientWidth - slide.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  };
  useEffect(() => {
    if (manual) return;
    const timer = window.setInterval(() => moveTo(active + 1), 5000);
    return () => window.clearInterval(timer);
  }, [active, manual]);
  return <div className="interaction-carousel"><div className="interaction-carousel__top"><span>swipe / drag / tap</span><div><button aria-label="Previous interaction" onClick={() => { setManual(true); moveTo(active - 1); }}><ArrowLeft size={17} /></button><button aria-label="Next interaction" onClick={() => { setManual(true); moveTo(active + 1); }}><ArrowRight size={17} /></button></div></div><div ref={railRef} className="interaction-carousel__rail" onPointerDown={() => setManual(true)}>{items.map((item, index) => { const Icon = objectIcons[index]; return <a href={`/create/${item.slug}`} className={`interaction-slide interaction-slide--${index + 1} ${active === index ? "is-active" : ""}`} key={item.id}><div className="interaction-slide__object"><Icon size={42} strokeWidth={1.4} /><span>{item.theme.emoji}</span></div><div className="interaction-slide__copy"><small>{item.shortName}</small><h3>{item.name}</h3><p>{item.description}</p><span className="interaction-slide__cta">make one <ArrowUpRight size={16} /></span></div></a>; })}</div><div className="interaction-carousel__dots">{items.map((item, index) => <button key={item.id} aria-label={`Go to ${item.name}`} className={active === index ? "is-active" : ""} onClick={() => { setManual(true); moveTo(index); }} />)}</div></div>;
}
