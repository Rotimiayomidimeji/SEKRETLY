import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate for member areas: no session cookie, straight to log in (and back afterwards).
// Pages still check the session itself against the database (lib/auth/session.ts).
const SESSION_COOKIE = "sk_session";

export function proxy(request: NextRequest) {
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
  ],
};
