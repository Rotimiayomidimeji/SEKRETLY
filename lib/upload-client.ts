"use client";

import { upload } from "@vercel/blob/client";

// Browser side of app/api/upload. Photos are first made phone-friendly here (any photo the browser can open,
// including iPhone HEIC, becomes a JPEG of at most 2048px, usually well under 1 MB), so they go up quickly as form
// data. Videos up to 4 MB go the same way; bigger ones go straight to Vercel Blob (Vercel turns away request bodies
// over 4.5 MB) and are checked by the server afterwards.
// Resolves to { ok, url, kind, size } or { ok: false, error }, whichever way the file went.

const SMALL = 4 * 1024 * 1024;
const MAX_SIDE = 2048;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

type Result = { ok: true; url: string; kind: "photo" | "video"; size: number } | { ok: false; error: string };

const post = (body: FormData | object): Promise<Result> =>
  fetch("/api/upload", body instanceof FormData ? { method: "POST", body } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then((r) =>
      // a reply that isn't ours (a crash page, or Vercel's "too big") still gets a straight answer
      r.json().catch(() => ({ ok: false, error: r.status === 413 ? "That file is too big. Try a smaller one." : "Couldn’t upload that (error " + r.status + "). Try again in a bit." })),
    )
    .catch(() => ({ ok: false, error: "Couldn’t upload that. Check your connection and try again." }));

const randomName = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g, "-").replace(/\//g, "_");

const isVideo = (f: File) => f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name);

/** A JPEG version of a photo, resized to fit 2048px (GIFs keep their animation and are left alone). Null if the browser can't open it. */
async function shrink(file: File): Promise<File | null> {
  if (file.type === "image/gif") return null;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.86));
    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : null;
  } catch {
    return null;
  }
}

export async function uploadMedia(fd: FormData): Promise<Result> {
  let file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file." };

  if (!isVideo(file)) {
    const small = await shrink(file);
    // keep the original when it's already smaller (a tiny PNG, say) and the server can read it
    if (small && (small.size < file.size || !EXT[file.type])) file = small;
    if (file.size > 8 * 1024 * 1024) return { ok: false, error: "That photo is too big. Try a screenshot of it instead." };
    const f2 = new FormData();
    fd.forEach((v, k) => f2.append(k, k === "file" ? (file as File) : v));
    return post(f2);
  }

  if (file.size > 25 * 1024 * 1024) return { ok: false, error: "Videos can be up to 25 MB. Try a shorter clip." };
  if (file.size <= SMALL) return post(fd);

  const target = { linkId: fd.get("linkId") || undefined, chatId: fd.get("chatId") || undefined };
  const pre = (await post({ check: true, ...target })) as Result & { direct?: boolean; access?: "public" | "private" | null; limit?: number };
  if (!pre?.ok) return pre;
  if (!pre.direct) {
    // local dev keeps files on disk with no size cap; a store without direct uploads takes up to about 4 MB
    if (pre.limit && file.size > pre.limit) return { ok: false, error: "Videos over 4 MB can’t be sent yet. Try a shorter clip." };
    return post(fd);
  }

  const type = file.type || (/\.mov$/i.test(file.name) ? "video/quicktime" : /\.webm$/i.test(file.name) ? "video/webm" : "video/mp4");
  const ext = EXT[type];
  if (!ext) return { ok: false, error: "Send a video as MP4, MOV or WebM." };
  try {
    const blob = await upload("media/" + randomName() + "." + ext, file, {
      access: pre.access === "private" ? "private" : "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify(target),
      contentType: type,
      multipart: file.size > 8 * 1024 * 1024,
    });
    return post({ url: blob.url, ...target });
  } catch {
    return { ok: false, error: "Couldn’t upload that video. Check your connection and try again." };
  }
}
