"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { identifyUser, resetUser, trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";

/**
 * Analytics Identifier Component
 *
 * Identifies authenticated users with PostHog.
 * Must be nested inside SessionProvider to access session.
 */
export function AnalyticsIdentifier({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const posthog = usePostHog();
  const [trialTracked, setTrialTracked] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { id, email, name } = session.user;

      if (!id) return;

      identifyUser(posthog, id, {
        email: email || "",
        name: name || "",
      });
    } else if (status === "unauthenticated") {
      resetUser(posthog);
    }
  }, [status, session, posthog]);

  useEffect(() => {
    const checkAndTrackTrial = async () => {
      if (status !== "authenticated" || !session?.user?.id || trialTracked) {
        return;
      }

      const trialTrackedKey = `trial_tracked_${session.user.id}`;
      const hasTracked = localStorage.getItem(trialTrackedKey);

      if (hasTracked) {
        setTrialTracked(true);
        return;
      }

      try {
        const response = await fetch("/api/billing/subscription");
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === "TRIAL" && data.trialEndsAt) {
          trackEvent(posthog, BILLING_EVENTS.TRIAL_STARTED, {
            trial_days: data.trialDaysRemaining || 14,
          });

          localStorage.setItem(trialTrackedKey, "true");
          setTrialTracked(true);
        }
      } catch (error) {
        console.error("[Analytics] Failed to check trial status:", error);
      }
    };

    checkAndTrackTrial();
  }, [status, session, posthog, trialTracked]);

  useEffect(() => {
    const checkTrialEndingSoon = async () => {
      if (status !== "authenticated" || !session?.user?.id) {
        return;
      }

      const trialEndingKey = `trial_ending_tracked_${session.user.id}`;
      const hasTrackedEnding = localStorage.getItem(trialEndingKey);

      if (hasTrackedEnding) {
        return;
      }

      try {
        const response = await fetch("/api/billing/subscription");
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === "TRIAL" && data.trialDaysRemaining !== null) {
          const daysRemaining = data.trialDaysRemaining;

          if (daysRemaining <= 3 && daysRemaining >= 0) {
            trackEvent(posthog, BILLING_EVENTS.TRIAL_ENDING_SOON, {
              days_remaining: daysRemaining,
            });

            localStorage.setItem(trialEndingKey, "true");
          }
        }
      } catch (error) {
        console.error("[Analytics] Failed to check trial ending:", error);
      }
    };

    checkTrialEndingSoon();
  }, [status, session, posthog]);

  return <>{children}</>;
}
