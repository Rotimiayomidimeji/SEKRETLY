import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import JoinPublic from "@/components/sk/JoinPublic";
import { joinRoom } from "@/features/games/actions";
import { findRoom, mySeat } from "@/features/games/rooms";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · You’re invited" };

// The invite link: pick a nickname, accept the rules, take a seat (guests welcome when the room is public).
export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  const room = await findRoom(code);
  if (!room) notFound();
  if (await mySeat(room)) redirect(room.status === "LOBBY" ? "/g/" + room.code + "/lobby" : "/g/" + room.code);
  const state = room.status !== "LOBBY" ? "started" : room.players.length >= room.maxPlayers ? "full" : "open";
  return (
    <JoinPublic
      mode={await getMode()}
      game={room.game}
      state={state}
      room={room.name}
      seated={room.players.length}
      max={room.maxPlayers}
      join={joinRoom.bind(null, room.code)}
    />
  );
}
