import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SignInResource } from "@clerk/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClerkErrorMessage(err: unknown): string {
  interface ClerkError {
    errors?: { message?: string }[];
    message?: string;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "errors" in err &&
    Array.isArray((err as ClerkError).errors) &&
    (err as ClerkError).errors?.[0]?.message
  ) {
    return (err as ClerkError).errors![0].message!;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as ClerkError).message === "string"
  ) {
    return (err as ClerkError).message!;
  }
  return "An unknown error occurred. Please try again.";
}

export async function handleGoogleAuth({ signIn, setLoading, toast }: {
  signIn?: SignInResource | null;
  setLoading: (loading: boolean) => void;
  toast: { error: (msg: string) => void };
}) {
  if (!signIn) return;
  setLoading(true);
  try {
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/callback",
      redirectUrlComplete: "/dashboard",
    });
  } catch (err) {
    console.log(err);
    toast.error("Google sign-in failed. Please try again.");
  } finally {
    setLoading(false);
  }
}
