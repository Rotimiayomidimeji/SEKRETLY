import type { Metadata } from "next";

import AdminUsers from "@/components/sk/AdminUsers";
import { clearWarnings, deleteUser, setSuspended, warnUser } from "@/features/admin/actions";
import { loadUsers } from "@/features/admin/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Users" };

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");
  return (
    <AdminUsers
      mode={await getMode()}
      users={await loadUsers()}
      warnUser={warnUser}
      clearWarnings={clearWarnings}
      setSuspended={setSuspended}
      deleteUser={deleteUser}
    />
  );
}
