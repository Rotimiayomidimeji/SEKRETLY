import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";

// Optimistic gate for member areas: no session cookie, straight to log in (and back afterwards).
// Pages still check the session itself against the database (lib/auth/session.ts).
const SESSION_COOKIE = "sk_session";

const notFound = (request: NextRequest) => NextResponse.rewrite(new URL("/_admin-not-found", request.url), { status: 404 });

/** Whether this session cookie belongs to the admin account (checked in the database, like lib/auth/session.ts). */
async function isAdminSession(token: string | undefined) {
  if (!token) return false;
  const session = await db.session.findUnique({
    where: { id: createHash("sha256").update(token).digest("hex") },
    select: { expiresAt: true, user: { select: { role: true, status: true } } },
  });
  return !!session && session.expiresAt > new Date() && session.user.status === "ACTIVE" && session.user.role === "ADMIN";
}

export async function proxy(request: NextRequest) {
  // admin pages: anyone but the admin account gets a real "page not found" before any admin code runs, logged in or
  // not (no login redirect, no page title, nothing that says there's something here). The pages check again.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return (await isAdminSession(request.cookies.get(SESSION_COOKIE)?.value)) ? NextResponse.next() : notFound(request);
  }
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/home/:path*",
    "/inbox/:path*",
    "/create/:path*",
    "/links/:path*",
    "/share/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/verify-email/:path*",
    "/admin/:path*",
    "/activity/:path*",
    "/analytics/:path*",
    "/drop/:path*",
    "/streak/:path*",
    "/badges/:path*",
    "/wrap/:path*",
    "/crews/:path*",
    "/games/:path*",
  ],
};
