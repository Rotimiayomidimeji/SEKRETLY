import { readLocal } from "@/features/media/storage";

// Serves photos and videos stored on this machine (local dev, when there's no Vercel Blob token).
export async function GET(request: Request, { params }: RouteContext<"/api/media/[file]">) {
  const { file } = await params;
  const media = await readLocal(file);
  if (!media) return new Response("Not found", { status: 404 });
  const size = media.bytes.length;
  const headers = { "Content-Type": media.mime, "Cache-Control": "private, max-age=86400", "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff" };
  // videos seek with byte ranges
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    return new Response(new Uint8Array(media.bytes.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(media.bytes), { headers: { ...headers, "Content-Length": String(size) } });
}
