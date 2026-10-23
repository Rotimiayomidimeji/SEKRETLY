import type { Metadata } from "next";

import Streak from "@/components/sk/Streak";
import { spendStreakSave } from "@/features/drops/actions";
import { dropClosesAt, streakOf, topUpSaves } from "@/features/drops/drops";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Streak" };

const lagos = (d: Date) => new Date(d.getTime() + 3_600_000);

export default async function StreakPage() {
  const user = await requireUser("/streak");
  const [saves, streak] = await Promise.all([topUpSaves(user), streakOf(user.id)]);
  // the calendar shows this month in Lagos time; each drop belongs to the day it closes (7pm)
  const now = lagos(dropClosesAt(streak.today));
  const year = now.getUTCFullYear(), month = now.getUTCMonth();
  const dayOf = (n: number) => {
    const d = lagos(dropClosesAt(n));
    return d.getUTCFullYear() === year && d.getUTCMonth() === month ? d.getUTCDate() : null;
  };
  const days = (set: Set<number>) => [...set].map(dayOf).filter((d): d is number => d !== null);
  return (
    <Streak
      mode={await getMode()}
      avatar={user.avatar}
      current={streak.current}
      longest={streak.longest}
      atRisk={streak.atRisk}
      saves={saves}
      savedToday={streak.saved.has(streak.today)}
      month={{
        name: now.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" }),
        offset: new Date(Date.UTC(year, month, 1)).getUTCDay(),
        days: new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
        today: now.getUTCDate(),
        dropped: days(streak.dropped),
        saved: days(streak.saved),
      }}
      spendSave={spendStreakSave}
    />
  );
}
