// ─── Route Handler: GET /api/accounts/lookup
// Proxies the client-side lookup request to the Go backend with the session
// access token (kept server-side). This is the ONLY Next.js route.ts in the
// project — justified because the TransferWizard is a client component that
// needs to trigger the authenticated lookup on demand (debounced user input).
//
// Architecture note: Server Actions cannot be called mid-render with dynamic
// args in a debounced pattern; a route handler is the clean solution here.

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { ApiError } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return NextResponse.json(
      { message: "Invalid account ID" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${API_BASE}/v1/accounts/lookup?id=${encodeURIComponent(id)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      },
    );

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            (body as { message?: string }).message ??
            `Request failed (${res.status})`,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message },
        { status: err.status || 500 },
      );
    }
    return NextResponse.json(
      { message: "Network error — could not reach the server." },
      { status: 500 },
    );
  }
}
