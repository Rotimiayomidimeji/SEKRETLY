import { redirect } from "next/navigation";

import { KeyboardFit } from "@/components/layout/KeyboardFit";
import { PushPrompt } from "@/components/layout/PushPrompt";
import { Realtime } from "@/components/layout/Realtime";
import { RoomSwitch } from "@/components/rooms/RoomSwitch";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { avatarBg } from "@/lib/avatar";

// Member screens: live updates for whoever is logged in, and one ask for notifications on this phone.
// The admin account isn't a member: it only has the admin pages.
export default async function MemberLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  // room owners also get a way to their room from every member screen
  const room = user ? await db.room.findUnique({ where: { hostId: user.id }, select: { name: true, logoUrl: true, accent: true, status: true } }) : null;
  return (
    <>
      {children}
      <KeyboardFit />
      {user && <Realtime userId={user.id} />}
      {/* the menu's Profile button shows the member's own animal on their colour */}
      {user && <style>{`:root{--me-img:url("/sk/${user.avatar}.png");--me-bg:${avatarBg(user.avatar, user.avatarHue)}}`}</style>}
      <PushPrompt />
      {room && room.status !== "SUSPENDED" && <RoomSwitch name={room.name} logoUrl={room.logoUrl} accent={room.accent} />}
    </>
  );
}
