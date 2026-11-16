import { NextResponse } from "next/server";
import { z } from "zod";

import { recordPresence } from "@/features/admin/presence";
import { getCurrentUser } from "@/lib/auth/session";

// Heartbeat from components/layout/Presence.tsx: feeds "live now" and "time on site" on the admin pages.
const ping = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{8,40}$/),
  path: z.string().max(200),
  ref: z.string().max(500).default(""),
  dt: z.number().min(0).max(3600).default(0),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const p = ping.safeParse(body);
  if (!p.success) return new NextResponse(null, { status: 400 });
  // admin pages and the admin account never count as visitors
  if (p.data.path.startsWith("/admin")) return new NextResponse(null, { status: 204 });
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") return new NextResponse(null, { status: 204 });
  try {
    await recordPresence({ ...p.data, path: p.data.path.split("?")[0], userId: user?.id ?? null });
  } catch (e) {
    console.warn("presence failed", e);
  }
  return new NextResponse(null, { status: 204 });
}
