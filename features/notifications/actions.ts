"use server";

import { z } from "zod";

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

/** Saves this phone's push subscription (after the member allowed notifications). */
export async function savePushSubscription(input: unknown, userAgent?: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const sub = subSchema.parse(input);
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { userId: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent: userAgent?.slice(0, 200) },
    update: { userId: user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
  return { ok: true };
}

/** Turns push off for this phone. */
export async function removePushSubscription(endpoint: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await db.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } });
  return { ok: true };
}
