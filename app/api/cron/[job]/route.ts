import { currentDrop, streakOf } from "@/features/drops/drops";
import { sendPush } from "@/features/notifications/push";
import { db } from "@/lib/db";

// Scheduled pushes (vercel.json runs these; Vercel sends "Authorization: Bearer <CRON_SECRET>"):
//   streak  5pm Lagos   "Your 12-day streak ends at 7pm" to members who haven't dropped yet
//   drop    7pm Lagos   the new daily drop question
//   wrap    Sunday 6pm  "Your week, wrapped"
// Each respects the member's switch for it and their quiet hours (see features/notifications/push).

export const maxDuration = 60;

const withPush = () => db.user.findMany({ where: { status: "ACTIVE", pushSubs: { some: {} } }, select: { id: true } });

const JOBS: Record<string, () => Promise<number>> = {
  async streak() {
    let sent = 0;
    for (const u of await withPush()) {
      const s = await streakOf(u.id);
      if (!s.atRisk) continue;
      await sendPush(u.id, { title: "Your " + s.current + "-day streak ends at 7pm", body: "Drop today’s question to keep it going.", url: "/drop", tag: "streak" }, "streak");
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
    return sent;
  },
};

export async function GET(request: Request, { params }: RouteContext<"/api/cron/[job]">) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== "Bearer " + secret) return new Response("Unauthorized", { status: 401 });
  const { job } = await params;
  const run = JOBS[job];
  if (!run) return new Response("Unknown job", { status: 404 });
  return Response.json({ job, sent: await run() });
}
