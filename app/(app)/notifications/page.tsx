import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import Notifications from "@/components/sk/Notifications";
import { adsFlag } from "@/features/admin/settings";
import { markAllNotificationsRead, markNotificationsRead } from "@/features/notifications/actions";
import { unreadCount } from "@/features/inbox/queries";
import { loadNotifications } from "@/features/notifications/queries";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const [{ items }, navInbox] = await Promise.all([loadNotifications(user.id), unreadCount(user.id)]);
  // opening the page counts as seeing them: the bell clears everywhere, while this visit still highlights what was new
  if (items.some((n) => n.unread)) await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return (
    <>
      <LiveRefresh seconds={15} />
      <Notifications
        mode={await getMode()}
        ads={await adsFlag("notif")}
        items={items}
        navInbox={navInbox}
        markRead={markNotificationsRead}
        markAllRead={markAllNotificationsRead}
      />
    </>
  );
}
