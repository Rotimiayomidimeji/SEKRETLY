import type { Metadata } from "next";

import JoinApp from "@/components/sk/JoinApp";
import { getRoom } from "@/features/games/actions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Join a game" };

const dayAgo = () => new Date(Date.now() - 86_400_000);

// Join by room code (looked up as it's typed), or pick an open public room.
export default async function JoinGamePage() {
  await requireUser("/games/join");
  const rooms = await db.gameRoom.findMany({
    where: { status: "LOBBY", isPublic: true, createdAt: { gte: dayAgo() } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { _count: { select: { players: { where: { kickedAt: null } } } } },
  });
  const open = rooms.filter((r) => r._count.players < r.maxPlayers).map((r) => ({ g: r.game, name: r.name, joined: r._count.players, max: r.maxPlayers, code: r.code }));
  return <JoinApp mode={await getMode()} rooms={open} peek={getRoom} />;
}
