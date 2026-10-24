"use client";

import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * Product analytics (PostHog) when NEXT_PUBLIC_POSTHOG_KEY is set; otherwise nothing loads.
 * Page views only, no autocapture of what people type, and no session recording (messages are private).
 */
export function Analytics() {
  const path = usePathname();
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;
    posthog.init(KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
      persistence: "localStorage",
    });
  }, []);
  useEffect(() => {
    // link addresses carry the owner's key: report the page shape, not the address
    if (KEY && posthog.__loaded) posthog.capture("$pageview", { $current_url: window.location.origin + path.replace(/^\/([^/]+)\/[^/]+\/([^/]+)\/([^/]+)$/, "/link/$2/$3") });
  }, [path]);
  return null;
}
