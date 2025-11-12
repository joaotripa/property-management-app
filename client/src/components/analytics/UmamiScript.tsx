"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { identifyUser, resetUser } from "@/lib/analytics/tracker";

/**
 * Identifies authenticated users with Umami analytics.
 * Runs once after Umami script loads.
 */
export function UmamiScript() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email || "",
        name: session.user.name || "",
      });
    } else if (status === "unauthenticated") {
      resetUser();
    }
  }, [status, session]);

  return null;
}
