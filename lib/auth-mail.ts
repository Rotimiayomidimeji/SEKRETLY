export async function sendAuthEmail(email: string, subject: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email delivery is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject, text: `SEKRETLY account security

Open this link to continue:
${url}

If you didn't request this, ignore this email.` }),
  });
  if (!response.ok) throw new Error("Email delivery failed");
}
