import type { Metadata } from "next";

import ShareStudio from "@/components/sk/ShareStudio";
import { currentDrop, myDrop } from "@/features/drops/drops";
import { TOPIC_TITLE, appOrigin } from "@/features/links/topics";
import { describeWords } from "@/features/stats/stats";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Share studio" };

const ICON: Record<string, string> = { DESCRIBE: "sparkles", QUIZ: "crown_3d", CONFESS: "shushing_face", RATE: "fire", AMA: "ghost", CUSTOM: "ghost", DROP: "sparkles" };
const weekAgo = () => new Date(Date.now() - 7 * 86_400_000);
const liveNow = () => new Date();

// The Inbox hands over what to share (in browser storage); this page adds recent messages to pick from,
// promo cards that point people at your links, and the address printed on every card.
export default async function SharePage() {
  const user = await requireUser("/share");
  const drop = currentDrop();
  const [recent, today, words, weekCount] = await Promise.all([
    db.message.findMany({
      where: { recipientId: user.id, deletedAt: null, expiresAt: { gt: liveNow() }, OR: [{ held: null }, { releasedAt: { not: null } }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { link: true },
    }),
    myDrop(user.id, drop.number),
    describeWords(user.id),
    db.message.count({ where: { recipientId: user.id, createdAt: { gte: weekAgo() } } }),
  ]);
  const pool = Object.fromEntries(
    recent.map((m) => {
      const d = (m.data ?? {}) as { score?: number; of?: number };
      const text = m.topic === "QUIZ" ? "Someone scored " + d.score + "/" + d.of + " on my quiz" + (m.text ? ". “" + m.text + "”" : "") : m.topic === "RATE" ? d.score + "/10" + (m.text ? ". " + m.text : "") : m.text;
      const topic = m.link.topic === "CUSTOM" || m.link.topic === "DROP" ? m.link.customQuestion ?? TOPIC_TITLE[m.link.topic] : TOPIC_TITLE[m.link.topic];
      return ["m:" + m.id, { topic, th: m.link.theme, icon: "/sk/" + ICON[m.topic] + ".png", text }];
    }),
  );
  const hours = Math.max(1, Math.round(drop.secondsLeft / 3600));
  const answers = today?.messageCount ?? 0;
  const hints = today ? await db.message.count({ where: { linkId: today.id, senderHint: { not: null } } }) : 0;
  const top = words.slice(0, 5).map(([w]) => w);
  const promos = {
    pd: { promo: "Today’s drop", topic: "Today’s drop · No. " + drop.number, th: today?.theme ?? "sunset", icon: "/sk/sparkles.png", text: drop.question + " Tell me. I won’t know it’s you." },
    pc: { promo: "Countdown", topic: "Drop closes at 7pm", th: "midnight", icon: "/sk/fire.png", text: "Last chance. " + hours + (hours === 1 ? " hour" : " hours") + " left to tell me what you really think." },
    pt: {
      promo: "Teaser",
      topic: "Answers so far",
      th: "bubblegum",
      icon: "/sk/eyes.png",
      text: answers ? answers + (answers === 1 ? " answer" : " answers") + " already. " + (hints ? hints + " of you left hints. " : "") + "Who’s next?" : "Nobody has answered yet. Be the first. I won’t know it’s you.",
    },
    pw: {
      promo: "Weekly wrap",
      topic: "My week on Sekretly",
      th: "ocean",
      icon: "/sk/crescent_moon.png",
      text: weekCount + (weekCount === 1 ? " message" : " messages") + " this week." + (top.length >= 3 ? " People called me " + top.slice(0, 3).join(", ").toLowerCase() + ". Fair." : " Your turn."),
    },
    pk: { promo: "Word cloud", topic: "How people describe me", th: "default", icon: "/sk/peach.png", text: top.length ? top.join(" · ") + ". Add your word." : "Describe me in 3 words. Go." },
  };
  return (
    <ShareStudio
      mode={await getMode()}
      ads={process.env.NEXT_PUBLIC_ADS === "on" ? "on" : "off"}
      pool={pool}
      promos={promos}
      brand={appOrigin().replace(/^https?:\/\//, "") + "/u/" + user.username}
    />
  );
}
