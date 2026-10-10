import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export const uniqueUsername = (email: string) => {
  const base = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 15) || "secret";
  return `${base}${randomBytes(4).toString("hex")}`;
};
export async function createEmailToken(userId: string, purpose: "verify" | "reset", minutes: number) {
  const token = newToken();
  await db.$transaction(async (tx) => {
    await tx.emailToken.deleteMany({ where: { userId, purpose } });
    await tx.emailToken.create({ data: { userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + minutes * 60_000) } });
  });
  return token;
}
export async function consumeEmailToken(token: string, purpose: "verify" | "reset") {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return db.$transaction(async (tx) => {
    const record = await tx.emailToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.purpose !== purpose || record.expiresAt <= new Date()) return null;
    await tx.emailToken.delete({ where: { id: record.id } });
    return record.userId;
  });
}
