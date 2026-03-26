import { z } from "zod";

// ─── Login Schema
// Fields: username, password

export const loginSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .min(1, "Username is required"),

  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Register Schema
// Fields: username, full_name, email, password
// username : ^[a-z0-9_]+$  | min 3  | max 50
// full_name: min 2          | max 100
// email    : valid email format
// password : min 8

export const registerSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, digits, and underscores",
    ),

  full_name: z
    .string({ message: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),

  email: z
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string({ message: "Password is required" })
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
