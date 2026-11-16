import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import { RoomDesk } from "@/components/rooms/RoomDesk";
import { logout } from "@/features/auth/actions";
import { editPost, hostKeepPost, printTip, saveRoomSettings, setHostPassword, spikeTip, writeLetter } from "@/features/rooms/actions";
import { loadDesk } from "@/features/rooms/queries";
import { requireUser } from "@/lib/auth/session";
import { roomFonts } from "@/lib/rooms-fonts";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Editor’s desk", robots: { index: false } };

// The room host's desk. Only accounts the admin made room hosts have one.
export default async function DeskPage() {
  const user = await requireUser("/desk");
  const desk = await loadDesk(user.id);
  if (!desk) notFound();
  return (
    <div className={roomFonts}>
      {desk.room.ready && <LiveRefresh seconds={20} />}
      <RoomDesk
        desk={desk}
        mode={await getMode()}
        actions={{ setPassword: setHostPassword, print: printTip, spike: spikeTip, letter: writeLetter, edit: editPost, keep: hostKeepPost, settings: saveRoomSettings, logout }}
      />
    </div>
  );
}
