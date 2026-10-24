import type { Metadata } from "next";

import Crews from "@/components/sk/Crews";
import { addJoke, createCrew, rsvp } from "@/features/crews/actions";
import { loadCrews } from "@/features/crews/crews";
import { findRoom } from "@/features/games/rooms";
import { navCounts } from "@/features/notifications/queries";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Crews" };

// /crews?from=<room code> offers to save that game table as a crew; ?pick=<crew id> opens one crew.
export default async function CrewsPage({ searchParams }: PageProps<"/crews">) {
  const user = await requireUser("/crews");
  const { from, pick } = await searchParams;
  const [crews, nav] = await Promise.all([loadCrews(user.id), navCounts(user.id)]);
  const room = typeof from === "string" ? await findRoom(from) : null;
  const fresh = room ? { code: room.code, game: room.name, players: room.players.filter((p) => p.userId && p.userId !== user.id).map((p) => p.nick) } : null;
  return (
    <Crews
      mode={await getMode()}
      {...nav}
      crews={crews}
      pick={typeof pick === "string" ? pick : null}
      fresh={fresh}
      create={createCrew}
      rsvp={rsvp}
      addJoke={addJoke}
    />
  );
}
