import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

// Sends the 6-digit codes (recovery-email checks and password resets). Three ways, first one configured wins:
//   SMTP_USER + SMTP_PASS   any SMTP inbox; with Gmail (an app password) it delivers to anyone, no domain needed
//   RESEND_API_KEY          Resend; delivers to anyone only once a domain is verified there (EMAIL_FROM on that domain)
//   neither                 local development: the code is printed in the terminal running `npm run dev`

const FROM = process.env.EMAIL_FROM ?? (process.env.SMTP_USER ? `Sekretly <${process.env.SMTP_USER}>` : "Sekretly <onboarding@resend.dev>");

let smtp: nodemailer.Transporter | null = null;
const transport = () =>
  (smtp ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

const html = (intro: string, code: string) => `<!doctype html><html><body style="margin:0;background:#0c0811;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#17101f;border-radius:20px;padding:28px">
<tr><td style="color:#fff;font-size:22px;font-weight:700;padding-bottom:8px">Sekretly</td></tr>
<tr><td style="color:#c9bfd6;font-size:15px;line-height:22px;padding-bottom:20px">${intro}</td></tr>
<tr><td align="center" style="background:#241a30;border-radius:14px;padding:18px;color:#fff;font-size:34px;letter-spacing:10px;font-weight:700">${code}</td></tr>
<tr><td style="color:#8f849c;font-size:13px;padding-top:18px">It expires in 10 minutes.</td></tr>
</table></td></tr></table></body></html>`;

/** Sends a 6-digit code. Returns false (and logs why) when it couldn't be sent. */
export async function sendCodeEmail(to: string, code: string, purpose: "verify" | "reset") {
  const subject = purpose === "verify" ? `${code} is your Sekretly code` : `${code} resets your Sekretly password`;
  const intro =
    purpose === "verify"
      ? "Use this code to confirm your recovery email."
      : "Use this code to set a new password. If you didn't ask for this, you can ignore this email.";
  const text = `${intro}\n\n${code}\n\nIt expires in 10 minutes.\n\nSekretly`;
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transport().sendMail({ from: FROM, to, subject, text, html: html(intro, code) });
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
