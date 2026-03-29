import { NextRequest, NextResponse } from "next/server";
import { SESSION_OPTIONS } from "@/lib/session/config";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/transfers",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) return NextResponse.next();

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_OPTIONS.cookieName)?.value,
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and known public assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
