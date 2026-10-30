import "server-only";

import { after } from "next/server";
import Pusher from "pusher";

// Live updates (Pusher Channels): when something changes for a member (a message, a reply, a notification, a visit
// to their link), their open screens hear about it at once and refresh. Each member listens on their own private
// channel, authorised by app/api/realtime/auth. Without the PUSHER_* settings this does nothing and the screens
// fall back to checking every few seconds (components/layout/LiveRefresh).

let client: Pusher | null | undefined;

export function pusher() {
  if (client !== undefined) return client;
  const { PUSHER_APP_ID: appId, NEXT_PUBLIC_PUSHER_KEY: key, PUSHER_SECRET: secret, NEXT_PUBLIC_PUSHER_CLUSTER: cluster } = process.env;
  client = appId && key && secret && cluster ? new Pusher({ appId, key, secret, cluster, useTLS: true }) : null;
  return client;
}

export const userChannel = (userId: string) => "private-user-" + userId;

/** Tells these members' open screens that something changed (sent after the response, never throws). */
export function emit(userIds: string | (string | null | undefined)[], event: "message" | "chat" | "notification" | "stats" | "update" = "update") {
  const p = pusher();
  if (!p) return;
  const ids = [...new Set((Array.isArray(userIds) ? userIds : [userIds]).filter((x): x is string => !!x))];
  if (!ids.length) return;
  const send = () => p.trigger(ids.map(userChannel), event, { at: Date.now() }).catch((e: unknown) => console.warn("realtime:", e instanceof Error ? e.message : e));
  try {
    after(send);
  } catch {
    // outside a request (scripts): send now
    void send();
  }
}
