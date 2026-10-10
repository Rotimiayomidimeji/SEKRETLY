import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createEmailToken, normalizeEmail } from "@/lib/auth-utils";
import { sendAuthEmail } from "@/lib/auth-mail";
export async function POST(request: Request) {
  try {
    const parsed = z.object({ email: z.string().email() }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    const user = await db.user.findUnique({ where: { email: normalizeEmail(parsed.data.email) } });
    if (user?.passwordHash) {
      const token = await createEmailToken(user.id, "reset", 20);
      if (!process.env.NEXT_PUBLIC_APP_URL) throw new Error("Missing app URL");
      await sendAuthEmail(user.email, "Reset your SEKRETLY password", `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);
    }
    return NextResponse.json({ ok: true, message: "If this account exists, you'll receive a reset link." });
  } catch { return NextResponse.json({ error: "Please try again later." }, { status: 500 }); }
}
