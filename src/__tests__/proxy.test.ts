import { describe, it, expect } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

// ─── Matcher coverage
// Verifies that the proxy config correctly includes/excludes routes
// without spinning up a server.
describe("proxy matcher", () => {
  const nextConfig = {}; // No custom next.config options affecting matcher

  it("runs for /dashboard", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/dashboard" }),
    ).toBe(true);
  });

  it("runs for /dashboard/settings", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig,
        url: "/dashboard/settings",
      }),
    ).toBe(true);
  });

  it("runs for /accounts", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/accounts" }),
    ).toBe(true);
  });

  it("runs for /login", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/login" }),
    ).toBe(true);
  });

  it("runs for /register", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/register" }),
    ).toBe(true);
  });

  it("skips _next/static assets", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig,
        url: "/_next/static/chunks/main.js",
      }),
    ).toBe(false);
  });

  it("skips _next/image", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig,
        url: "/_next/image?url=foo",
      }),
    ).toBe(false);
  });

  it("skips favicon.ico", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/favicon.ico" }),
    ).toBe(false);
  });

  it("skips robots.txt", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/robots.txt" }),
    ).toBe(false);
  });

  it("skips sitemap.xml", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: "/sitemap.xml" }),
    ).toBe(false);
  });
});

// ─── Proxy routing logic
describe("proxy routing", () => {
  function makeEvent() {
    return {
      waitUntil: () => {},
      passThroughOnException: () => {},
    } as unknown as Parameters<typeof proxy>[1];
  }

  function makeRequest(url: string, cookies: Record<string, string> = {}) {
    const req = new Request(`http://localhost${url}`);
    const cookieHeader = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    if (cookieHeader) {
      Object.defineProperty(req, "cookies", {
        value: {
          get: (name: string) =>
            cookies[name] ? { name, value: cookies[name] } : undefined,
        },
      });
    } else {
      Object.defineProperty(req, "cookies", {
        value: { get: () => undefined },
      });
    }
    // Minimal nextUrl stub
    Object.defineProperty(req, "nextUrl", {
      value: new URL(`http://localhost${url}`),
    });
    return req as unknown as Parameters<typeof proxy>[0];
  }

  it("redirects unauthenticated user from /dashboard to /login", async () => {
    const req = makeRequest("/dashboard");
    const res = await proxy(req, makeEvent());
    expect(res?.status).toBe(307);
    const location = (res as Response).headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl=%2Fdashboard");
  });

  it("redirects unauthenticated user from /accounts to /login", async () => {
    const req = makeRequest("/accounts");
    const res = await proxy(req, makeEvent());
    expect(res?.status).toBe(307);
  });

  it("passes authenticated user through to /dashboard", async () => {
    const req = makeRequest("/dashboard", { gobank_sid: "some-sealed-value" });
    const res = await proxy(req, makeEvent());
    // NextResponse.next() returns a response with no redirect status
    expect(res?.status).not.toBe(307);
    expect(res?.status).not.toBe(308);
  });

  it("redirects authenticated user from /login to /dashboard", async () => {
    const req = makeRequest("/login", { gobank_sid: "some-sealed-value" });
    const res = await proxy(req, makeEvent());
    expect(res?.status).toBe(307);
    const location = (res as Response).headers.get("location");
    expect(location).toContain("/dashboard");
  });

  it("passes unauthenticated user through to /login", async () => {
    const req = makeRequest("/login");
    const res = await proxy(req, makeEvent());
    expect(res?.status).not.toBe(307);
  });

  it("passes public landing page through", async () => {
    const req = makeRequest("/");
    const res = await proxy(req, makeEvent());
    expect(res?.status).not.toBe(307);
  });
});
