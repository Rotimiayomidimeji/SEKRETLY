import "server-only";

import type { Chat, ChatMessage, Guess, Link, Message, QuizQuestion, User } from "@prisma/client";

import { MESSAGE_TTL_MS, TOPIC_COMPOSER, TOPIC_TITLE } from "@/features/links/topics";
import { kindOf } from "@/features/media/storage";
import { senderKeyOf, standingWith, userKey } from "@/features/safety/standing";
import { db } from "@/lib/db";

// The Inbox board works with plain objects in the mockup's shape: kind "one" for a message, "chat" for a private chat.
// Ids carry their type: "m:<messageId>" and "c:<chatId>".

const ago = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  return m < 1 ? "now" : m < 60 ? m + "m" : m < 1440 ? Math.floor(m / 60) + "h" : Math.floor(m / 1440) + "d";
};
/** Time left and the share of its life remaining (for the countdown ring); lifetimes follow each member's timer. */
const timeLeft = (expires: Date, total = MESSAGE_TTL_MS) => {
  const ms = Math.max(0, expires.getTime() - Date.now());
  return { left: ms >= 3_600_000 ? Math.floor(ms / 3_600_000) + "h" : Math.max(1, Math.floor(ms / 60_000)) + "m", pct: Math.min(1, ms / total) };
};
const ALIAS_BG: Record<string, string> = {
  fox: "linear-gradient(135deg,#ffb35c,#ff5f8f)",
  crescent_moon: "linear-gradient(135deg,#7f8cff,#2b2f7a)",
  eyes: "linear-gradient(135deg,#7ef0c1,#1f8a70)",
  peach: "linear-gradient(135deg,#ffc3a0,#ff6f91)",
  ghost: "linear-gradient(135deg,#b78bff,#5a2ea6)",
  frog: "linear-gradient(135deg,#c4f27a,#2f9e5b)",
  octopus: "linear-gradient(135deg,#ff9ad5,#9c3ad6)",
  koala: "linear-gradient(135deg,#d7dce6,#6b7590)",
  panda: "linear-gradient(135deg,#f0f0f0,#5b5b6b)",
  unicorn: "linear-gradient(135deg,#ffd1f0,#a77bff)",
};
export const aliasBg = (avatar: string) => ALIAS_BG[avatar] ?? "linear-gradient(135deg,#ff5fa2,#7a3cff)";

const topicTitle = (link: Link) => (link.topic === "CUSTOM" || link.topic === "DROP" ? link.customQuestion ?? TOPIC_TITLE[link.topic] : TOPIC_TITLE[link.topic]);

type MessageRow = Message & { link: Link & { questions: QuizQuestion[] }; sender: User | null; chat: Chat | null; guesses: Guess[] };

/** Guess who, as the guesser sees it: guesses used, and the latest one waiting, confirmed or not confirmed. */
function guessOf(guesses: Guess[], names: Map<string, string>) {
  const last = guesses.at(-1);
  if (!last) return { used: 0 };
  const res = last.status === "REVEALED" ? "yes" : last.status === "PENDING" && last.resolveAt > new Date() ? "wait" : "no";
  return { used: guesses.length, res, who: names.get(last.guessedUserId) ?? "" };
}

/** What the owner sees for one received message. */
async function messageItem(m: MessageRow, warns: number, names: Map<string, string>) {
  const data = (m.data ?? {}) as { words?: string[]; score?: number; of?: number; picks?: number[]; category?: string };
  let quiz;
  if (m.topic === "QUIZ" && typeof data.score === "number") {
    const better = await db.message.count({ where: { linkId: m.linkId, topic: "QUIZ", data: { path: ["score"], gt: data.score } } });
    quiz = {
      score: data.score,
      of: data.of ?? m.link.questions.length,
      rank: better + 1,
      rows: m.link.questions.map((q, i) => {
        const pick = data.picks?.[i] ?? -1;
        return [q.text, q.options[pick] ?? "—", pick === q.correctIndex ? "" : q.options[q.correctIndex] ?? ""];
      }),
    };
  }
  return {
    id: "m:" + m.id,
    kind: "one",
    link: TOPIC_COMPOSER[m.topic],
    th: "th-" + m.link.theme,
    title: topicTitle(m.link),
    text: m.text,
    ago: ago(m.createdAt),
    ...timeLeft(m.expiresAt, m.expiresAt.getTime() - m.createdAt.getTime()),
    unread: !m.readAt,
    warns,
    acct: !!m.senderId,
    replyOk: m.wantsReply && !!m.sender && m.sender.status === "ACTIVE",
    quiz,
    rate: m.topic === "RATE" ? data.score : undefined,
    cat: m.topic === "RATE" ? data.category : undefined,
    media: m.mediaUrl ? kindOf(m.mediaUrl) : undefined,
    mediaUrl: m.mediaUrl ?? undefined,
    hint: m.hint ?? "",
    chatId: m.chat && !m.chat.ownerDeletedAt ? "c:" + m.chat.id : undefined,
    archived: !!m.archivedAt,
    senderHint: m.senderHint ?? undefined,
    // every message carries a receipt now, so reactions always reach the sender
    receipt: true,
    held: m.held && !m.releasedAt ? m.held : undefined,
    reaction: m.reaction ?? undefined,
    guess: guessOf(m.guesses, names),
  };
}

type ChatRow = Chat & { message: Message & { link: Link }; owner: User; guest: User; messages: ChatMessage[] };

/** One chat as `viewerId` (owner or guest) sees it. */
export async function chatItem(c: ChatRow, viewerId: string, warns?: number) {
  const asOwner = c.ownerId === viewerId;
  const now = new Date();
  const bubbles = c.messages.filter((b) => b.expiresAt > now && !(asOwner ? b.deletedByOwner : b.deletedByGuest));
  const last = c.messages.at(-1);
  const readAt = asOwner ? c.ownerReadAt : c.guestReadAt;
  const other = asOwner ? userKey(c.guestId) : userKey(c.ownerId);
  const original = c.message.text || (c.message.topic === "QUIZ" ? "Took your quiz" : c.message.topic === "RATE" ? "Rated you" : "");
  return {
    id: "c:" + c.id,
    kind: "chat",
    role: asOwner ? "owner" : "guest",
    link: TOPIC_COMPOSER[c.message.topic],
    th: "th-" + c.message.link.theme,
    title: topicTitle(c.message.link),
    who: asOwner ? c.alias : "@" + c.owner.username,
    av: "/sk/" + (asOwner ? c.aliasAvatar : c.owner.avatar) + ".png",
    avBg: asOwner ? aliasBg(c.aliasAvatar) : aliasBg(c.owner.avatar),
    ago: ago(c.lastAt),
    ...timeLeft(new Date(c.lastAt.getTime() + c.owner.chatTimerDays * MESSAGE_TTL_MS), c.owner.chatTimerDays * MESSAGE_TTL_MS),
    unread: !!last && last.fromOwner !== asOwner && (!readAt || readAt < last.createdAt),
    warns: warns ?? (await standingWith(viewerId, [other])).warns,
    acct: true,
    started: asOwner,
    hint: asOwner ? c.message.hint ?? "" : "",
    archived: !!(asOwner ? c.ownerArchivedAt : c.guestArchivedAt),
    thread: [
      { from: original, fromLabel: asOwner ? "Their message" : "Your message" },
      ...bubbles.map((b) => ({ bid: b.id, me: b.fromOwner === asOwner, text: b.text ?? undefined, media: b.mediaKind ?? undefined, url: b.mediaUrl ?? undefined })),
    ],
  };
}

export const CHAT_INCLUDE = { message: { include: { link: true } }, owner: true, guest: true, messages: { orderBy: { createdAt: "asc" as const } } };

/** Everything in a member's inbox: messages to them and chats they are in (newest first), plus the unread count. */
export async function loadInbox(userId: string) {
  const now = new Date();
  // chats can last up to 3 weeks (Settings › Messages); each is checked against its owner's timer below
  const since = new Date(now.getTime() - 21 * MESSAGE_TTL_MS);
  const [messages, chats, standings] = await Promise.all([
    db.message.findMany({
      where: { recipientId: userId, deletedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { link: { include: { questions: { orderBy: { position: "asc" } } } }, sender: true, chat: true, guesses: { orderBy: { createdAt: "asc" } } },
    }),
    db.chat.findMany({
      where: { lastAt: { gt: since }, OR: [{ ownerId: userId, ownerDeletedAt: null }, { guestId: userId, guestDeletedAt: null }] },
      orderBy: { lastAt: "desc" },
      include: CHAT_INCLUDE,
    }),
    db.senderStanding.findMany({ where: { recipientId: userId } }),
  ]);
  const guessed = [...new Set(messages.flatMap((m) => m.guesses.map((g) => g.guessedUserId)))];
  const names = new Map(
    guessed.length ? (await db.user.findMany({ where: { id: { in: guessed } }, select: { id: true, username: true } })).map((u) => [u.id, u.username] as [string, string]) : [],
  );
  const warnsOf = (key: string) => standings.find((s) => s.senderKey === key)?.warns ?? 0;
  const items = [
    ...(await Promise.all(chats.filter((c) => c.lastAt.getTime() + c.owner.chatTimerDays * MESSAGE_TTL_MS > now.getTime()).map((c) => chatItem(c, userId, warnsOf(userKey(c.ownerId === userId ? c.guestId : c.ownerId)))))),
    ...(await Promise.all(messages.map((m) => messageItem(m, warnsOf(senderKeyOf(m)), names)))),
  ];
  return { items, unread: items.filter((i) => i.unread && !i.archived).length };
}

/** Unread inbox items, for badges. */
export async function unreadCount(userId: string) {
  const now = new Date();
  const [messages, chats] = await Promise.all([
    // held messages never ping, so they don't count as new either
    db.message.count({ where: { recipientId: userId, readAt: null, deletedAt: null, archivedAt: null, expiresAt: { gt: now }, OR: [{ held: null }, { releasedAt: { not: null } }] } }),
    db.chat.findMany({
      where: { lastAt: { gt: new Date(now.getTime() - 21 * MESSAGE_TTL_MS) }, OR: [{ ownerId: userId, ownerDeletedAt: null }, { guestId: userId, guestDeletedAt: null }] },
      select: { ownerId: true, ownerReadAt: true, guestReadAt: true, lastAt: true, owner: { select: { chatTimerDays: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1, select: { fromOwner: true, createdAt: true } } },
    }),
  ]);
  const unreadChats = chats.filter((c) => {
    if (c.lastAt.getTime() + c.owner.chatTimerDays * MESSAGE_TTL_MS <= now.getTime()) return false;
    const last = c.messages[0], asOwner = c.ownerId === userId, readAt = asOwner ? c.ownerReadAt : c.guestReadAt;
    return last && last.fromOwner !== asOwner && (!readAt || readAt < last.createdAt);
  }).length;
  return messages + unreadChats;
}
