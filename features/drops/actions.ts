"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { currentDrop, dropSlug, myDrop } from "@/features/drops/drops";
import { THEMES, appOrigin, linkPath } from "@/features/links/topics";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const dropSchema = z.object({
  theme: z.enum(THEMES),
  self: z.string().trim().max(140).optional().default(""),
  kind: z.boolean().default(true),
  hints: z.boolean().default(true),
});

/** "Drop it": makes (or updates) today's drop link with the day's question. */
export async function makeDrop(input: z.input<typeof dropSchema>) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Log in again to drop." };
  const v = dropSchema.parse(input);
  const drop = currentDrop();
  const fields = { theme: v.theme, dropSelf: v.self || null, kindOff: !v.kind, hintsOff: !v.hints, customQuestion: drop.question, closesAt: drop.closesAt, status: "LIVE" as const };
  const existing = await myDrop(user.id, drop.number);
  const link = existing
    ? await db.link.update({ where: { id: existing.id }, data: fields })
    : await db.link.upsert({
        where: { ownerId_theme_slug: { ownerId: user.id, theme: v.theme, slug: dropSlug(drop.number) } },
        create: { ...fields, ownerId: user.id, topic: "DROP", slug: dropSlug(drop.number), dropNumber: drop.number },
        update: fields,
      });
  revalidatePath("/home");
  const path = linkPath(user.username, user.linkKey, link.theme, link.slug);
  return { ok: true as const, path, url: appOrigin().replace(/^https?:\/\//, "") + path };
}

/** Spends a streak save on today's drop so the streak survives without dropping. */
export async function spendStreakSave() {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (user.streakSaves < 1) return { ok: false };
  const { number } = currentDrop();
  if (await db.streakSave.findUnique({ where: { userId_dropNumber: { userId: user.id, dropNumber: number } } })) return { ok: true };
  await db.$transaction([
    db.streakSave.upsert({ where: { userId_dropNumber: { userId: user.id, dropNumber: number } }, create: { userId: user.id, dropNumber: number }, update: {} }),
    db.user.update({ where: { id: user.id }, data: { streakSaves: { decrement: 1 } } }),
  ]);
  revalidatePath("/streak");
  return { ok: true };
}
