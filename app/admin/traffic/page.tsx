import type { Metadata } from "next";

import AdminTraffic from "@/components/sk/AdminTraffic";
import { LiveRefresh } from "@/components/layout/LiveRefresh";
import { setIpBlocked } from "@/features/admin/actions";
import { trafficFor } from "@/features/admin/traffic";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Traffic" };

const fiveMinAgo = () => new Date(Date.now() - 5 * 60_000);

export default async function AdminTrafficPage() {
  await requireAdmin("/admin/traffic");
  const [today, week, month, live] = await Promise.all([
    trafficFor("today"),
    trafficFor("week"),
    trafficFor("month"),
    db.visitLog.findMany({ where: { at: { gte: fiveMinAgo() } }, distinct: ["fingerprint"], select: { id: true } }),
  ]);
  return (
    <>
      <LiveRefresh seconds={30} />
      <AdminTraffic mode={await getMode()} traffic={{ today, week, month }} live={live.length} setIpBlocked={setIpBlocked} />
    </>
  );
}
