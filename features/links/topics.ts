import type { LinkTopic } from "@prisma/client";

/** Address slugs used by Create link and in link URLs, and the matching topic. */
export const SLUG_TOPIC: Record<string, LinkTopic> = {
  "describe-3": "DESCRIBE",
  "know-me": "QUIZ",
  confess: "CONFESS",
  "rate-me": "RATE",
  ama: "AMA",
  custom: "CUSTOM",
};

/** Topic names the link page (Main) understands. */
export const TOPIC_COMPOSER: Record<LinkTopic, string> = {
  DESCRIBE: "describe",
  QUIZ: "quiz",
  CONFESS: "confess",
  RATE: "rate",
  AMA: "ama",
  CUSTOM: "custom",
  // a drop is answered like a custom question (its question is the day's drop)
  DROP: "custom",
};

export const TOPIC_TITLE: Record<LinkTopic, string> = {
  DESCRIBE: "Describe me in 3 words",
  QUIZ: "How well do you know me?",
  CONFESS: "Confess something",
  RATE: "Rate me 1–10",
  AMA: "Ask me anything",
  CUSTOM: "Custom topic",
  DROP: "Today’s drop",
};

export const THEMES = ["default", "sunset", "midnight", "bubblegum", "neon", "ocean"] as const;
export const RATE_CATEGORIES = ["Overall", "Vibe", "Style", "Friendship", "Humour"] as const;

/** Create link's "Stop after a time" choices. */
export const CLOSE_AFTER_MS: Record<string, number> = {
  "1 hour": 3_600_000,
  "6 hours": 6 * 3_600_000,
  "24 hours": 24 * 3_600_000,
  "3 days": 3 * 24 * 3_600_000,
  "7 days": 7 * 24 * 3_600_000,
};

/** Messages disappear after a day by default (Settings will make this adjustable). */
export const MESSAGE_TTL_MS = 24 * 3_600_000;

export const linkPath = (username: string, key: string, theme: string, slug: string) => `/${username}/${key}/${theme}/${slug}`;

export function appOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** A link takes a nap when it is paused, hit its message limit, or passed its closing time. */
export function isNapping(link: { status: string; maxMessages: number | null; messageCount: number; closesAt: Date | null }) {
  if (link.status === "PAUSED") return true;
  if (link.maxMessages != null && link.messageCount >= link.maxMessages) return true;
  if (link.closesAt && link.closesAt <= new Date()) return true;
  return false;
}

/** 6 lowercase letters/digits, like the mockup's k7x2m9. */
export function newLinkKey() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}
