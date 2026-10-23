import "server-only";

import { db } from "@/lib/db";

// The daily drop: one question for everyone each day. A drop runs until 7pm Lagos time (18:00 UTC), then the next one starts.
// Numbers count up from drop No. 1 (closing 24 Mar 2026), so the drop closing 23 Oct 2026 is No. 214.

const DAY = 86_400_000;
const SHIFT = 6 * 3_600_000; // moving 18:00 UTC to midnight makes each drop one calendar "day"
const FIRST = Date.UTC(2026, 2, 24) / DAY;

const QUESTIONS = [
  "What’s one thing people get wrong about me?",
  "What’s your first impression of me?",
  "What should I do more of?",
  "What song reminds you of me?",
  "What’s a secret you’ve never told me?",
  "Describe me as a Nollywood character.",
  "What’s my most annoying habit? Be honest.",
  "When did I make your day without knowing?",
  "What would you never say to my face?",
  "Who do you think I secretly like?",
  "What’s one thing I’m better at than I think?",
  "If I were a food, what would I be?",
  "What do you think I’ll be doing in 5 years?",
  "What’s the funniest thing I’ve ever done?",
  "Rate my vibe this week, 1 to 10, and why.",
  "What advice would you give me right now?",
  "What’s something you admire about me?",
  "What’s a rumour you’ve heard about me?",
  "Which friend of mine do you think is the realest?",
  "What’s one question you’ve always wanted to ask me?",
];

/** Today's drop number (changes at 7pm Lagos). */
export const dropNumber = (at = Date.now()) => Math.floor((at + SHIFT) / DAY) - FIRST + 1;
export const dropQuestion = (n: number) => QUESTIONS[(((n - 214) % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length];
/** When drop `n` closes. */
export const dropClosesAt = (n: number) => new Date((n + FIRST) * DAY - SHIFT);
export const dropSlug = (n: number) => "d" + n;

export function currentDrop() {
  const number = dropNumber();
  const closesAt = dropClosesAt(number);
  return { number, question: dropQuestion(number), closesAt, secondsLeft: Math.max(0, Math.floor((closesAt.getTime() - Date.now()) / 1000)) };
}

/** The member's drop for today, if they made one. */
export const myDrop = (userId: string, number = dropNumber()) =>
  db.link.findFirst({ where: { ownerId: userId, topic: "DROP", dropNumber: number, status: { not: "DELETED" } } });

/**
 * Streak: drops posted on consecutive days (a streak save covers a missed day). Today counts once it's dropped;
 * until 7pm an undropped today doesn't break the streak yet, it puts it at risk.
 */
export async function streakOf(userId: string) {
  const [drops, saves] = await Promise.all([
    db.link.findMany({ where: { ownerId: userId, topic: "DROP" }, select: { dropNumber: true } }),
    db.streakSave.findMany({ where: { userId }, select: { dropNumber: true } }),
  ]);
  const dropped = new Set(drops.map((d) => d.dropNumber!).filter((n) => n != null));
  const saved = new Set(saves.map((s) => s.dropNumber));
  const done = new Set([...dropped, ...saved]);
  const today = dropNumber();
  const doneToday = done.has(today);
  let current = 0;
  for (let n = doneToday ? today : today - 1; done.has(n); n--) current++;
  let longest = 0, run = 0;
  for (const n of [...done].sort((a, b) => a - b)) {
    run = done.has(n - 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest, doneToday, atRisk: !doneToday && current > 0, today, dropped, saved };
}

/** Adds the week's free streak save (Mondays, Lagos time; holding at most 2). Safe to call on every visit. */
export async function topUpSaves(user: { id: string; streakSaves: number; savesToppedAt: Date | null }) {
  const lagosNow = new Date(Date.now() + 3_600_000);
  const monday = new Date(Date.UTC(lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate() - ((lagosNow.getUTCDay() + 6) % 7)) - 3_600_000);
  if (user.savesToppedAt && user.savesToppedAt >= monday) return user.streakSaves;
  // the first visit only starts the clock (accounts begin with 2 saves)
  const saves = user.savesToppedAt ? Math.min(2, user.streakSaves + 1) : user.streakSaves;
  await db.user.update({ where: { id: user.id }, data: { streakSaves: saves, savesToppedAt: new Date() } });
  return saves;
}
