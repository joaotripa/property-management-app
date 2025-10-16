"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/tracker";
import { DASHBOARD_EVENTS } from "@/lib/analytics/events";

interface AnalyticsPageClientProps {
  children: React.ReactNode;
  timeRange: string;
  propertyId: string | null;
}

export function AnalyticsPageClient({
  children,
  timeRange,
  propertyId,
}: AnalyticsPageClientProps) {
  useEffect(() => {
    trackEvent(DASHBOARD_EVENTS.ANALYTICS_VIEWED, {
      time_range: timeRange,
      property_filter: propertyId,
    });
  }, [timeRange, propertyId]);

  return <>{children}</>;
}
