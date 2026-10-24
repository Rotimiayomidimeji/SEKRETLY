import "server-only";

import type { User } from "@prisma/client";

import { aliasBg } from "@/features/inbox/queries";
import { TOPIC_TITLE } from "@/features/links/topics";
import type { PushPrefs } from "@/features/notifications/push";
import { userKey } from "@/features/safety/standing";
import { db } from "@/lib/db";

/** The timer choices in Settings › Messages, in days (the screen shows 1 day … 3 weeks). */
export const TIMER_DAYS = [1, 2, 3, 7, 14, 21];

/** Push switches start on, except quiet hours which also start on (nothing between 11pm and 7am). */
export const DEFAULT_PREFS: Required<PushPrefs> = { msg: true, reply: true, join: true, turn: true, paused: true, warn: true, drop: true, streak: true, wrap: true, quiet: true };

/** Everything Settings shows, from the member's saved choices. */
export async function loadSettings(user: User) {
  const [blockedRows, warnedBy] = await Promise.all([
    db.senderStanding.findMany({ where: { recipientId: user.id, blockedAt: { not: null } }, orderBy: { updatedAt: "desc" } }),
    db.senderStanding.findMany({ where: { senderKey: userKey(user.id), warns: { gt: 0 } } }),
  ]);
  // name each blocked sender the way the member knew them: the chat alias, or which link the visitor wrote on
  const blocked = await Promise.all(
    blockedRows.map(async (b) => {
      if (b.senderKey.startsWith("u:")) {
        const chat = await db.chat.findFirst({ where: { ownerId: user.id, guestId: b.senderKey.slice(2) }, orderBy: { lastAt: "desc" } });
        if (chat) return { key: b.senderKey, name: chat.alias + " (chat) · reported 4 times", icon: "/sk/" + chat.aliasAvatar + ".png", bg: aliasBg(chat.aliasAvatar) };
      }
      const where = b.senderKey.startsWith("u:") ? { senderId: b.senderKey.slice(2) } : { senderFingerprint: b.senderKey.slice(2) };
      const m = await db.message.findFirst({ where: { recipientId: user.id, ...where }, orderBy: { createdAt: "desc" }, include: { link: true } });
      const on = m ? (m.link.topic === "CUSTOM" || m.link.topic === "DROP" ? m.link.customQuestion ?? TOPIC_TITLE[m.link.topic] : TOPIC_TITLE[m.link.topic]) : "your links";
      return { key: b.senderKey, name: "Sender on " + on + " · reported 4 times", icon: "/sk/ghost.png", bg: "linear-gradient(135deg,#7f8cff,#2b2f7a)" };
    }),
  );
  const names = new Map(
    (await db.user.findMany({ where: { id: { in: warnedBy.map((w) => w.recipientId) } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]),
  );
  const prefs = { ...DEFAULT_PREFS, ...((user.notifPrefs ?? {}) as PushPrefs) };
  return {
    username: user.username,
    email: user.recoveryEmail ?? "",
    emailVerified: !!user.emailVerifiedAt,
    kind: user.kindMode,
    mys: { hints: user.allowHints, receipts: user.receiptReactions, guess: user.allowGuess },
    chats: user.chatsFrom,
    visitors: user.allowVisitors,
    pub: user.publicProfile,
    inbox: Math.max(0, TIMER_DAYS.indexOf(user.inboxTimerDays)),
    chat: Math.max(0, TIMER_DAYS.indexOf(user.chatTimerDays)),
    words: user.hiddenWords,
    blur: user.blurMedia,
    notif: prefs,
    invites: user.gameInvites,
    listing: user.gameListing,
    blocked,
    myWarnings: warnedBy.map((w) => ["To @" + (names.get(w.recipientId) ?? "someone"), w.blockedAt ? 4 : w.warns]),
  };
}
