"use client";

import { upload } from "@vercel/blob/client";

// Browser side of app/api/upload. Small files go up as form data. Bigger ones go straight to Vercel Blob
// (Vercel turns away request bodies over 4.5 MB) and are checked by the server afterwards.
// Resolves to { ok, url, kind, size } or { ok: false, error }, whichever way the file went.

const SMALL = 4 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

const post = (body: FormData | object) =>
  fetch("/api/upload", body instanceof FormData ? { method: "POST", body } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

const randomName = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g, "-").replace(/\//g, "_");

export async function uploadMedia(fd: FormData) {
  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file." };
  if (file.size <= SMALL) return post(fd);

  const target = { linkId: fd.get("linkId") || undefined, chatId: fd.get("chatId") || undefined };
  const pre = await post({ check: true, ...target });
  if (!pre?.ok) return pre;
  if (!pre.direct) return post(fd); // local dev keeps files on disk; there's no size cap to dodge

  const ext = EXT[file.type];
  if (!ext) return { ok: false, error: "Send a photo (JPG, PNG, WebP, GIF) or a video (MP4, MOV, WebM)." };
  try {
    const blob = await upload("media/" + randomName() + "." + ext, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify(target),
      contentType: file.type,
      multipart: file.size > 8 * 1024 * 1024,
    });
    return post({ url: blob.url, ...target });
  } catch {
    return { ok: false, error: "Couldn’t upload that. Check your connection and try again." };
  }
}
