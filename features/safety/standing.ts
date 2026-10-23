import "server-only";

import { headers } from "next/headers";

import { db } from "@/lib/db";

/** How a sender is known to the warning ladder: their account if they have one, otherwise their hashed device. */
export const userKey = (id: string) => "u:" + id;
export const deviceKey = (fingerprint: string) => "f:" + fingerprint;
export const senderKeyOf = (m: { senderId: string | null; senderFingerprint: string }) =>
  m.senderId ? userKey(m.senderId) : deviceKey(m.senderFingerprint);

/** Categories that send the sender help-lines instead of a warning. */
export const SUPPORT_CATEGORIES = ["Self-harm", "Suicide talk"];

/** The worst standing a sender has with a recipient, under any of the keys they might be known by. */
export async function standingWith(recipientId: string, keys: string[]) {
  const rows = await db.senderStanding.findMany({ where: { recipientId, senderKey: { in: keys } } });
  return {
    warns: rows.reduce((n, r) => Math.max(n, r.warns), 0),
    blocked: rows.some((r) => r.blockedAt),
  };
}

/** Records one report and moves the sender up the ladder: warnings 1–3, then blocked. Returns the new count. */
export async function addWarning(recipientId: string, senderKey: string) {
  const row = await db.senderStanding.upsert({
    where: { recipientId_senderKey: { recipientId, senderKey } },
    create: { recipientId, senderKey, warns: 1 },
    update: { warns: { increment: 1 } },
  });
  const warns = Math.min(4, row.warns);
  if (warns >= 4 && !row.blockedAt) {
    await db.senderStanding.update({ where: { recipientId_senderKey: { recipientId, senderKey } }, data: { warns: 4, blockedAt: new Date() } });
  }
  return warns;
}

/** "Undo block": back to 3 warnings, so one more report blocks them again. */
export async function undoBlock(recipientId: string, senderKey: string) {
  await db.senderStanding.updateMany({ where: { recipientId, senderKey }, data: { warns: 3, blockedAt: null } });
}

/** A rough, never-exact hint about where a message came from: city · device · time of day (Lagos time). */
export async function senderHint() {
  const h = await headers();
  const city = decodeURIComponent(h.get("x-vercel-ip-city") ?? "") || "Somewhere near you";
  const ua = h.get("user-agent") ?? "";
  const device = /iphone|ipad/i.test(ua) ? "iPhone" : /android/i.test(ua) ? "Android" : "Computer";
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  const time = hour < 5 ? "late at night" : hour < 12 ? "in the morning" : hour < 17 ? "in the afternoon" : hour < 21 ? "in the evening" : "around midnight";
  return `${city} · ${device} · ${time}`;
}
