import "server-only";

import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";

/** Admin pages: members with the ADMIN role only; everyone else gets a plain 404 (admin pages aren't advertised). */
export async function requireAdmin(next: string) {
  const user = await requireUser(next);
  if (user.role !== "ADMIN") notFound();
  return user;
}
