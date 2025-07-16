import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClerkErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "errors" in err &&
    Array.isArray((err as any).errors) &&
    (err as any).errors[0]?.message
  ) {
    return (err as any).errors[0].message;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as any).message === "string"
  ) {
    return (err as any).message;
  }
  return "An unknown error occurred. Please try again.";
}

export async function handleGoogleAuth({ signIn, setLoading, toast }: {
  signIn: any;
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
