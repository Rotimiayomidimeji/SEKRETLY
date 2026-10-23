import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import Home from "@/components/sk/Home";
import { currentDrop, myDrop, streakOf } from "@/features/drops/drops";
import { unreadCount } from "@/features/inbox/queries";
import { setLinkPaused } from "@/features/links/actions";
import { loadMyLinks } from "@/features/links/queries";
import { unreadNotifications } from "@/features/notifications/queries";
import { badgesOf } from "@/features/stats/stats";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Home" };

const greeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const weekAgo = () => new Date(Date.now() - 7 * 86_400_000);

export default async function HomePage() {
  const user = await requireUser("/home");
  const drop = currentDrop();
  const live = { recipientId: user.id, deletedAt: null, expiresAt: { gt: new Date() } };
  const [mine, unread, notifUnread, streak, today, droppers, hintCount, held, weekCount, badges] = await Promise.all([
    loadMyLinks(user.id),
    unreadCount(user.id),
    unreadNotifications(user.id),
    streakOf(user.id),
    myDrop(user.id, drop.number),
    db.link.count({ where: { topic: "DROP", dropNumber: drop.number, status: { not: "DELETED" } } }),
    db.message.count({ where: { ...live, readAt: null, senderHint: { not: null }, OR: [{ held: null }, { releasedAt: { not: null } }] } }),
    db.message.count({ where: { ...live, held: { not: null }, releasedAt: null } }),
    db.message.count({ where: { recipientId: user.id, createdAt: { gte: weekAgo() } } }),
    badgesOf(user.id),
  ]);
  // the home strip shows the three newest links, in the shape the board's cards use
  const links = mine.links.slice(0, 3).map((l) => ({
    id: l.id,
    topic: l.topic,
    count: l.count,
    limit: l.limit === "No limit" ? "no limit" : l.limit.toLowerCase(),
    th: l.th,
    emoji: l.emoji,
    paused: l.paused,
  }));
  // the spotlight takes turns between what's worth a look right now
  const card = { bg: "var(--card)", ink: "var(--ink)", line: "var(--line)" };
  const nextBadge = badges.filter((b) => b.have < b.need && b.cat === "Inbox").sort((a, b) => b.have / b.need - a.have / a.need)[0];
  const spots = [
    { title: "Your week, wrapped", sub: weekCount + (weekCount === 1 ? " message" : " messages") + " · your top words · tap to watch", icon: "/sk/sparkles.png", href: "/wrap", bg: "linear-gradient(135deg,#22337d,#7a3cff 70%,#d81b72)", ink: "#ffffff", line: "transparent" },
    hintCount > 0 && { title: "Guess who sent it", sub: hintCount + (hintCount === 1 ? " message came" : " messages came") + " with a hint", icon: "/sk/eyes.png", href: "/inbox", ...card },
    held > 0 && { title: held + " held by Kind mode", sub: "Hidden until you choose to look", icon: "/sk/shushing_face.png", href: "/inbox?filter=held", ...card },
    nextBadge && { title: nextBadge.need - nextBadge.have + " to your " + nextBadge.name + " badge", sub: nextBadge.have + " of " + nextBadge.need + " · see all badges", icon: nextBadge.icon, href: "/badges", ...card },
  ].filter(Boolean);
  const others = droppers - (today ? 1 : 0);
  return (
    <>
      <LiveRefresh seconds={15} />
      <Home
        mode={await getMode()}
        ads={process.env.NEXT_PUBLIC_ADS === "on" ? "on" : "off"}
        username={user.username}
        avatar={user.avatar}
        greeting={greeting()}
        unread={unread}
        notifUnread={notifUnread}
        links={links}
        setPaused={setLinkPaused}
        streak={streak.current}
        hintCount={hintCount}
        drop={{
          question: drop.question,
          secondsLeft: drop.secondsLeft,
          sub: today
            ? "Yours is live · " + today.messageCount + (today.messageCount === 1 ? " answer" : " answers") + " so far"
            : (others > 0 ? others + (others === 1 ? " person has" : " people have") + " dropped" : "Be the first to drop") + " · tap to drop yours",
        }}
        spots={spots}
      />
    </>
  );
}
