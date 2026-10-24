import type { Metadata } from "next";

import CreateGame from "@/components/sk/CreateGame";
import { createRoom } from "@/features/games/actions";
import { isGame } from "@/features/games/rooms";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · New game" };

// /games/new?game=wyr opens the wizard on that game.
export default async function NewGamePage({ searchParams }: PageProps<"/games/new">) {
  await requireUser("/games/new");
  const { game } = await searchParams;
  return <CreateGame mode={await getMode()} game={typeof game === "string" && isGame(game) ? game : "nhie"} create={createRoom} />;
}
