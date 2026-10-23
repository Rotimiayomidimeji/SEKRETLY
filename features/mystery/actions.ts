"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { RECEIPT_INCLUDE, receiptView } from "@/features/mystery/queries";
import { notify } from "@/features/notifications/notify";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

const HOUR = 3_600_000;
const msgId = (id: string) => id.replace(/^m:/, "");

async function me() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not logged in");
  return user;
}

/** The owner's reaction to a message (or null to take it back). The sender sees it on their receipt. */
export async function react(id: string, reaction: number | null) {
  const user = await me();
  const k = reaction === null ? null : z.number().int().min(0).max(4).parse(reaction);
  const m = await db.message.findFirst({ where: { id: msgId(id), recipientId: user.id } });
  if (!m) return { ok: false };
  await db.message.update({ where: { id: m.id }, data: { reaction: k, reactedAt: k === null ? null : new Date() } });
  if (k !== null && m.senderId && user.receiptReactions)
    await notify(m.senderId, "REPLY", "@" + user.username + " reacted to your message", "/receipt?m=" + m.id, "Open your receipt");
  return { ok: true };
}

/** "Not mean": moves a message Kind mode held into the inbox. */
export async function releaseHeld(id: string) {
  const user = await me();
  await db.message.updateMany({ where: { id: msgId(id), recipientId: user.id }, data: { releasedAt: new Date() } });
  revalidatePath("/inbox");
  return { ok: true };
}

/** Usernames to guess from (search as you type). */
export async function searchPeople(q: string) {
  const user = await me();
  const term = z.string().trim().toLowerCase().max(20).parse(q).replace(/^@/, "");
  if (term.length < 2) return [];
  const rows = await db.user.findMany({
    where: { username: { startsWith: term }, status: "ACTIVE", id: { not: user.id } },
    orderBy: { username: "asc" },
    take: 6,
    select: { username: true, avatar: true },
  });
  return rows.map((r) => ({ handle: r.username, icon: "/sk/" + r.avatar + ".png" }));
}

/**
 * Guess who sent a message (3 tries per message). A right guess asks the sender privately; a wrong one quietly
 * resolves as "not confirmed" a few hours later, so the answer's timing never gives it away.
 */
export async function guess(id: string, username: string) {
  const user = await me();
  if (!user.allowGuess) return { ok: false as const, error: "Guess who is off in your settings." };
  const m = await db.message.findFirst({ where: { id: msgId(id), recipientId: user.id }, include: { guesses: true } });
  if (!m) return { ok: false as const, error: "That message is gone." };
  if (m.guesses.length >= 3) return { ok: false as const, error: "No guesses left on this message." };
  const target = await db.user.findUnique({ where: { username: z.string().toLowerCase().parse(username).replace(/^@/, "") } });
  if (!target) return { ok: false as const, error: "No one has that username." };
  const correct = !!m.senderId && m.senderId === target.id;
  const wait = correct ? 24 * HOUR : (2 + Math.random() * 4) * HOUR;
  await db.guess.create({ data: { messageId: m.id, guesserId: user.id, guessedUserId: target.id, correct, resolveAt: new Date(Date.now() + wait) } });
  if (correct) await notify(target.id, "REPLY", "@" + user.username + " thinks your message was from you", "/receipt?m=" + m.id, "Reveal yourself, or keep the mystery");
  return { ok: true as const, used: m.guesses.length + 1 };
}

/** The sender's answer when they've been guessed right: reveal, or keep the mystery. */
export async function decideGuess(messageId: string, reveal: boolean) {
  const user = await me();
  const m = await db.message.findFirst({ where: { id: messageId, senderId: user.id }, include: { link: true } });
  if (!m) return { ok: false };
  const g = await db.guess.findFirst({ where: { messageId: m.id, correct: true, status: "PENDING" }, orderBy: { createdAt: "desc" } });
  if (!g) return { ok: false };
  await db.guess.update({ where: { id: g.id }, data: { status: reveal ? "REVEALED" : "HIDDEN" } });
  if (reveal) await notify(m.recipientId, "REPLY", "You guessed right: it was @" + user.username, "/inbox?open=m:" + m.id, "They chose to reveal");
  return { ok: true };
}

/** Receipts for codes saved on this device (anonymous senders). */
export async function lookupReceipts(codes: string[]) {
  const list = z.array(z.string().trim().toUpperCase().regex(/^SK-[A-Z0-9]{4}-[A-Z0-9]{2}$/)).max(30).safeParse(codes);
  if (!list.success || !list.data.length) return [];
  const limit = await hitRateLimit("receipt:" + (await requestFingerprint()), 120, HOUR);
  if (!limit.allowed) return [];
  const rows = await db.message.findMany({ where: { receiptCode: { in: list.data } }, include: RECEIPT_INCLUDE, orderBy: { createdAt: "desc" } });
  return rows.map(receiptView);
}

/** Adds to a message from its receipt (once). Goes to the same person, through the same checks as any message. */
export async function sendFollowUp(code: string, text: string) {
  const m = await db.message.findUnique({ where: { receiptCode: z.string().toUpperCase().parse(code) } });
  if (!m || m.followUpOfId) return { ok: false as const, error: "You can’t add to this one." };
  const already = await db.message.count({ where: { followUpOfId: m.id } });
  if (already) return { ok: false as const, error: "You already added to this message." };
  const { sendMessage } = await import("@/features/messages/actions");
  return sendMessage({ linkId: m.linkId, payload: { text }, followUpOf: m.id });
}
