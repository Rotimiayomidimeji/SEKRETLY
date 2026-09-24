"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function ScrollStory() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const heroWorld = document.querySelector(".hero-world-wrap");
      const universeOrb = document.querySelector(".universe-field__orb");
      const inboxSnippet = document.querySelector(".loop-snippet--inbox");
      if (heroWorld) gsap.to(heroWorld, { rotate: 5, scale: 0.84, yPercent: -16, ease: "none", scrollTrigger: { trigger: ".hero-scene", start: "top top", end: "bottom top", scrub: 1 } });
      if (universeOrb) gsap.fromTo(universeOrb, { y: 35, rotate: -12 }, { y: -35, rotate: 12, ease: "none", scrollTrigger: { trigger: ".universe-section", start: "top bottom", end: "bottom top", scrub: 1.2 } });
      if (inboxSnippet) gsap.fromTo(inboxSnippet, { y: 30, rotate: -2 }, { y: -28, rotate: 5, ease: "none", scrollTrigger: { trigger: ".loop-section", start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    return () => context.revert();
  }, []);
  return null;
}
