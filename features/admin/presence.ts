import "server-only";

import { headers } from "next/headers";
import UAParser from "ua-parser-js";

import { clientIp, networkOf, stateName } from "@/features/admin/traffic";
import { db } from "@/lib/db";
import { requestFingerprint } from "@/lib/rate-limit";

// Who is on the site right now, and for how long: every open tab pings /api/presence (components/layout/Presence.tsx).

const DAY = 86_400_000;
/** A tab that pinged within this window counts as "live now" (pings come every 20s while the tab is visible). */
export const LIVE_WINDOW_MS = 60_000;
const liveSince = () => new Date(Date.now() - LIVE_WINDOW_MS);

const refDomain = (ref: string) => {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (!host) return "Direct";
    if (/(^|\.)instagram\.com$/.test(host)) return "Instagram";
    if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return "WhatsApp";
    if (/(^|\.)tiktok\.com$/.test(host)) return "TikTok";
    if (/(^|\.)snapchat\.com$/.test(host)) return "Snapchat";
    if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(host)) return "X (Twitter)";
    if (/(^|\.)(facebook\.com|fb\.com)$/.test(host)) return "Facebook";
    if (/(^|\.)google\./.test(host)) return "Google";
    return host;
  } catch {
    return "Direct";
  }
};

/** One ping from an open tab. `dt` is visible seconds since its last ping (capped, so a sleeping laptop can't add hours). */
export async function recordPresence(input: { id: string; path: string; ref: string; dt: number; userId: string | null }) {
  const now = new Date();
  const dt = Math.max(0, Math.min(30, Math.round(input.dt || 0)));
  const existing = await db.presence.findUnique({ where: { id: input.id }, select: { path: true, userId: true } });
  if (existing) {
    await db.presence.update({
      where: { id: input.id },
      data: {
        path: input.path,
        lastSeenAt: now,
        seconds: { increment: dt },
        ...(existing.path !== input.path ? { pages: { increment: 1 } } : {}),
        ...(input.userId && !existing.userId ? { userId: input.userId } : {}),
      },
    });
  } else {
    const h = await headers();
    const ua = new UAParser(h.get("user-agent") ?? "").getResult();
    await db.presence.create({
      data: {
        id: input.id,
        fingerprint: await requestFingerprint(),
        userId: input.userId,
        ip: await clientIp(),
        city: decodeURIComponent(h.get("x-vercel-ip-city") ?? "") || null,
        region: h.get("x-vercel-ip-country-region") || null,
        country: h.get("x-vercel-ip-country") || null,
        device: ua.device.type === "mobile" ? "Mobile" : ua.device.type === "tablet" ? "Tablet" : "Desktop",
        os: ua.os.name ?? "Unknown",
        browser: /Instagram/i.test(ua.ua) ? "Instagram app" : /WhatsApp/i.test(ua.ua) ? "WhatsApp app" : (ua.browser.name ?? "Unknown"),
        referrer: refDomain(input.ref),
        firstPath: input.path,
        path: input.path,
      },
    });
    // housekeeping, about once per 200 new tabs: drop rows older than 30 days
    if (Math.random() < 0.005) await db.presence.deleteMany({ where: { lastSeenAt: { lt: new Date(Date.now() - 30 * DAY) } } });
  }
  if (input.userId) await db.user.update({ where: { id: input.userId }, data: { lastSeenAt: now } }).catch(() => {});
}

/** "45s", "4m 05s", "1h 12m" */
export function duration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m " + String(s % 60).padStart(2, "0") + "s";
  return Math.floor(s / 3600) + "h " + String(Math.floor((s % 3600) / 60)).padStart(2, "0") + "m";
}

/** Everyone with the site open right now (one row per tab), newest first. */
export async function livePeople() {
  const rows = await db.presence.findMany({ where: { lastSeenAt: { gte: liveSince() } }, orderBy: { startedAt: "desc" }, take: 200 });
  const ids = [...new Set(rows.map((r) => r.userId).filter((x): x is string => !!x))];
  const names = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]));
  return {
    count: new Set(rows.map((r) => r.userId ?? "f:" + r.fingerprint)).size,
    members: ids.length,
    rows: rows.map((r) => ({
      who: r.userId ? "@" + (names.get(r.userId) ?? "member") : "Visitor",
      member: !!r.userId,
      page: r.path,
      place: [r.city, stateName(r.region, r.country)].filter((x) => x && x !== "Unknown").join(", ") || "Unknown place",
      device: (r.os === "iOS" ? "iPhone" : r.os) + " · " + r.browser,
      net: networkOf(r.ip),
      ip: r.ip,
      from: r.referrer,
      onFor: duration(r.seconds),
      pages: r.pages,
    })),
  };
}

/** Time on site for a period: average visit length, total time, and per-device seconds and pages (for the traffic rows). */
export async function timeOnSite(since: Date) {
  const rows = await db.presence.findMany({ where: { lastSeenAt: { gte: since } }, select: { fingerprint: true, userId: true, seconds: true, pages: true, referrer: true } });
  const total = rows.reduce((a, r) => a + r.seconds, 0);
  const byDevice = new Map<string, number>(), pagesByDevice = new Map<string, number>(), sourceByDevice = new Map<string, string>();
  for (const r of rows) {
    byDevice.set(r.fingerprint, (byDevice.get(r.fingerprint) ?? 0) + r.seconds);
    pagesByDevice.set(r.fingerprint, (pagesByDevice.get(r.fingerprint) ?? 0) + r.pages);
    if (!sourceByDevice.has(r.fingerprint) || r.referrer !== "Direct") sourceByDevice.set(r.fingerprint, r.referrer);
  }
  return { visits: rows.length, avg: rows.length ? duration(total / rows.length) : "—", total: duration(total), byDevice, pagesByDevice, sourceByDevice };
}

/** One member's devices and network addresses (newest first), from their visits and sends. For Admin › Users. */
export async function addressesOf(userIds: string[]) {
  const [p, v] = await Promise.all([
    db.presence.findMany({ where: { userId: { in: userIds } }, orderBy: { lastSeenAt: "desc" }, take: 3000, select: { userId: true, ip: true, lastSeenAt: true, seconds: true } }),
    db.visitLog.findMany({ where: { userId: { in: userIds } }, orderBy: { at: "desc" }, take: 3000, select: { userId: true, ip: true, at: true } }),
  ]);
  const out = new Map<string, { ips: Map<string, Date>; seconds: number }>();
  const add = (uid: string | null, ip: string, at: Date, secs = 0) => {
    if (!uid) return;
    const o = out.get(uid) ?? { ips: new Map(), seconds: 0 };
    if (!o.ips.has(ip) || o.ips.get(ip)! < at) o.ips.set(ip, at);
    o.seconds += secs;
    out.set(uid, o);
  };
  for (const r of p) add(r.userId, r.ip, r.lastSeenAt, r.seconds);
  for (const r of v) add(r.userId, r.ip, r.at);
  return out;
}

/** Whether this device or network belongs to a suspended account (so a suspended person can't just sign up again). */
export async function linkedToSuspended(fingerprint: string, ip: string) {
  const local = ip === "127.0.0.1" || ip === "::1" || ip === "local";
  const where = local ? { fingerprint } : { OR: [{ fingerprint }, { ip }] };
  const [p, v] = await Promise.all([
    db.presence.findMany({ where: { ...where, userId: { not: null } }, select: { userId: true }, distinct: ["userId"], take: 50 }),
    db.visitLog.findMany({ where: { ...where, userId: { not: null } }, select: { userId: true }, distinct: ["userId"], take: 50 }),
  ]);
  const ids = [...new Set([...p, ...v].map((r) => r.userId!))];
  if (!ids.length) return false;
  return (await db.user.count({ where: { id: { in: ids }, status: "SUSPENDED" } })) > 0;
}
