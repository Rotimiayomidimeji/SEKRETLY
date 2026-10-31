import "server-only";

/**
 * The one contact address for now (general, safety, ads, legal): CONTACT_EMAIL, or else the Sekretly mailbox the
 * codes are sent from (SMTP_USER). Empty when neither is set (local development).
 */
export const contactEmail = () => (process.env.CONTACT_EMAIL || process.env.SMTP_USER || "").trim().replace(/^["']|["']$/g, "");
