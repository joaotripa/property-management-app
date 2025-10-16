"use client";

import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "./PostHogProvider";
import QueryProvider from "./QueryProvider";
import { AnalyticsIdentifier } from "@/lib/analytics/AnalyticsIdentifier";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <QueryProvider>
        <SessionProvider>
          <AnalyticsIdentifier>{children}</AnalyticsIdentifier>
        </SessionProvider>
      </QueryProvider>
    </PostHogProvider>
  );
}
