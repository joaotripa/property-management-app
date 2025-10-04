"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useRedirectIfSignedIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirected = useRef(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsRedirecting(true);

      const isAuthPage = pathname === "/login" || pathname === "/signup";
      if (isAuthPage && !hasShownToast.current) {
        hasShownToast.current = true;
        toast.info("You're already signed in. Redirecting to dashboard...");
      }

      router.replace("/dashboard");
    }
  }, [status, session, router, pathname]);

  return { isRedirecting, isLoading: status === "loading" || isRedirecting };
}
