import "server-only";

import type { Prisma } from "@prisma/client";

import type { Table } from "@/features/games/engine";
import { appOrigin } from "@/features/links/topics";
import { db } from "@/lib/db";

// Crews: friends saved from a game table. Their extras live in Crew.data:
//   night { title, sub }, rsvps { userId: 0 going | 1 maybe | 2 can't }, jokes [{ text, by, at }],
//   daily { day, votes { userId: { pick: userId, why } } }

export type CrewData = {
  night?: { title: string; sub: string };
  rsvps?: Record<string, number>;
  jokes?: { text: string; by: string; at: string }[];
  daily?: { day: string; votes: Record<string, { pick: string; why: string }> };
};

const GAME_NAME: Record<string, string> = { nhie: "Never Have I Ever", tod: "Truth or Dare", wyr: "Would You Rather", mlt: "Most Likely To", hot: "Hot Takes", poll: "Anonymous Polls" };
const LOOKS = [
  ["fire", "radial-gradient(130% 110% at 100% 0%,#ffb347 0%,#ff4f6d 45%,#7a1fa2 100%)"],
  ["eyes", "radial-gradient(130% 110% at 100% 0%,#22e1ff 0%,#3a6bff 50%,#22337d 100%)"],
  ["shushing_face", "radial-gradient(130% 110% at 100% 0%,#ff9ad5 0%,#d81b72 50%,#5d1785 100%)"],
  ["sparkles", "radial-gradient(130% 110% at 100% 0%,#5be0a0 0%,#127a80 50%,#0a2b3a 100%)"],
];
const QUESTIONS = ["Who here becomes famous first?", "Who would survive longest on a deserted island?", "Who’s most likely to text their ex tonight?", "Who gives the best advice?", "Who’s secretly the funniest?", "Who would win in a dance battle?", "Who’s most likely to be late to their own wedding?"];

export const lagosDay = (d = new Date()) => new Date(d.getTime() + 3_600_000).toISOString().slice(0, 10);
export const dailyQuestion = (day: string) => QUESTIONS[Math.floor(Date.parse(day) / 86_400_000) % QUESTIONS.length];
/** Today's crew question reveals at 9pm Lagos (20:00 UTC), or as soon as everyone has answered. */
export const revealAt = (day: string) => new Date(day + "T20:00:00Z");

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });

/** The member's crews with everything the Crews screen shows. */
export async function loadCrews(userId: string) {
  const crews = await db.crew.findMany({ where: { members: { some: { userId } } }, orderBy: { createdAt: "asc" }, include: { members: true } });
  const ids = [...new Set(crews.flatMap((c) => c.members.map((m) => m.userId)))];
  const users = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } })).map((u) => [u.id, u.username]));
  // every game any member played (to find the ones the crew played together)
  const seats = await db.gamePlayer.findMany({ where: { userId: { in: ids } }, include: { room: true } });
  return crews.map((c, i) => {
    const data = (c.data ?? {}) as CrewData;
    const memberIds = c.members.map((m) => m.userId);
    const name = (id: string) => (id === userId ? "You" : users.get(id) ?? "member");
    const together = new Map<string, { room: (typeof seats)[number]["room"]; nicks: Map<string, string> }>();
    for (const s of seats) {
      if (!s.userId || !memberIds.includes(s.userId)) continue;
      const g = together.get(s.roomId) ?? { room: s.room, nicks: new Map() };
      g.nicks.set(s.userId, s.nick);
      together.set(s.roomId, g);
    }
    const games = [...together.values()].filter((g) => g.nicks.size >= 2 && g.room.status !== "LOBBY").sort((a, b) => b.room.createdAt.getTime() - a.room.createdAt.getTime());
    // leaderboard: points scored in crew games
    const pts = new Map<string, number>(memberIds.map((id) => [id, 0]));
    const crowns = new Map<string, number>();
    for (const g of games) {
      const t = g.room.state as unknown as Table | null;
      for (const [uid, nick] of g.nicks) {
        pts.set(uid, (pts.get(uid) ?? 0) + (t?.scores?.[nick] ?? 0));
        crowns.set(uid, (crowns.get(uid) ?? 0) + (t?.crowns?.[nick] ?? 0));
      }
    }
    const winner = (g: (typeof games)[number]) => {
      const t = g.room.state as unknown as Table | null;
      const top = Object.entries(t?.scores ?? {}).sort((a, b) => b[1] - a[1])[0];
      const uid = [...g.nicks.entries()].find(([, n]) => n === top?.[0])?.[0];
      return top ? (uid ? name(uid) : top[0]) : null;
    };
    // weeks in a row the crew played together
    const weeks = new Set(games.map((g) => Math.floor((g.room.createdAt.getTime() - 4 * 86_400_000) / (7 * 86_400_000))));
    let streak = 0;
    for (let w = Math.floor((Date.now() - 4 * 86_400_000) / (7 * 86_400_000)); weeks.has(w); w--) streak++;
    const rsvps = data.rsvps ?? {};
    return {
      id: c.id,
      name: c.name,
      icon: "/sk/" + LOOKS[i % LOOKS.length][0] + ".png",
      bg: LOOKS[i % LOOKS.length][1],
      who: [userId, ...memberIds.filter((m) => m !== userId)].map(name),
      streak,
      nightTitle: data.night?.title ?? "No game night yet",
      nightSub: data.night?.sub ?? "Tap Play now to start one",
      myRsvp: rsvps[userId] ?? -1,
      going: Object.values(rsvps).filter((v) => v === 0).length,
      invite: appOrigin() + "/crews/join/" + c.id,
      board: [...pts.entries()].sort((a, b) => b[1] - a[1]).map(([uid, p]) => ({ n: name(uid), pts: p, title: (crowns.get(uid) ?? 0) ? "Crowned " + crowns.get(uid) + "×" : p ? "Plays to win" : "New to the crew" })),
      history: [
        ...games.slice(0, 5).map((g) => ({
          game: GAME_NAME[g.room.game] ?? "Game",
          when: fmtDay(g.room.createdAt),
          highlight: "“" + g.room.name + "”" + (winner(g) ? ": " + winner(g) + " won." : "."),
          meta: g.nicks.size + " from the crew played",
        })),
        { game: "Crew saved", when: fmtDay(c.createdAt), highlight: "The crew was born.", meta: "Day one" },
      ],
      jokes: (data.jokes ?? []).slice().reverse().map((j) => ({ text: j.text, from: "pinned by " + (j.by === userId ? "you" : users.get(j.by) ?? "a member") })),
    };
  });
}

export async function updateCrewData(crewId: string, change: (d: CrewData) => CrewData) {
  const c = await db.crew.findUnique({ where: { id: crewId } });
  if (!c) return;
  await db.crew.update({ where: { id: crewId }, data: { data: change((c.data ?? {}) as CrewData) as Prisma.InputJsonValue } });
}
