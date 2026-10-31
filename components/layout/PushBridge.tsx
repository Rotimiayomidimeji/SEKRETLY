"use client";

import { useEffect } from "react";

import { removePushSubscription, savePushSubscription } from "@/features/notifications/actions";

type PushResult = "on" | "denied" | "unsupported" | "install" | "error";
declare global {
  interface Window {
    /** Used by the ported screens (onboarding, notifications, settings) and PushPrompt to turn push on or off for this phone. */
    skPush?: {
      supported: boolean;
      /** iPhone/iPad in Safari: push only works once Sekretly is added to the Home Screen and opened from there */
      needsInstall: boolean;
      isOn: () => Promise<boolean>;
      enable: () => Promise<PushResult>;
      disable: () => Promise<void>;
    };
  }
}

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

const key = (b64: string) => {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

const sameKey = (sub: PushSubscription) => {
  const k = sub.options?.applicationServerKey;
  if (!k) return true;
  const a = new Uint8Array(k), b = key(VAPID);
  return a.length === b.length && a.every((x, i) => x === b[i]);
};

/** This phone's subscription, made (or remade, if it was made with other keys) when needed. */
async function subscription(reg: ServiceWorkerRegistration) {
  const old = await reg.pushManager.getSubscription();
  if (old && sameKey(old)) return old;
  if (old) await old.unsubscribe().catch(() => {});
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(VAPID) });
}

/** Registers the service worker (offline page + push), keeps this phone's subscription current, exposes window.skPush. */
export function PushBridge() {
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID;
    const ready = "serviceWorker" in navigator ? navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready) : null;

    window.skPush = {
      supported,
      needsInstall: ios && !standalone,
      isOn: async () => {
        if (!supported || !ready || Notification.permission !== "granted") return false;
        return !!(await (await ready).pushManager.getSubscription());
      },
      enable: async () => {
        if (!supported || !ready) return ios && !standalone ? "install" : "unsupported";
        try {
          if ((await Notification.requestPermission()) !== "granted") return "denied";
          const sub = await subscription(await ready);
          // one "Notifications are on" per phone, ever (the server also skips phones it already has)
          let first = true;
          try {
            first = !localStorage.getItem("sk-push-hello");
            localStorage.setItem("sk-push-hello", "1");
          } catch {}
          const saved = await savePushSubscription(sub.toJSON(), navigator.userAgent, first);
          return saved.ok ? "on" : "error";
        } catch {
          return "error";
        }
      },
      disable: async () => {
        if (!ready) return;
        const sub = await (await ready).pushManager.getSubscription();
        if (!sub) return;
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      },
    };

    // already allowed: make sure the server has this phone, for whoever is logged in now
    if (supported && ready && Notification.permission === "granted") {
      ready
        .then(subscription)
        .then((sub) => savePushSubscription(sub.toJSON(), navigator.userAgent))
        .catch(() => {});
    }
    window.dispatchEvent(new Event("sk-push-ready"));
  }, []);
  return null;
}
