import { getCurrentUser } from "@/lib/auth/session";
import { pusher, userChannel } from "@/lib/realtime";

// Lets a logged-in member listen on their own channel (and nobody else's).

export async function POST(request: Request) {
  const p = pusher();
  if (!p) return new Response("Live updates are off", { status: 501 });
  const user = await getCurrentUser();
  if (!user) return new Response("Log in", { status: 401 });
  const form = await request.formData().catch(() => null);
  const socketId = String(form?.get("socket_id") ?? ""), channel = String(form?.get("channel_name") ?? "");
  if (!socketId || channel !== userChannel(user.id)) return new Response("Forbidden", { status: 403 });
  return Response.json(p.authorizeChannel(socketId, channel));
}
