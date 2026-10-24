import "server-only";

import type { NotificationKind } from "@prisma/client";
import webpush from "web-push";

import { db } from "@/lib/db";

// Web Push: every in-app notification is also sent to the member's phones, unless their settings say otherwise.

let ready = false;
function configure() {
  if (ready) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@sekretly.app", pub, priv);
  ready = true;
  return true;
}

/** Which Settings › Notifications switch covers each kind (warnings always go: they're about the account). */
const PREF: Partial<Record<NotificationKind, string>> = { MESSAGE: "msg", REPLY: "reply", LINK_NAP: "paused" };
export type PushPrefs = Partial<Record<"msg" | "reply" | "join" | "turn" | "paused" | "warn" | "drop" | "streak" | "wrap" | "quiet", boolean>>;

/** 11pm to 7am in Lagos. */
const quietNow = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  return h >= 23 || h < 7;
};

/** Whether a push of this kind (or scheduled topic) should go to this member right now. */
export function wantsPush(prefs: PushPrefs, pref: string | undefined) {
  if (pref && prefs[pref as keyof PushPrefs] === false) return false;
  if (prefs.quiet !== false && quietNow()) return false;
  return true;
}

/** Sends to every phone the member turned push on for. Gone subscriptions are removed. Never throws. */
export async function sendPush(userId: string, payload: { title: string; body?: string; url?: string; tag?: string }, pref?: string) {
  try {
    if (!configure()) return;
    const user = await db.user.findUnique({ where: { id: userId }, select: { notifPrefs: true, pushSubs: true } });
    if (!user || !user.pushSubs.length) return;
    if (!wantsPush((user.notifPrefs ?? {}) as PushPrefs, pref)) return;
    const body = JSON.stringify(payload);
    await Promise.all(
      user.pushSubs.map((s) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 12 }).catch(async (e: { statusCode?: number; message?: string }) => {
          // the phone uninstalled or turned push off: forget it; anything else is worth a log line
          if (e.statusCode === 404 || e.statusCode === 410) await db.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
          else console.warn("push to " + new URL(s.endpoint).host + " failed:", e.statusCode ?? e.message);
        }),
      ),
    );
  } catch (e) {
    console.error("push failed", e);
  }
}

export const prefFor = (kind: NotificationKind) => PREF[kind];
