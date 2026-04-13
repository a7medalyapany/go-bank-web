// ─── GoBank Proxy (Next.js v16 file convention — formerly middleware.ts)
// Runs at the Edge before every matched route.
//
// SECURITY NOTE — cookie-presence vs. cryptographic verification:
// We only check that the session cookie *exists* here, NOT that it is valid.
// Full cryptographic verification (iron-session AES-256-CBC + HMAC) is
// intentionally deferred to requireAuth() inside each protected RSC/Server
// Action. The proxy is only responsible for fast UX redirects.

import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";
import { SESSION_OPTIONS } from "@/lib/session/config";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/transfers",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register", "/"];

export const proxy: NextProxy = (request) => {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "?"),
  );

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_OPTIONS.cookieName)?.value,
  );

  // Unauthenticated user hitting a protected route → send to login
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting login/register → send to dashboard
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
