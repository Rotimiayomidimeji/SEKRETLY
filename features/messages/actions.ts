"use server";

import type { LinkTopic, Prisma } from "@prisma/client";
import { z } from "zod";

import { createAccount } from "@/features/auth/accounts";
import { passwordSchema, usernameSchema } from "@/features/auth/schemas";
import { MESSAGE_TTL_MS, RATE_CATEGORIES, isNapping } from "@/features/links/topics";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearRateLimit, hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

const MINUTE = 60_000;

// Random leaderboard names for quiz takers, like the mockup's SuyaStar and BlueFox.
const NICK_A = ["Suya", "Blue", "Kola", "Pixel", "Mango", "Zobo", "Puff", "Chin", "Moon", "Jollof", "Plantain", "Neon", "Velvet", "Tiger", "Ginger"];
const NICK_B = ["Star", "Fox", "Nut", "Owl", "Moon", "Queen", "King", "Bee", "Wave", "Spark", "Ghost", "Cat", "Drift", "Frog", "Pop"];
const nickname = () => NICK_A[Math.floor(Math.random() * NICK_A.length)] + NICK_B[Math.floor(Math.random() * NICK_B.length)];

const sendSchema = z.object({
  linkId: z.string().min(1),
  wantsReply: z.boolean().optional().default(false),
  payload: z
    .object({
      words: z.array(z.string().trim().min(1).max(20)).optional(),
      picks: z.array(z.number().int().min(0).max(3)).optional(),
      score: z.number().int().min(1).max(10).optional(),
      category: z.string().optional(),
      text: z.string().optional(),
      note: z.string().optional(),
    })
    .default({}),
});
export type SendInput = z.input<typeof sendSchema>;
type Built = { text: string; data: Prisma.InputJsonValue | undefined } | { error: string };

/** Turns what the visitor did on the link page into a message, checking each topic's rules. */
async function buildMessage(topic: LinkTopic, linkId: string, p: z.infer<typeof sendSchema>["payload"]): Promise<Built> {
  const text = (p.text ?? "").trim();
  switch (topic) {
    case "DESCRIBE": {
      const words = p.words ?? [];
      if (words.length !== 3) return { error: "Pick exactly 3 words." };
      if (words.join(" ").length > 60) return { error: "Keep your 3 words under 60 characters." };
      return { text: words.join(" · "), data: { words } };
    }
    case "QUIZ": {
      const questions = await db.quizQuestion.findMany({ where: { linkId }, orderBy: { position: "asc" } });
      const picks = p.picks ?? [];
      if (!questions.length || picks.length !== questions.length) return { error: "Answer every question first." };
      const score = questions.reduce((n, q, i) => n + (picks[i] === q.correctIndex ? 1 : 0), 0);
      const note = (p.note ?? "").trim().slice(0, 140);
      return { text: note, data: { score, of: questions.length, picks, nickname: nickname() } };
    }
    case "CONFESS":
      if (text.length < 2) return { error: "Write your confession." };
      return { text: text.slice(0, 2000), data: undefined };
    case "RATE": {
      if (!p.score) return { error: "Tap a number from 1 to 10." };
      const category = RATE_CATEGORIES.includes(p.category as (typeof RATE_CATEGORIES)[number]) ? p.category! : "Overall";
      return { text: text.slice(0, 140), data: { score: p.score, category } };
    }
    case "AMA":
      if (text.length < 5) return { error: "Type your question." };
      return { text: text.slice(0, 300), data: undefined };
    case "CUSTOM":
      if (text.length < 1) return { error: "Write something." };
      return { text: text.slice(0, 1000), data: undefined };
  }
}

/** Saves one anonymous message through a link. senderId is set only when the sender is logged in. */
async function deliver(input: z.infer<typeof sendSchema>, senderId: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  const link = await db.link.findUnique({ where: { id: input.linkId } });
  if (!link || link.status === "DELETED") return { ok: false, error: "This link no longer exists." };
  if (isNapping(link)) return { ok: false, error: "This link is taking a nap. Try again later." };
  if (senderId && senderId === link.ownerId) return { ok: false, error: "You can’t send to your own link. Share it with your friends instead." };
  const fingerprint = await requestFingerprint();
  const perLink = await hitRateLimit(`send:${link.id}:${fingerprint}`, 10, 60 * MINUTE);
  const overall = await hitRateLimit(`send-any:${fingerprint}`, 60, 60 * MINUTE);
  if (!perLink.allowed || !overall.allowed) return { ok: false, error: "You’ve sent a lot in a short time. Take a breather and try again later." };
  const built = await buildMessage(link.topic, link.id, input.payload);
  if ("error" in built) return { ok: false, error: built.error };
  const day = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  await db.$transaction([
    db.message.create({
      data: {
        linkId: link.id,
        recipientId: link.ownerId,
        topic: link.topic,
        text: built.text,
        data: built.data,
        senderId,
        senderFingerprint: fingerprint,
        wantsReply: !!senderId && input.wantsReply,
        expiresAt: new Date(Date.now() + MESSAGE_TTL_MS),
      },
    }),
    db.link.update({ where: { id: link.id }, data: { messageCount: { increment: 1 } } }),
    db.linkDay.upsert({ where: { linkId_day: { linkId: link.id, day } }, create: { linkId: link.id, day, messages: 1 }, update: { messages: { increment: 1 } } }),
    db.visitor.upsert({ where: { fingerprint }, create: { fingerprint }, update: {} }),
  ]);
  return { ok: true };
}

/** "Send" on the link page. Logged-in senders are attached so the owner can reply; visitors stay fully anonymous. */
export async function sendMessage(input: SendInput) {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Something’s missing. Check your message." };
  const user = await getCurrentUser();
  return deliver(parsed.data, user?.id ?? null);
}

const joinSchema = z.object({
  username: z.string(),
  password: z.string(),
  login: z.boolean().optional().default(false),
  message: sendSchema,
});

/**
 * The "get replies" popup: make an account (username + password, 16+ confirmed) or log in,
 * then send the message from that account so the owner can reply. Logs the person in on this device.
 */
export async function joinAndSend(input: z.input<typeof joinSchema>): Promise<{ ok: true } | { ok: false; error: string; taken?: boolean }> {
  const parsed = joinSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check your username and password." };
  const name = usernameSchema.safeParse(parsed.data.username);
  if (!name.success) return { ok: false, error: "Use 3–20 letters, numbers or _ for your username." };
  let userId: string;
  if (parsed.data.login) {
    const limit = await hitRateLimit(`login:${name.data}`, 5, 15 * MINUTE);
    if (!limit.allowed) return { ok: false, error: "Too many tries. Wait 15 minutes, or reset your password." };
    const user = await db.user.findUnique({ where: { username: name.data } });
    if (!user || user.status !== "ACTIVE" || !(await verifyPassword(parsed.data.password, user.passwordHash)))
      return { ok: false, error: `That username and password do not match. ${limit.remaining} ${limit.remaining === 1 ? "try" : "tries"} left.` };
    await clearRateLimit(`login:${name.data}`);
    userId = user.id;
  } else {
    const pw = passwordSchema.safeParse(parsed.data.password);
    if (!pw.success) return { ok: false, error: "Your password needs at least 8 characters." };
    const limit = await hitRateLimit(`signup:${await requestFingerprint()}`, 5, 60 * MINUTE);
    if (!limit.allowed) return { ok: false, error: "Too many new accounts from this device. Try again in an hour." };
    const created = await createAccount({ username: name.data, password: pw.data, birthDate: null, ageConfirmed: true });
    if (!created.ok) return { ok: false, error: `@${name.data} is taken. Try another one.`, taken: true };
    userId = created.id;
  }
  const sent = await deliver({ ...parsed.data.message, wantsReply: true }, userId);
  if (!sent.ok) return sent;
  await createSession(userId);
  return { ok: true };
}
