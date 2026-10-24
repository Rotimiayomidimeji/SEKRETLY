"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { CHAT_INCLUDE, chatItem } from "@/features/inbox/queries";
import { MESSAGE_TTL_MS } from "@/features/links/topics";
import { isOurMedia, kindOf } from "@/features/media/storage";
import { warningText } from "@/features/admin/settings";
import { notify } from "@/features/notifications/notify";
import { SUPPORT_CATEGORIES, addWarning, senderKeyOf, standingWith, undoBlock as clearBlock, userKey } from "@/features/safety/standing";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hitRateLimit } from "@/lib/rate-limit";

// Inbox ids carry their type: "m:<messageId>" for a received message, "c:<chatId>" for a chat.
const split = (ids: string[]) => ({
  messages: ids.filter((i) => i.startsWith("m:")).map((i) => i.slice(2)),
  chats: ids.filter((i) => i.startsWith("c:")).map((i) => i.slice(2)),
});
const idList = z.array(z.string().max(40)).max(300);

async function me() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not logged in");
  return user;
}

/** Sets a per-side chat field (read/archived/deleted) for whichever side the user is on. */
async function touchChats(userId: string, chatIds: string[], field: "ReadAt" | "ArchivedAt" | "DeletedAt", value: Date | null) {
  if (!chatIds.length) return;
  await db.chat.updateMany({ where: { id: { in: chatIds }, ownerId: userId }, data: { ["owner" + field]: value } });
  await db.chat.updateMany({ where: { id: { in: chatIds }, guestId: userId }, data: { ["guest" + field]: value } });
}

export async function markRead(ids: string[]) {
  const user = await me();
  const { messages, chats } = split(idList.parse(ids));
  if (messages.length) await db.message.updateMany({ where: { id: { in: messages }, recipientId: user.id, readAt: null }, data: { readAt: new Date() } });
  await touchChats(user.id, chats, "ReadAt", new Date());
  return { ok: true };
}

export async function markAllRead() {
  const user = await me();
  const now = new Date();
  await db.message.updateMany({ where: { recipientId: user.id, readAt: null }, data: { readAt: now } });
  await db.chat.updateMany({ where: { ownerId: user.id }, data: { ownerReadAt: now } });
  await db.chat.updateMany({ where: { guestId: user.id }, data: { guestReadAt: now } });
  revalidatePath("/inbox");
  return { ok: true };
}

export async function setArchived(ids: string[], archived: boolean) {
  const user = await me();
  const { messages, chats } = split(idList.parse(ids));
  const at = archived ? new Date() : null;
  if (messages.length) await db.message.updateMany({ where: { id: { in: messages }, recipientId: user.id }, data: { archivedAt: at } });
  await touchChats(user.id, chats, "ArchivedAt", at);
  return { ok: true };
}

/** Gone for this user right away. Messages are only hidden so reports about them still count. */
export async function deleteItems(ids: string[]) {
  const user = await me();
  const { messages, chats } = split(idList.parse(ids));
  if (messages.length) await db.message.updateMany({ where: { id: { in: messages }, recipientId: user.id }, data: { deletedAt: new Date() } });
  await touchChats(user.id, chats, "DeletedAt", new Date());
  return { ok: true };
}

const ALIASES: [string, string][] = [
  ["Fox", "fox"], ["Moon", "crescent_moon"], ["Owl", "eyes"], ["Peach", "peach"], ["Ghost", "ghost"],
  ["Frog", "frog"], ["Octopus", "octopus"], ["Koala", "koala"], ["Panda", "panda"], ["Unicorn", "unicorn"],
];

/** "Reply privately": opens an anonymous chat with the sender of a message (they asked for replies and have an account). */
export async function startChat(id: string) {
  const user = await me();
  const messageId = id.replace(/^m:/, "");
  const m = await db.message.findFirst({ where: { id: messageId, recipientId: user.id }, include: { sender: true, chat: true } });
  if (!m || !m.wantsReply || !m.sender || m.sender.status !== "ACTIVE") return { ok: false as const, error: "This sender can’t get replies." };
  const chat =
    m.chat && !m.chat.ownerDeletedAt
      ? m.chat
      : m.chat
        ? await db.chat.update({ where: { id: m.chat.id }, data: { ownerDeletedAt: null, ownerArchivedAt: null } })
        : await db.chat.create({
            data: (() => {
              const [alias, aliasAvatar] = ALIASES[Math.floor(Math.random() * ALIASES.length)];
              return { messageId: m.id, ownerId: user.id, guestId: m.sender!.id, alias, aliasAvatar, ownerReadAt: new Date() };
            })(),
          });
  const full = await db.chat.findUniqueOrThrow({ where: { id: chat.id }, include: CHAT_INCLUDE });
  return { ok: true as const, item: await chatItem(full, user.id) };
}

const sendSchema = z
  .object({ chatId: z.string().max(40), text: z.string().trim().max(1000).optional().default(""), mediaUrl: z.string().max(300).optional() })
  .refine((v) => v.text.length > 0 || !!v.mediaUrl);

/** One reply in a chat, from either side. */
export async function sendChat(input: z.input<typeof sendSchema>) {
  const user = await me();
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Type something first." };
  const media = parsed.data.mediaUrl;
  if (media && !isOurMedia(media)) return { ok: false as const, error: "That attachment can’t be sent." };
  const chatId = parsed.data.chatId.replace(/^c:/, "");
  const chat = await db.chat.findFirst({ where: { id: chatId, OR: [{ ownerId: user.id }, { guestId: user.id }] }, include: { owner: true } });
  if (!chat) return { ok: false as const, error: "This chat is gone." };
  const asOwner = chat.ownerId === user.id;
  const otherId = asOwner ? chat.guestId : chat.ownerId;
  if ((await standingWith(otherId, [userKey(user.id)])).blocked) return { ok: false as const, error: "You can’t message them anymore." };
  if ((await standingWith(user.id, [userKey(otherId)])).blocked) return { ok: false as const, error: "You blocked them. Undo the block to reply." };
  const limit = await hitRateLimit("chat:" + user.id, 120, 3_600_000);
  if (!limit.allowed) return { ok: false as const, error: "Slow down a little. Try again soon." };
  const now = new Date();
  await db.$transaction([
    // bubbles last as long as the chat owner's chat timer (Settings › Messages)
    db.chatMessage.create({ data: { chatId, fromOwner: asOwner, text: parsed.data.text || null, mediaUrl: media ?? null, mediaKind: media ? kindOf(media) : null, expiresAt: new Date(now.getTime() + chat.owner.chatTimerDays * MESSAGE_TTL_MS) } }),
    db.chat.update({
      where: { id: chatId },
      // a new message brings the chat back for the other side if they had deleted it
      data: asOwner ? { lastAt: now, ownerReadAt: now, guestDeletedAt: null } : { lastAt: now, guestReadAt: now, ownerDeletedAt: null },
    }),
  ]);
  await notify(otherId, "REPLY", "New reply in an anonymous chat", "/inbox?open=c:" + chatId, asOwner ? "@" + chat.owner.username : chat.alias);
  return { ok: true as const };
}

/** Removes the user's own view of some chat bubbles. */
export async function deleteBubbles(chatId: string, bubbleIds: string[]) {
  const user = await me();
  const id = chatId.replace(/^c:/, "");
  const chat = await db.chat.findFirst({ where: { id, OR: [{ ownerId: user.id }, { guestId: user.id }] } });
  if (!chat) return { ok: false };
  const ids = idList.parse(bubbleIds);
  await db.chatMessage.updateMany({ where: { chatId: id, id: { in: ids } }, data: chat.ownerId === user.id ? { deletedByOwner: true } : { deletedByGuest: true } });
  return { ok: true };
}

/** Who sent an inbox item, as the warning ladder knows them, plus the account to notify (if any) and what was said. */
async function senderOf(userId: string, id: string) {
  if (id.startsWith("m:")) {
    const m = await db.message.findFirst({ where: { id: id.slice(2), recipientId: userId } });
    return m && { key: senderKeyOf(m), accountId: m.senderId, excerpt: m.text.slice(0, 500), messageId: m.id };
  }
  const chat = await db.chat.findFirst({
    where: { id: id.slice(2), OR: [{ ownerId: userId }, { guestId: userId }] },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!chat) return null;
  const asOwner = chat.ownerId === userId, otherId = asOwner ? chat.guestId : chat.ownerId;
  const theirs = chat.messages.filter((b) => b.fromOwner !== asOwner).map((b) => b.text ?? "[media]");
  return { key: userKey(otherId), accountId: otherId, excerpt: theirs.reverse().join(" / ").slice(0, 500), messageId: null };
}

/**
 * Report from the ⋮ menu. Each report is a warning to the sender (1–3); the 4th blocks them from this person only.
 * Self-harm reports send the sender help instead of a warning.
 */
export async function report(id: string, category: string) {
  const user = await me();
  const cat = z.string().trim().min(2).max(120).parse(category);
  const sender = await senderOf(user.id, id);
  if (!sender) return { ok: false as const };
  const limit = await hitRateLimit("report:" + user.id, 30, 3_600_000);
  if (!limit.allowed) return { ok: false as const };
  await db.report.create({ data: { reporterId: user.id, senderKey: sender.key, messageId: sender.messageId, category: cat, excerpt: sender.excerpt } });
  if (SUPPORT_CATEGORIES.includes(cat)) {
    if (sender.accountId)
      await notify(sender.accountId, "SUPPORT", "Someone who got your message is worried about you", "/help", "You are not alone. Free, confidential help is a tap away.");
    return { ok: true as const, support: true, n: 0 };
  }
  const n = await addWarning(user.id, sender.key);
  if (sender.accountId) {
    if (n >= 4) await notify(sender.accountId, "BLOCKED", "You can no longer message @" + user.username, "/help", "Your messages were reported 4 times. @" + user.username + " can undo this.");
    else
      await notify(
        sender.accountId,
        "WARNING",
        await warningText(cat, user.username, n),
        "/help",
        n >= 3 ? "Last warning · one more report blocks you from @" + user.username : "Warning · " + (3 - n) + " more and the next report blocks you from @" + user.username,
      );
  }
  if (n >= 4) await notify(user.id, "BLOCKED_SENDER", "A sender can’t message you anymore", "/settings/safety", "You reported them 4 times · tap to undo");
  revalidatePath("/inbox");
  return { ok: true as const, n };
}

/** "Undo block" from the inbox: back to 3 warnings. */
export async function undoBlock(id: string) {
  const user = await me();
  const sender = await senderOf(user.id, id);
  if (!sender) return { ok: false };
  await clearBlock(user.id, sender.key);
  revalidatePath("/inbox");
  return { ok: true };
}
