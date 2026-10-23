"use server";

import { redirect } from "next/navigation";

import { checkCode, issueCode } from "@/features/auth/codes";
import { createAccount, RESERVED } from "@/features/auth/accounts";
import { maskEmail, passwordSchema, signupSchema, usernameSchema, type SignupInput } from "@/features/auth/schemas";
import { createSession, destroyAllSessions, destroySession, getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearRateLimit, hitRateLimit, requestFingerprint } from "@/lib/rate-limit";

const MINUTE = 60_000;

/** Only same-site paths are allowed after login. */
const safeNext = (next: string | undefined) => (next && /^\/(?!\/)[^\s]*$/.test(next) ? next : null);

export async function checkUsername(name: string) {
  const parsed = usernameSchema.safeParse(name);
  if (!parsed.success) return { available: false };
  if (RESERVED.has(parsed.data)) return { available: false };
  const taken = await db.user.findUnique({ where: { username: parsed.data }, select: { id: true } });
  return { available: !taken };
}

export async function signup(input: SignupInput): Promise<{ error: string; taken?: boolean }> {
  const limit = await hitRateLimit(`signup:${await requestFingerprint()}`, 5, 60 * MINUTE);
  if (!limit.allowed) return { error: "Too many new accounts from this device. Try again in an hour." };
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  const { username, password, birthDate, avatar, email } = parsed.data;
  if (RESERVED.has(username)) return { error: `@${username} is taken. Try another one.`, taken: true };
  const created = await createAccount({ username, password, birthDate: new Date(birthDate + "T00:00:00Z"), avatar, recoveryEmail: email ?? null });
  if (!created.ok) return { error: `@${username} is taken. Try another one.`, taken: true };
  const userId = created.id;
  await createSession(userId);
  if (email) {
    await issueCode(userId, email, "VERIFY_EMAIL");
    redirect("/verify-email");
  }
  redirect("/onboarding");
}

export async function login(input: { username: string; password: string; next?: string }): Promise<{ left: number; locked: boolean }> {
  const name = String(input.username ?? "").trim().toLowerCase().slice(0, 40);
  // 5 tries per account per 15 minutes (as the screen says), and a looser cap per device
  const perAccount = await hitRateLimit(`login:${name}`, 5, 15 * MINUTE);
  const perDevice = await hitRateLimit(`login-device:${await requestFingerprint()}`, 30, 15 * MINUTE);
  if (!perAccount.allowed || !perDevice.allowed) return { left: 0, locked: true };
  const user = await db.user.findUnique({ where: { username: name } });
  const ok = !!user && user.status === "ACTIVE" && (await verifyPassword(String(input.password ?? ""), user.passwordHash));
  if (!ok || !user) return { left: perAccount.remaining, locked: perAccount.remaining === 0 };
  await clearRateLimit(`login:${name}`);
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  redirect(safeNext(input.next) ?? (user.onboardedAt ? "/home" : "/onboarding"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function verifyEmail(code: string): Promise<{ ok: boolean; reason?: "wrong" | "expired" }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "expired" };
  const res = await checkCode(user.id, "VERIFY_EMAIL", String(code ?? ""), true);
  if (!res.ok) return { ok: false, reason: res.reason };
  await db.user.update({ where: { id: user.id }, data: { recoveryEmail: res.email, emailVerifiedAt: new Date() } });
  return { ok: true };
}

export async function resendVerifyCode() {
  const user = await getCurrentUser();
  if (!user?.recoveryEmail) return;
  const limit = await hitRateLimit(`verify-send:${user.id}`, 5, 60 * MINUTE);
  if (limit.allowed) await issueCode(user.id, user.recoveryEmail, "VERIFY_EMAIL");
}

export async function startReset(username: string): Promise<{ ok: true; masked: string } | { ok: false; noEmail?: true; error?: string }> {
  const name = String(username ?? "").trim().toLowerCase();
  const limit = await hitRateLimit(`reset-send:${await requestFingerprint()}`, 6, 60 * MINUTE);
  if (!limit.allowed) return { ok: false, error: "Too many reset requests. Try again in an hour." };
  const user = await db.user.findUnique({ where: { username: name } });
  if (!user || user.status === "DELETED" || !user.recoveryEmail) return { ok: false, noEmail: true };
  await issueCode(user.id, user.recoveryEmail, "RESET_PASSWORD");
  return { ok: true, masked: maskEmail(user.recoveryEmail) };
}

export async function checkReset(username: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const user = await db.user.findUnique({ where: { username: String(username ?? "").trim().toLowerCase() } });
  if (!user) return { ok: false, error: "That code doesn’t match." };
  const res = await checkCode(user.id, "RESET_PASSWORD", String(code ?? ""), false);
  if (res.ok) return { ok: true };
  return { ok: false, error: res.reason === "expired" ? "That code has expired or was tried too many times. Tap Resend code." : "That code doesn’t match. Check the newest email." };
}

export async function finishReset(username: string, code: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const pw = passwordSchema.safeParse(password);
  if (!pw.success) return { ok: false, error: pw.error.issues[0]?.message };
  const user = await db.user.findUnique({ where: { username: String(username ?? "").trim().toLowerCase() } });
  if (!user) return { ok: false, error: "Start again from the first step." };
  const res = await checkCode(user.id, "RESET_PASSWORD", String(code ?? ""), true);
  if (!res.ok) return { ok: false, error: "That code has expired. Start again from the first step." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw.data) } });
  // "We logged you out of other devices, just in case."
  await destroyAllSessions(user.id);
  await clearRateLimit(`login:${user.username}`);
  await createSession(user.id);
  return { ok: true };
}

export async function completeOnboarding() {
  const user = await getCurrentUser();
  if (user && !user.onboardedAt) await db.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
}
