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
