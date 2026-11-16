import type { Metadata } from "next";

import AdminTraffic from "@/components/sk/AdminTraffic";
import { LiveRefresh } from "@/components/layout/LiveRefresh";
import { setIpBlocked } from "@/features/admin/actions";
import { livePeople } from "@/features/admin/presence";
import { reviewCount } from "@/features/admin/queries";
import { trafficFor } from "@/features/admin/traffic";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Traffic" };

export default async function AdminTrafficPage() {
  await requireAdmin();
  const [today, week, month, live, review] = await Promise.all([
    trafficFor("today"),
    trafficFor("week"),
    trafficFor("month"),
    livePeople(),
    reviewCount(),
  ]);
  return (
    <>
      <LiveRefresh seconds={20} />
      <AdminTraffic mode={await getMode()} traffic={{ today, week, month }} live={live.count} liveRows={live.rows} reviewCount={review} setIpBlocked={setIpBlocked} />
    </>
  );
}
