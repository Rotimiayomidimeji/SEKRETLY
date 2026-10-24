"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { lagosDay, updateCrewData } from "@/features/crews/crews";
import { findRoom } from "@/features/games/rooms";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function memberOf(crewId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const m = await db.crewMember.findUnique({ where: { crewId_userId: { crewId, userId: user.id } } });
  return m ? user : null;
}

/** "Save this table as a crew": you plus the players you ticked (those with accounts). */
export async function createCrew(input: { name: string; code: string; invite: string[] }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Log in to save a crew." };
  const v = z.object({ name: z.string().trim().min(1).max(30), code: z.string().max(8), invite: z.array(z.string().max(30)).max(20) }).parse(input);
  const room = v.code ? await findRoom(v.code) : null;
  const ids = new Set([user.id, ...(room?.players ?? []).filter((p) => p.userId && v.invite.includes(p.nick)).map((p) => p.userId!)]);
  const crew = await db.crew.create({ data: { name: v.name, ownerId: user.id, members: { create: [...ids].map((userId) => ({ userId })) } } });
  revalidatePath("/crews");
  return { ok: true as const, id: crew.id };
}

/** Joining from a crew invite link. */
export async function joinCrew(crewId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  const crew = await db.crew.findUnique({ where: { id: crewId }, include: { _count: { select: { members: true } } } });
  if (!crew || crew._count.members >= 30) return { ok: false as const };
  await db.crewMember.upsert({ where: { crewId_userId: { crewId, userId: user.id } }, create: { crewId, userId: user.id }, update: {} });
  return { ok: true as const };
}

export async function rsvp(crewId: string, answer: number) {
  const user = await memberOf(crewId);
  if (!user) return { ok: false };
  const a = z.number().int().min(0).max(2).parse(answer);
  await updateCrewData(crewId, (d) => ({ ...d, rsvps: { ...(d.rsvps ?? {}), [user.id]: a } }));
  return { ok: true };
}

export async function addJoke(crewId: string, text: string) {
  const user = await memberOf(crewId);
  if (!user) return { ok: false };
  const t = z.string().trim().min(1).max(120).parse(text);
  await updateCrewData(crewId, (d) => ({ ...d, jokes: [...(d.jokes ?? []), { text: t, by: user.id, at: new Date().toISOString() }].slice(-50) }));
  return { ok: true };
}

/** Today's crew question: one secret vote per member (who they picked stays hidden; only the totals are shown). */
export async function voteDaily(crewId: string, pick: string, why: string) {
  const user = await memberOf(crewId);
  if (!user) return { ok: false };
  const target = await db.crewMember.findUnique({ where: { crewId_userId: { crewId, userId: z.string().max(40).parse(pick) } } });
  if (!target || target.userId === user.id) return { ok: false };
  const day = lagosDay();
  await updateCrewData(crewId, (d) => {
    const daily = d.daily?.day === day ? d.daily : { day, votes: {} };
    return { ...d, daily: { day, votes: { ...daily.votes, [user.id]: { pick: target.userId, why: z.string().trim().max(140).parse(why) } } } };
  });
  revalidatePath("/crews/daily");
  return { ok: true };
}
