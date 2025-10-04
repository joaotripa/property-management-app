"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useRedirectIfSignedOut() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.warning("Your session has expired. Please sign in again.");
      router.replace("/login?message=session_expired");
    }
  }, [status, router]);
}
