import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import Inbox from "@/components/sk/Inbox";
import { activeCategories, adsFlag } from "@/features/admin/settings";
import { deleteBubbles, deleteItems, markAllRead, markRead, report, sendChat, setArchived, startChat, undoBlock } from "@/features/inbox/actions";
import { loadInbox } from "@/features/inbox/queries";
import { guess, react, releaseHeld, searchPeople } from "@/features/mystery/actions";
import { unreadNotifications } from "@/features/notifications/queries";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Inbox" };

// /inbox?open=m:<id> or ?open=c:<id> opens one item (links from notifications); ?filter=held opens on a filter.
export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const user = await requireUser("/inbox");
  const { open, filter } = await searchParams;
  // the inbox is where message and reply notifications lead, so being here clears them from the bell
  await db.notification.updateMany({ where: { userId: user.id, readAt: null, kind: { in: ["MESSAGE", "REPLY"] } }, data: { readAt: new Date() } });
  const [{ items }, navNotif, cats] = await Promise.all([loadInbox(user.id), unreadNotifications(user.id), activeCategories()]);
  return (
    <>
      <LiveRefresh />
      <Inbox
        mode={await getMode()}
        ads={await adsFlag("inbox")}
        username={user.username}
        navNotif={navNotif}
        items={items}
        startOpen={typeof open === "string" && items.some((i) => i.id === open) ? open : null}
        markRead={markRead}
        markAllRead={markAllRead}
        setArchived={setArchived}
        deleteItems={deleteItems}
        startChat={startChat}
        sendChat={sendChat}
        deleteBubbles={deleteBubbles}
        report={report}
        undoBlock={undoBlock}
        startFilter={filter === "held" || filter === "unread" || filter === "chats" ? filter : null}
        allowGuess={user.allowGuess}
        blurMedia={user.blurMedia}
        reportCats={cats.list}
        reportMin={cats.min}
        reportMax={cats.max}
        react={react}
        releaseHeld={releaseHeld}
        searchPeople={searchPeople}
        guess={guess}
      />
    </>
  );
}
