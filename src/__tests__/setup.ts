import { vi } from "vitest";

// ── Mock Next.js server-only modules
// These throw if imported outside a Next.js request context.
// Unit tests don't have that context, so we stub the parts our
// test subjects depend on.

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// server-only is a side-effect-only package that throws in non-server environments.
// Mock it as a no-op so modules with `import 'server-only'` load cleanly.
vi.mock("server-only", () => ({}));
