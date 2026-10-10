import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { consumeEmailToken } from "@/lib/auth-utils";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(12).max(128) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid link or password. Use at least 12 characters." }, { status: 400 });
    const userId = await consumeEmailToken(parsed.data.token, "reset");
    if (!userId) return NextResponse.json({ error: "This reset link has expired." }, { status: 400 });
    await db.user.update({ where: { id: userId }, data: { passwordHash: await hash(parsed.data.password, 12) } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to reset password." }, { status: 500 }); }
}
