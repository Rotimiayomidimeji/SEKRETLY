import type { Metadata } from "next";

import Crews from "@/components/sk/Crews";
import { navCounts } from "@/features/notifications/queries";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Crews" };

// Crews are saved from game tables, so this shows the mockup's sample crews until games are built (Phase 6).
export default async function CrewsPage() {
  const user = await requireUser("/crews");
  return <Crews mode={await getMode()} {...await navCounts(user.id)} />;
}
