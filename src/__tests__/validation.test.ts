import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  extractFieldErrors,
} from "@/lib/validation/auth";

// ─── loginSchema
describe("loginSchema", () => {
  it("passes with valid credentials", () => {
    const result = loginSchema.safeParse({
      username: "john_doe",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("fails when username is empty", () => {
    const result = loginSchema.safeParse({ username: "", password: "secret" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = z.flattenError(result.error);
      expect(flat.fieldErrors.username).toBeDefined();
    }
  });

  it("fails when password is empty", () => {
    const result = loginSchema.safeParse({ username: "john", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = z.flattenError(result.error);
      expect(flat.fieldErrors.password).toBeDefined();
    }
  });

  it("fails when both fields are missing", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = z.flattenError(result.error);
      expect(flat.fieldErrors.username).toBeDefined();
      expect(flat.fieldErrors.password).toBeDefined();
    }
  });
});

// ─── registerSchema
describe("registerSchema", () => {
  const valid = {
    username: "john_doe_123",
    full_name: "John Doe",
    email: "john@example.com",
    password: "securepassword",
  };

  it("passes with all valid fields", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects username shorter than 3 chars", () => {
    const r = registerSchema.safeParse({ ...valid, username: "ab" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(z.flattenError(r.error).fieldErrors.username).toBeDefined();
    }
  });

  it("rejects username longer than 50 chars", () => {
    const r = registerSchema.safeParse({
      ...valid,
      username: "a".repeat(51),
    });
    expect(r.success).toBe(false);
  });

  it("rejects username with uppercase letters", () => {
    const r = registerSchema.safeParse({ ...valid, username: "JohnDoe" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const msg = z.flattenError(r.error).fieldErrors.username?.[0];
      expect(msg).toMatch(/lowercase/i);
    }
  });

  it("rejects username with spaces", () => {
    const r = registerSchema.safeParse({ ...valid, username: "john doe" });
    expect(r.success).toBe(false);
  });

  it("accepts username with underscores and digits", () => {
    expect(
      registerSchema.safeParse({ ...valid, username: "john_doe_123" }).success,
    ).toBe(true);
  });

  it("rejects full_name shorter than 2 chars", () => {
    const r = registerSchema.safeParse({ ...valid, full_name: "J" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(z.flattenError(r.error).fieldErrors.email).toBeDefined();
    }
  });

  it("rejects password shorter than 8 chars", () => {
    const r = registerSchema.safeParse({ ...valid, password: "short" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(z.flattenError(r.error).fieldErrors.password).toBeDefined();
    }
  });

  it("rejects when all fields are missing", () => {
    const r = registerSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) {
      const flat = z.flattenError(r.error);
      expect(Object.keys(flat.fieldErrors).length).toBeGreaterThanOrEqual(4);
    }
  });
});

// ─── extractFieldErrors
describe("extractFieldErrors", () => {
  it("returns a flat record of field → string[]", () => {
    const result = registerSchema.safeParse({
      username: "AB", // fails: uppercase + too short
      full_name: "J", // fails: too short
      email: "bad",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = extractFieldErrors(result.error);
      expect(errors).toHaveProperty("username");
      expect(errors).toHaveProperty("email");
      expect(errors).toHaveProperty("password");
      // Each value should be an array of strings
      expect(Array.isArray(errors.username)).toBe(true);
      expect(typeof errors.username![0]).toBe("string");
    }
  });

  it("returns an empty object for a valid parse (should not be called)", () => {
    // Defensive: if somehow called with a zero-error ZodError
    const fakeError = new z.ZodError([]);
    const errors = extractFieldErrors(fakeError);
    expect(Object.keys(errors).length).toBe(0);
  });
});
