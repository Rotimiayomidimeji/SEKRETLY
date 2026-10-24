import type { Metadata } from "next";

import AdminAds from "@/components/sk/AdminAds";
import { saveAds } from "@/features/admin/actions";
import { adsConfig } from "@/features/admin/settings";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Ads" };

export default async function AdminAdsPage() {
  await requireAdmin("/admin/ads");
  return <AdminAds mode={await getMode()} config={await adsConfig()} save={saveAds} />;
}
