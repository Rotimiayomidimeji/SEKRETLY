import { NextResponse } from "next/server";
import { consumeEmailToken } from "@/lib/auth-utils";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (typeof token !== "string") return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    const userId = await consumeEmailToken(token, "verify");
    if (!userId) return NextResponse.json({ error: "This link has expired or was already used." }, { status: 400 });
    await db.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Verification failed" }, { status: 500 }); }
}
