import "server-only";

import { RESERVED } from "@/features/auth/accounts";
import { LIVE_WINDOW_MS } from "@/features/admin/presence";
import { db } from "@/lib/db";

// Rooms: a big channel's own gossip paper at sekretly.app/<handle>. See prisma/schema.prisma (Room, RoomPost).

/** sekretly.app/<handle> must never shadow a page of the app itself. */
export const RESERVED_HANDLES = new Set([
  ...RESERVED,
  "api", "g", "u", "join", "receipt", "desk", "create", "links", "share", "notifications", "profile", "onboarding", "verify-email",
  "activity", "analytics", "drop", "streak", "badges", "wrap", "crews", "forgot", "contact", "legal", "privacy", "terms", "sk",
  "rooms", "room", "media", "upload", "manifest", "favicon.ico", "sw.js", "robots.txt", "sitemap.xml",
]);
export const HANDLE = /^[a-z0-9](?:[a-z0-9._]{1,22})[a-z0-9]$/;

export const STAMPS = ["Felt that", "Dead", "Wild", "Same"] as const;

const ago = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  if (m < 1440) return Math.floor(m / 60) + (m < 120 ? " hr ago" : " hrs ago");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

type Voice = { sec: number; peaks: number[]; disguise: string };
const voiceOf = (data: unknown): Voice | null => {
  const v = (data as { voice?: Voice } | null)?.voice;
  return v && Array.isArray(v.peaks) ? v : null;
};
export const DISGUISE_NAME: Record<string, string> = { deep: "Deep", helium: "Helium", robot: "Robot", radio: "Radio", echo: "Echo", whisper: "Whisper" };

/** People reading the room right now (tabs pinging /api/presence on its page). */
async function readingNow(handle: string) {
  const rows = await db.presence.findMany({ where: { path: "/" + handle, lastSeenAt: { gte: new Date(Date.now() - LIVE_WINDOW_MS) } }, select: { fingerprint: true, userId: true } });
  return new Set(rows.map((r) => r.userId ?? r.fingerprint)).size;
}

type PostRow = { id: string; number: number; kind: string; text: string; style: string; audioUrl: string | null; audioSec: number | null; peaks: unknown; voice: string | null; take: string | null; takeAudioUrl: string | null; takeAudioSec: number | null; pinned: boolean; s0: number; s1: number; s2: number; s3: number; createdAt: Date };
const postView = (p: PostRow, mine: Set<string>) => ({
  id: p.id,
  number: p.number,
  kind: p.kind as "letter" | "text" | "voice",
  text: p.text,
  style: p.style,
  audioUrl: p.audioUrl,
  audioSec: p.audioSec ?? 0,
  peaks: (Array.isArray(p.peaks) ? p.peaks : []) as number[],
  voice: p.voice ? (DISGUISE_NAME[p.voice] ?? p.voice) : null,
  take: p.take,
  takeAudioUrl: p.takeAudioUrl,
  takeAudioSec: p.takeAudioSec ?? 0,
  pinned: p.pinned,
  stamps: [p.s0, p.s1, p.s2, p.s3],
  mine: [0, 1, 2, 3].map((k) => mine.has(p.id + ":" + k)),
  age: p.pinned && p.kind === "letter" ? "Pinned" : ago(p.createdAt),
  createdAt: p.createdAt.getTime(),
  reports: (p as { reports?: number }).reports ?? 0,
});
export type RoomPostView = ReturnType<typeof postView>;

/** The public room page. Null when there is no such room; `unavailable` when the admin suspended it. */
export async function loadRoom(handle: string, viewer: { userId: string | null; fingerprint: string }) {
  if (!HANDLE.test(handle)) return null;
  const room = await db.room.findUnique({ where: { handle }, include: { host: { select: { username: true } }, link: { select: { id: true, messageCount: true } } } });
  if (!room) return null;
  if (room.status === "SUSPENDED") return { unavailable: true as const, name: room.name };
  const posts = await db.roomPost.findMany({ where: { roomId: room.id, deletedAt: null }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 60 });
  const who = viewer.userId ? ["u:" + viewer.userId, "f:" + viewer.fingerprint] : ["f:" + viewer.fingerprint];
  const stamps = await db.roomStamp.findMany({ where: { postId: { in: posts.map((p) => p.id) }, who: { in: who } }, select: { postId: true, stamp: true } });
  const mine = new Set(stamps.map((s) => s.postId + ":" + s.stamp));
  return {
    unavailable: false as const,
    id: room.id,
    handle: room.handle,
    name: room.name,
    tagline: room.tagline,
    accent: room.accent,
    theme: room.theme,
    logoUrl: room.logoUrl,
    host: room.host.username,
    linkId: room.link.id,
    open: room.status === "LIVE",
    voice: room.voiceAllowed && room.voiceOn,
    maxVoiceSec: room.maxVoiceSec,
    volume: room.link.messageCount,
    reading: Math.max(1, await readingNow(room.handle)),
    posts: posts.map((p) => postView(p, mine)),
  };
}
export type RoomView = Extract<NonNullable<Awaited<ReturnType<typeof loadRoom>>>, { unavailable: false }>;

/** The host's desk: tips waiting, what's printed, and the room's switches. */
export async function loadDesk(userId: string) {
  const room = await db.room.findUnique({ where: { hostId: userId } });
  if (!room) return null;
  const now = new Date(), dayAgo = new Date(Date.now() - 86_400_000);
  const [tips, printed, tipsToday, reading] = await Promise.all([
    db.message.findMany({
      where: { linkId: room.linkId, deletedAt: null, archivedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, text: true, mediaUrl: true, data: true, held: true, createdAt: true },
    }),
    db.roomPost.findMany({ where: { roomId: room.id, deletedAt: null }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 100 }),
    db.message.count({ where: { linkId: room.linkId, createdAt: { gte: dayAgo } } }),
    readingNow(room.handle),
  ]);
  const printedIds = new Set((await db.roomPost.findMany({ where: { roomId: room.id, messageId: { in: tips.map((t) => t.id) } }, select: { messageId: true } })).map((p) => p.messageId));
  return {
    room: {
      handle: room.handle, name: room.name, tagline: room.tagline ?? "", accent: room.accent, theme: room.theme, logoUrl: room.logoUrl, open: room.status === "LIVE", suspended: room.status === "SUSPENDED",
      takesAllowed: room.takesAllowed, voiceAllowed: room.voiceAllowed, takesOn: room.takesOn, voiceOn: room.voiceOn, maxVoiceSec: room.maxVoiceSec,
      ready: !!room.hostReadyAt, linkId: room.linkId,
    },
    reading,
    tipsToday,
    tips: tips
      .filter((t) => !printedIds.has(t.id))
      .map((t) => {
        const v = t.mediaUrl ? voiceOf(t.data) : null;
        return { id: t.id, text: t.text, kind: v ? ("voice" as const) : ("text" as const), audioUrl: v ? t.mediaUrl : null, sec: v?.sec ?? 0, peaks: v?.peaks ?? [], voice: v ? (DISGUISE_NAME[v.disguise] ?? v.disguise) : null, held: t.held, age: ago(t.createdAt) };
      }),
    printed: printed.map((p) => postView(p, new Set())),
  };
}
export type DeskView = NonNullable<Awaited<ReturnType<typeof loadDesk>>>;

/** Admin › Rooms. */
export async function loadAdminRooms() {
  const rooms = await db.room.findMany({ orderBy: { createdAt: "desc" }, include: { host: { select: { username: true, lastSeenAt: true } }, _count: { select: { posts: { where: { deletedAt: null } } } } } });
  const linkIds = rooms.map((r) => r.linkId);
  const [tips, waiting, printedFrom, reports, live] = await Promise.all([
    db.message.groupBy({ by: ["linkId"], where: { linkId: { in: linkIds }, createdAt: { gte: new Date(Date.now() - 86_400_000) } }, _count: true }),
    db.message.groupBy({ by: ["linkId"], where: { linkId: { in: linkIds }, deletedAt: null, archivedAt: null, expiresAt: { gt: new Date() } }, _count: true }),
    db.roomPost.groupBy({ by: ["roomId"], where: { roomId: { in: rooms.map((r) => r.id) }, messageId: { not: null } }, _count: true }),
    db.roomPost.groupBy({ by: ["roomId"], where: { roomId: { in: rooms.map((r) => r.id) } }, _sum: { reports: true } }),
    db.presence.findMany({ where: { lastSeenAt: { gte: new Date(Date.now() - LIVE_WINDOW_MS) }, path: { in: rooms.map((r) => "/" + r.handle) } }, select: { path: true, fingerprint: true, userId: true } }),
  ]);
  const count = (list: { linkId: string; _count: number }[], id: string) => list.find((x) => x.linkId === id)?._count ?? 0;
  return rooms.map((r) => ({
    id: r.id,
    handle: r.handle,
    name: r.name,
    accent: r.accent,
    theme: r.theme,
    logoUrl: r.logoUrl,
    linkId: r.linkId,
    host: r.host.username,
    status: r.status,
    ready: !!r.hostReadyAt,
    takesAllowed: r.takesAllowed,
    voiceAllowed: r.voiceAllowed,
    posts: r._count.posts,
    tipsToday: count(tips, r.linkId),
    onDesk: Math.max(0, count(waiting, r.linkId) - (printedFrom.find((x) => x.roomId === r.id)?._count ?? 0)),
    reports: reports.find((x) => x.roomId === r.id)?._sum.reports ?? 0,
    reading: new Set(live.filter((p) => p.path === "/" + r.handle).map((p) => p.userId ?? p.fingerprint)).size,
    lastIn: r.host.lastSeenAt ? ago(r.host.lastSeenAt) : "never",
    created: r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  }));
}
export type AdminRoomView = Awaited<ReturnType<typeof loadAdminRooms>>[number];

/** Admin › Rooms: posts readers reported, most reported first, with the room they're in. */
export async function loadReportedRoomPosts() {
  const posts = await db.roomPost.findMany({ where: { reports: { gt: 0 }, deletedAt: null }, orderBy: [{ reports: "desc" }, { createdAt: "desc" }], take: 50, include: { room: { select: { id: true, name: true, handle: true } } } });
  return posts.map((p) => ({ id: p.id, roomId: p.room.id, room: p.room.name, handle: p.room.handle, number: p.number, kind: p.kind, text: p.text.slice(0, 400), take: p.take, reports: p.reports, audioUrl: p.audioUrl, age: ago(p.createdAt) }));
}
export type ReportedPost = Awaited<ReturnType<typeof loadReportedRoomPosts>>[number];
