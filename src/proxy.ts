import { NextRequest, NextResponse } from "next/server";
import { SESSION_OPTIONS } from "@/lib/session/config";

const PROTECTED = ["/dashboard", "/accounts", "/transfers", "/settings"];
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_OPTIONS.cookieName)?.value,
  );

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
