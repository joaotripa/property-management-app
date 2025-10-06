"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useSessionExpiredToast() {
  const { status } = useSession();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current === "authenticated" && status === "unauthenticated") {
      toast.warning("Your session has expired. Please sign in again.");
    }
    prevStatus.current = status;
  }, [status]);
}
