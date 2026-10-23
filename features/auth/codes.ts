import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import type { CodePurpose } from "@prisma/client";
import { db } from "@/lib/db";
import { sendCodeEmail } from "@/lib/email";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const hash = (code: string) => createHash("sha256").update(code).digest("hex");

/** Creates a fresh 6-digit code (older unused ones stop working) and emails it. */
export async function issueCode(userId: string, email: string, purpose: CodePurpose) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.$transaction([
    db.emailCode.updateMany({ where: { userId, purpose, usedAt: null }, data: { usedAt: new Date() } }),
    db.emailCode.create({ data: { userId, purpose, email, codeHash: hash(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) } }),
  ]);
  await sendCodeEmail(email, code, purpose === "VERIFY_EMAIL" ? "verify" : "reset");
}

/** Checks a code without using it up (unless `consume`). Wrong guesses count towards MAX_ATTEMPTS. */
export async function checkCode(userId: string, purpose: CodePurpose, code: string, consume: boolean) {
  const row = await db.emailCode.findFirst({ where: { userId, purpose, usedAt: null }, orderBy: { createdAt: "desc" } });
  if (!row || row.expiresAt < new Date() || row.attempts >= MAX_ATTEMPTS) return { ok: false as const, reason: "expired" as const };
  const a = Buffer.from(hash(code.trim())), b = Buffer.from(row.codeHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.emailCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, reason: row.attempts + 1 >= MAX_ATTEMPTS ? ("expired" as const) : ("wrong" as const) };
  }
  if (consume) await db.emailCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return { ok: true as const, email: row.email };
}
