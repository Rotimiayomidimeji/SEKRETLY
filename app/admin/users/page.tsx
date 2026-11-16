import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import AdminUsers from "@/components/sk/AdminUsers";
import { clearWarnings, deleteUser, setSuspended, warnUser } from "@/features/admin/actions";
import { loadUsers, reviewCount } from "@/features/admin/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Users" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const [data, review] = await Promise.all([loadUsers(), reviewCount()]);
  return (
    <>
    <LiveRefresh seconds={30} />
    <AdminUsers
      mode={await getMode()}
      users={data.list}
      stats={{ total: data.total, suspended: data.suspended, active7: data.active7, online: data.online }}
      reviewCount={review}
      warnUser={warnUser}
      clearWarnings={clearWarnings}
      setSuspended={setSuspended}
      deleteUser={deleteUser}
    />
    </>
  );
}
