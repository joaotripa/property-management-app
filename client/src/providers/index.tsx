"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "./QueryProvider";
import { AnalyticsIdentifier } from "@/lib/analytics/AnalyticsIdentifier";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <AnalyticsIdentifier>{children}</AnalyticsIdentifier>
      </SessionProvider>
    </QueryProvider>
  );
}
