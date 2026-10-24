import type { Metadata } from "next";

import AdminReports from "@/components/sk/AdminReports";
import { decideReport } from "@/features/admin/actions";
import { loadReports } from "@/features/admin/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Reports" };

export default async function AdminReportsPage() {
  await requireAdmin("/admin/reports");
  const { reports, log, kpis } = await loadReports();
  return <AdminReports mode={await getMode()} reports={reports} log={log} kpis={kpis} decide={decideReport} />;
}
