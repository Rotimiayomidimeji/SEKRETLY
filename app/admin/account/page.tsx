import type { Metadata } from "next";

import AdminAccount from "@/components/admin/AdminAccount";
import { changeAdminPassword } from "@/features/admin/actions";
import { logout } from "@/features/auth/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Account" };

// The admin account's password and log out (the admin has no Settings: it isn't a member).
export default async function AdminAccountPage() {
  const user = await requireAdmin();
  return <AdminAccount mode={await getMode()} username={user.username} changePassword={changeAdminPassword} logout={logout} />;
}
