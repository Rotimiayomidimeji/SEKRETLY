import "server-only";

import type { Chat, ChatMessage, Guess, Link, Message, User } from "@prisma/client";

import { aliasBg } from "@/features/inbox/queries";
import { TOPIC_TITLE } from "@/features/links/topics";

/** The five reactions, in the order the Inbox shows them (index is what's stored). */
export const REACTIONS: [string, string][] = [
  ["Love it", "/sk/sparkles.png"],
  ["Laughing", "/sk/fire.png"],
  ["Shook", "/sk/eyes.png"],
  ["Secret safe", "/sk/shushing_face.png"],
  ["Touched", "/sk/love_letter.png"],
];

const stamp = (d: Date) => {
  const lagos = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).replace(" ", "");
  if (lagos(d) === lagos(new Date())) return "Today " + time;
  if (lagos(d) === lagos(new Date(Date.now() - 86_400_000))) return "Yesterday " + time;
  return d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Africa/Lagos" }) + " " + time;
};

/** Where a guess stands for the person who made it: waiting, confirmed (they revealed) or not confirmed. */
export function guessState(g: Guess | undefined) {
  if (!g) return null;
  if (g.status === "REVEALED") return "yes";
  if (g.status === "PENDING" && g.resolveAt > new Date()) return "wait";
  return "no";
}

type ReceiptRow = Message & {
  link: Link & { owner: User };
  chat: (Chat & { messages: ChatMessage[] }) | null;
  guesses: Guess[];
};

export const RECEIPT_INCLUDE = {
  link: { include: { owner: true } },
  chat: { include: { messages: { where: { fromOwner: true }, orderBy: { createdAt: "asc" as const }, take: 1 } } },
  guesses: { where: { correct: true }, orderBy: { createdAt: "desc" as const }, take: 1 },
};

/** What the sender sees on their receipt. Nothing here says who they are, and held messages just read "Sent". */
export function receiptView(m: ReceiptRow) {
  const owner = m.link.owner;
  const reply = m.chat?.messages[0];
  const showReaction = owner.receiptReactions && m.reaction != null && !!m.reactedAt;
  const guess = m.guesses[0];
  const asked = guess && guess.status === "PENDING" && guess.resolveAt > new Date();
  const steps: [string, Date | null][] = [
    ["Sent", m.createdAt],
    ["Seen", m.held && !m.releasedAt ? null : m.readAt],
    ["Reacted", showReaction ? m.reactedAt : null],
    ["Replied", reply ? reply.createdAt : null],
  ];
  const done = steps.filter(([, at]) => at).length;
  const status = asked ? "guessed" : reply ? "replied" : showReaction ? "reacted" : m.readAt && !m.held ? "seen" : "sent";
  return {
    id: m.id,
    code: m.receiptCode ?? "",
    to: "@" + owner.username,
    topic: m.link.topic === "CUSTOM" || m.link.topic === "DROP" ? m.link.customQuestion ?? TOPIC_TITLE[m.link.topic] : TOPIC_TITLE[m.link.topic],
    msg: m.text || (m.topic === "QUIZ" ? "Took the quiz" : m.topic === "RATE" ? "Sent a rating" : ""),
    hint: m.senderHint ?? "",
    icon: "/sk/" + owner.avatar + ".png",
    tint: aliasBg(owner.avatar),
    status,
    dot: { guessed: "#7a3cff", replied: "#22b36f", reacted: "#ffb020", seen: "#3aa0ff", sent: "#8f8399" }[status],
    steps: steps.map(([label, at], i) => ({ label, when: at ? stamp(at) : "not yet", done: !!at, last: i === steps.length - 1, next: i < done - 1 })),
    reacted: showReaction,
    reactIcon: showReaction ? REACTIONS[m.reaction!]?.[1] ?? "" : "",
    reactWord: showReaction ? REACTIONS[m.reaction!]?.[0] ?? "" : "",
    replied: !!reply,
    reply: reply?.text ?? "",
    guessed: !!asked || guess?.status === "REVEALED",
    revealed: guess?.status === "REVEALED",
    canFollow: !m.followUpOfId,
  };
}
