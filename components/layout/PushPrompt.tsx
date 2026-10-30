"use client";

import { useEffect, useState } from "react";

// A small card asking a member to turn on notifications for this phone (or, on iPhone in Safari, to add Sekretly to
// the Home Screen first, which Apple requires for push). Hidden once push is on, after "Not now" for 3 days, or if blocked.

const SNOOZE = "sk-push-snooze";
const DAYS3 = 3 * 86_400_000;

type Ask = "push" | "install" | null;

export function PushPrompt() {
  const [ask, setAsk] = useState<Ask>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const p = window.skPush;
      if (!p) return;
      try {
        if (Date.now() - Number(localStorage.getItem(SNOOZE) || 0) < DAYS3) return;
      } catch {}
      if (p.needsInstall) timer = setTimeout(() => setAsk("install"), 2500);
      else if (p.supported && Notification.permission === "default") timer = setTimeout(() => setAsk("push"), 2500);
    };
    if (window.skPush) check();
    else window.addEventListener("sk-push-ready", check, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("sk-push-ready", check);
    };
  }, []);

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE, String(Date.now()));
    } catch {}
    setAsk(null);
  };

  const turnOn = async () => {
    if (!window.skPush || busy) return;
    setBusy(true);
    const r = await window.skPush.enable();
    setBusy(false);
    if (r === "on") {
      setNote("Done. A test notification is on its way.");
      setTimeout(() => setAsk(null), 2500);
    } else if (r === "denied") {
      setNote("Notifications are blocked. Allow them for this site in your browser settings.");
      setTimeout(snooze, 4000);
    } else setNote("Couldn’t turn them on. Try again from Settings › Notifications.");
  };

  if (!ask) return null;
  return (
    <div role="dialog" aria-label="Turn on notifications" className="sk-pushprompt">
      <img src="/icons/icon-192.png" alt="" width={40} height={40} />
      <div className="sk-pushprompt-text">
        {ask === "install" ? (
          <>
            <b>Get notified on your iPhone</b>
            <span>
              Tap <span aria-label="Share">Share</span> <ShareGlyph /> then <b>Add to Home Screen</b>. Open Sekretly from there and turn on notifications.
            </span>
          </>
        ) : (
          <>
            <b>{note ? note : "Know the moment a message lands"}</b>
            {!note && <span>Turn on notifications for this phone. You can change them anytime in Settings.</span>}
          </>
        )}
      </div>
      <div className="sk-pushprompt-actions">
        {ask === "push" && !note && (
          <button type="button" onClick={turnOn} disabled={busy} className="sk-pushprompt-on">
            {busy ? "…" : "Turn on"}
          </button>
        )}
        <button type="button" onClick={snooze} className="sk-pushprompt-later">
          {ask === "install" ? "Got it" : "Not now"}
        </button>
      </div>
    </div>
  );
}

const ShareGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px" }} aria-hidden>
    <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);
