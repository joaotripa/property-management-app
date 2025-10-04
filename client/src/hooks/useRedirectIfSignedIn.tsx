"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useRedirectIfSignedIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsRedirecting(true);
      toast.info("You're already signed in. Redirecting to dashboard...");
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  return { isRedirecting, isLoading: status === "loading" || isRedirecting };
}
