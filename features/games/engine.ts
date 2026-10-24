import "server-only";

// The live table for every game, kept on the server so all phones see the same turn, card, timer and scores.
// Phones send what their player did (pick a card, answer, guess…); the table moves on when everyone has answered
// or the timer runs out. The rules mirror the game screen's own (components/sk/NHIE.tsx etc.), so each phone's
// reveal matches the server's tallies.

export const GAMES = ["nhie", "tod", "wyr", "mlt", "hot", "poll"] as const;
export type GameId = (typeof GAMES)[number];

export type Settings = {
  max: number;
  laps: number;
  timer: number;
  spice: "mild" | "spicy" | "unhinged";
  esc: boolean;
  special: Record<string, boolean>;
  packs: string[];
  pollQ?: string;
  pollOpts?: string[];
};

export type Seat = { nick: string; color: string };
export type Phase = "intro" | "spin" | "choose" | "act" | "pick" | "answer" | "reveal" | "over";
type Value = string | number;

export type Table = {
  seats: Seat[];
  k: number;
  phase: Phase;
  phaseAt: number;
  deadline: number;
  card: number | "own" | null;
  own: string;
  choice: "truth" | "dare" | null;
  didIt: string | null;
  answers: Record<string, Value>;
  guesses: Record<string, Value>;
  paused: boolean;
  pausedAt?: number;
  kicked: string[];
  scores: Record<string, number>;
  lives: Record<string, number>;
  catches: Record<string, number>;
  crowns: Record<string, number>;
  chickens: Record<string, number>;
};

const SEC = 1000;
const h = (k: number, i: number, salt: number) => ((k + 3) * 73 + (i + 1) * 151 + salt * 37 + k * i * 11) % 100;

/** Turn order, same as the screen: the last seat starts, then seat 0, 1, …; once per lap. */
export function turns(t: Table, laps: number) {
  const n = t.seats.length, one = [n - 1, ...Array.from({ length: n - 1 }, (_, i) => i)];
  return Array.from({ length: laps }, () => one.map((i) => t.seats[i].nick)).flat();
}

const alive = (t: Table, nick: string) => !t.kicked.includes(nick);
const inGame = (t: Table) => t.seats.map((s) => s.nick).filter((n) => alive(t, n));

/** Who answers on turn k (Never Have I Ever and Truth or Dare: not the turn player; NHIE: only players with cups). */
export function answerers(game: GameId, t: Table, tp: string) {
  return inGame(t).filter((n) => {
    if ((game === "nhie" || game === "tod") && n === tp) return false;
    if (game === "nhie" && t.lives[n] === 0) return false;
    return true;
  });
}

export function newTable(game: GameId, seats: Seat[], s: Settings): Table {
  const cups = s.special.lives5 ? 5 : 3;
  const now = Date.now();
  return {
    seats,
    k: 0,
    phase: "intro",
    phaseAt: now,
    deadline: now + 4 * SEC,
    card: null,
    own: "",
    choice: null,
    didIt: null,
    answers: {},
    guesses: {},
    paused: false,
    kicked: [],
    scores: {},
    lives: Object.fromEntries(seats.map((p) => [p.nick, cups])),
    catches: {},
    crowns: {},
    chickens: {},
  };
}

const to = (t: Table, phase: Phase, seconds: number): Table => ({ ...t, phase, phaseAt: Date.now(), deadline: Date.now() + seconds * SEC });

/** Starts turn k (skipping players who were removed), or ends the game. */
function begin(game: GameId, t: Table, s: Settings, k: number): Table {
  const tl = turns(t, s.laps);
  while (k < tl.length && !alive(t, tl[k])) k++;
  if (k >= tl.length) return to({ ...t, k }, "over", 3600);
  return to({ ...t, k, card: null, own: "", choice: null, didIt: null, answers: {}, guesses: {} }, game === "tod" ? "spin" : "pick", game === "tod" ? 3.2 : s.timer + 5);
}

/** Fills in anyone who didn't answer (same defaults as the screen), then scores the turn. */
function resolve(game: GameId, t: Table, s: Settings): Table {
  const tp = turns(t, s.laps)[t.k];
  const ans = answerers(game, t, tp);
  const others = inGame(t).filter((n) => n !== tp);
  const a: Record<string, Value> = {};
  for (const n of ans) {
    const v = t.answers[n];
    a[n] = v !== undefined ? v : game === "nhie" ? "never" : game === "tod" ? "legit" : game === "wyr" ? "a" : game === "mlt" ? (inGame(t).find((x) => x !== n) ?? n) : game === "hot" ? 3 : 0;
  }
  const scores = { ...t.scores }, lives = { ...t.lives }, catches = { ...t.catches }, crowns = { ...t.crowns }, chickens = { ...t.chickens };
  const add = (n: string, v: number) => (scores[n] = (scores[n] ?? 0) + v);
  if (game === "nhie") {
    const caught = ans.filter((n) => a[n] === "have");
    caught.forEach((n) => (lives[n] = Math.max(0, lives[n] - 1)));
    catches[tp] = (catches[tp] ?? 0) + caught.length;
    add(tp, caught.length);
  } else if (game === "tod") {
    const lg = ans.filter((n) => a[n] === "legit").length, legit = lg > ans.length - lg;
    if (legit) add(tp, 3);
    else {
      add(tp, -1);
      chickens[tp] = (chickens[tp] ?? 0) + 1;
    }
    ans.forEach((n) => (a[n] === "legit") === legit && add(n, 1));
  } else if (game === "wyr") {
    const ca = ans.filter((n) => a[n] === "a").length, maj = ca >= ans.length - ca ? "a" : "b";
    ans.forEach((n) => a[n] === maj && add(n, 1));
    Object.entries(t.guesses).forEach(([n, g]) => g === maj && add(n, 2));
    if (Math.abs(ca - (ans.length - ca)) <= 1) add(tp, 2);
  } else if (game === "mlt") {
    const tally: Record<string, number> = {};
    ans.forEach((n) => (tally[String(a[n])] = (tally[String(a[n])] ?? 0) + 1));
    const win = Object.keys(tally).sort((x, y) => tally[y] - tally[x])[0];
    if (win) {
      crowns[win] = (crowns[win] ?? 0) + 1;
      add(win, 2);
      ans.forEach((n) => a[n] === win && n !== win && add(n, 1));
    }
  } else if (game === "hot") {
    const raters = ans.filter((n) => n !== tp);
    const avg = Math.round(raters.reduce((x, n) => x + Number(a[n]), 0) / Math.max(1, raters.length));
    raters.forEach((n) => {
      const d = Math.abs(Number(a[n]) - avg);
      if (d === 0) add(n, 2);
      else if (d === 1) add(n, 1);
    });
    const gd = Math.abs(Number(a[tp]) - avg);
    if (gd === 0) add(tp, 3);
    else if (gd === 1) add(tp, 1);
  } else {
    const counts: Record<string, number> = {};
    ans.forEach((n) => (counts[String(a[n])] = (counts[String(a[n])] ?? 0) + 1));
    const top = Object.keys(counts).sort((x, y) => counts[y] - counts[x] || Number(x) - Number(y))[0];
    ans.forEach((n) => String(a[n]) === top && add(n, 1));
    Object.entries(t.guesses).forEach(([n, g]) => String(g) === top && add(n, 2));
  }
  void others;
  return to({ ...t, answers: a, scores, lives, catches, crowns, chickens }, "reveal", 5.5);
}

/** Moves the table on when its time is up (or when everyone has acted). Returns null if nothing should change yet. */
export function advance(game: GameId, t: Table, s: Settings, force = false): Table | null {
  if (t.paused || t.phase === "over") return null;
  const late = force || Date.now() >= t.deadline;
  const tp = turns(t, s.laps)[t.k];
  switch (t.phase) {
    case "intro":
      return late ? begin(game, t, s, 0) : null;
    case "spin":
      return late ? to(t, "choose", s.timer) : null;
    case "choose":
      return late || t.choice ? to({ ...t, choice: t.choice ?? (h(t.k, 2, 9) < 50 ? "truth" : "dare") }, "act", s.timer + 5) : null;
    case "act":
      return late || t.didIt ? to({ ...t, didIt: t.didIt ?? "chicken" }, "answer", s.timer) : null;
    case "pick":
      return late || t.card !== null ? to({ ...t, card: t.card ?? 0 }, "answer", s.timer) : null;
    case "answer": {
      const everyone = answerers(game, t, tp).every((n) => t.answers[n] !== undefined);
      return late || (everyone && Date.now() - t.phaseAt >= 1500) ? resolve(game, t, s) : null;
    }
    case "reveal":
      return late ? begin(game, t, s, t.k + 1) : null;
    default:
      return null;
  }
}

/** Applies one player's action. Returns the new table, or an error if it doesn't fit the moment. */
export function act(game: GameId, t: Table, s: Settings, nick: string, type: string, value: unknown): Table | { error: string } {
  const tp = turns(t, s.laps)[t.k];
  if (!alive(t, nick)) return { error: "You were removed from this table." };
  if (type === "pick") {
    if (t.phase !== "pick" || nick !== tp) return { error: "Not your pick." };
    const v = value as { card: number | "own"; own?: string };
    const own = String(v.own ?? "").trim().slice(0, 140);
    if (v.card === "own" && own.length < 8) return { error: "Write a bit more." };
    return advance(game, { ...t, card: v.card === "own" ? "own" : Math.max(0, Math.min(2, Number(v.card) || 0)), own }, s, true)!;
  }
  if (type === "choose") {
    if (t.phase !== "choose" || nick !== tp || (value !== "truth" && value !== "dare")) return { error: "Not your choice." };
    return advance(game, { ...t, choice: value }, s, true)!;
  }
  if (type === "did") {
    if (t.phase !== "act" || nick !== tp) return { error: "Not your turn." };
    return advance(game, { ...t, didIt: String(value).slice(0, 20) }, s, true)!;
  }
  if (type === "answer") {
    if (t.phase !== "answer" || !answerers(game, t, tp).includes(nick) || t.answers[nick] !== undefined) return { error: "Answer not taken." };
    const v = typeof value === "number" ? value : String(value).slice(0, 40);
    const next = { ...t, answers: { ...t.answers, [nick]: v } };
    return advance(game, next, s) ?? next;
  }
  if (type === "guess") {
    if (t.phase !== "answer" || t.guesses[nick] !== undefined) return { error: "Guess not taken." };
    return { ...t, guesses: { ...t.guesses, [nick]: typeof value === "number" ? value : String(value).slice(0, 40) } };
  }
  return { error: "Unknown action." };
}

/** Host controls. */
export function host(t: Table, type: "pause" | "kick" | "end", value?: unknown): Table {
  if (type === "pause") {
    if (value) return t.paused ? t : { ...t, paused: true, pausedAt: Date.now() };
    // carry on with the time that was left when it paused
    const held = Date.now() - (t.pausedAt ?? Date.now());
    return { ...t, paused: false, pausedAt: undefined, phaseAt: t.phaseAt + held, deadline: t.deadline + held };
  }
  if (type === "kick") return { ...t, kicked: [...new Set([...t.kicked, String(value)])] };
  return { ...t, phase: "over", phaseAt: Date.now(), deadline: Date.now() + 3600 * SEC };
}
