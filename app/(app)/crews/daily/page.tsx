import type { Metadata } from "next";

import CrewDaily from "@/components/sk/CrewDaily";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Crew question" };

// Sample crew question until crews are built with games (Phase 6).
export default async function CrewDailyPage() {
  await requireUser("/crews/daily");
  return <CrewDaily mode={await getMode()} />;
}
