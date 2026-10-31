"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// The Sekretly logo breathing over a blurred screen, so nobody is left staring at a page that seems stuck.
// It shows when:
//   · a link to another screen is tapped (until that screen arrives)
//   · the page is about to reload or leave (window.location changes)
// Quick things on the same screen (saving a switch, sending a chat, pausing a link) never show it: their own
// button shows it's working, and a full-screen cover for those just gets in the way.

/** The pulsing logo itself, also used by the loading.tsx screens while a page renders on the server. */
export function LoaderMark({ label = "Loading" }: { label?: string }) {
  return (
    <div className="sk-loader-mark" role="status" aria-live="polite">
      <span className="sk-loader-ring" aria-hidden />
      <img src="/icons/icon-192.png" alt="" width={72} height={72} />
      <span className="sr">{label}…</span>
    </div>
  );
}

const SHOW_AFTER_MS = 140; // fast screens never flash the loader
const GIVE_UP_MS = 12_000;

function Watcher({ onRoute }: { onRoute: () => void }) {
  const path = usePathname();
  const search = useSearchParams();
  const key = path + "?" + search.toString();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onRoute();
  }, [key, onRoute]);
  return null;
}

export function PageLoader() {
  const [on, setOn] = useState(false);
  const timers = useRef<{ show?: ReturnType<typeof setTimeout>; giveUp?: ReturnType<typeof setTimeout> }>({});

  const hide = useCallback(() => {
    clearTimeout(timers.current.show);
    clearTimeout(timers.current.giveUp);
    setOn(false);
  }, []);
  const show = useCallback((after: number) => {
    clearTimeout(timers.current.show);
    clearTimeout(timers.current.giveUp);
    timers.current.show = setTimeout(() => setOn(true), after);
    timers.current.giveUp = setTimeout(() => setOn(false), GIVE_UP_MS);
  }, []);

  useEffect(() => {
    // taps on links to another screen of this app
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const to = new URL(a.href, location.href);
      if (to.origin !== location.origin) return;
      if (to.pathname === location.pathname && to.search === location.search) return; // same screen (or just a #hash)
      if (to.pathname.startsWith("/api/")) return;
      show(SHOW_AFTER_MS);
    };
    // the generated screens sometimes navigate with window.location
    const onLeave = () => show(0);
    // back from another site (bfcache): nothing is loading
    const onShow = () => hide();

    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pageshow", onShow);
    };
  }, [hide, show]);

  return (
    <>
      <Suspense fallback={null}>
        <Watcher onRoute={hide} />
      </Suspense>
      <div className={"sk-loader" + (on ? " on" : "")} aria-hidden={!on}>
        {on && <LoaderMark />}
      </div>
    </>
  );
}
