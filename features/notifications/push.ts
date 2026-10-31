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
  // the subject must be "mailto:you@…" or an https address; a bare email (a common slip in the env settings) is fixed up
  const raw = (process.env.VAPID_SUBJECT || "hello@sekretly.app").trim();
  const subject = /^(mailto:|https:)/i.test(raw) ? raw : "mailto:" + raw.replace(/^mailto:/i, "");
  webpush.setVapidDetails(subject, pub.trim(), priv.trim());
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
  if (prefs.quiet === true && quietNow()) return false;
  return true;
}

/**
 * Sends to every phone the member turned push on for (pref "always" skips their switches and quiet hours).
 * Gone subscriptions are removed. Never throws; returns how many phones took it.
 */
export async function sendPush(userId: string, payload: { title: string; body?: string; url?: string; tag?: string }, pref?: string) {
  try {
    if (!configure()) {
      console.warn("push skipped: NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set");
      return 0;
    }
    const user = await db.user.findUnique({ where: { id: userId }, select: { notifPrefs: true, pushSubs: true } });
    if (!user || !user.pushSubs.length) return 0;
    if (pref !== "always" && !wantsPush((user.notifPrefs ?? {}) as PushPrefs, pref)) return 0;
    const body = JSON.stringify(payload);
    const sent = await Promise.all(
      user.pushSubs.map((s) =>
        // high urgency: Android delivers right away instead of waiting for the phone to wake up
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 12, urgency: "high" }).then(
          () => 1,
          async (e: { statusCode?: number; message?: string; body?: string }) => {
            // the phone uninstalled, turned push off, or subscribed with other keys: forget it; anything else is worth a log line
            if (e.statusCode === 404 || e.statusCode === 410 || e.statusCode === 403) await db.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
            else console.warn("push to " + new URL(s.endpoint).host + " failed:", e.statusCode ?? e.message, e.body ?? "");
            return 0;
          },
        ),
      ),
    );
    const reached = sent.reduce<number>((a, b) => a + b, 0);
    // shows up in the Vercel logs, so a missing push can be told apart from a phone that held it back
    console.log("push \"" + (payload.tag ?? "") + "\" reached " + reached + " of " + sent.length + " phone(s)");
    return reached;
  } catch (e) {
    console.error("push failed", e);
    return 0;
  }
}

export const prefFor = (kind: NotificationKind) => PREF[kind];
