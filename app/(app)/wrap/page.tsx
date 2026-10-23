import type { Metadata } from "next";

import WeeklyWrap from "@/components/sk/WeeklyWrap";
import { wrapOf } from "@/features/stats/stats";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sekretly · Weekly wrap" };

export default async function WrapPage() {
  const user = await requireUser("/wrap");
  return <WeeklyWrap username={user.username} wrap={await wrapOf(user)} />;
}
