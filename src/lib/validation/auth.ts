import { z } from "zod";

// ─── Login Schema
export const loginSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(1, "Username is required"),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Register Schema
export const registerSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, digits, and underscores",
    ),

  full_name: z
    .string({ error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),

  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Action Response Types
export type ActionState<T = unknown> =
  | { status: "idle" }
  | { status: "success"; data?: T }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string[]>>;
    };

// ─── Zod v4 field-error extractor
// z.flattenError() replaces the deprecated error.flatten() from Zod v3.
// Returns { formErrors: string[], fieldErrors: Record<string, string[]> }
export function extractFieldErrors(
  error: z.ZodError,
): Partial<Record<string, string[]>> {
  const { fieldErrors } = z.flattenError(error);
  // fieldErrors values are string[] | undefined — cast to our ActionState shape
  return fieldErrors as Partial<Record<string, string[]>>;
}
