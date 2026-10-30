"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

type PostHog = typeof import("posthog-js").default;
let ph: Promise<PostHog> | null = null;

/** Loads PostHog the first time it's needed (never, without a key), so it isn't in every page's bundle. */
const load = () =>
  (ph ??= import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded)
      posthog.init(KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: true,
        persistence: "localStorage",
      });
    return posthog;
  }));

/**
 * Product analytics (PostHog) when NEXT_PUBLIC_POSTHOG_KEY is set; otherwise nothing loads.
 * Page views only, no autocapture of what people type, and no session recording (messages are private).
 */
export function Analytics() {
  const path = usePathname();
  useEffect(() => {
    if (!KEY) return;
    // link addresses carry the owner's key: report the page shape, not the address
    const shape = path.replace(/^\/([^/]+)\/[^/]+\/([^/]+)\/([^/]+)$/, "/link/$2/$3");
    load().then((posthog) => posthog.capture("$pageview", { $current_url: window.location.origin + shape }));
  }, [path]);
  return null;
}
