import "server-only";

import { headers } from "next/headers";
import UAParser from "ua-parser-js";

import { duration, timeOnSite } from "@/features/admin/presence";
import { getSetting } from "@/features/admin/settings";
import { db } from "@/lib/db";
import { requestFingerprint } from "@/lib/rate-limit";

// Admin › Traffic: who opened links, sent messages and signed up (approximate place, device, network).
// Locations come from Vercel's IP headers, so locally they read "Unknown".

const DAY = 86_400_000;

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "127.0.0.1";
}

/** Approximate Nigerian network from the IP's first two blocks (carrier ranges); "Other" when unknown. */
const NETS: [string, string][] = [["102.89", "MTN"], ["197.210", "MTN"], ["105.112", "Airtel"], ["105.113", "Airtel"], ["197.211", "Glo"], ["41.190", "9mobile"], ["41.217", "Wi-Fi · Spectranet"], ["127.0", "This computer"]];
export const networkOf = (ip: string) => NETS.find(([p]) => ip.startsWith(p + "."))?.[1] ?? "Other";

/** Records one event for Admin › Traffic. Never throws (logging must not break a send). */
export async function logVisit(kind: "visit" | "message" | "signup", path: string, userId: string | null = null) {
  try {
    const h = await headers();
    const ua = new UAParser(h.get("user-agent") ?? "").getResult();
    const deviceType = ua.device.type === "mobile" ? "Mobile" : ua.device.type === "tablet" ? "Tablet" : "Desktop";
    await db.visitLog.create({
      data: {
        kind,
        path: path.slice(0, 200),
        fingerprint: await requestFingerprint(),
        ip: await clientIp(),
        city: decodeURIComponent(h.get("x-vercel-ip-city") ?? "") || null,
        region: h.get("x-vercel-ip-country-region") || null,
        country: h.get("x-vercel-ip-country") || null,
        device: deviceType,
        os: ua.os.name ?? "Unknown",
        browser: /Instagram/i.test(ua.ua) ? "Instagram app" : /WhatsApp/i.test(ua.ua) ? "WhatsApp app" : ua.browser.name ?? "Unknown",
        userId,
      },
    });
  } catch (e) {
    console.warn("visit log failed", e);
  }
}

/** Networks the admin blocked for abuse (Admin › Traffic). */
export async function ipBlocked() {
  const blocked = await getSetting<{ ips: string[] }>("blockedIps", { ips: [] });
  return blocked.ips.includes(await clientIp());
}

/** Vercel sends Nigerian states as ISO codes ("LA"); admins read the full name ("Lagos"). */
const NG_STATES: Record<string, string> = {
  AB: "Abia", AD: "Adamawa", AK: "Akwa Ibom", AN: "Anambra", BA: "Bauchi", BE: "Benue", BO: "Borno", BY: "Bayelsa", CR: "Cross River",
  DE: "Delta", EB: "Ebonyi", ED: "Edo", EK: "Ekiti", EN: "Enugu", FC: "FCT Abuja", GO: "Gombe", IM: "Imo", JI: "Jigawa", KD: "Kaduna",
  KE: "Kebbi", KN: "Kano", KO: "Kogi", KT: "Katsina", KW: "Kwara", LA: "Lagos", NA: "Nasarawa", NI: "Niger", OG: "Ogun", ON: "Ondo",
  OS: "Osun", OY: "Oyo", PL: "Plateau", RI: "Rivers", SO: "Sokoto", TA: "Taraba", YO: "Yobe", ZA: "Zamfara",
};
let regionNames: Intl.DisplayNames | null = null;
/** "NG" → "Nigeria": any country code → its English name. */
export function countryName(code: string | null | undefined) {
  if (!code) return "Unknown";
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
/** Full state name: "LA" in Nigeria → "Lagos"; elsewhere the code with the country ("CA, United States"). */
export function stateName(region: string | null | undefined, country: string | null | undefined) {
  if (!region) return country && country !== "NG" ? countryName(country) : "Unknown";
  if (!country || country === "NG") return NG_STATES[region.toUpperCase()] ?? region;
  return region + ", " + countryName(country);
}
const pctRows = (m: Map<string, number>, total: number, n = 6) =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, Math.max(1, Math.round((100 * v) / Math.max(1, total)))] as [string, number]);
const count = <T,>(list: T[], key: (x: T) => string) => list.reduce((m, x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1), new Map<string, number>());

/** Everything Admin › Traffic shows for one range. */
export async function trafficFor(range: "today" | "week" | "month") {
  const lagosToday = new Date(new Date(Date.now() + 3_600_000).toISOString().slice(0, 10) + "T00:00:00+01:00");
  const since = range === "today" ? lagosToday : new Date(Date.now() - (range === "week" ? 7 : 30) * DAY);
  const days = range === "today" ? 1 : range === "week" ? 7 : 30;
  const logs = await db.visitLog.findMany({ where: { at: { gte: since } }, orderBy: { at: "desc" }, take: 5000 });
  const visits = logs.filter((l) => l.kind === "visit");
  const devices = new Set(logs.map((l) => l.fingerprint));
  const perDevice = count(logs, (l) => l.fingerprint);
  const returning = [...perDevice.values()].filter((n) => n > 1).length;
  const lagosHour = (d: Date) => new Date(d.getTime() + 3_600_000).getUTCHours();
  const hours = Array.from({ length: 24 }, () => 0);
  const heat = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  for (const l of logs) {
    hours[lagosHour(l.at)]++;
    heat[(new Date(l.at.getTime() + 3_600_000).getUTCDay() + 6) % 7][lagosHour(l.at)]++;
  }
  const maxH = Math.max(1, ...hours), maxHeat = Math.max(1, ...heat.flat());
  const users = new Map((await db.user.findMany({ where: { id: { in: [...new Set(logs.map((l) => l.userId).filter((x): x is string => !!x))] } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]));
  const fmtTime = (d: Date) => new Date(d.getTime() + 3_600_000).toISOString().slice(11, 16);
  const blocked = await getSetting<{ ips: string[] }>("blockedIps", { ips: [] });
  const time = await timeOnSite(since);
  return {
    kpis: [
      { label: "Visits", value: Math.round(visits.length / days).toLocaleString("en-US"), sub: days > 1 ? "link visits a day" : "link visits" },
      { label: "Unique visitors", value: devices.size.toLocaleString("en-US"), sub: "by device" },
      { label: "Returning", value: devices.size ? Math.round((100 * returning) / devices.size) + "%" : "—", sub: "came back" },
      { label: "Messages sent", value: logs.filter((l) => l.kind === "message").length.toLocaleString("en-US"), sub: "from link pages" },
      { label: "Time on site", value: time.avg, sub: "average visit · " + time.total + " in all" },
      { label: "Sign-ups", value: logs.filter((l) => l.kind === "signup").length.toLocaleString("en-US"), sub: "new accounts" },
    ],
    hours: hours.map((v, i) => ({ h: Math.round((100 * v) / maxH) + "%", t: i + ":00 · " + v + (v === 1 ? " visit" : " visits") })),
    heat: heat.map((row) => row.map((v) => (0.06 + (v / maxHeat) * 0.94).toFixed(2))),
    breakdowns: [
      ["Top states", count(logs, (l) => stateName(l.region, l.country))],
      ["Device type", count(logs, (l) => l.device)],
      ["Phone system", count(logs, (l) => l.os)],
      ["Browser", count(logs, (l) => l.browser)],
      ["Mobile network", count(logs, (l) => networkOf(l.ip))],
      ["Countries", count(logs, (l) => countryName(l.country))],
      ["Top links visited", count(visits, (l) => l.path.replace(/^\/([^/]+)\/[^/]+\//, "/$1/…/"))],
    ].map(([title, m]) => ({ title: title as string, rows: pctRows(m as Map<string, number>, logs.length) })),
    rows: logs.slice(0, 60).map((l) => ({
      id: l.id,
      time: fmtTime(l.at),
      ip: l.ip,
      vid: "v_" + l.fingerprint.slice(0, 6),
      visits: perDevice.get(l.fingerprint) ?? 1,
      state: stateName(l.region, l.country),
      city: l.city || "Unknown",
      country: countryName(l.country),
      net: networkOf(l.ip),
      device: l.device,
      os: l.os,
      browser: l.browser,
      src: (time.sourceByDevice.get(l.fingerprint) ?? "Direct") + " · " + (l.kind === "visit" ? "opened a link" : l.kind === "message" ? "sent a message" : "signed up"),
      landing: l.path,
      pages: time.pagesByDevice.get(l.fingerprint) ?? perDevice.get(l.fingerprint) ?? 1,
      dur: time.byDevice.has(l.fingerprint) ? duration(time.byDevice.get(l.fingerprint)!) : "—",
      acct: l.userId ? "@" + (users.get(l.userId) ?? "member") : "Visitor",
      trail: logs.filter((x) => x.fingerprint === l.fingerprint).slice(0, 4).reverse().map((x) => ({ page: x.kind === "visit" ? x.path : x.kind === "message" ? "sent a message" : "signed up", t: fmtTime(x.at) })),
    })),
    totalCount: logs.length.toLocaleString("en-US"),
    blockedIps: Object.fromEntries(blocked.ips.map((ip) => [ip, true])),
  };
}
