import type { Metadata } from "next";

import CrewDaily from "@/components/sk/CrewDaily";
import { voteDaily } from "@/features/crews/actions";
import { dailyQuestion, lagosDay, revealAt, type CrewData } from "@/features/crews/crews";
import { aliasBg } from "@/features/inbox/queries";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Crew question" };

const nowMs = () => Date.now();

// Today's question for one of your crews (?crew=<id>, or your first crew). Votes stay secret; totals reveal at 9pm.
export default async function CrewDailyPage({ searchParams }: PageProps<"/crews/daily">) {
  const user = await requireUser("/crews/daily");
  const { crew: wanted } = await searchParams;
  const crews = await db.crew.findMany({ where: { members: { some: { userId: user.id } } }, orderBy: { createdAt: "asc" }, include: { members: true } });
  const crew = crews.find((c) => c.id === wanted) ?? crews[0];
  if (!crew) {
    return <CrewDaily mode={await getMode()} crew={{ id: "", name: "No crew yet", question: "Save a game table as a crew to get a daily question", members: [], results: [], whys: [], revealed: false, secondsLeft: 0 }} vote={voteDaily} />;
  }
  const users = await db.user.findMany({ where: { id: { in: crew.members.map((m) => m.userId) } }, select: { id: true, username: true, avatar: true } });
  const day = lagosDay();
  const data = (crew.data ?? {}) as CrewData;
  const votes = data.daily?.day === day ? data.daily.votes : {};
  const allIn = users.length > 1 && users.every((u) => votes[u.id]);
  const revealed = allIn || nowMs() >= revealAt(day).getTime();
  const name = (id: string) => (id === user.id ? "You" : users.find((u) => u.id === id)?.username ?? "member");
  return (
    <CrewDaily
      mode={await getMode()}
      crew={{
        id: crew.id,
        name: crew.name,
        question: dailyQuestion(day),
        members: users.map((u) => ({ id: u.id, name: name(u.id), icon: "/sk/" + u.avatar + ".png", tint: aliasBg(u.avatar), done: !!votes[u.id], me: u.id === user.id })),
        myPick: votes[user.id] ? name(votes[user.id].pick) : "",
        results: revealed ? users.map((u) => ({ name: name(u.id), icon: "/sk/" + u.avatar + ".png", tint: aliasBg(u.avatar), votes: Object.values(votes).filter((v) => v.pick === u.id).length })) : [],
        whys: revealed ? Object.values(votes).map((v) => v.why).filter(Boolean) : [],
        revealed,
        secondsLeft: Math.max(0, Math.floor((revealAt(day).getTime() - nowMs()) / 1000)),
      }}
      vote={voteDaily}
    />
  );
}
