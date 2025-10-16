"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { trackEvent } from "@/lib/analytics/tracker";

interface PageViewTrackerProps {
  children: React.ReactNode;
  event: string;
  properties?: Record<string, string | number | boolean | null>;
}

export function PageViewTracker({
  children,
  event,
  properties,
}: PageViewTrackerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    trackEvent(posthog, event, properties);
  }, [posthog, event, properties]);

  return <>{children}</>;
}
