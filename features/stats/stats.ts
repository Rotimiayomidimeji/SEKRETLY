import "server-only";

import { Prisma } from "@prisma/client";

import { streakOf } from "@/features/drops/drops";
import { TOPIC_TITLE, appOrigin } from "@/features/links/topics";
import { userKey } from "@/features/safety/standing";
import { db } from "@/lib/db";

const DAY = 86_400_000;
const count = (rows: { n: bigint | number }[]) => Number(rows[0]?.n ?? 0);

/** Messages received in total, kept on each link so it survives messages disappearing. */
async function receivedTotal(userId: string) {
  const r = await db.link.aggregate({ where: { ownerId: userId }, _sum: { messageCount: true } });
  return r._sum.messageCount ?? 0;
}

/** Words people used in "describe me in 3 words", most used first (held messages don't count). */
export async function describeWords(userId: string, since?: Date) {
  const rows = await db.$queryRaw<{ w: string; n: bigint }[]>`
    SELECT lower(w) AS w, count(*) AS n
    FROM "Message", jsonb_array_elements_text("data"->'words') AS w
    WHERE "recipientId" = ${userId} AND "topic" = 'DESCRIBE' AND ("held" IS NULL OR "releasedAt" IS NOT NULL)
      ${since ? Prisma.sql`AND "createdAt" >= ${since}` : Prisma.empty}
    GROUP BY 1 ORDER BY 2 DESC, 1 ASC LIMIT 40`;
  return rows.map((r) => [r.w.charAt(0).toUpperCase() + r.w.slice(1), Number(r.n)] as [string, number]);
}

/** Share of members who reach a threshold, as the "x% of people have it" line. */
async function share(n: number, total: number) {
  return total ? Math.max(n ? 1 : 0, Math.round((100 * n) / total)) : 0;
}

/** All 12 badges with the member's real progress. Games and crews count from zero until those are built. */
export async function badgesOf(userId: string) {
  const [streak, received, words, revealed, sent, reportsAgainst, total] = await Promise.all([
    streakOf(userId),
    receivedTotal(userId),
    describeWords(userId),
    db.guess.count({ where: { guesserId: userId, status: "REVEALED" } }),
    db.message.count({ where: { senderId: userId } }),
    db.report.count({ where: { senderKey: userKey(userId) } }),
    db.user.count({ where: { status: "ACTIVE" } }),
  ]);
  const usersWithMessages = async (n: number) =>
    count(await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM (SELECT "ownerId" FROM "Link" GROUP BY 1 HAVING sum("messageCount") >= ${n}) t`);
  const usersWithDrops = async (n: number) =>
    count(await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM (SELECT "ownerId" FROM "Link" WHERE "topic" = 'DROP' GROUP BY 1 HAVING count(*) >= ${n}) t`);
  const detectives = async (n: number) =>
    count(await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM (SELECT "guesserId" FROM "Guess" WHERE "status" = 'REVEALED' GROUP BY 1 HAVING count(*) >= ${n}) t`);
  const collectors = count(
    await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM (SELECT "recipientId" FROM "Message", jsonb_array_elements_text("data"->'words') AS w WHERE "topic" = 'DESCRIBE' GROUP BY 1 HAVING count(DISTINCT lower(w)) >= 20) t`,
  );
  const kindSenders = count(
    await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM (SELECT "senderId" FROM "Message" m WHERE "senderId" IS NOT NULL GROUP BY 1 HAVING count(*) >= 20 AND NOT EXISTS (SELECT 1 FROM "Report" r WHERE r."senderKey" = 'u:' || m."senderId")) t`,
  );
  const kindHave = reportsAgainst ? 0 : Math.min(sent, 20);
  const B = [
    { id: "flame7", cat: "Streaks", name: "Flame", how: "Drop 7 days in a row.", icon: "fire", bg: "s", have: streak.longest, need: 7, holders: await usersWithDrops(7), go: "/drop", goLabel: "Drop today" },
    { id: "flame30", cat: "Streaks", name: "Wildfire", how: "Drop 30 days in a row.", icon: "fire", bg: "s", have: streak.longest, need: 30, holders: await usersWithDrops(30), go: "/streak", goLabel: "See your streak" },
    { id: "flame100", cat: "Streaks", name: "Legend", how: "Drop 100 days in a row.", icon: "crescent_moon", bg: "s", have: streak.longest, need: 100, holders: await usersWithDrops(100), go: "/streak", goLabel: "See your streak" },
    { id: "msg50", cat: "Inbox", name: "50 messages", how: "Receive 50 messages in total.", icon: "love_letter", bg: "i", have: received, need: 50, holders: await usersWithMessages(50), go: "/share", goLabel: "Share a link" },
    { id: "msg100", cat: "Inbox", name: "Century", how: "Receive 100 messages in total.", icon: "love_letter", bg: "i", have: received, need: 100, holders: await usersWithMessages(100), go: "/share", goLabel: "Post your link" },
    { id: "cloud20", cat: "Inbox", name: "Word collector", how: "Get 20 different words in your cloud.", icon: "peach", bg: "i", have: words.length, need: 20, holders: collectors, go: "/profile", goLabel: "See your cloud" },
    { id: "detective1", cat: "Inbox", name: "Detective", how: "Guess a sender right and they reveal.", icon: "eyes", bg: "g", have: revealed, need: 1, holders: await detectives(1), go: "/inbox", goLabel: "Play guess who" },
    { id: "detective10", cat: "Inbox", name: "Sherlock", how: "Get 10 confirmed guesses.", icon: "eyes", bg: "g", have: revealed, need: 10, holders: await detectives(10), go: "/inbox", goLabel: "Play guess who" },
    { id: "host10", cat: "Games", name: "Host with the most", how: "Host 10 games.", icon: "unicorn", bg: "g", have: 0, need: 10, holders: 0, go: "/games/new", goLabel: "Plan a game night" },
    { id: "crew1", cat: "Crews", name: "Crew founder", how: "Start a crew with 3 or more people.", icon: "shushing_face", bg: "c", have: 0, need: 1, holders: 0, go: "/crews", goLabel: "Open crews" },
    { id: "crew4", cat: "Crews", name: "Ride or die", how: "Keep a crew streak for 4 weeks.", icon: "octopus", bg: "c", have: 0, need: 4, holders: 0, go: "/crews", goLabel: "Open crews" },
    { id: "kind", cat: "Kindness", name: "Kind soul", how: "Send 20 messages with no reports.", icon: "sparkles", bg: "k", have: kindHave, need: 20, holders: kindSenders, go: "/explore", goLabel: "Send something nice" },
  ];
  return Promise.all(
    B.map(async (b) => ({
      ...b,
      have: Math.min(b.have, b.need),
      icon: "/sk/" + b.icon + ".png",
      rarity: await share(b.holders, total),
      when: b.have >= b.need ? "Earned" : b.need - b.have + " to go",
    })),
  );
}

const lagos = (d: Date) => new Date(d.getTime() + 3_600_000);
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmtDay = (d: Date) => lagos(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** The weekly wrap: the last 7 days in numbers and words. */
export async function wrapOf(user: { id: string; username: string; linkKey: string }) {
  const end = new Date(), start = new Date(end.getTime() - 7 * DAY), before = new Date(start.getTime() - 7 * DAY);
  const [week, lastWeek, words, allWords, links, days, quiz, guessed, streak, badges] = await Promise.all([
    db.message.findMany({ where: { recipientId: user.id, createdAt: { gte: start } }, select: { createdAt: true, linkId: true, senderHint: true } }),
    db.message.count({ where: { recipientId: user.id, createdAt: { gte: before, lt: start } } }),
    describeWords(user.id, start),
    describeWords(user.id),
    db.link.findMany({ where: { ownerId: user.id } }),
    db.linkDay.findMany({ where: { link: { ownerId: user.id }, day: { gte: new Date(start.toISOString().slice(0, 10)) } } }),
    db.message.findMany({ where: { recipientId: user.id, topic: "QUIZ", createdAt: { gte: start } }, select: { data: true } }),
    db.guess.count({ where: { guesserId: user.id, status: "REVEALED", createdAt: { gte: start } } }),
    streakOf(user.id),
    badgesOf(user.id),
  ]);
  // busiest night: the weekday and hour (Lagos) with the most messages
  const slots = new Map<string, number>();
  for (const m of week) {
    const t = lagos(m.createdAt), key = DOW[t.getUTCDay()] + "|" + t.getUTCHours();
    slots.set(key, (slots.get(key) ?? 0) + 1);
  }
  const busiest = [...slots.entries()].sort((a, b) => b[1] - a[1])[0];
  const hourLabel = (h: number) => (h % 12 || 12) + (h < 12 ? "am" : "pm");
  // most loved link this week
  const perLink = new Map<string, { n: number; hints: number }>();
  for (const m of week) {
    const p = perLink.get(m.linkId) ?? { n: 0, hints: 0 };
    p.n++;
    if (m.senderHint) p.hints++;
    perLink.set(m.linkId, p);
  }
  const topId = [...perLink.entries()].sort((a, b) => b[1].n - a[1].n)[0]?.[0];
  const top = links.find((l) => l.id === topId);
  const topStats = topId ? perLink.get(topId)! : { n: 0, hints: 0 };
  const visits = days.reduce((a, d) => a + d.visits, 0);
  const fromStatus = days.reduce((a, d) => a + d.fromWhatsapp + d.fromInstagram + d.fromSnapchat, 0);
  const best = quiz
    .map((m) => m.data as { score?: number; of?: number; nickname?: string } | null)
    .filter((d): d is { score: number; of: number; nickname: string } => !!d && typeof d.score === "number")
    .sort((a, b) => b.score - a.score)[0];
  const droppedThisWeek = [...streak.dropped].filter((n) => n > streak.today - 7).length;
  const name = user.username.charAt(0).toUpperCase() + user.username.slice(1);
  const top3 = words.slice(0, 3).map(([w]) => w.toLowerCase());
  const diff = week.length - lastWeek;
  return {
    range: fmtDay(start) + "–" + fmtDay(end),
    title: week.length ? name + ", your week was a lot." : name + ", a quiet week.",
    count: week.length,
    delta: diff > 0 ? diff + " more than last week" : diff < 0 ? -diff + " fewer than last week" : "same as last week",
    busiest: busiest ? "Busiest night: " + busiest[0].split("|")[0] + ", " + hourLabel(Number(busiest[0].split("|")[1])) + "." : "Share a link and see when people answer.",
    words: top3.length ? top3 : ["mysterious", "unread", "next week"],
    allTime: allWords[0] ? "“" + allWords[0][0] + "” is still number one all time. " + allWords[0][1] + (allWords[0][1] === 1 ? " person agrees." : " people agree.") : "Make a “describe me in 3 words” link to start your cloud.",
    topTag: top ? (top.topic === "DROP" ? "Drop No. " + top.dropNumber : TOPIC_TITLE[top.topic]) : "No messages yet",
    topTitle: top ? (top.topic === "CUSTOM" || top.topic === "DROP" ? top.customQuestion ?? "" : TOPIC_TITLE[top.topic]) : "Your links will show up here",
    topLine: topStats.n + " answers · " + topStats.hints + " with hints",
    dropLine: "You dropped " + droppedThisWeek + " of 7 days." + (visits ? " Statuses brought in " + Math.round((100 * fromStatus) / visits) + "% of your visits." : ""),
    bestName: best ? best.nickname : "Nobody yet",
    bestLine: best ? best.score + " out of " + best.of + " on your quiz" : "Make a quiz link to find out",
    guessLine: guessed ? "And you guessed " + guessed + (guessed === 1 ? " sender" : " senders") + " right." : "Guess who sent a message to unlock Detective.",
    badgeLine: badges.filter((b) => b.have >= b.need).length + " of 12 earned · " + (badges.find((b) => b.have < b.need && b.have > 0)?.name ?? "Flame") + " is next",
    streakLine: streak.current + "-day streak. " + badges.filter((b) => b.have >= b.need).length + " badges earned.",
    week: "week " + Math.ceil((lagos(end).getTime() - Date.UTC(lagos(end).getUTCFullYear(), 0, 1)) / (7 * DAY)),
    url: appOrigin().replace(/^https?:\/\//, "") + "/u/" + user.username,
  };
}
