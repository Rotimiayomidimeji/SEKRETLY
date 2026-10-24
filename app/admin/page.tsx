import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import Admin from "@/components/sk/Admin";
import { loadDashboard } from "@/features/admin/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Overview" };

export default async function AdminPage() {
  await requireAdmin("/admin");
  return (
    <>
      <LiveRefresh seconds={20} />
      <Admin mode={await getMode()} dash={await loadDashboard()} />
    </>
  );
}
