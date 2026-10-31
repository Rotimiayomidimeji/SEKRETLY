"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps a server-rendered screen fresh: re-fetches it every `seconds` while the tab is visible, and as soon as
 * the person comes back to it. While live updates are connected (components/layout/Realtime) it stays quiet, and it
 * waits while someone is typing, so a chat or reply box never stutters under a refresh.
 */
export function LiveRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable);
      if (document.visibilityState === "visible" && !window.__skLive && !typing) router.refresh();
    };
    const timer = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);
  return null;
}
