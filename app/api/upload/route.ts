import { MAX_BYTES, sniff, storeMedia } from "@/features/media/storage";
import { deviceKey, standingWith, userKey } from "@/features/safety/standing";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

// One photo or video, for a message on a link (anyone, where the topic takes media) or a chat (its two members).
// The file is checked by its contents, size-limited and rate-limited before it is stored.

export const maxDuration = 60;

const MEDIA_TOPICS = new Set(["CONFESS", "AMA", "CUSTOM", "DROP"]);

const fail = (error: string, status = 400) => Response.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return fail("No file.");
  if (file.size > MAX_BYTES.video) return fail("That file is too big. Videos up to 25 MB, photos up to 8 MB.", 413);

  const user = await getCurrentUser();
  const fingerprint = await requestFingerprint();
  const linkId = String(form.get("linkId") ?? ""), chatId = String(form.get("chatId") ?? "").replace(/^c:/, "");
  if (linkId) {
    const link = await db.link.findUnique({ where: { id: linkId }, include: { owner: true } });
    if (!link || link.status !== "LIVE" || !MEDIA_TOPICS.has(link.topic)) return fail("This link doesn’t take photos or videos.");
    if (!user && !link.owner.allowVisitors) return fail("Make a free account to send.");
    const keys = user ? [userKey(user.id), deviceKey(fingerprint)] : [deviceKey(fingerprint)];
    if ((await standingWith(link.ownerId, keys)).blocked) return fail("You can’t message this person anymore.", 403);
  } else if (chatId) {
    if (!user) return fail("Log in again.", 401);
    const chat = await db.chat.findFirst({ where: { id: chatId, OR: [{ ownerId: user.id }, { guestId: user.id }] } });
    if (!chat) return fail("This chat is gone.", 404);
  } else return fail("Nowhere to send this.");

  const limit = await hitRateLimit("upload:" + (user ? user.id : fingerprint), 20, 3_600_000);
  if (!limit.allowed) return fail("You’ve sent a lot of media. Try again later.", 429);

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return fail("Send a photo (JPG, PNG, WebP, GIF) or a video (MP4, MOV, WebM).", 415);
  if (bytes.length > MAX_BYTES[type.kind]) return fail(type.kind === "photo" ? "Photos can be up to 8 MB." : "Videos can be up to 25 MB.", 413);

  const url = await storeMedia(bytes, type);
  return Response.json({ ok: true, url, kind: type.kind, size: bytes.length });
}
