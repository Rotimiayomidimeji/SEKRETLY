import { del, head } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { isOurMedia, kindOf, MAX_BYTES, sniff, storeMedia } from "@/features/media/storage";
import { deviceKey, standingWith, userKey } from "@/features/safety/standing";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

// One photo or video, for a message on a link (anyone, where the topic takes media) or a chat (its two members).
// The file is checked by its contents, size-limited and rate-limited before it is used.
//
// Two ways in (see lib/upload-client.ts):
//   form data { file, linkId | chatId }   small files, and every file in local dev; stored by storeMedia
//   JSON                                   big files on Vercel, which caps request bodies at 4.5 MB, so the browser
//                                          sends them straight to Vercel Blob:
//     { check, linkId | chatId }            preflight: may this person send here, and is Blob switched on?
//     { type: "blob.…", payload }           the Blob client asking for its one-time upload token
//     { url, linkId | chatId }              after the upload: the bytes are checked here, and deleted if wrong

export const maxDuration = 60;

const MEDIA_TOPICS = new Set(["CONFESS", "AMA", "CUSTOM", "DROP"]);
const BLOB_NAME = /^media\/[\w-]{24}\.(jpg|png|webp|gif|webm|mov|mp4)$/;
const BLOB_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

const fail = (error: string, status = 400) => Response.json({ ok: false, error }, { status });

type Target = { linkId?: unknown; chatId?: unknown };

/** Who's sending and whether they may send media to this link or chat. Returns an error message, or the sender. */
async function checkTarget(t: Target) {
  const user = await getCurrentUser();
  const fingerprint = await requestFingerprint();
  const linkId = String(t.linkId ?? ""), chatId = String(t.chatId ?? "").replace(/^c:/, "");
  if (linkId) {
    const link = await db.link.findUnique({ where: { id: linkId }, include: { owner: true } });
    if (!link || link.status !== "LIVE" || !MEDIA_TOPICS.has(link.topic)) return { error: "This link doesn’t take photos or videos." };
    if (!user && !link.owner.allowVisitors) return { error: "Make a free account to send." };
    const keys = user ? [userKey(user.id), deviceKey(fingerprint)] : [deviceKey(fingerprint)];
    if ((await standingWith(link.ownerId, keys)).blocked) return { error: "You can’t message this person anymore.", status: 403 };
  } else if (chatId) {
    if (!user) return { error: "Log in again.", status: 401 };
    const chat = await db.chat.findFirst({ where: { id: chatId, OR: [{ ownerId: user.id }, { guestId: user.id }] } });
    if (!chat) return { error: "This chat is gone.", status: 404 };
  } else return { error: "Nowhere to send this." };
  return { who: user ? user.id : fingerprint };
}

const overLimit = async (who: string) => !(await hitRateLimit("upload:" + who, 20, 3_600_000)).allowed;
const LIMIT_MSG = "You’ve sent a lot of media. Try again later.";

export async function POST(request: Request) {
  if ((request.headers.get("content-type") ?? "").includes("application/json")) return json(request);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return fail("No file.");
  if (file.size > MAX_BYTES.video) return fail("That file is too big. Videos up to 25 MB, photos up to 8 MB.", 413);

  const target = await checkTarget({ linkId: form.get("linkId"), chatId: form.get("chatId") });
  if ("error" in target) return fail(target.error!, target.status);
  if (await overLimit(target.who)) return fail(LIMIT_MSG, 429);

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return fail("Send a photo (JPG, PNG, WebP, GIF) or a video (MP4, MOV, WebM).", 415);
  if (bytes.length > MAX_BYTES[type.kind]) return fail(type.kind === "photo" ? "Photos can be up to 8 MB." : "Videos can be up to 25 MB.", 413);

  const url = await storeMedia(bytes, type);
  return Response.json({ ok: true, url, kind: type.kind, size: bytes.length });
}

async function json(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Bad request.");
  const blobOn = !!process.env.BLOB_READ_WRITE_TOKEN;

  // preflight
  if (body.check) {
    const target = await checkTarget(body);
    if ("error" in target) return fail(target.error!, target.status);
    return Response.json({ ok: true, direct: blobOn });
  }

  // the Blob client's token request
  if (typeof body.type === "string" && body.type.startsWith("blob.")) {
    if (!blobOn) return fail("Uploads aren’t set up.", 501);
    try {
      const result = await handleUpload({
        request,
        body: body as HandleUploadBody,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          if (!BLOB_NAME.test(pathname)) throw new Error("bad name");
          const target = await checkTarget(JSON.parse(clientPayload || "{}"));
          if ("error" in target) throw new Error(target.error);
          if (await overLimit(target.who)) throw new Error(LIMIT_MSG);
          return { allowedContentTypes: BLOB_TYPES, maximumSizeInBytes: MAX_BYTES.video, addRandomSuffix: false, allowOverwrite: false };
        },
      });
      return Response.json(result);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Couldn’t start the upload.", 403);
    }
  }

  // after a direct upload: check what actually arrived
  if (typeof body.url === "string") {
    const url = body.url;
    if (!blobOn || !isOurMedia(url) || url.startsWith("/")) return fail("That attachment can’t be sent.");
    const target = await checkTarget(body);
    if ("error" in target) return fail(target.error!, target.status);
    const [info, start] = await Promise.all([
      head(url).catch(() => null),
      fetch(url, { headers: { Range: "bytes=0-31" }, cache: "no-store" }).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null),
    ]);
    const type = start ? sniff(Buffer.from(start)) : null;
    if (!info || !type || type.kind !== kindOf(url) || info.size > MAX_BYTES[type.kind]) {
      await del(url).catch(() => {});
      return fail(!type ? "Send a photo (JPG, PNG, WebP, GIF) or a video (MP4, MOV, WebM)." : type.kind === "photo" ? "Photos can be up to 8 MB." : "Videos can be up to 25 MB.", 415);
    }
    return Response.json({ ok: true, url, kind: type.kind, size: info.size });
  }

  return fail("Bad request.");
}
