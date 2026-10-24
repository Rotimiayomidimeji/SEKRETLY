"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const BADGE_IDS = ["flame7", "flame30", "flame100", "msg50", "msg100", "cloud20", "detective1", "detective10", "host10", "crew1", "crew4", "kind"] as const;

/** Up to 3 badges shown on the profile. */
export async function setPinnedBadges(ids: string[]) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const pins = z.array(z.enum(BADGE_IDS)).max(3).parse([...new Set(ids)]);
  await db.user.update({ where: { id: user.id }, data: { pinnedBadges: pins } });
  revalidatePath("/profile");
  return { ok: true };
}

const AVATAR_NAMES = ["fox", "panda", "frog", "octopus", "unicorn", "koala"] as const;
const profileSchema = z.object({
  avatar: z.enum(AVATAR_NAMES).optional(),
  bio: z.string().trim().max(150).optional(),
  publicProfile: z.boolean().optional(),
  cloudPublic: z.boolean().optional(),
});

/** Saves whatever the Profile screen changed (avatar, bio, public profile, word cloud on profile). */
export async function saveProfile(input: z.input<typeof profileSchema>) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const v = profileSchema.parse(input);
  await db.user.update({ where: { id: user.id }, data: { ...v, bio: v.bio === undefined ? undefined : v.bio || null } });
  revalidatePath("/profile");
  revalidatePath("/u/" + user.username);
  return { ok: true };
}

/** "Report this profile" from a public profile (members only, so reports can't be spammed anonymously). */
export async function reportProfile(username: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, login: true };
  const target = await db.user.findUnique({ where: { username: z.string().toLowerCase().parse(username) } });
  if (!target || target.id === user.id) return { ok: false as const };
  await db.report.create({ data: { reporterId: user.id, senderKey: "u:" + target.id, category: "Profile", excerpt: ("@" + target.username + " · " + (target.bio ?? "")).slice(0, 500) } });
  return { ok: true as const };
}
