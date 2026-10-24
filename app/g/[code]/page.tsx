import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import NHIE from "@/components/sk/NHIE";
import TruthDare from "@/components/sk/TruthDare";
import WYR from "@/components/sk/WYR";
import MostLikely from "@/components/sk/MostLikely";
import HotTakes from "@/components/sk/HotTakes";
import Polls from "@/components/sk/Polls";
import { adsFlag } from "@/features/admin/settings";
import { getRoom, hostAction, playMove, tickTable } from "@/features/games/actions";
import { findRoom, mySeat, roomView } from "@/features/games/rooms";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Game" };

const TABLE = { nhie: NHIE, tod: TruthDare, wyr: WYR, mlt: MostLikely, hot: HotTakes, poll: Polls } as const;

// The live table: every phone follows the same server table (see features/games/engine).
export default async function GamePage({ params }: PageProps<"/g/[code]">) {
  const { code } = await params;
  const room = await findRoom(code);
  if (!room) notFound();
  const seat = await mySeat(room);
  if (!seat) redirect("/join/" + room.code);
  if (room.status === "LOBBY") redirect("/g/" + room.code + "/lobby");
  const Table = TABLE[room.game as keyof typeof TABLE] ?? NHIE;
  return (
    <Table
      mode={await getMode()}
      ads={await adsFlag("over")}
      role={seat.isHost ? "host" : "player"}
      code={room.code}
      view={await roomView(room)}
      load={getRoom}
      move={playMove}
      tick={tickTable}
      host={hostAction}
    />
  );
}
