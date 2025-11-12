"use client";

import { useEffect, useRef } from "react";
import { useBillingData } from "@/hooks/queries/useBillingQueries";
import { trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";

/**
 * Tracks trial lifecycle events to Umami.
 * Uses useRef to avoid re-renders (tracking state doesn't affect UI).
 */
export function TrialEventTracker() {
  const { data: billing } = useBillingData();
  const trackedRef = useRef({ trialStarted: false, trialEnding: false });

  useEffect(() => {
    if (!billing?.subscription) return;

    const { subscription } = billing;

    // Track trial started (once per session)
    if (
      subscription.status === "TRIAL" &&
      subscription.trialEndsAt &&
      !trackedRef.current.trialStarted
    ) {
      trackEvent(BILLING_EVENTS.TRIAL_STARTED, {
        trial_days: subscription.trialDaysRemaining || 14,
      });
      trackedRef.current.trialStarted = true;
    }

    // Track trial ending soon (once per session, when ≤3 days remaining)
    if (
      subscription.status === "TRIAL" &&
      subscription.trialDaysRemaining !== null &&
      subscription.trialDaysRemaining !== undefined &&
      subscription.trialDaysRemaining <= 3 &&
      subscription.trialDaysRemaining >= 0 &&
      !trackedRef.current.trialEnding
    ) {
      trackEvent(BILLING_EVENTS.TRIAL_ENDING_SOON, {
        days_remaining: subscription.trialDaysRemaining,
      });
      trackedRef.current.trialEnding = true;
    }
  }, [billing]);

  return null;
}
