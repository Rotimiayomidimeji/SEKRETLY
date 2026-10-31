import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { get, put } from "@vercel/blob";

// Photos and videos sent with messages and in chats.
// With BLOB_READ_WRITE_TOKEN set (Vercel) files go to Vercel Blob; without it (local dev) they're kept in
// .data/media. A Blob store can be public (files are served straight from Blob) or private (files are served by
// /api/media/<file>, like local ones); which one is found out once, or set with BLOB_ACCESS=public|private.
// Either way the address is long and random, never guessable.

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
const NAME = /^[\w-]{24}\.(jpg|png|webp|gif|webm|mov|mp4)$/;

let access: Promise<"public" | "private"> | null = null;

/** Whether the Blob store is public or private (null without a Blob token). Asked once per server. */
export function blobAccess(): Promise<"public" | "private"> | null {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const set = process.env.BLOB_ACCESS;
  if (set === "public" || set === "private") return Promise.resolve(set);
  return (access ??= put("media/.probe", "ok", { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "text/plain" }).then(
    () => "public" as const,
    (e: unknown) => {
      console.warn("blob store is not public, using private access:", e instanceof Error ? e.message : e);
      return "private" as const;
    },
  ));
}

/** Stores a checked file and returns its address. */
export async function storeMedia(bytes: Buffer, type: (typeof TYPES)[number]) {
  const name = randomBytes(18).toString("base64url") + "." + type.ext;
  const mode = await blobAccess();
  if (mode === "public") {
    const blob = await put("media/" + name, bytes, { access: "public", contentType: type.mime, addRandomSuffix: false });
    return blob.url;
  }
  if (mode === "private") {
    await put("media/" + name, bytes, { access: "private", contentType: type.mime, addRandomSuffix: false });
    return LOCAL_PREFIX + name;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), bytes);
  return LOCAL_PREFIX + name;
}

/** Only addresses this app handed out can be attached to a message (so nobody can post an outside link as "media"). */
export function isOurMedia(url: string) {
  if (url.startsWith(LOCAL_PREFIX)) return NAME.test(url.slice(LOCAL_PREFIX.length));
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /\.(public|private)\.blob\.vercel-storage\.com$/.test(u.hostname) && u.pathname.startsWith("/media/");
  } catch {
    return false;
  }
}

/** The /api/media/<file> address for a file uploaded straight to a private store (its blob URL isn't viewable). */
export const servedAddress = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.includes(".private.") ? LOCAL_PREFIX + u.pathname.slice("/media/".length) : url;
  } catch {
    return url;
  }
};

export const kindOf = (url: string): MediaKind => (/\.(webm|mov|mp4)$/.test(url) ? "video" : "photo");

const mimeOf = (name: string) => TYPES.find((t) => name.endsWith("." + t.ext))!.mime;

/** Reads a file kept on this machine (local dev). */
export async function readLocal(name: string) {
  if (!NAME.test(name)) return null;
  try {
    return { bytes: await readFile(path.join(LOCAL_DIR, name)), mime: mimeOf(name) };
  } catch {
    return null;
  }
}

/** Streams a file from a private Blob store (with the byte range a video player asks for). */
export async function readPrivate(name: string, range: string | null) {
  if (!NAME.test(name) || (await blobAccess()) !== "private") return null;
  try {
    const r = await get("media/" + name, { access: "private", headers: range ? { range } : undefined });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return { stream: r.stream, mime: mimeOf(name), headers: r.headers };
  } catch {
    return null;
  }
}
