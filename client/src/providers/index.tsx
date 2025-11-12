"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "./QueryProvider";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { TrialEventTracker } from "@/components/analytics/TrialEventTracker";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <UmamiScript />
        <TrialEventTracker />
        {children}
      </SessionProvider>
    </QueryProvider>
  );
}
