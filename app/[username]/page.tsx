import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import { RoomView } from "@/components/rooms/RoomView";
import { sendMessage } from "@/features/messages/actions";
import { quickJoin, reportPost, stampPost } from "@/features/rooms/actions";
import { loadRoom } from "@/features/rooms/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { requestFingerprint } from "@/lib/rate-limit";
import { roomFonts } from "@/lib/rooms-fonts";

// sekretly.app/<handle>: a room (a big channel's own gossip paper). Every other single-segment address that isn't
// a page of the app is "not found", as before. Member links stay at /<username>/<key>/<theme>/<topic>.

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const room = await db.room.findUnique({ where: { handle: username.toLowerCase() }, select: { name: true, status: true } });
  if (!room || room.status === "SUSPENDED") return { title: "Sekretly" };
  return {
    title: "The " + room.name + " · Sekretly",
    description: "Send The " + room.name + " an anonymous tip. Type it, or say it with your voice disguised.",
    openGraph: { title: "The " + room.name, description: "Send a tip. 100% anonymous." },
  };
}

export default async function RoomPage({ params }: PageProps<"/[username]">) {
  const { username } = await params;
  const user = await getCurrentUser();
  const room = await loadRoom(username.toLowerCase(), { userId: user?.id ?? null, fingerprint: await requestFingerprint() });
  if (!room) notFound();
  if (room.unavailable)
    return (
      <div className={"gp " + roomFonts}>
        <div className="gp-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
          <span className="gp-bigstamp">Unavailable</span>
          <h1 className="gp-name" style={{ fontSize: 48, marginTop: 24 }}>{room.name}</h1>
          <p style={{ marginTop: 14, fontSize: 17 }}>This room isn’t available right now.</p>
          <Link href="/" className="gp-btn" style={{ marginTop: 22 }}>Go to Sekretly</Link>
        </div>
      </div>
    );
  return (
    <div className={roomFonts}>
      {/* new posts, reactions and the open/closed state arrive on their own */}
      <LiveRefresh seconds={15} />
      <RoomView room={room} signedIn={!!user} actions={{ send: sendMessage, stamp: stampPost, report: reportPost, quickJoin }} />
    </div>
  );
}
