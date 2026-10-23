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
