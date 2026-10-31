import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

// Sends the 6-digit codes (recovery-email checks and password resets). Three ways, first one configured wins:
//   SMTP_USER + SMTP_PASS   any SMTP inbox; with Gmail (an app password) it delivers to anyone, no domain needed
//   RESEND_API_KEY          Resend; delivers to anyone only once a domain is verified there (EMAIL_FROM on that domain)
//   neither                 local development: the code is printed in the terminal running `npm run dev`

// Gmail shows app passwords in groups of 4 ("abcd efgh ijkl mnop"); spaces and stray quotes are dropped either way
const SMTP_USER = (process.env.SMTP_USER ?? "").trim().replace(/^["']|["']$/g, "");
const SMTP_PASS = (process.env.SMTP_PASS ?? "").replace(/[\s"']/g, "");
const FROM = process.env.EMAIL_FROM ?? (SMTP_USER ? `Sekretly <${SMTP_USER}>` : "Sekretly <onboarding@resend.dev>");

let smtp: nodemailer.Transporter | null = null;
const transport = () =>
  (smtp ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  }));

// A plain, light transactional layout (dark, code-only emails look like spam to mail filters)
const SITE = (process.env.NEXT_PUBLIC_APP_URL || "https://sekretlyy.vercel.app").replace(/^https?:\/\//, "");
const html = (intro: string, code: string) => `<!doctype html><html><body style="margin:0;background:#f4f2f7;font-family:Arial,Helvetica,sans-serif;color:#1d1726">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e6e1ee">
<tr><td style="font-size:20px;font-weight:700;padding-bottom:12px">Sekretly</td></tr>
<tr><td style="font-size:15px;line-height:22px;padding-bottom:18px">Hi,<br><br>${intro}</td></tr>
<tr><td align="center" style="background:#f4f2f7;border-radius:12px;padding:16px;font-size:30px;letter-spacing:8px;font-weight:700">${code}</td></tr>
<tr><td style="font-size:14px;line-height:21px;padding-top:18px">The code expires in 10 minutes. Never share it with anyone, not even someone who says they work for Sekretly.</td></tr>
<tr><td style="font-size:14px;line-height:21px;padding-top:14px">Thanks,<br>The Sekretly team</td></tr>
<tr><td style="font-size:12px;line-height:18px;color:#7a7286;padding-top:22px;border-top:1px solid #eee;margin-top:18px">You're getting this because this email address was entered on ${SITE}. If that wasn't you, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`;

/** Sends a 6-digit code. Returns false (and logs why) when it couldn't be sent. */
export async function sendCodeEmail(to: string, code: string, purpose: "verify" | "reset") {
  const subject = purpose === "verify" ? `Your Sekretly verification code: ${code}` : `Your Sekretly password reset code: ${code}`;
  const intro =
    purpose === "verify"
      ? "Use this code to confirm your recovery email."
      : "Use this code to set a new password. If you didn't ask for this, you can ignore this email.";
  const text = `Hi,\n\n${intro}\n\n${code}\n\nThe code expires in 10 minutes. Never share it with anyone.\n\nThanks,\nThe Sekretly team\n\nYou're getting this because this email address was entered on ${SITE}. If that wasn't you, you can ignore this email.`;
  try {
    if (SMTP_USER && SMTP_PASS) {
      await transport().sendMail({ from: FROM, to, subject, text, html: html(intro, code) });
      console.log("email sent to " + to.replace(/^(.).*@/, "$1***@") + " (" + purpose + ")");
      return true;
    }
    const key = process.env.RESEND_API_KEY;
    if (key) {
      // Resend reports failures in the result instead of throwing
      const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, text, html: html(intro, code) });
      if (error) throw new Error(error.name + ": " + error.message);
      return true;
    }
    if (process.env.NODE_ENV === "production") {
      console.error("email not sent: set SMTP_USER + SMTP_PASS (or RESEND_API_KEY) in the environment");
      return false;
    }
    console.log(`\n[email:dev] to ${to} · ${subject}\n`);
    return true;
  } catch (e) {
    console.error("email to " + to.replace(/^(.).*@/, "$1***@") + " failed:", e instanceof Error ? e.message : e);
    return false;
  }
}
