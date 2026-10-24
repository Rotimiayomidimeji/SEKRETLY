import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import NHIELobby from "@/components/sk/NHIELobby";
import TruthDareLobby from "@/components/sk/TruthDareLobby";
import WYRLobby from "@/components/sk/WYRLobby";
import MostLikelyLobby from "@/components/sk/MostLikelyLobby";
import HotTakesLobby from "@/components/sk/HotTakesLobby";
import PollsLobby from "@/components/sk/PollsLobby";
import { adsFlag } from "@/features/admin/settings";
import { getRoom, rerollNick, startGame } from "@/features/games/actions";
import { findRoom, mySeat, roomView } from "@/features/games/rooms";
import { appOrigin } from "@/features/links/topics";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Lobby" };

const LOBBY = { nhie: NHIELobby, tod: TruthDareLobby, wyr: WYRLobby, mlt: MostLikelyLobby, hot: HotTakesLobby, poll: PollsLobby } as const;

export default async function LobbyPage({ params }: PageProps<"/g/[code]/lobby">) {
  const { code } = await params;
  const room = await findRoom(code);
  if (!room) notFound();
  if (!(await mySeat(room))) redirect("/join/" + room.code);
  if (room.status !== "LOBBY") redirect("/g/" + room.code);
  const Lobby = LOBBY[room.game as keyof typeof LOBBY] ?? NHIELobby;
  return <Lobby mode={await getMode()} ads={await adsFlag("lobby")} code={room.code} view={await roomView(room)} load={getRoom} start={startGame} reroll={rerollNick} origin={appOrigin()} />;
}
