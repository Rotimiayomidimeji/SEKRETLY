import type { Metadata } from "next";

import { AdminRooms } from "@/components/admin/AdminRooms";
import { LiveRefresh } from "@/components/layout/LiveRefresh";
import { reviewCount } from "@/features/admin/queries";
import { adminPostAction, createRoom, deleteRoom, resetRoomPassword, setRoomAdmin } from "@/features/rooms/actions";
import { loadAdminRooms, loadReportedRoomPosts } from "@/features/rooms/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Rooms" };

export default async function AdminRoomsPage() {
  await requireAdmin();
  const [rooms, reported, review, mode] = await Promise.all([loadAdminRooms(), loadReportedRoomPosts(), reviewCount(), getMode()]);
  return (
    <>
      <LiveRefresh seconds={30} />
      <AdminRooms rooms={rooms} reported={reported} mode={mode} reviewCount={review} actions={{ create: createRoom, reset: resetRoomPassword, set: setRoomAdmin, remove: deleteRoom, post: adminPostAction }} />
    </>
  );
}
