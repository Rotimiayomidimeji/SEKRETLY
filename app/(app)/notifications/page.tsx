import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import Notifications from "@/components/sk/Notifications";
import { markAllNotificationsRead, markNotificationsRead } from "@/features/notifications/actions";
import { loadNotifications } from "@/features/notifications/queries";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const { items } = await loadNotifications(user.id);
  return (
    <>
      <LiveRefresh seconds={15} />
      <Notifications
        mode={await getMode()}
        ads={process.env.NEXT_PUBLIC_ADS === "on" ? "on" : "off"}
        items={items}
        markRead={markNotificationsRead}
        markAllRead={markAllNotificationsRead}
      />
    </>
  );
}
