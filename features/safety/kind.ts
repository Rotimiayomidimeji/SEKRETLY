// Kind mode: decides whether a new message goes straight to the inbox or waits in Inbox › Held.
// Simple rules for now (patterns, not a service); `classify` is the only entry point, so a smarter check can replace it.
//   0 Off       only threats are held
//   1 Standard  + clear insults, slurs, body shaming, spam
//   2 Kind only + anything negative or teasing, and low ratings
// The member's own hidden words are held at every level.

const words = (list: string[]) => new RegExp(`(^|[^a-z])(${list.join("|")})([^a-z]|$)`, "i");

const THREAT = [
  /\b(i('|’)?ll|i will|i go|we go|i'm going to|im gonna|i'm gonna|gonna)\s+(kill|beat|stab|shoot|deal with|finish|hurt|find)\s+(you|u)\b/i,
  /\b(kill|end)\s+(yourself|urself)\b/i,
  /\bkys\b/i,
  /\byou\s+(go|will)\s+die\b/i,
  /\bi\s+know\s+where\s+(you|u)\s+(live|stay|sleep)\b/i,
];

const INSULT = words([
  "stupid", "idiot", "fool", "dumb", "useless", "worthless", "pathetic", "disgusting", "loser", "trash", "rubbish",
  "mumu", "olodo", "werey", "oloshi", "ashawo", "olosho", "bastard", "dullard", "bitch",
  "fuck you", "f\\*ck", "fuck off", "shut up",
  "nobody likes you", "no one likes you", "everyone hates you", "everybody hates you", "they just tolerate you",
]);

const BODY = words(["fat", "fatty", "obese", "skinny", "lepa", "orobo", "ugly", "big head", "kpako", "flat chest", "bleach", "short man"]);

const SPAM = [/https?:\/\//i, /\bwww\./i, /\b[a-z0-9-]+\.(com|ng|net|xyz|link|ly)\b/i, /(.)\1{7,}/, /\b(dm me|whatsapp me|send money|bitcoin|forex|investment)\b/i];

const NEGATIVE = words([
  "annoying", "bossy", "rude", "loud", "fake", "proud", "lazy", "boring", "arrogant", "selfish", "weird",
  "toxic", "childish", "dramatic", "stingy", "liar", "hate", "don'?t like", "can'?t stand", "overrated",
]);

type Subject = { text: string; score?: number | null };

/** Why a message should be held, or null to deliver it. */
export function classify(m: Subject, level: number, hiddenWords: string[] = []): string | null {
  const text = m.text ?? "";
  if (THREAT.some((r) => r.test(text))) return "Threat";
  const own = hiddenWords.map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (own.length && own.some((w) => text.toLowerCase().includes(w))) return "Hidden word";
  if (level >= 1) {
    if (INSULT.test(text)) return "Insult";
    if (BODY.test(text)) return "Body shaming";
    if (SPAM.some((r) => r.test(text))) return "Spam";
    const letters = text.replace(/[^a-zA-Z]/g, "");
    if (letters.length >= 20 && letters === letters.toUpperCase()) return "Shouting";
  }
  if (level >= 2) {
    if (NEGATIVE.test(text)) return "Maybe rude";
    if (typeof m.score === "number" && m.score <= 4) return "Low rating";
  }
  return null;
}

/** The sender's own hint: short, and never a name, number or @handle. */
export function cleanHint(raw: string | undefined | null) {
  return (raw ?? "")
    .replace(/@\S+/g, "")
    .replace(/\+?\d[\d\s-]{3,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}
