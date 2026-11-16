"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const EVERY_MS = 20_000;

/** This tab's id for the visit, kept for the life of the tab (a reload keeps it, a new tab gets a new one). */
function tabId() {
  try {
    let id = sessionStorage.getItem("sk-tab");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      sessionStorage.setItem("sk-tab", id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Tells the server this tab is open (every 20s while visible, and on every page change) so the admin pages
 * can show who is live and how long people stay. Sends no content: only the page address and seconds visible.
 */
export function Presence() {
  const path = usePathname();
  const last = useRef(0);

  useEffect(() => {
    if (path.startsWith("/admin")) return;
    const id = tabId();
    if (!id) return;
    const send = (beacon = false) => {
      const now = Date.now();
      const dt = last.current ? (now - last.current) / 1000 : 0;
      last.current = now;
      const body = JSON.stringify({ id, path, ref: document.referrer || "", dt });
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/presence", body);
      else fetch("/api/presence", { method: "POST", body, keepalive: true }).catch(() => {});
    };
    send();
    const iv = window.setInterval(() => {
      if (document.visibilityState === "visible") send();
    }, EVERY_MS);
    const onVis = () => {
      if (document.visibilityState === "hidden") send(true);
      else {
        // back on the tab: the hidden time doesn't count
        last.current = Date.now();
        send();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [path]);

  return null;
}
