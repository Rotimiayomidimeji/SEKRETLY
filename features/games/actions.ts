"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import { act as applyAct, advance, host as hostCtl, newTable, type GameId, type Settings, type Table } from "@/features/games/engine";
import { COLORS, NICKS, findRoom, freeNick, isGame, mySeat, newCode, roomView, saveTable, seatCookie } from "@/features/games/rooms";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

const createSchema = z.object({
  game: z.string(),
  name: z.string().trim().min(2).max(40),
  max: z.number().int().min(2).max(8),
  laps: z.number().int().min(1).max(3),
  timer: z.number().int().min(10).max(60),
  spice: z.enum(["mild", "spicy", "unhinged"]),
  esc: z.boolean(),
  special: z.record(z.string(), z.boolean()).default({}),
  packs: z.array(z.string().max(40)).max(12).default([]),
  isPublic: z.boolean().default(false),
  pollQ: z.string().max(140).optional(),
  pollOpts: z.array(z.string().max(40)).max(6).optional(),
});

/** Opens a room (Create game › Open the room); the host takes the first seat. */
export async function createRoom(input: z.input<typeof createSchema>) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Log in to host a game." };
  const v = createSchema.safeParse(input);
  if (!v.success || !isGame(v.data.game)) return { ok: false as const, error: "Check the game settings." };
  const limit = await hitRateLimit("rooms:" + user.id, 20, 3_600_000);
  if (!limit.allowed) return { ok: false as const, error: "You’ve opened a lot of rooms. Try again later." };
  const { game, name, max, isPublic, ...rest } = v.data;
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    try {
      const room = await db.gameRoom.create({
        data: { code, game, name, hostId: user.id, maxPlayers: max, isPublic, settings: { max, ...rest }, players: { create: { userId: user.id, nick: NICKS[Math.floor(Math.random() * NICKS.length)], color: COLORS[0], isHost: true } } },
        include: { players: true },
      });
      (await cookies()).set(seatCookie(code), room.players[0].id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
      return { ok: true as const, code };
    } catch {
      // code taken: try another
    }
  }
  return { ok: false as const, error: "Couldn’t open a room. Try again." };
}

/** Takes a seat (members in the app, or anyone with the link when the room allows it). */
export async function joinRoom(code: string, nick?: string) {
  const room = await findRoom(z.string().max(8).parse(code));
  if (!room) return { ok: false as const, error: "No room with that code." };
  const seat = await mySeat(room);
  if (seat) return { ok: true as const, code: room.code };
  if (room.status !== "LOBBY") return { ok: false as const, error: "This game already started." };
  if (room.players.length >= room.maxPlayers) return { ok: false as const, error: "This table is full." };
  const user = await getCurrentUser();
  if (!user && !room.isPublic) return { ok: false as const, error: "Log in to join this room.", login: true };
  const limit = await hitRateLimit("join:" + (user?.id ?? (await requestFingerprint())), 30, 3_600_000);
  if (!limit.allowed) return { ok: false as const, error: "Too many joins. Try again later." };
  const used = new Set(room.players.map((p) => p.color));
  const p = await db.gamePlayer.create({ data: { roomId: room.id, userId: user?.id ?? null, nick: nick && /^[A-Za-z0-9]{3,16}$/.test(nick) && nick !== "MangoMoon" && !room.players.some((x) => x.nick === nick) ? nick : freeNick(room), color: COLORS.find((c) => !used.has(c)) ?? COLORS[room.players.length % COLORS.length] } });
  (await cookies()).set(seatCookie(room.code), p.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  return { ok: true as const, code: room.code };
}

/** Lobby "Reroll": a different random nickname (before the game starts). */
export async function rerollNick(code: string) {
  const room = await findRoom(code);
  if (!room || room.status !== "LOBBY") return { ok: false as const };
  const seat = await mySeat(room);
  if (!seat) return { ok: false as const };
  const nick = freeNick(room, seat.nick);
  await db.gamePlayer.update({ where: { id: seat.id }, data: { nick } });
  return { ok: true as const, nick };
}

/** Host starts the game: seats are fixed in join order and the first turn begins. */
export async function startGame(code: string) {
  const room = await findRoom(code);
  if (!room) return { ok: false as const, error: "Room not found." };
  const seat = await mySeat(room);
  if (!seat?.isHost) return { ok: false as const, error: "Only the host can start." };
  if (room.status !== "LOBBY") return { ok: true as const };
  const min = room.game === "nhie" || room.game === "mlt" ? 3 : 2;
  if (room.players.length < min) return { ok: false as const, error: "Waiting for " + (min - room.players.length) + " more." };
  const table = newTable(room.game as GameId, room.players.map((p) => ({ nick: p.nick, color: p.color })), room.settings as unknown as Settings);
  await saveTable(room, table, { status: "LIVE", startsAt: new Date() });
  return { ok: true as const };
}

async function load(code: string) {
  const room = await findRoom(z.string().max(8).parse(code));
  if (!room || !room.state) return null;
  return { room, table: room.state as unknown as Table, settings: room.settings as unknown as Settings, game: room.game as GameId };
}

/** One player's move (pick a card, answer, guess, truth or dare, did it). Retries once if another phone moved the table. */
export async function playMove(code: string, type: string, value: unknown) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await load(code);
    if (!r) return { ok: false as const, error: "Game not found." };
    const seat = await mySeat(r.room);
    if (!seat) return { ok: false as const, error: "You’re not at this table." };
    const next = applyAct(r.game, r.table, r.settings, seat.nick, z.string().max(10).parse(type), value);
    if ("error" in next) return { ok: false as const, error: next.error };
    if (await saveTable(r.room, next, next.phase === "over" ? { status: "ENDED" } : {})) return { ok: true as const };
  }
  return { ok: false as const, error: "The table moved on. Try again." };
}

/** Moves the table on when its timer is up (any phone may ask; the server checks the time). */
export async function tickTable(code: string) {
  const r = await load(code);
  if (!r) return { ok: false as const };
  const next = advance(r.game, r.table, r.settings);
  if (next) await saveTable(r.room, next, next.phase === "over" ? { status: "ENDED" } : {});
  return { ok: true as const };
}

/** Host controls: pause or resume, remove a player, end the game. */
export async function hostAction(code: string, type: "pause" | "kick" | "end", value?: unknown) {
  const r = await load(code);
  if (!r) return { ok: false as const };
  const seat = await mySeat(r.room);
  if (!seat?.isHost) return { ok: false as const };
  const t = z.enum(["pause", "kick", "end"]).parse(type);
  const next = hostCtl(r.table, t, t === "kick" ? z.string().max(30).parse(value) : value);
  await saveTable(r.room, next, t === "end" ? { status: "ENDED" } : {});
  return { ok: true as const };
}

/** The room as this phone sees it (lobby and table both poll this). */
export async function getRoom(code: string) {
  const room = await findRoom(z.string().max(8).parse(code));
  return room ? roomView(room) : null;
}
