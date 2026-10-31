import "server-only";

import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

/**
 * Admin pages: the ADMIN account only. Everyone else, logged in or not, gets the plain "page not found", the same as
 * an address that doesn't exist, so nothing tells an outsider there's anything here (no login redirect either).
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return user;
}
