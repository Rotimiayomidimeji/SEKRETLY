import "server-only";

import type { NotificationKind } from "@prisma/client";

import { db } from "@/lib/db";

/** Adds an in-app notification (Notifications page and bell). Push to the phone is layered on top later. */
export async function notify(userId: string, kind: NotificationKind, title: string, href: string, body = "") {
  await db.notification.create({ data: { userId, kind, title, body, href } });
}
