import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { db } from "@/lib/db";

/**
 * Fixed-window counter kept in Postgres, so it holds across serverless instances.
 * Returns whether this attempt is allowed and how many remain in the window.
 */
export async function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const { count } = rows[0];
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), count };
}

/** Clears a counter, e.g. after a successful login. */
export async function clearRateLimit(key: string) {
  await db.rateLimit.deleteMany({ where: { key } });
}

/** A hashed, coarse identity for the requesting device (network + browser). The raw IP is never stored. */
export async function requestFingerprint() {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return createHash("sha256").update(`${ip}|${h.get("user-agent") ?? ""}`).digest("hex").slice(0, 32);
}
