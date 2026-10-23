import "server-only";

import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Sekretly <onboarding@resend.dev>";

/**
 * Sends a 6-digit code. With RESEND_API_KEY set it goes out through Resend;
 * without it (local development) the code is printed in the terminal running `npm run dev`.
 */
export async function sendCodeEmail(to: string, code: string, purpose: "verify" | "reset") {
  const subject = purpose === "verify" ? `${code} is your Sekretly code` : `${code} resets your Sekretly password`;
  const intro =
    purpose === "verify"
      ? "Use this code to confirm your recovery email."
      : "Use this code to set a new password. If you didn't ask for this, you can ignore this email.";
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[email:dev] to ${to} · ${subject}\n`);
    return;
  }
  await new Resend(key).emails.send({
    from: FROM,
    to,
    subject,
    text: `${intro}\n\n${code}\n\nIt expires in 10 minutes.\n\nSekretly`,
  });
}
