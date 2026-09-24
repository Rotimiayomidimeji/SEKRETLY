export const analyticsEventNames = ["page_view", "profile_view", "interaction_view", "interaction_started", "interaction_submitted", "signup_started", "signup_completed", "interaction_created", "link_shared", "share_card_created", "message_opened", "reply_created", "explore_opened", "notification_opened"] as const;
export type AnalyticsEventName = (typeof analyticsEventNames)[number];
