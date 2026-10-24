"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Fills the screens' ad slots (the .ad boxes, shown only when Admin › Ads turns them on) with Google AdSense units.
 * Without NEXT_PUBLIC_ADSENSE_CLIENT it does nothing, so no ad code loads.
 */
export function AdFiller() {
  const path = usePathname();
  useEffect(() => {
    if (!CLIENT) return;
    if (!document.querySelector("script[data-sk-adsense]")) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + CLIENT;
      s.crossOrigin = "anonymous";
      s.dataset.skAdsense = "1";
      document.head.appendChild(s);
    }
    // wait a beat for the screen to render its slots, then fill the visible ones once each
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.sk[data-ads="on"] .ad:not([data-filled])').forEach((slot) => {
        if (!slot.offsetWidth) return;
        slot.dataset.filled = "1";
        slot.innerHTML = "";
        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.style.width = "100%";
        ins.style.height = "100%";
        ins.dataset.adClient = CLIENT;
        ins.dataset.adFormat = "auto";
        ins.dataset.fullWidthResponsive = "true";
        slot.appendChild(ins);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    }, 800);
    return () => clearTimeout(t);
  }, [path]);
  return null;
}
