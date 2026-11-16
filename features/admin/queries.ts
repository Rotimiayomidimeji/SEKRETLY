import "server-only";

import { addressesOf, duration, livePeople, LIVE_WINDOW_MS, timeOnSite } from "@/features/admin/presence";
import { isSerious } from "@/features/admin/settings";
import { networkOf, stateName } from "@/features/admin/traffic";
import { db } from "@/lib/db";

const DAY = 86_400_000;
const lagosToday = () => new Date(new Date(Date.now() + 3_600_000).toISOString().slice(0, 10) + "T00:00:00+01:00");
const ago = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  return m < 1 ? "now" : m < 60 ? m + "m" : m < 1440 ? Math.floor(m / 60) + "h" : Math.floor(m / 1440) + "d";
};
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) + "%" : "—");

/** "@username" for an account, "a visitor (device v_3c91af)" for a device. */
async function senderNames(keys: string[]) {
  const ids = [...new Set(keys.filter((k) => k.startsWith("u:")).map((k) => k.slice(2)))];
  const users = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]));
  return (k: string) => (k.startsWith("u:") ? "@" + (users.get(k.slice(2)) ?? "deleted") : "a visitor (device v_" + k.slice(2, 8) + ")");
}

/** Serious reports (last 30 days) nobody has decided on yet, by category: the red badge on every admin page. */
async function openSerious() {
  const open = await db.report.findMany({ where: { decision: null, createdAt: { gte: new Date(Date.now() - 30 * DAY) } }, select: { category: true } });
  const flags = await Promise.all(open.map((r) => isSerious(r.category)));
  const byCat = new Map<string, number>();
  open.forEach((r, i) => flags[i] && byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1));
  return byCat;
}

/** How many serious reports wait for a human (0 hides the badge). */
export async function reviewCount() {
  return [...(await openSerious()).values()].reduce((a, n) => a + n, 0);
}

/** Admin home: today at a glance. */
export async function loadDashboard() {
  const today = lagosToday(), week = new Date(Date.now() - 7 * DAY);
  const [livePpl, timeToday, serious] = await Promise.all([livePeople(), timeOnSite(today), openSerious()]);
  const [live, visitsToday, devicesToday, messagesToday, usersToday, reportsToday, blocksToday, review, hourly, cats, weekVisits, weekMessages, weekSignups, recent, joined] = await Promise.all([
    db.visitLog.findMany({ where: { at: { gte: new Date(Date.now() - 5 * 60_000) } }, distinct: ["fingerprint"], select: { id: true } }),
    db.visitLog.count({ where: { kind: "visit", at: { gte: today } } }),
    db.visitLog.findMany({ where: { at: { gte: today } }, distinct: ["fingerprint"], select: { id: true } }),
    db.message.count({ where: { createdAt: { gte: today } } }),
    db.user.count({ where: { createdAt: { gte: today } } }),
    db.report.findMany({ where: { createdAt: { gte: today } }, select: { category: true } }),
    db.senderStanding.count({ where: { blockedAt: { gte: today } } }),
    db.report.findMany({ where: { decision: null, createdAt: { gte: new Date(Date.now() - 30 * DAY) } }, select: { category: true } }),
    db.visitLog.findMany({ where: { at: { gte: today } }, select: { at: true } }),
    db.report.groupBy({ by: ["category"], where: { createdAt: { gte: week } }, _count: true, orderBy: { _count: { category: "desc" } }, take: 5 }),
    db.visitLog.count({ where: { kind: "visit", at: { gte: week } } }),
    db.visitLog.count({ where: { kind: "message", at: { gte: week } } }),
    db.visitLog.count({ where: { kind: "signup", at: { gte: week } } }),
    db.visitLog.findMany({ orderBy: { at: "desc" }, take: 8 }),
    db.user.findMany({ where: { createdAt: { lte: new Date(Date.now() - DAY) } }, select: { createdAt: true, sessions: { select: { lastUsedAt: true } } }, take: 2000 }),
  ]);
  void live;
  const needsReview = (await Promise.all(review.map((r) => isSerious(r.category)))).filter(Boolean).length;
  const seriousList = [...serious.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => n + " " + c.toLowerCase());
  const hours = Array.from({ length: 24 }, () => 0);
  for (const v of hourly) hours[new Date(v.at.getTime() + 3_600_000).getUTCHours()]++;
  const maxH = Math.max(1, ...hours), maxCat = Math.max(1, ...cats.map((c) => c._count));
  // came back at least N days after joining (any session used then)
  const back = (n: number) => {
    const pool = joined.filter((u) => u.createdAt.getTime() <= Date.now() - n * DAY);
    const kept = pool.filter((u) => u.sessions.some((s) => s.lastUsedAt.getTime() >= u.createdAt.getTime() + n * DAY)).length;
    return { value: pool.length ? pct(kept, pool.length) : "not yet", w: pool.length ? pct(kept, pool.length) : "0%" };
  };
  const warnings = reportsToday.filter((r) => !["Self-harm", "Suicide talk"].includes(r.category)).length;
  return {
    live: livePpl.count,
    liveRows: livePpl.rows.slice(0, 12),
    liveMembers: livePpl.members,
    reviewCount: needsReview,
    dateLabel: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }) + " · live data, refreshes every 20s",
    seriousTitle: needsReview ? needsReview + (needsReview === 1 ? " serious report" : " serious reports") : "No serious reports",
    seriousText: needsReview ? " need a human: " + seriousList.join(", ") + "." : " waiting. The review queue is clear.",
    seriousC: needsReview ? "var(--bad)" : "var(--ok)",
    kpis: [
      { label: "Live now", value: fmt(livePpl.count), delta: livePpl.members + (livePpl.members === 1 ? " member" : " members") + " · " + (livePpl.count - livePpl.members) + " visitors", c: "var(--ok)", href: "/admin/traffic" },
      { label: "Time on site", value: timeToday.avg, delta: "average visit today · " + timeToday.visits + " visits", c: "var(--muted)", href: "/admin/traffic" },
      { label: "Visitors today", value: fmt(visitsToday), delta: "link visits", c: "var(--ok)", href: "/admin/traffic" },
      { label: "Unique devices", value: fmt(devicesToday.length), delta: "today", c: "var(--muted)", href: "/admin/traffic" },
      { label: "Messages sent", value: fmt(messagesToday), delta: "today", c: "var(--ok)", href: "/admin/traffic" },
      { label: "New users", value: fmt(usersToday), delta: "today", c: "var(--ok)", href: "/admin/users" },
      { label: "Reports", value: fmt(reportsToday.length), delta: pct(reportsToday.length, messagesToday) + " of messages", c: "var(--muted)", href: "/admin/reports" },
      { label: "Warnings sent", value: fmt(warnings), delta: "automatic", c: "var(--muted)", href: "/admin/reports" },
      { label: "Blocks (4th report)", value: fmt(blocksToday), delta: "today", c: "var(--warn)", href: "/admin/reports" },
      { label: "Needs review", value: fmt(needsReview), delta: "serious reports", c: needsReview ? "var(--bad)" : "var(--ok)", href: "/admin/reports" },
    ],
    hours: hours.map((v, i) => ({ h: Math.round((100 * v) / maxH) + "%", t: i + ":00 · " + v + " visitors" })),
    topCats: cats.map((c) => ({ label: c.category, n: c._count, w: Math.round((100 * c._count) / maxCat) + "%" })),
    retention: [
      { label: "Day 1", target: "40%", ...back(1) },
      { label: "Day 7", target: "20%", ...back(7) },
      { label: "Day 30", target: "track", ...back(30) },
    ],
    funnel: [
      { label: "Link visits", value: fmt(weekVisits), rate: "", w: "100%" },
      { label: "Messages sent", value: fmt(weekMessages), rate: pct(weekMessages, weekVisits), w: pct(weekMessages, weekVisits).replace("—", "0%") },
      { label: "Sign-ups", value: fmt(weekSignups), rate: pct(weekSignups, weekMessages), w: pct(weekSignups, weekVisits).replace("—", "0%") },
    ],
    feed: recent.map((l, i) => ({
      text: (l.kind === "signup" ? "New account" : l.userId ? "Member" : "Visitor") + " · " + (l.city || stateName(l.region, l.country)) + " · " + networkOf(l.ip) + " · " + l.os + (l.kind === "visit" ? " opened " + l.path : l.kind === "message" ? " sent a message" : " signed up"),
      c: l.kind === "signup" ? "#5be0a0" : l.kind === "message" ? "#ff3b8d" : "#22e1ff",
      t: ago(l.at),
      cls: i === 0 ? "fresh" : "",
    })),
  };
}

/** Admin › Reports: the last 30 days, serious ones first in the review tab, plus the automatic actions log. */
export async function loadReports() {
  const since = new Date(Date.now() - 30 * DAY), today = lagosToday();
  const rows = await db.report.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 200, include: { reporter: { select: { username: true } } } });
  const name = await senderNames(rows.map((r) => r.senderKey));
  const standings = await db.senderStanding.findMany({ where: { OR: rows.map((r) => ({ recipientId: r.reporterId, senderKey: r.senderKey })) } });
  const warnsOf = (r: (typeof rows)[number]) => {
    const s = standings.find((x) => x.recipientId === r.reporterId && x.senderKey === r.senderKey);
    return s ? (s.blockedAt ? 4 : s.warns) : 0;
  };
  const reports = await Promise.all(
    rows.map(async (r) => {
      const n = warnsOf(r), support = ["Self-harm", "Suicide talk"].includes(r.category), serious = await isSerious(r.category);
      const who = name(r.senderKey);
      const auto = support
        ? "No warning. " + who + " was sent help-line resources." + (serious ? " Sent to review so a person can check in." : "")
        : n >= 4
          ? "4th report from @" + r.reporter.username + ". " + who + " is now blocked from messaging @" + r.reporter.username + "."
          : "Warning " + Math.max(1, n) + " of 3 sent to " + who + "." + (serious ? " Sent to review because it is “" + r.category + "”." : "");
      return { id: r.id, cat: r.category, serious, receiver: r.reporter.username, sender: who, ago: ago(r.createdAt), text: r.excerpt, media: r.excerpt.includes("[media]"), n, auto, decision: r.decision, support, createdAt: r.createdAt };
    }),
  );
  const todays = reports.filter((r) => r.createdAt >= today);
  return {
    reports: reports.map((r) => ({ ...r, createdAt: undefined })),
    kpis: {
      reports: todays.length,
      warnings: todays.filter((r) => !r.support && r.n < 4).length,
      blocks: await db.senderStanding.count({ where: { blockedAt: { gte: today } } }),
      undone: await db.senderStanding.count({ where: { blockedAt: null, warns: 3, updatedAt: { gte: today } } }),
    },
    log: reports.slice(0, 30).map((r) => [
      new Date(r.createdAt.getTime() + 3_600_000).toISOString().slice(11, 16),
      r.support ? "Support sent" : r.n >= 4 ? "Blocked" : "Warning " + Math.max(1, r.n) + "/3",
      r.sender,
      r.receiver,
      r.cat,
      r.support ? "Someone who got your message is worried about you. Free, confidential help is a tap away." : r.n >= 4 ? "You can no longer message @" + r.receiver + ". Your messages were reported 4 times." : "Your message to @" + r.receiver + " was reported as “" + r.cat + "”. This is warning " + Math.max(1, r.n) + " of 3.",
    ]),
  };
}

/** Admin › Users: every member with warnings, blocks, where they are, their network addresses and time on site. */
export async function loadUsers() {
  const users = await db.user.findMany({ where: { status: { not: "DELETED" }, role: { not: "ADMIN" } }, orderBy: { createdAt: "desc" }, take: 500, include: { _count: { select: { links: true, sent: true } } } });
  const keys = users.map((u) => "u:" + u.id), ids = users.map((u) => u.id);
  const [standings, reports, lastVisits, lastPresence, addrs, total, suspended, active7] = await Promise.all([
    db.senderStanding.findMany({ where: { senderKey: { in: keys } } }),
    db.report.findMany({ where: { senderKey: { in: keys } }, select: { senderKey: true, reporterId: true, category: true } }),
    db.visitLog.findMany({ where: { userId: { in: ids } }, orderBy: { at: "desc" }, distinct: ["userId"] }),
    db.presence.findMany({ where: { userId: { in: ids } }, orderBy: { lastSeenAt: "desc" }, distinct: ["userId"] }),
    addressesOf(ids),
    db.user.count({ where: { status: { not: "DELETED" }, role: { not: "ADMIN" } } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.user.count({ where: { status: "ACTIVE", role: { not: "ADMIN" }, lastSeenAt: { gte: new Date(Date.now() - 7 * DAY) } } }),
  ]);
  const names = new Map((await db.user.findMany({ where: { id: { in: standings.map((s) => s.recipientId) } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]));
  const liveSince = Date.now() - LIVE_WINDOW_MS;
  const list = users.map((u) => {
    const key = "u:" + u.id;
    const pv = lastPresence.find((v) => v.userId === u.id), lv = lastVisits.find((v) => v.userId === u.id);
    // the newest of their last page visit and their last link visit or send
    const last = pv && (!lv || pv.lastSeenAt >= lv.at) ? pv : (lv ?? null);
    const a = addrs.get(u.id);
    const seen = u.lastSeenAt ?? pv?.lastSeenAt ?? null;
    return {
      name: u.username,
      av: u.avatar,
      joined: u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      isNew: u.createdAt.getTime() > Date.now() - 7 * DAY,
      state: last ? stateName(last.region, last.country) : "Unknown",
      device: last ? (last.os === "iOS" ? "iPhone" : last.os) : "Unknown",
      links: u._count.links,
      sent: u._count.sent,
      status: u.status === "SUSPENDED" ? "Suspended" : "",
      ips: last?.ip ?? "—",
      ipList: a ? [...a.ips.entries()].sort((x, y) => y[1].getTime() - x[1].getTime()).slice(0, 8).map(([ip, at]) => ({ ip, net: networkOf(ip), when: ago(at) })) : [],
      timeOnSite: a ? duration(a.seconds) : "0s",
      lastSeen: seen ? (seen.getTime() >= liveSince ? "online now" : ago(seen) + " ago") : "never",
      online: !!pv && pv.lastSeenAt.getTime() >= liveSince,
      pairs: standings
        .filter((s) => s.senderKey === key)
        .map((s) => {
          const cats = reports.filter((r) => r.senderKey === key && r.reporterId === s.recipientId).map((r) => r.category);
          return [names.get(s.recipientId) ?? "someone", s.blockedAt ? 4 : s.warns, cats.join(", ")];
        }),
    };
  });
  return { list, total, suspended, active7, online: list.filter((u) => u.online).length };
}
