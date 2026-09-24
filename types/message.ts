export type MessageVisibility = "private" | "public";
export type MessageStatus = "unread" | "read" | "archived";
export type AnonymousMessage = { id: string; body: string; visibility: MessageVisibility; status: MessageStatus; createdAt: Date };
