import type { Metadata } from "next";

import Badges from "@/components/sk/Badges";
import { setPinnedBadges } from "@/features/profile/actions";
import { badgesOf } from "@/features/stats/stats";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Badges" };

export default async function BadgesPage() {
  const user = await requireUser("/badges");
  return <Badges mode={await getMode()} badges={await badgesOf(user.id)} pinned={user.pinnedBadges} setPins={setPinnedBadges} />;
}
