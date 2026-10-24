import "server-only";

import type { User } from "@prisma/client";

import { TOPIC_TITLE, appOrigin, isNapping, linkPath } from "@/features/links/topics";
import { badgesOf, describeWords } from "@/features/stats/stats";
import { db } from "@/lib/db";

const DAY = 86_400_000;
const EMOJI: Record<string, string> = { default: "shushing_face", sunset: "peach", midnight: "crescent_moon", bubblegum: "unicorn", neon: "fire", ocean: "octopus" };
const BADGE_BG: Record<string, string> = {
  s: "linear-gradient(135deg,#ff8a2b,#ff3d6e)",
  i: "linear-gradient(135deg,#ffb35c,#ff4f6d)",
  g: "linear-gradient(135deg,#7a3cff,#3a6bff)",
  c: "linear-gradient(135deg,#ff5fa2,#7a3cff)",
  k: "linear-gradient(135deg,#22b36f,#127a80)",
};
const ago = (n: number) => new Date(Date.now() - n * DAY);

/**
 * Everything the Profile screen shows, for the owner ("own") or a visitor ("public"). Visitors only see what the
 * owner made public: their live links, and the word cloud if it's switched on.
 */
export async function loadProfile(user: User, view: "own" | "public") {
  const [links, all, month, week, lastWeek, badges, received] = await Promise.all([
    db.link.findMany({ where: { ownerId: user.id, status: view === "own" ? { not: "DELETED" } : "LIVE" }, orderBy: { createdAt: "desc" } }),
    describeWords(user.id),
    describeWords(user.id, ago(30)),
    describeWords(user.id, ago(7)),
    describeWords(user.id, ago(14)),
    view === "own" ? badgesOf(user.id) : Promise.resolve(null),
    db.link.aggregate({ where: { ownerId: user.id }, _sum: { messageCount: true } }),
  ]);
  const live = links.filter((l) => !isNapping(l) && l.topic !== "DROP");
  const weekMap = Object.fromEntries(week), monthMap = Object.fromEntries(month), twoWeeks = Object.fromEntries(lastWeek);
  // how each word is moving: new this week, rising, fading (nothing this month) or steady
  const trend = (w: string) => {
    const wk = weekMap[w] ?? 0, before = (twoWeeks[w] ?? 0) - wk;
    if (wk && !before && (all.find((x) => x[0] === w)?.[1] ?? 0) === wk) return "new this week";
    if (wk > before) return "rising";
    if (!monthMap[w]) return "fading";
    return "steady";
  };
  const origin = appOrigin().replace(/^https?:\/\//, "");
  const earned = badges ? badges.filter((b) => b.have >= b.need) : [];
  const pinned = badges ? badges.filter((b) => user.pinnedBadges.includes(b.id)) : [];
  return {
    username: user.username,
    avatar: user.avatar,
    bio: user.bio ?? "",
    pub: user.publicProfile,
    cloudPub: user.cloudPublic,
    stats: { links: live.length, messages: received._sum.messageCount ?? 0, games: 0 },
    links: live.slice(0, 6).map((l) => ({
      topic: l.topic === "CUSTOM" ? l.customQuestion ?? TOPIC_TITLE.CUSTOM : TOPIC_TITLE[l.topic],
      th: "th-" + l.theme,
      emoji: "/sk/" + (EMOJI[l.theme] ?? "shushing_face") + ".png",
      href: view === "own" ? "/links/" + l.id : linkPath(user.username, user.linkKey, l.theme, l.slug),
      url: origin + linkPath(user.username, user.linkKey, l.theme, l.slug),
    })),
    words: { all: all.map(([w, n]) => [w.toLowerCase(), n, trend(w)]), month: Object.fromEntries(month.map(([w, n]) => [w.toLowerCase(), n])), week: Object.fromEntries(week.map(([w, n]) => [w.toLowerCase(), n])) },
    answerCounts: [all, month, week].map((list) => Math.round(list.reduce((a, [, n]) => a + n, 0) / 3)),
    // the profile shows pinned badges first, then other earned ones, then what's next
    badges: [...pinned, ...earned.filter((b) => !pinned.includes(b)), ...(badges ?? []).filter((b) => b.have < b.need)]
      .slice(0, 5)
      .map((b) => [b.name, b.icon, BADGE_BG[b.bg] ?? BADGE_BG.i, b.have >= b.need]),
  };
}
