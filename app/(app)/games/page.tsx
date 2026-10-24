import type { Metadata } from "next";

import GamesHub from "@/components/sk/GamesHub";
import { adsFlag } from "@/features/admin/settings";
import { navCounts } from "@/features/notifications/queries";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Games" };

const dayAgo = () => new Date(Date.now() - 86_400_000);

// Open public rooms waiting for players (newest first), plus ways to start or join one.
export default async function GamesPage() {
  const user = await requireUser("/games");
  const [rooms, nav] = await Promise.all([
    db.gameRoom.findMany({ where: { status: "LOBBY", isPublic: true, createdAt: { gte: dayAgo() } }, orderBy: { createdAt: "desc" }, take: 30, include: { _count: { select: { players: { where: { kickedAt: null } } } } } }),
    navCounts(user.id),
  ]);
  const open = rooms
    .filter((r) => r._count.players < r.maxPlayers)
    .map((r) => ({ g: r.game, name: r.name, joined: r._count.players, max: r.maxPlayers, left: "waiting", code: r.code }));
  return <GamesHub mode={await getMode()} ads={await adsFlag("list")} rooms={open} {...nav} />;
}
