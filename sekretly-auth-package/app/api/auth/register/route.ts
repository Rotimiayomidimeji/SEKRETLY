import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createEmailToken, normalizeEmail, uniqueUsername } from "@/lib/auth-utils";
import { sendAuthEmail } from "@/lib/auth-mail";

const schema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().email().max(254), password: z.string().min(12).max(128) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Check your name, email, and password (minimum 12 characters)." }, { status: 400 });
    const { name, password } = parsed.data;
    const email = normalizeEmail(parsed.data.email);
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "This email is already registered. Try signing in or resetting your password." }, { status: 409 });
    const passwordHash = await hash(password, 12);
    const user = await db.user.create({ data: { email, name, passwordHash, profile: { create: { username: uniqueUsername(email), displayName: name } } } });
    const token = await createEmailToken(user.id, "verify", 30);
    const origin = process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) throw new Error("NEXT_PUBLIC_APP_URL is required");
    await sendAuthEmail(email, "Verify your SEKRETLY email", `${origin}/verify?token=${token}`);
    return NextResponse.json({ ok: true, message: "Check your inbox for a verification link." }, { status: 201 });
  } catch (error) {
    console.error("Registration error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to register right now. Please try again." }, { status: 500 });
  }
}
