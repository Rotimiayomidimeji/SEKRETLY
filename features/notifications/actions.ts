"use server";

import { after } from "next/server";
import { z } from "zod";

import { sendPush } from "@/features/notifications/push";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function markNotificationsRead(ids: string[]) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const list = z.array(z.string().max(40)).max(200).parse(ids);
  await db.notification.updateMany({ where: { userId: user.id, id: { in: list }, readAt: null }, data: { readAt: new Date() } });
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return { ok: true };
}

const subSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
});

/**
 * Saves this phone's push subscription (after the member allowed notifications, and again on each visit so the
 * phone stays tied to whoever is logged in). `hello` sends a confirmation push, so they see it working at once.
 */
export async function savePushSubscription(input: unknown, userAgent?: string, hello = false) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const sub = subSchema.parse(input);
  // the confirmation goes to a phone once, the first time it's saved, however often push is switched on
  const known = await db.pushSubscription.findUnique({ where: { endpoint: sub.endpoint }, select: { id: true } });
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { userId: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent: userAgent?.slice(0, 200) },
    update: { userId: user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
  if (hello && !known) after(() => sendPush(user.id, { title: "Notifications are on", body: "New messages and replies will show up here, even with Sekretly closed.", url: "/notifications", tag: "hello" }, "always"));
  return { ok: true };
}

/** Turns push off for this phone. */
export async function removePushSubscription(endpoint: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await db.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } });
  return { ok: true };
}
