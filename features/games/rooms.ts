import "server-only";

import type { GameRoom, Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";

import { GAMES, type GameId, type Settings, type Table } from "@/features/games/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

// Game rooms and who sits in them. A phone knows its seat by a per-room cookie (members are also matched by account).

// (no "MangoMoon": the game screen uses that name internally for "you")
export const NICKS = ["CocoaRay", "BlueFox", "KolaNut", "PixelOwl", "ZoboQueen", "JollofJet", "SuyaStar", "PuffSpark", "ChinChin", "GingerBee", "PlantainKing", "NeonWave", "VelvetCat", "MoonDrift", "AgegeBread", "NeonNaija", "PuffPuff"];
export const COLORS = ["#ffd23d", "#7ef0c1", "#7fb2ff", "#ff9ad5", "#ffb35c", "#b78bff", "#ff9a4a", "#5be0a0"];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newCode = () => Array.from({ length: 5 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
export const seatCookie = (code: string) => "skg_" + code;
export const isGame = (g: string): g is GameId => (GAMES as readonly string[]).includes(g);

export const findRoom = (code: string) => db.gameRoom.findUnique({ where: { code: code.toUpperCase() }, include: { players: { where: { kickedAt: null }, orderBy: { joinedAt: "asc" } } } });
export type RoomWithPlayers = NonNullable<Awaited<ReturnType<typeof findRoom>>>;

/** This phone's seat in a room, if it has one. */
export async function mySeat(room: RoomWithPlayers) {
  const jar = await cookies();
  const id = jar.get(seatCookie(room.code))?.value;
  const user = await getCurrentUser();
  return room.players.find((p) => p.id === id) ?? (user ? room.players.find((p) => p.userId === user.id) : undefined) ?? null;
}

/** A nickname nobody at the table has yet. */
export function freeNick(room: RoomWithPlayers, avoid?: string) {
  const taken = new Set(room.players.map((p) => p.nick));
  const pool = NICKS.filter((n) => !taken.has(n) && n !== avoid);
  return pool.length ? pool[randomInt(pool.length)] : "Player" + randomInt(100, 999);
}

/** Saves a new table only if nobody changed it since it was read (another phone may have moved it on). */
export async function saveTable(room: GameRoom, next: Table, extra: Prisma.GameRoomUpdateInput = {}) {
  const r = await db.gameRoom.updateMany({ where: { id: room.id, version: room.version }, data: { ...extra, state: next as unknown as Prisma.InputJsonValue, version: { increment: 1 } } as Prisma.GameRoomUpdateManyMutationInput });
  return r.count === 1;
}

/** What a phone needs to draw the lobby or the table. */
export async function roomView(room: RoomWithPlayers) {
  const me = await mySeat(room);
  return {
    code: room.code,
    game: room.game,
    name: room.name,
    status: room.status,
    isPublic: room.isPublic,
    max: room.maxPlayers,
    settings: room.settings as unknown as Settings,
    players: room.players.map((p) => ({ nick: p.nick, color: p.color, isHost: p.isHost, me: p.id === me?.id })),
    state: room.state as unknown as Table | null,
    version: room.version,
    now: Date.now(),
    me: me ? { nick: me.nick, color: me.color, isHost: me.isHost } : null,
  };
}
export type RoomView = Awaited<ReturnType<typeof roomView>>;
