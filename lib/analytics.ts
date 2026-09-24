import type { AnalyticsEventName } from "@/types/analytics";

export type AnalyticsEvent = { name: AnalyticsEventName; properties?: Record<string, string | number | boolean> };

export function trackEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") console.info("[analytics]", event);
}
