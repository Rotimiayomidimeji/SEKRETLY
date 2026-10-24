"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { RESERVED } from "@/features/auth/accounts";
import { issueCode } from "@/features/auth/codes";
import { passwordSchema, usernameSchema } from "@/features/auth/schemas";
import { TIMER_DAYS } from "@/features/settings/queries";
import { undoBlock } from "@/features/safety/standing";
import { createSession, destroyAllSessions, destroySession, getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { hitRateLimit } from "@/lib/rate-limit";

async function me() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not logged in");
  return user;
}

const bool = z.boolean().optional();
const settingsSchema = z.object({
  kindMode: z.number().int().min(0).max(2).optional(),
  allowHints: bool,
  receiptReactions: bool,
  allowGuess: bool,
  chatsFrom: z.enum(["everyone", "nobody"]).optional(),
  allowVisitors: bool,
  publicProfile: bool,
  inboxTimer: z.number().int().min(0).max(TIMER_DAYS.length - 1).optional(),
  chatTimer: z.number().int().min(0).max(TIMER_DAYS.length - 1).optional(),
  hiddenWords: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(50).optional(),
  blurMedia: bool,
  notifPrefs: z.record(z.string(), z.boolean()).optional(),
  gameInvites: bool,
  gameListing: bool,
});

/** Saves any Settings switches that changed (each toggle saves on its own). */
export async function updateSettings(input: z.input<typeof settingsSchema>) {
  const user = await me();
  const { inboxTimer, chatTimer, hiddenWords, ...rest } = settingsSchema.parse(input);
  await db.user.update({
    where: { id: user.id },
    data: {
      ...rest,
      inboxTimerDays: inboxTimer === undefined ? undefined : TIMER_DAYS[inboxTimer],
      chatTimerDays: chatTimer === undefined ? undefined : TIMER_DAYS[chatTimer],
      hiddenWords: hiddenWords === undefined ? undefined : [...new Set(hiddenWords)],
    },
  });
  return { ok: true };
}

/** A new username. Links move to it; addresses with the old name stop working. */
export async function changeUsername(name: string) {
  const user = await me();
  const parsed = usernameSchema.safeParse(name);
  if (!parsed.success) return { ok: false as const, error: "Use 3–20 letters, numbers or _." };
  if (parsed.data === user.username) return { ok: true as const, username: user.username };
  if (RESERVED.has(parsed.data)) return { ok: false as const, error: "@" + parsed.data + " isn’t available." };
  const limit = await hitRateLimit("rename:" + user.id, 3, 24 * 3_600_000);
  if (!limit.allowed) return { ok: false as const, error: "You can change your username 3 times a day." };
  try {
    await db.user.update({ where: { id: user.id }, data: { username: parsed.data } });
  } catch {
    return { ok: false as const, error: "@" + parsed.data + " is taken." };
  }
  revalidatePath("/", "layout");
  return { ok: true as const, username: parsed.data };
}

/** A new password: every other device is logged out, this one stays in. */
export async function changePassword(password: string) {
  const user = await me();
  const pw = passwordSchema.safeParse(password);
  if (!pw.success) return { ok: false as const, error: "At least 8 characters." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw.data) } });
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return { ok: true as const };
}

/** Sets (or changes) the recovery email and sends a code to check it. */
export async function setRecoveryEmail(email: string) {
  const user = await me();
  const v = z.string().trim().toLowerCase().email().max(200).safeParse(email);
  if (!v.success) return { ok: false as const, error: "Enter a valid email." };
  const limit = await hitRateLimit("code:" + user.id, 5, 3_600_000);
  if (!limit.allowed) return { ok: false as const, error: "Too many codes. Try again in an hour." };
  await db.user.update({ where: { id: user.id }, data: { recoveryEmail: v.data, emailVerifiedAt: null } });
  await issueCode(user.id, v.data, "VERIFY_EMAIL");
  return { ok: true as const };
}

/** Lets a blocked sender message the member again (back on 3 warnings). */
export async function unblockSender(key: string) {
  const user = await me();
  await undoBlock(user.id, z.string().max(80).parse(key));
  revalidatePath("/settings");
  return { ok: true };
}

/** Deletes the account and everything in it (links, messages, chats). Cannot be undone. */
export async function deleteAccount(confirm: string) {
  const user = await me();
  if (confirm.trim().toUpperCase() !== "DELETE") return { ok: false };
  await destroySession();
  await db.senderStanding.deleteMany({ where: { recipientId: user.id } });
  await db.user.delete({ where: { id: user.id } });
  redirect("/");
}
