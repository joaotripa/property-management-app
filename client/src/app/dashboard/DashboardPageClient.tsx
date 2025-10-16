"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/tracker";
import { DASHBOARD_EVENTS } from "@/lib/analytics/events";

interface DashboardPageClientProps {
  children: React.ReactNode;
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  useEffect(() => {
    trackEvent(DASHBOARD_EVENTS.DASHBOARD_VIEWED);
  }, []);

  return <>{children}</>;
}
