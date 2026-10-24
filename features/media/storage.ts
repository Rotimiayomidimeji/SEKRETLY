import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";

// Photos and videos sent with messages and in chats.
// With BLOB_READ_WRITE_TOKEN set (Vercel) files go to Vercel Blob; without it (local dev) they're kept in
// .data/media and served by /api/media/<file>. Either way the address is long and random, never guessable.

export type MediaKind = "photo" | "video";

/** What we accept, recognised by the file's first bytes (not its name or the browser's word for it). */
const TYPES: { kind: MediaKind; ext: string; mime: string; test: (b: Buffer) => boolean }[] = [
  { kind: "photo", ext: "jpg", mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { kind: "photo", ext: "png", mime: "image/png", test: (b) => b.subarray(0, 4).toString("hex") === "89504e47" },
  { kind: "photo", ext: "webp", mime: "image/webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { kind: "photo", ext: "gif", mime: "image/gif", test: (b) => b.subarray(0, 4).toString() === "GIF8" },
  { kind: "video", ext: "webm", mime: "video/webm", test: (b) => b.subarray(0, 4).toString("hex") === "1a45dfa3" },
  { kind: "video", ext: "mov", mime: "video/quicktime", test: (b) => b.subarray(4, 8).toString() === "ftyp" && b.subarray(8, 10).toString() === "qt" },
  { kind: "video", ext: "mp4", mime: "video/mp4", test: (b) => b.subarray(4, 8).toString() === "ftyp" },
];

export const MAX_BYTES: Record<MediaKind, number> = { photo: 8 * 1024 * 1024, video: 25 * 1024 * 1024 };

export const sniff = (b: Buffer) => TYPES.find((t) => t.test(b)) ?? null;

const LOCAL_DIR = path.join(process.cwd(), ".data", "media");
const LOCAL_PREFIX = "/api/media/";

/** Stores a checked file and returns its public address. */
export async function storeMedia(bytes: Buffer, type: (typeof TYPES)[number]) {
  const name = randomBytes(18).toString("base64url") + "." + type.ext;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put("media/" + name, bytes, { access: "public", contentType: type.mime, addRandomSuffix: false });
    return blob.url;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), bytes);
  return LOCAL_PREFIX + name;
}

/** Only addresses this app handed out can be attached to a message (so nobody can post an outside link as "media"). */
export function isOurMedia(url: string) {
  if (url.startsWith(LOCAL_PREFIX)) return /^\/api\/media\/[\w-]{24}\.(jpg|png|webp|gif|webm|mov|mp4)$/.test(url);
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith("/media/");
  } catch {
    return false;
  }
}

export const kindOf = (url: string): MediaKind => (/\.(webm|mov|mp4)$/.test(url) ? "video" : "photo");

/** Reads a locally stored file (dev only). */
export async function readLocal(name: string) {
  if (!/^[\w-]{24}\.(jpg|png|webp|gif|webm|mov|mp4)$/.test(name)) return null;
  try {
    return { bytes: await readFile(path.join(LOCAL_DIR, name)), mime: TYPES.find((t) => name.endsWith("." + t.ext))!.mime };
  } catch {
    return null;
  }
}
