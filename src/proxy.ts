// ─── GoBank Proxy (Next.js v16 file convention — formerly middleware.ts)
// Runs at the Edge before every matched route.
//
// SECURITY NOTE — cookie-presence vs. cryptographic verification:
// We only check that the session cookie *exists* here, NOT that it is valid.
// Full cryptographic verification (iron-session AES-256-CBC + HMAC) is
// intentionally deferred to requireAuth() inside each protected RSC/Server
// Action, for two reasons:
//   1. iron-session requires the Node.js crypto module, which is unavailable
//      in the Edge Runtime where Proxy executes.
//   2. The docs (data-security.md) explicitly warn that "a Proxy matcher that
//      excludes a path will also skip Server Function calls on that path" and
//      recommend re-verifying inside each Server Action regardless.
// Therefore: Proxy = fast UX redirect for cookie-less clients.
//            requireAuth() = real auth gate for all protected code paths.

import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";
import { SESSION_OPTIONS } from "@/lib/session/config";

// Routes that require an authenticated session.
// Any sub-path is also covered (e.g. /accounts/1).
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/transfers",
  "/settings",
];

// Routes that authenticated users should not revisit
// (redirect them to the dashboard instead).
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

  // ── Unauthenticated user hitting a protected route → send to login
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated user hitting login/register → send to dashboard
  // (avoids double-login UX; real session validation still happens in the RSC)
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public images (svg, png, jpg, jpeg, gif, webp, ico)
     *
     * Note: per Next.js docs, _next/data routes are always matched by Proxy
     * even when excluded here — this is intentional to prevent accidentally
     * unprotecting the RSC data layer behind a protected page.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
