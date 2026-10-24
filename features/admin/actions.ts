"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSetting, setSetting } from "@/features/admin/settings";
import { notify } from "@/features/notifications/notify";
import { getCurrentUser, destroyAllSessions } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function admin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Admins only");
  return user;
}
const byName = (username: string) => db.user.findUnique({ where: { username: z.string().toLowerCase().max(20).parse(username) } });

/** Review of a serious report: keep it, reverse the warning, suspend the sender, or escalate. */
export async function decideReport(id: string, decision: "keep" | "reverse" | "suspend" | "escalate") {
  const me = await admin();
  const d = z.enum(["keep", "reverse", "suspend", "escalate"]).parse(decision);
  const r = await db.report.update({ where: { id }, data: { decision: d, decidedAt: new Date(), decidedBy: me.username } });
  if (d === "reverse") {
    // take one warning back (and the block, if this report caused it)
    const s = await db.senderStanding.findUnique({ where: { recipientId_senderKey: { recipientId: r.reporterId, senderKey: r.senderKey } } });
    if (s) await db.senderStanding.update({ where: { recipientId_senderKey: { recipientId: r.reporterId, senderKey: r.senderKey } }, data: { warns: Math.max(0, Math.min(3, s.warns) - (s.blockedAt ? 0 : 1)), blockedAt: null } });
  }
  if (d === "suspend" && r.senderKey.startsWith("u:")) {
    await db.user.update({ where: { id: r.senderKey.slice(2) }, data: { status: "SUSPENDED" } });
    await destroyAllSessions(r.senderKey.slice(2));
  }
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function warnUser(username: string) {
  await admin();
  const u = await byName(username);
  if (!u) return { ok: false };
  await notify(u.id, "WARNING", "A warning from the Sekretly team", "/help", "Your recent messages broke the community rules. Keep it respectful or your account may be suspended.");
  return { ok: true };
}

/** Clears warnings others gave this member (blocks stay: those are the other person's choice). */
export async function clearWarnings(username: string) {
  await admin();
  const u = await byName(username);
  if (!u) return { ok: false };
  await db.senderStanding.updateMany({ where: { senderKey: "u:" + u.id, blockedAt: null }, data: { warns: 0 } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setSuspended(username: string, suspended: boolean) {
  await admin();
  const u = await byName(username);
  if (!u || u.role === "ADMIN") return { ok: false };
  await db.user.update({ where: { id: u.id }, data: { status: suspended ? "SUSPENDED" : "ACTIVE" } });
  if (suspended) await destroyAllSessions(u.id);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(username: string) {
  await admin();
  const u = await byName(username);
  if (!u || u.role === "ADMIN") return { ok: false };
  await db.senderStanding.deleteMany({ where: { recipientId: u.id } });
  await db.user.delete({ where: { id: u.id } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function saveCategories(config: unknown) {
  await admin();
  const c = z
    .object({
      minS: z.number().int().min(3).max(15),
      maxS: z.number().int().min(3).max(15),
      extraCats: z.array(z.string().max(40)).max(50),
      inactive: z.record(z.string(), z.boolean()),
      seriousOver: z.record(z.string(), z.boolean()),
      added: z.record(z.string(), z.array(z.string().max(300)).max(50)),
      deleted: z.record(z.string(), z.record(z.string(), z.boolean())),
    })
    .parse(config);
  await setSetting("categories", c);
  return { ok: true };
}

export async function saveAds(config: unknown) {
  await admin();
  await setSetting("ads", z.object({ master: z.boolean(), slots: z.record(z.string(), z.boolean()) }).parse(config));
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Blocks (or unblocks) a network address from sending and signing up. For abuse only. */
export async function setIpBlocked(ip: string, blocked: boolean) {
  await admin();
  const v = z.string().max(64).parse(ip);
  const cur = await getSetting<{ ips: string[] }>("blockedIps", { ips: [] });
  const ips = blocked ? [...new Set([...cur.ips, v])] : cur.ips.filter((x) => x !== v);
  await setSetting("blockedIps", { ips });
  return { ok: true };
}
