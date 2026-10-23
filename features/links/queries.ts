import "server-only";

import { headers } from "next/headers";

import { CLOSE_AFTER_MS, TOPIC_COMPOSER, TOPIC_TITLE, isNapping, linkPath, appOrigin } from "@/features/links/topics";
import { db } from "@/lib/db";
import { requestFingerprint } from "@/lib/rate-limit";

type Viewer = { id: string } | null;

/** Where a visit came from, by referrer or in-app browser. Counts only; nothing about the visitor is kept. */
async function visitSource(): Promise<"fromWhatsapp" | "fromInstagram" | "fromSnapchat" | "fromOther"> {
  const h = await headers();
  const hint = `${h.get("referer") ?? ""} ${h.get("user-agent") ?? ""}`.toLowerCase();
  if (/whatsapp|wa\.me/.test(hint)) return "fromWhatsapp";
  if (/instagram/.test(hint)) return "fromInstagram";
  if (/snapchat/.test(hint)) return "fromSnapchat";
  return "fromOther";
}

/**
 * Everything the link page needs for /<username>/<key>/<theme>/<slug>, and counts the visit.
 * Returns null when the address doesn't match a link (old key, deleted link, typo).
 */
export async function loadLinkPage(params: { username: string; key: string; theme: string; slug: string }, viewer: Viewer) {
  const owner = await db.user.findUnique({ where: { username: params.username.toLowerCase() } });
  if (!owner || owner.status !== "ACTIVE" || owner.linkKey !== params.key) return null;
  const link = await db.link.findUnique({
    where: { ownerId_theme_slug: { ownerId: owner.id, theme: params.theme, slug: params.slug } },
    include: { questions: { orderBy: { position: "asc" } } },
  });
  if (!link || link.status === "DELETED") return null;

  if (viewer?.id !== owner.id) {
    const day = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    const source = await visitSource();
    await db.$transaction([
      db.link.update({ where: { id: link.id }, data: { visitCount: { increment: 1 } } }),
      db.linkDay.upsert({
        where: { linkId_day: { linkId: link.id, day } },
        create: { linkId: link.id, day, visits: 1, [source]: 1 },
        update: { visits: { increment: 1 }, [source]: { increment: 1 } },
      }),
    ]);
  }

  const visitor = viewer ? "member" : (await db.visitor.findUnique({ where: { fingerprint: await requestFingerprint() } })) ? "returning" : "first";
  const board =
    link.topic === "QUIZ"
      ? (await db.message.findMany({ where: { linkId: link.id, topic: "QUIZ" }, orderBy: { createdAt: "desc" }, take: 200, select: { data: true } }))
          .map((m) => m.data as { nickname?: string; score?: number } | null)
          .filter((d): d is { nickname: string; score: number } => !!d?.nickname && typeof d.score === "number")
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map((d) => [d.nickname, d.score] as [string, number])
      : [];
  return {
    linkId: link.id,
    owner: owner.username,
    ownerAvatar: owner.avatar,
    isOwner: viewer?.id === owner.id,
    theme: link.theme,
    topic: TOPIC_COMPOSER[link.topic],
    customQuestion: link.customQuestion,
    quiz: link.questions.map((q) => [q.text, q.options, q.correctIndex] as [string, string[], number]),
    board,
    linkState: isNapping(link) ? "paused" : "live",
    visitor,
  };
}

const LIMIT_LABEL = (l: { maxMessages: number | null; closesAt: Date | null; messageCount: number }) => {
  const parts: string[] = [];
  if (l.maxMessages != null) parts.push(l.messageCount >= l.maxMessages ? "Napped at " + l.maxMessages + " messages" : "Stops at " + l.maxMessages + " messages");
  if (l.closesAt) parts.push(l.closesAt <= new Date() ? "Napped (time limit)" : "Ends " + l.closesAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  return parts.join(" · ") || "No limit";
};

const THEME_EMOJI: Record<string, string> = { default: "shushing_face", sunset: "peach", midnight: "crescent_moon", bubblegum: "unicorn", neon: "fire", ocean: "octopus" };

/** The owner's links for My links (newest first). */
export async function loadMyLinks(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const links = await db.link.findMany({ where: { ownerId: userId, status: { not: "DELETED" } }, orderBy: { createdAt: "desc" } });
  const origin = appOrigin().replace(/^https?:\/\//, "");
  return {
    username: user.username,
    key: user.linkKey,
    links: links.map((l) => ({
      id: l.id,
      topic: l.topic === "CUSTOM" ? l.customQuestion ?? "Custom topic" : TOPIC_TITLE[l.topic],
      th: "th-" + l.theme,
      theme: l.theme,
      slug: l.slug,
      emoji: "/sk/" + (THEME_EMOJI[l.theme] ?? "shushing_face") + ".png",
      count: l.messageCount,
      visits: l.visitCount,
      limit: LIMIT_LABEL(l),
      unit: l.topic === "QUIZ" ? "quiz takers" : "messages",
      paused: l.status === "PAUSED",
      napping: isNapping(l),
      url: origin + linkPath(user.username, user.linkKey, l.theme, l.slug),
    })),
  };
}

/** One link for Create link's edit mode (owner only). */
export async function loadLinkForEdit(userId: string, id: string) {
  const link = await db.link.findFirst({ where: { id, ownerId: userId, status: { not: "DELETED" } }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!link) return null;
  const slugFor = { DESCRIBE: "describe-3", QUIZ: "know-me", CONFESS: "confess", RATE: "rate-me", AMA: "ama", CUSTOM: "custom" } as const;
  const closeLeft = link.closesAt ? link.closesAt.getTime() - Date.now() : 0;
  const time = Object.entries(CLOSE_AFTER_MS).find(([, ms]) => ms >= closeLeft)?.[0] ?? "24 hours";
  return {
    editing: link.id,
    topic: slugFor[link.topic],
    theme: link.theme,
    custom: link.customQuestion ?? "",
    limMsg: link.maxMessages != null,
    msgN: link.maxMessages ?? 50,
    limTime: !!link.closesAt,
    time,
    quiz: link.questions.length
      ? link.questions.map((q) => ({ text: q.text, opts: [...q.options, "", "", ""].slice(0, 4), right: q.correctIndex }))
      : undefined,
  };
}

const DAY_MS = 24 * 3_600_000;
const ago = (d: Date) => {
  const m = Math.max(1, Math.round((Date.now() - d.getTime()) / 60_000));
  return m < 60 ? m + "m" : m < 24 * 60 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d";
};

/** Everything Link insights shows for one of the owner's links. */
export async function loadLinkInsights(userId: string, id: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const link = await db.link.findFirst({ where: { id, ownerId: userId, status: { not: "DELETED" } }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!link) return null;
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const from = new Date(today.getTime() - 6 * DAY_MS);
  const days = await db.linkDay.findMany({ where: { linkId: link.id, day: { gte: from } } });
  const allDays = await db.linkDay.aggregate({ where: { linkId: link.id }, _sum: { fromWhatsapp: true, fromInstagram: true, fromSnapchat: true, fromOther: true } });
  const byDay = new Map(days.map((d) => [d.day.toISOString().slice(0, 10), d]));
  const week: number[] = [], labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from.getTime() + i * DAY_MS);
    week.push(byDay.get(d.toISOString().slice(0, 10))?.messages ?? 0);
    labels.push(d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }));
  }
  const messages = await db.message.findMany({ where: { linkId: link.id }, orderBy: { createdAt: "desc" }, take: 1000, select: { data: true, createdAt: true } });
  type Data = { words?: string[]; score?: number; of?: number; category?: string; nickname?: string; picks?: number[] };
  const data = messages.map((m) => ({ d: (m.data ?? {}) as Data, at: m.createdAt }));
  const kind = { QUIZ: "know", DESCRIBE: "describe", RATE: "rate", CONFESS: "confess", AMA: "ama", CUSTOM: "ama" }[link.topic];
  const n = link.messageCount;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const stats: [string | number, string][] = [
    [link.visitCount, "visits"],
    [n, link.topic === "QUIZ" ? "quiz takers" : "messages"],
    [pct(n, link.visitCount) + "%", "of visitors sent"],
    [week[6], "today"],
  ];

  // quiz: leaderboard, how many got each question right, the hardest one
  const takers = data.filter((x) => typeof x.d.score === "number" && x.d.nickname);
  const qn = link.questions.length;
  if (link.topic === "QUIZ") stats[2] = [takers.length ? (takers.reduce((a, x) => a + (x.d.score ?? 0), 0) / takers.length).toFixed(1) : "–", "average score /" + qn];
  const MED = ["🥇", "🥈", "🥉", "4", "5", "6"];
  const board = [...takers]
    .sort((a, b) => (b.d.score ?? 0) - (a.d.score ?? 0) || b.at.getTime() - a.at.getTime())
    .slice(0, 6)
    .map((x, i) => ({ medal: MED[i], name: x.d.nickname!, score: `${x.d.score}/${x.d.of ?? qn}`, when: ago(x.at) }));
  const qStats = link.questions.map((q, i) => {
    const right = takers.filter((x) => x.d.picks?.[i] === q.correctIndex).length;
    const p = pct(right, takers.length);
    return { q: q.text, pct: p + "%", c: p < 45 ? "#ff8b98" : p < 65 ? "#ffd23d" : "#5be0a0", p };
  });
  const hard = [...qStats].sort((a, b) => a.p - b.p)[0];

  // describe: most-picked words
  const counts = new Map<string, number>();
  for (const x of data) for (const w of x.d.words ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
  const words = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9);

  // rate: spread of scores, average, most-rated category
  const dist = Array.from({ length: 10 }, (_, i) => data.filter((x) => x.d.score === i + 1 && !x.d.nickname).length);
  const rated = dist.reduce((a, v) => a + v, 0);
  const avgRate = rated ? (dist.reduce((a, v, i) => a + v * (i + 1), 0) / rated).toFixed(1) : "–";
  if (link.topic === "RATE") stats[2] = [avgRate, "average rating"];
  const cats = new Map<string, number>();
  for (const x of data) if (x.d.category) cats.set(x.d.category, (cats.get(x.d.category) ?? 0) + 1);
  const topCat = [...cats.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Overall";

  const src = allDays._sum;
  const total = (src.fromWhatsapp ?? 0) + (src.fromInstagram ?? 0) + (src.fromSnapchat ?? 0) + (src.fromOther ?? 0);
  const sources: [string, number, string][] = [
    ["WhatsApp", pct(src.fromWhatsapp ?? 0, total), "#25d366"],
    ["Instagram", pct(src.fromInstagram ?? 0, total), "#d81b72"],
    ["Snapchat", pct(src.fromSnapchat ?? 0, total), "#ffd23d"],
    ["Other / direct", pct(src.fromOther ?? 0, total), "#9a8fb0"],
  ];
  const textTitle =
    link.topic === "CONFESS" ? `${n} ${n === 1 ? "confession" : "confessions"} so far` : n ? `${n} ${link.topic === "AMA" ? (n === 1 ? "question" : "questions") : n === 1 ? "answer" : "answers"} so far` : link.topic === "AMA" ? "No questions yet" : "No answers yet";
  const textBody =
    link.topic === "CONFESS" ? "Long ones arrive as numbered cards. Share them to your story in order with one tap." : "Share your link to your story. What you answer can go straight back to your story.";
  const origin = appOrigin().replace(/^https?:\/\//, "");
  return {
    linkId: link.id,
    kind,
    paused: link.status === "PAUSED",
    url: origin + linkPath(user.username, user.linkKey, link.theme, link.slug),
    l: {
      topic: link.topic === "CUSTOM" ? link.customQuestion ?? "Custom topic" : TOPIC_TITLE[link.topic],
      th: "th-" + link.theme,
      theme: link.theme,
      slug: link.slug,
      emoji: "/sk/" + (THEME_EMOJI[link.theme] ?? "shushing_face") + ".png",
      msgs: n,
      visits: link.visitCount,
      week,
    },
    days: labels,
    stats,
    board,
    qStats,
    hardest: hard && takers.length ? `${hard.q} Only ${hard.pct} got it.` : "Answers show up here once friends take your quiz.",
    words,
    dist,
    avgRate,
    topCat,
    sources,
    textTitle,
    textBody,
  };
}
