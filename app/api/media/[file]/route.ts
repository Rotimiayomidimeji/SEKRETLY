import { readLocal, readPrivate } from "@/features/media/storage";

// Serves photos and videos that aren't public Blob files: from a private Blob store on Vercel, or from this
// machine in local dev (no Blob token). Addresses are long and random.
export async function GET(request: Request, { params }: RouteContext<"/api/media/[file]">) {
  const { file } = await params;
  const range = request.headers.get("range");
  const base = { "Cache-Control": "private, max-age=86400", "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff" };

  const remote = await readPrivate(file, range);
  if (remote) {
    const h = remote.headers, partial = h.get("content-range");
    const headers: Record<string, string> = { ...base, "Content-Type": remote.mime };
    if (partial) headers["Content-Range"] = partial;
    if (h.get("content-length")) headers["Content-Length"] = h.get("content-length")!;
    return new Response(remote.stream, { status: partial ? 206 : 200, headers });
  }

  const media = await readLocal(file);
  if (!media) return new Response("Not found", { status: 404 });
  const size = media.bytes.length;
  const headers = { ...base, "Content-Type": media.mime };
  // videos seek with byte ranges
  const m = /^bytes=(\d*)-(\d*)$/.exec(range ?? "");
  if (m) {
    const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    return new Response(new Uint8Array(media.bytes.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(media.bytes), { headers: { ...headers, "Content-Length": String(size) } });
}
