"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { identifyUser, resetUser, trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";
import { useBillingData } from "@/hooks/queries/useBillingQueries";

/**
 * Analytics Identifier Component
 *
 * Identifies authenticated users with Umami and tracks trial events.
 * - Tracks TRIAL_STARTED when user begins trial (once per user)
 * - Tracks TRIAL_ENDING_SOON when trial has 3 or fewer days remaining
 *
 * Must be nested inside SessionProvider to access session.
 */
export function AnalyticsIdentifier({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { data: billingData } = useBillingData();
  const [trialStartTracked, setTrialStartTracked] = useState(false);
  const [trialEndingTracked, setTrialEndingTracked] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { id, email, name } = session.user;

      if (!id) return;

      identifyUser(id, {
        email: email || "",
        name: name || "",
      });
    } else if (status === "unauthenticated") {
      resetUser();
    }
  }, [status, session]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !billingData) {
      return;
    }

    const userId = session.user.id;
    const { subscription } = billingData;

    if (
      !trialStartTracked &&
      subscription.status === "TRIAL" &&
      subscription.trialEndsAt
    ) {
      const trialTrackedKey = `trial_tracked_${userId}`;
      const hasTracked = localStorage.getItem(trialTrackedKey);

      if (!hasTracked) {
        trackEvent(BILLING_EVENTS.TRIAL_STARTED, {
          trial_days: subscription.trialDaysRemaining || 14,
        });

        localStorage.setItem(trialTrackedKey, "true");
        setTrialStartTracked(true);
      } else {
        setTrialStartTracked(true);
      }
    }

    if (
      !trialEndingTracked &&
      subscription.status === "TRIAL" &&
      subscription.trialDaysRemaining !== null &&
      subscription.trialDaysRemaining !== undefined
    ) {
      const trialEndingKey = `trial_ending_tracked_${userId}`;
      const hasTrackedEnding = localStorage.getItem(trialEndingKey);
      const daysRemaining = subscription.trialDaysRemaining;

      if (!hasTrackedEnding && daysRemaining <= 3 && daysRemaining >= 0) {
        trackEvent(BILLING_EVENTS.TRIAL_ENDING_SOON, {
          days_remaining: daysRemaining,
        });

        localStorage.setItem(trialEndingKey, "true");
        setTrialEndingTracked(true);
      } else if (hasTrackedEnding) {
        setTrialEndingTracked(true);
      }
    }
  }, [status, session, billingData, trialStartTracked, trialEndingTracked]);

  return <>{children}</>;
}
