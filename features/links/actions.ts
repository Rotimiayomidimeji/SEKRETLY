"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { CLOSE_AFTER_MS, SLUG_TOPIC, THEMES, appOrigin, linkPath, newLinkKey } from "@/features/links/topics";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const quizSchema = z
  .array(
    z.object({
      text: z.string().trim().min(4).max(70),
      options: z.array(z.string().trim().min(1).max(28)).min(2).max(4),
      right: z.number().int().min(0),
    }),
  )
  .min(3)
  .max(10)
  .refine((qs) => qs.every((q) => q.right < q.options.length), "Every question needs a ✓ answer");

const saveSchema = z.object({
  id: z.string().optional().nullable(),
  topic: z.enum(Object.keys(SLUG_TOPIC) as [string, ...string[]]),
  theme: z.enum(THEMES),
  custom: z.string().trim().max(60).optional().default(""),
  maxMessages: z.number().int().min(1).max(10_000).nullable().optional(),
  closesIn: z.string().nullable().optional(),
  quiz: quizSchema.nullable().optional(),
});

export type SaveLinkInput = z.input<typeof saveSchema>;
type SaveResult = { ok: true; url: string; path: string } | { ok: false; error: string };

/** Create link and Edit link both end here. */
export async function saveLink(input: SaveLinkInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Log in again to save your link." };
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your link and try again." };
  const v = parsed.data;
  const topic = SLUG_TOPIC[v.topic];
  if (topic === "CUSTOM" && v.custom.length < 3) return { ok: false, error: "Write your question first." };
  if (topic === "QUIZ" && !v.quiz) return { ok: false, error: "Finish your quiz first." };
  const closesAt = v.closesIn && CLOSE_AFTER_MS[v.closesIn] ? new Date(Date.now() + CLOSE_AFTER_MS[v.closesIn]) : null;

  const existing = v.id ? await db.link.findFirst({ where: { id: v.id, ownerId: user.id, status: { not: "DELETED" } } }) : null;
  if (v.id && !existing) return { ok: false, error: "That link no longer exists." };
  // a custom link keeps its own slug; the standard topics use the topic slug
  const slug = topic === "CUSTOM" ? (existing?.topic === "CUSTOM" ? existing.slug : "c-" + newLinkKey().slice(0, 4)) : v.topic;
  const fields = {
    topic,
    slug,
    theme: v.theme,
    customQuestion: topic === "CUSTOM" ? v.custom : null,
    maxMessages: v.maxMessages ?? null,
    closesAt,
  };
  const questions = topic === "QUIZ" && v.quiz ? v.quiz.map((q, i) => ({ position: i, text: q.text, options: q.options, correctIndex: q.right })) : [];
  try {
    if (existing) {
      await db.$transaction([
        db.quizQuestion.deleteMany({ where: { linkId: existing.id } }),
        db.link.update({ where: { id: existing.id }, data: { ...fields, status: "LIVE", questions: { create: questions } } }),
      ]);
    } else {
      // a deleted link with the same address is brought back instead of duplicated
      await db.link.upsert({
        where: { ownerId_theme_slug: { ownerId: user.id, theme: v.theme, slug } },
        create: { ...fields, ownerId: user.id, questions: { create: questions } },
        update: { ...fields, status: "LIVE", questions: { deleteMany: {}, create: questions } },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: "You already have this topic in this theme. Pick another theme or edit that link." };
    throw e;
  }
  revalidatePath("/links");
  const path = linkPath(user.username, user.linkKey, v.theme, slug);
  return { ok: true, path, url: appOrigin().replace(/^https?:\/\//, "") + path };
}

async function ownLink(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  return db.link.findFirst({ where: { id, ownerId: user.id, status: { not: "DELETED" } } });
}

export async function setLinkPaused(id: string, paused: boolean) {
  const link = await ownLink(id);
  if (!link) return { ok: false };
  await db.link.update({ where: { id }, data: { status: paused ? "PAUSED" : "LIVE" } });
  revalidatePath("/links");
  return { ok: true };
}

export async function deleteLink(id: string) {
  const link = await ownLink(id);
  if (!link) return { ok: false };
  // Messages already received stay in the inbox (they expire on their own timer).
  await db.link.update({ where: { id }, data: { status: "DELETED" } });
  revalidatePath("/links");
  return { ok: true };
}

/** Delete from Link insights, then back to My links. */
export async function deleteLinkAndReturn(id: string) {
  await deleteLink(id);
  redirect("/links");
}

export async function setAllPaused(paused: boolean) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await db.link.updateMany({ where: { ownerId: user.id, status: { not: "DELETED" } }, data: { status: paused ? "PAUSED" : "LIVE" } });
  revalidatePath("/links");
  return { ok: true };
}

/** "Reset all": a new key, so every address shared so far stops working. Links stay, under new addresses. */
export async function resetLinks() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const key = newLinkKey();
      await db.user.update({ where: { id: user.id }, data: { linkKey: key } });
      await db.link.updateMany({ where: { ownerId: user.id, status: "PAUSED" }, data: { status: "LIVE" } });
      revalidatePath("/links");
      return { ok: true as const, key };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  return { ok: false as const };
}
