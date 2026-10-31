import { currentDrop, streakOf } from "@/features/drops/drops";
import { sendPush } from "@/features/notifications/push";
import { db } from "@/lib/db";

// Scheduled pushes (vercel.json runs these; Vercel sends "Authorization: Bearer <CRON_SECRET>"):
//   streak  5pm Lagos   "Your 12-day streak ends at 7pm" to members who haven't done anything that counts today
//   drop    7pm Lagos   the new daily drop question
//   wrap    Sunday 6pm  "Your week, wrapped" (and the occasional in-app "Try Mystery features" note)
// Each respects the member's switch for it and their quiet hours (see features/notifications/push).

export const maxDuration = 60;

const withPush = () => db.user.findMany({ where: { status: "ACTIVE", pushSubs: { some: {} } }, select: { id: true } });

const JOBS: Record<string, () => Promise<number>> = {
  async streak() {
    let sent = 0;
    for (const u of await withPush()) {
      const s = await streakOf(u.id);
      if (!s.atRisk) continue;
      await sendPush(u.id, { title: "Your " + s.current + "-day streak ends at 7pm", body: "Do one thing to keep it going: answer the drop, send a message, reply or play a game.", url: "/home", tag: "streak" }, "streak");
      sent++;
    }
    return sent;
  },
  async drop() {
    const drop = currentDrop();
    const users = await withPush();
    for (const u of users) await sendPush(u.id, { title: "Today’s drop is live", body: drop.question, url: "/drop", tag: "drop" }, "drop");
    return users.length;
  },
  async wrap() {
    const since = new Date(Date.now() - 7 * 86_400_000);
    let sent = 0;
    for (const u of await withPush()) {
      const n = await db.message.count({ where: { recipientId: u.id, createdAt: { gte: since } } });
      if (!n) continue;
      await sendPush(u.id, { title: "Your week, wrapped", body: n + (n === 1 ? " message" : " messages") + " this week. Tap to watch.", url: "/wrap", tag: "wrap" }, "wrap");
      sent++;
    }
    await nudgeMystery();
    return sent;
  },
};

// Every 3 weeks or so, members with all four Mystery features off get one in-app note about them (never a push).
async function nudgeMystery() {
  const due = new Date(Date.now() - 21 * 86_400_000);
  const users = await db.user.findMany({
    where: {
      status: "ACTIVE",
      role: "MEMBER",
      createdAt: { lt: new Date(Date.now() - 2 * 86_400_000) },
      allowHints: false,
      receiptReactions: false,
      allowGuess: false,
      senderReceipts: false,
      OR: [{ mysteryNudgedAt: null }, { mysteryNudgedAt: { lt: due } }],
    },
    select: { id: true },
    take: 5000,
  });
  if (!users.length) return;
  const ids = users.map((u) => u.id);
  await db.notification.createMany({
    data: ids.map((userId) => ({
      userId,
      kind: "WELCOME" as const,
      title: "Try Mystery features",
      body: "Hints, receipts, reactions and Guess who make your messages more fun. Turn them on in Settings › Privacy.",
      href: "/settings?s=privacy",
    })),
  });
  await db.user.updateMany({ where: { id: { in: ids } }, data: { mysteryNudgedAt: new Date() } });
}

export async function GET(request: Request, { params }: RouteContext<"/api/cron/[job]">) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== "Bearer " + secret) return new Response("Unauthorized", { status: 401 });
  const { job } = await params;
  const run = JOBS[job];
  if (!run) return new Response("Unknown job", { status: 404 });
  return Response.json({ job, sent: await run() });
}
