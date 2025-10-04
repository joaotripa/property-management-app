import { z } from "zod";

// Password validation schema with security requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Email validation schema
const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .transform((val) => val.toLowerCase().trim());

// Signup validation schema
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Email verification schema
export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// Types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Helper function to check password strength
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: "Weak", color: "text-destructive" };
  } else if (score <= 4) {
    return { score, label: "Fair", color: "text-orange-500" };
  } else if (score <= 5) {
    return { score, label: "Good", color: "text-yellow-500" };
  } else {
    return { score, label: "Strong", color: "text-success" };
  }
}
