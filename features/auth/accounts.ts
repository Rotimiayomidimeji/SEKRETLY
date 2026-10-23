import "server-only";

import { Prisma } from "@prisma/client";

import { newLinkKey } from "@/features/links/topics";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// Not a "use server" file on purpose: nothing here may be callable from the browser.

// Words that could be mistaken for staff or app pages.
export const RESERVED = new Set(["admin", "sekretly", "support", "help", "safety", "about", "login", "signup", "settings", "inbox", "home", "games", "staff", "official", "moderator", "root", "system"]);

/**
 * Creates the account with a fresh link key. Returns ok:false only when the username is taken
 * (a link-key collision, about 1 in a billion, just retries).
 */
export async function createAccount(data: { username: string; password: string; birthDate: Date | null; avatar?: string; recoveryEmail?: string | null; ageConfirmed?: boolean }) {
  if (RESERVED.has(data.username)) return { ok: false as const };
  const passwordHash = await hashPassword(data.password);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const user = await db.user.create({
        data: {
          username: data.username,
          passwordHash,
          birthDate: data.birthDate,
          ageConfirmedAt: data.ageConfirmed ? new Date() : null,
          avatar: data.avatar ?? "fox",
          recoveryEmail: data.recoveryEmail ?? null,
          linkKey: newLinkKey(),
        },
        select: { id: true },
      });
      return { ok: true as const, id: user.id };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
      const target = String((e.meta as { target?: unknown } | undefined)?.target ?? "");
      if (target.includes("username")) return { ok: false as const };
    }
  }
  throw new Error("Could not create a unique link key");
}
