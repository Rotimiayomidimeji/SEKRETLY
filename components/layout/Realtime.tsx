"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    /** true while the live connection is up (LiveRefresh then stops polling) */
    __skLive?: boolean;
  }
}

/**
 * Keeps every member screen in step with the server: listens on the member's own Pusher channel and refreshes the
 * screen's data the moment something changes. Also refreshes a screen brought back with Back/Forward from another
 * page (the browser shows the copy it kept, which can be out of date) or when the app comes back to the foreground.
 * Back inside one screen (closing a message, a settings section) stays on the copy it has: nothing new to fetch.
 */
export function Realtime({ userId }: { userId: string }) {
  const router = useRouter();
  // the page on screen; a Back that lands on the same page was only an inner view closing
  const pathname = usePathname();
  const shown = useRef(pathname);
  useEffect(() => {
    shown.current = pathname;
  }, [pathname]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // several events in a burst cause one refresh
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };
    const onPop = () => {
      if (location.pathname !== shown.current) refresh();
    };
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) refresh();
    };
    let hidden = 0;
    const onVisible = () => {
      if (document.visibilityState === "hidden") hidden = Date.now();
      else if (Date.now() - hidden > 15_000) refresh();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVisible);

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY, cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    let stop = () => {};
    if (key && cluster) {
      let cancelled = false;
      import("pusher-js").then(({ default: Pusher }) => {
        if (cancelled) return;
        const p = new Pusher(key, { cluster, channelAuthorization: { endpoint: "/api/realtime/auth", transport: "ajax" } });
        const ch = p.subscribe("private-user-" + userId);
        ch.bind_global(refresh);
        p.connection.bind("state_change", (s: { current: string }) => {
          window.__skLive = s.current === "connected";
          if (s.current === "connected") refresh(); // catch up on anything missed while offline
        });
        stop = () => {
          window.__skLive = false;
          ch.unbind_global();
          p.disconnect();
        };
      });
      stop = () => {
        cancelled = true;
      };
    }
    return () => {
      clearTimeout(timer);
      stop();
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, userId]);
  return null;
}
