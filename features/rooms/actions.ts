"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { linkedToSuspended } from "@/features/admin/presence";
import { clientIp, ipBlocked } from "@/features/admin/traffic";
import { createAccount } from "@/features/auth/accounts";
import { passwordSchema, usernameSchema } from "@/features/auth/schemas";
import { newLinkKey } from "@/features/links/topics";
import { isOurMedia, kindOf } from "@/features/media/storage";
import { notify } from "@/features/notifications/notify";
import { HANDLE, RESERVED_HANDLES } from "@/features/rooms/queries";
import { createSession, destroyAllSessions, getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

const MINUTE = 60_000;
const THEME = z.enum(["press", "neon", "stack", "chat", "pop"]);
const COLOR = z.string().regex(/^#[0-9a-f]{6}$/i);
/** A logo must be a photo this app stored (or null to remove it). */
const LOGO = z.string().max(300).refine((u) => isOurMedia(u) && kindOf(u) === "photo", "Upload the logo again.").nullable();

// ───────────── readers (no account needed) ─────────────

/** Stamps (or un-stamps) a post. Each person counts once per stamp. */
export async function stampPost(postId: string, stamp: number) {
  const k = z.number().int().min(0).max(3).parse(stamp);
  const id = z.string().max(40).parse(postId);
  const user = await getCurrentUser();
  const fp = await requestFingerprint();
  if (!(await hitRateLimit("stamp:" + fp, 120, 10 * MINUTE)).allowed) return { ok: false as const };
  const who = user ? "u:" + user.id : "f:" + fp;
  const post = await db.roomPost.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!post) return { ok: false as const };
  const field = ("s" + k) as "s0" | "s1" | "s2" | "s3";
  const existing = await db.roomStamp.findUnique({ where: { postId_who_stamp: { postId: id, who, stamp: k } } });
  if (existing) {
    await db.$transaction([db.roomStamp.delete({ where: { postId_who_stamp: { postId: id, who, stamp: k } } }), db.roomPost.update({ where: { id }, data: { [field]: { decrement: 1 } } })]);
    return { ok: true as const, on: false };
  }
  // each person picks at most 2 reactions per post: a third replaces their oldest
  const mine = await db.roomStamp.findMany({ where: { postId: id, who }, orderBy: { createdAt: "asc" } });
  const drop = mine.length >= 2 ? mine[0] : null;
  await db.$transaction([
    ...(drop ? [db.roomStamp.delete({ where: { postId_who_stamp: { postId: id, who, stamp: drop.stamp } } }), db.roomPost.update({ where: { id }, data: { [("s" + drop.stamp) as "s0"]: { decrement: 1 } } })] : []),
    db.roomStamp.create({ data: { postId: id, who, stamp: k } }),
    db.roomPost.update({ where: { id }, data: { [field]: { increment: 1 } } }),
  ]);
  return { ok: true as const, on: true };
}

/** A reader flags a post. The count shows on the host's desk and in Admin › Rooms. */
export async function reportPost(postId: string, reason: string) {
  const id = z.string().max(40).parse(postId);
  z.string().max(80).parse(reason);
  const fp = await requestFingerprint();
  if (!(await hitRateLimit("room-report:" + fp + ":" + id, 1, 24 * 60 * MINUTE)).allowed) return { ok: true as const };
  await db.roomPost.updateMany({ where: { id, deletedAt: null }, data: { reports: { increment: 1 } } });
  return { ok: true as const };
}

/**
 * The quick sign-up a reader sees when they tap "Say it" without an account (voice tips need one).
 * The same checks as the full sign-up: blocked networks, suspended devices, rate limits, 16+.
 */
export async function quickJoin(input: { username: string; password: string; adult: boolean }) {
  if (!input.adult) return { ok: false as const, error: "You need to be 16 or older." };
  const name = usernameSchema.safeParse(input.username);
  if (!name.success) return { ok: false as const, error: "Use 3–20 letters, numbers or _ for your username." };
  const pw = passwordSchema.safeParse(input.password);
  if (!pw.success) return { ok: false as const, error: pw.error.issues[0]?.message ?? "Use 8 characters or more." };
  if (await ipBlocked()) return { ok: false as const, error: "New accounts can’t be made from this network." };
  if (await linkedToSuspended(await requestFingerprint(), await clientIp())) return { ok: false as const, error: "This device is linked to a suspended account, so you can’t make a new one." };
  if (!(await hitRateLimit("signup:" + (await requestFingerprint()), 5, 60 * MINUTE)).allowed) return { ok: false as const, error: "Too many new accounts from this device. Try again in an hour." };
  const created = await createAccount({ username: name.data, password: pw.data, birthDate: null, ageConfirmed: true });
  if (!created.ok) return { ok: false as const, error: "@" + name.data + " is taken. Try another one." };
  await createSession(created.id);
  return { ok: true as const };
}

// ───────────── the host ─────────────

async function myRoom() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in again");
  const room = await db.room.findUnique({ where: { hostId: user.id } });
  if (!room || room.status === "SUSPENDED") throw new Error("No room");
  return { user, room };
}
const refresh = (handle: string) => {
  revalidatePath("/desk");
  revalidatePath("/" + handle);
};
const nextNumber = async (roomId: string) => ((await db.roomPost.aggregate({ where: { roomId }, _max: { number: true } }))._max.number ?? 0) + 1;

/** First login: the host swaps the one-time password the admin sent for his own. */
export async function setHostPassword(next: string) {
  const { user, room } = await myRoom();
  const pw = z.string().min(10, "Use 10 characters or more.").max(200).safeParse(next);
  if (!pw.success) return { ok: false as const, error: pw.error.issues[0]?.message ?? "Use 10 characters or more." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw.data), onboardedAt: user.onboardedAt ?? new Date() } });
  await db.room.update({ where: { id: room.id }, data: { hostReadyAt: new Date() } });
  await destroyAllSessions(user.id);
  await createSession(user.id);
  revalidatePath("/desk");
  return { ok: true as const };
}

const takeSchema = z.object({ text: z.string().max(280).optional(), audioUrl: z.string().max(300).optional(), audioSec: z.number().int().min(1).max(200).optional() });

/** Prints a tip into the room, with the host's optional take (typed, or recorded in his own voice). */
export async function printTip(input: { messageId: string; style: "clip" | "head"; pin: boolean; take?: z.input<typeof takeSchema> }) {
  const { room } = await myRoom();
  const v = z.object({ messageId: z.string().max(40), style: z.enum(["clip", "head"]), pin: z.boolean(), take: takeSchema.optional() }).parse(input);
  const msg = await db.message.findFirst({ where: { id: v.messageId, linkId: room.linkId, deletedAt: null } });
  if (!msg) return { ok: false as const, error: "That tip is gone." };
  if (await db.roomPost.findUnique({ where: { messageId: msg.id } })) return { ok: false as const, error: "Already printed." };
  const voice = msg.mediaUrl && kindOf(msg.mediaUrl) === "audio" ? ((msg.data as { voice?: { sec: number; peaks: number[]; disguise: string } } | null)?.voice ?? null) : null;
  const takesOn = room.takesAllowed && room.takesOn;
  const takeAudio = takesOn && v.take?.audioUrl && isOurMedia(v.take.audioUrl) && kindOf(v.take.audioUrl) === "audio" ? v.take.audioUrl : null;
  await db.roomPost.create({
    data: {
      roomId: room.id,
      number: await nextNumber(room.id),
      kind: voice ? "voice" : "text",
      text: msg.text,
      style: voice ? "clip" : v.style,
      audioUrl: voice ? msg.mediaUrl : null,
      audioSec: voice ? voice.sec : null,
      peaks: voice ? voice.peaks : undefined,
      voice: voice ? voice.disguise : null,
      take: takesOn ? v.take?.text?.trim() || null : null,
      takeAudioUrl: takeAudio,
      takeAudioSec: takeAudio ? (v.take?.audioSec ?? null) : null,
      pinned: v.pin,
      messageId: msg.id,
    },
  });
  // keep the tip for as long as it's printed (messages otherwise expire)
  await db.message.update({ where: { id: msg.id }, data: { readAt: msg.readAt ?? new Date(), expiresAt: new Date(Date.now() + 3650 * 86_400_000) } });
  if (msg.senderId) await notify(msg.senderId, "REPLY", "Your tip was printed in " + room.name, "/" + room.handle, takesOn && (v.take?.text || takeAudio) ? "With the editor’s take" : "Go and see what people stamp");
  refresh(room.handle);
  return { ok: true as const };
}

/** "Spike it": not printed. The tip leaves the desk; the sender's receipt shows it wasn't printed. */
export async function spikeTip(messageId: string) {
  const { room } = await myRoom();
  await db.message.updateMany({ where: { id: z.string().max(40).parse(messageId), linkId: room.linkId }, data: { archivedAt: new Date(), readAt: new Date() } });
  refresh(room.handle);
  return { ok: true as const };
}

/** The host writes his own letter (pinned to the top of the paper). */
export async function writeLetter(text: string) {
  const { room } = await myRoom();
  const t = z.string().trim().min(2).max(2000).parse(text);
  await db.roomPost.updateMany({ where: { roomId: room.id, kind: "letter", deletedAt: null }, data: { pinned: false } });
  await db.roomPost.create({ data: { roomId: room.id, number: await nextNumber(room.id), kind: "letter", text: t, pinned: true } });
  refresh(room.handle);
  return { ok: true as const };
}

/** Pin, edit the take, or unprint a post. */
export async function editPost(postId: string, patch: { pinned?: boolean; take?: string | null; remove?: boolean }) {
  const { room } = await myRoom();
  const p = z.object({ pinned: z.boolean().optional(), take: z.string().max(280).nullable().optional(), remove: z.boolean().optional() }).parse(patch);
  const data: Record<string, unknown> = {};
  if (p.pinned !== undefined) data.pinned = p.pinned;
  if (p.take !== undefined && room.takesAllowed) data.take = p.take?.trim() || null;
  if (p.remove) data.deletedAt = new Date();
  await db.roomPost.updateMany({ where: { id: z.string().max(40).parse(postId), roomId: room.id }, data });
  refresh(room.handle);
  return { ok: true as const };
}

/** The host's switches. The admin's switches (takes, voice) can't be turned on from here. */
export async function saveRoomSettings(patch: { open?: boolean; voiceOn?: boolean; takesOn?: boolean; maxVoiceSec?: number; tagline?: string; theme?: string; accent?: string; logoUrl?: string | null }) {
  const { room } = await myRoom();
  const p = z.object({ open: z.boolean().optional(), voiceOn: z.boolean().optional(), takesOn: z.boolean().optional(), maxVoiceSec: z.union([z.literal(60), z.literal(120), z.literal(180)]).optional(), tagline: z.string().max(120).optional(), theme: THEME.optional(), accent: COLOR.optional(), logoUrl: LOGO.optional() }).parse(patch);
  await db.room.update({
    where: { id: room.id },
    data: {
      ...(p.open !== undefined ? { status: p.open ? "LIVE" : "CLOSED" } : {}),
      ...(p.voiceOn !== undefined ? { voiceOn: p.voiceOn } : {}),
      ...(p.takesOn !== undefined ? { takesOn: p.takesOn } : {}),
      ...(p.maxVoiceSec !== undefined ? { maxVoiceSec: p.maxVoiceSec } : {}),
      ...(p.tagline !== undefined ? { tagline: p.tagline.trim() || null } : {}),
      ...(p.theme ? { theme: p.theme } : {}),
      ...(p.accent ? { accent: p.accent.toLowerCase() } : {}),
      ...(p.logoUrl !== undefined ? { logoUrl: p.logoUrl } : {}),
    },
  });
  refresh(room.handle);
  return { ok: true as const };
}

// ───────────── the admin ─────────────

async function admin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Admins only");
  return user;
}
const WORDS = ["moon", "tide", "spark", "echo", "ink", "press", "tea", "gist"];
const tempPassword = () => "SK-" + randomBytes(3).toString("hex").toUpperCase() + "-" + WORDS[randomBytes(1)[0] % WORDS.length];

/** Makes a room: its host account (with a one-time password), its confession link, and the room. */
export async function createRoom(input: { name: string; handle: string; accent: string; theme: string; takesAllowed: boolean; voiceAllowed: boolean }) {
  await admin();
  const v = z
    .object({ name: z.string().trim().min(2).max(40), handle: z.string().trim().toLowerCase(), accent: COLOR, theme: THEME, takesAllowed: z.boolean(), voiceAllowed: z.boolean() })
    .safeParse(input);
  if (!v.success) return { ok: false as const, error: "Check the name and colour." };
  const handle = v.data.handle.replace(/^@/, "");
  if (!HANDLE.test(handle)) return { ok: false as const, error: "Handles are 3–24 letters, numbers, dots or underscores." };
  if (RESERVED_HANDLES.has(handle)) return { ok: false as const, error: "That handle is reserved for the app. Pick another." };
  if (await db.room.findUnique({ where: { handle } })) return { ok: false as const, error: "A room already uses that handle." };
  // the host's username: the handle in username form (letters, numbers, _), made unique
  const base = handle.replace(/[^a-z0-9_]/g, "_").slice(0, 16).replace(/_+$/, "") || "room";
  let username = base.length >= 3 ? base : base + "_room";
  for (let i = 2; await db.user.findUnique({ where: { username } }); i++) username = (base + "_" + i).slice(0, 20);
  const password = tempPassword();
  const user = await db.user.create({
    data: { username, passwordHash: await hashPassword(password), linkKey: newLinkKey(), ageConfirmedAt: new Date(), onboardedAt: new Date(), inboxTimerDays: 30, senderReceipts: true },
  });
  const link = await db.link.create({ data: { ownerId: user.id, topic: "CONFESS", slug: "confess", theme: "midnight", title: v.data.name, intro: "Send a tip. 100% anonymous." } });
  await db.room.create({ data: { handle, name: v.data.name, accent: v.data.accent.toLowerCase(), theme: v.data.theme, hostId: user.id, linkId: link.id, takesAllowed: v.data.takesAllowed, voiceAllowed: v.data.voiceAllowed } });
  revalidatePath("/admin/rooms");
  return { ok: true as const, username, password, handle };
}

/** A new one-time password for the host (he sets his own again on next login). */
export async function resetRoomPassword(roomId: string) {
  await admin();
  const room = await db.room.findUnique({ where: { id: z.string().max(40).parse(roomId) }, include: { host: true } });
  if (!room) return { ok: false as const, error: "No such room." };
  const password = tempPassword();
  await db.user.update({ where: { id: room.hostId }, data: { passwordHash: await hashPassword(password) } });
  await db.room.update({ where: { id: room.id }, data: { hostReadyAt: null } });
  await destroyAllSessions(room.hostId);
  revalidatePath("/admin/rooms");
  return { ok: true as const, username: room.host.username, password };
}

/** Open, close (reading only) or suspend (unavailable) a room, and the admin-only switches. */
export async function setRoomAdmin(roomId: string, patch: { status?: "LIVE" | "CLOSED" | "SUSPENDED"; takesAllowed?: boolean; voiceAllowed?: boolean; theme?: string; accent?: string; name?: string; logoUrl?: string | null }) {
  await admin();
  const p = z.object({ status: z.enum(["LIVE", "CLOSED", "SUSPENDED"]).optional(), takesAllowed: z.boolean().optional(), voiceAllowed: z.boolean().optional(), theme: THEME.optional(), accent: COLOR.optional(), name: z.string().trim().min(2).max(40).optional(), logoUrl: LOGO.optional() }).parse(patch);
  const room = await db.room.update({ where: { id: z.string().max(40).parse(roomId) }, data: p });
  if (p.status === "SUSPENDED") await destroyAllSessions(room.hostId);
  revalidatePath("/admin/rooms");
  revalidatePath("/" + room.handle);
  return { ok: true as const };
}

/** Deletes the room and its host account (posts, tips and the link go with it). */
export async function deleteRoom(roomId: string) {
  await admin();
  const room = await db.room.findUnique({ where: { id: z.string().max(40).parse(roomId) } });
  if (!room) return { ok: false as const };
  await db.user.delete({ where: { id: room.hostId } });
  revalidatePath("/admin/rooms");
  return { ok: true as const };
}

/** Admin › Rooms: act on a reported post. "remove" takes it out of the room; "keep" clears its reports. */
export async function adminPostAction(postId: string, action: "remove" | "keep") {
  await admin();
  const a = z.enum(["remove", "keep"]).parse(action);
  const post = await db.roomPost.update({ where: { id: z.string().max(40).parse(postId) }, data: a === "remove" ? { deletedAt: new Date() } : { reports: 0 }, include: { room: { select: { handle: true } } } });
  revalidatePath("/admin/rooms");
  revalidatePath("/" + post.room.handle);
  return { ok: true as const };
}

/** The host clears the reports on one of his posts after checking it (or unprints it with editPost). */
export async function hostKeepPost(postId: string) {
  const { room } = await myRoom();
  await db.roomPost.updateMany({ where: { id: z.string().max(40).parse(postId), roomId: room.id }, data: { reports: 0 } });
  refresh(room.handle);
  return { ok: true as const };
}
