import type { Metadata } from "next";

import { LiveRefresh } from "@/components/layout/LiveRefresh";
import DropAnswer from "@/components/sk/DropAnswer";
import { makeDrop } from "@/features/drops/actions";
import { currentDrop, myDrop, streakOf } from "@/features/drops/drops";
import { appOrigin, linkPath } from "@/features/links/topics";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Daily drop" };

const ago = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  return m < 1 ? "just now" : m < 60 ? m + " min ago" : Math.floor(m / 60) + "h ago";
};

/** "7pm today" or "7pm tomorrow", in Lagos time. */
const closesLabel = (closesAt: Date) =>
  "closes at 7pm " + (new Date(closesAt.getTime() + 3_600_000).getUTCDate() === new Date(Date.now() + 3_600_000).getUTCDate() ? "today" : "tomorrow");

export default async function DropPage() {
  const user = await requireUser("/drop");
  const drop = currentDrop();
  const [mine, streak] = await Promise.all([myDrop(user.id, drop.number), streakOf(user.id)]);
  const answers = mine
    ? await db.message.findMany({
        where: { linkId: mine.id, OR: [{ held: null }, { releasedAt: { not: null } }] },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { text: true, createdAt: true, senderHint: true },
      })
    : [];
  return (
    <>
      {mine && <LiveRefresh seconds={10} />}
      <DropAnswer
        mode={await getMode()}
        username={user.username}
        number={drop.number}
        question={drop.question}
        secondsLeft={drop.secondsLeft}
        closesLabel={closesLabel(drop.closesAt)}
        streak={streak.current}
        drop={
          mine && {
            theme: mine.theme,
            self: mine.dropSelf ?? "",
            kind: !mine.kindOff,
            hints: !mine.hintsOff,
            url: appOrigin().replace(/^https?:\/\//, "") + linkPath(user.username, user.linkKey, mine.theme, mine.slug),
          }
        }
        answers={mine?.messageCount ?? 0}
        taps={mine?.visitCount ?? 0}
        withHints={answers.filter((a) => a.senderHint).length}
        feed={answers.map((a) => ({ text: a.text, when: ago(a.createdAt), hint: a.senderHint ?? "" }))}
        makeDrop={makeDrop}
      />
    </>
  );
}
