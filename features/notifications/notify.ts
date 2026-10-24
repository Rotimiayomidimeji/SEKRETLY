import "server-only";

import type { NotificationKind } from "@prisma/client";
import { after } from "next/server";

import { prefFor, sendPush } from "@/features/notifications/push";
import { db } from "@/lib/db";

/** Adds an in-app notification (Notifications page and bell) and pushes it to the member's phones once the response is sent. */
export async function notify(userId: string, kind: NotificationKind, title: string, href: string, body = "") {
  await db.notification.create({ data: { userId, kind, title, body, href } });
  // the welcome note is for the app only; everything else also goes to the lock screen
  if (kind !== "WELCOME") after(() => sendPush(userId, { title, body, url: href, tag: kind }, prefFor(kind)));
}
