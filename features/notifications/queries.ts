import "server-only";

import type { NotificationKind } from "@prisma/client";

import { db } from "@/lib/db";

// How each kind looks on the Notifications screen: its filter tab, emoji and tint (as in the mockup).
const LOOK: Record<NotificationKind, { type: string; icon: string; tint: string }> = {
  MESSAGE: { type: "messages", icon: "love_letter", tint: "linear-gradient(135deg,#ff9a4a,#ff4f6d)" },
  REPLY: { type: "messages", icon: "speech_balloon_3d", tint: "linear-gradient(135deg,#ffb35c,#ff5f8f)" },
  WARNING: { type: "safety", icon: "bell", tint: "linear-gradient(135deg,#ffb020,#c4213a)" },
  BLOCKED: { type: "safety", icon: "hourglass_not_done", tint: "linear-gradient(135deg,#3a0d2c,#1b0b26)" },
  BLOCKED_SENDER: { type: "safety", icon: "locked_3d", tint: "linear-gradient(135deg,#c4213a,#5a1240)" },
  SUPPORT: { type: "safety", icon: "red_heart_3d", tint: "linear-gradient(135deg,#ff9ad5,#9c3ad6)" },
  LINK_NAP: { type: "account", icon: "crescent_moon", tint: "linear-gradient(135deg,#22337d,#0c1236)" },
  WELCOME: { type: "account", icon: "bell", tint: "linear-gradient(135deg,#d6ff6b,#22c4a0)" },
};

const lagosDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

const when = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1) return "now";
  if (m < 60) return m + "m";
  if (lagosDay(d) === lagosDay(new Date())) return Math.floor(m / 60) + "h";
  if (lagosDay(d) === lagosDay(new Date(Date.now() - 86_400_000))) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Africa/Lagos" });
};

/** The member's latest notifications, in the Notifications board's shape. */
export async function loadNotifications(userId: string) {
  const rows = await db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  const today = lagosDay(new Date());
  const items = rows.map((n) => ({
    id: n.id,
    day: lagosDay(n.createdAt) === today ? "Today" : "Earlier",
    type: LOOK[n.kind].type,
    title: n.title,
    sub: n.body,
    ago: when(n.createdAt),
    icon: "/sk/" + LOOK[n.kind].icon + ".png",
    tint: LOOK[n.kind].tint,
    href: n.href,
    unread: !n.readAt,
  }));
  return { items, unread: items.filter((n) => n.unread).length };
}

export const unreadNotifications = (userId: string) => db.notification.count({ where: { userId, readAt: null } });
