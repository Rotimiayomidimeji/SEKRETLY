"use client";

import { useEffect } from "react";

import { removePushSubscription, savePushSubscription } from "@/features/notifications/actions";

type PushResult = "on" | "denied" | "unsupported" | "error";
declare global {
  interface Window {
    /** Used by the ported screens (onboarding, notifications, settings) to turn push on or off for this phone. */
    skPush?: { supported: boolean; isOn: () => Promise<boolean>; enable: () => Promise<PushResult>; disable: () => Promise<void> };
  }
}

const key = (b64: string) => {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

/** Registers the service worker (offline page + push) and exposes window.skPush. Renders nothing. */
export function PushBridge() {
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    const ready = supported ? navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready) : null;
    window.skPush = {
      supported,
      isOn: async () => {
        if (!ready || Notification.permission !== "granted") return false;
        return !!(await (await ready).pushManager.getSubscription());
      },
      enable: async () => {
        if (!ready) return "unsupported";
        try {
          if ((await Notification.requestPermission()) !== "granted") return "denied";
          const reg = await ready;
          const sub =
            (await reg.pushManager.getSubscription()) ??
            (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "") }));
          const saved = await savePushSubscription(sub.toJSON(), navigator.userAgent);
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
  }, []);
  return null;
}
