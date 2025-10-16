"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, X } from "lucide-react";

import { trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";

interface PropertyLimitBannerProps {
  propertyCount: number;
  propertyLimit: number;
  isAtLimit: boolean;
  plan: string;
  subscriptionStatus: string;
}

const DISMISSAL_KEY = "property-limit-banner-dismissed";

export function PropertyLimitBanner({
  propertyLimit,
  isAtLimit,
  plan,
  subscriptionStatus,
}: PropertyLimitBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem(DISMISSAL_KEY);
    if (sessionDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    const isSubscriptionActive = subscriptionStatus === "ACTIVE";
    if (isAtLimit && isSubscriptionActive && !dismissed) {
      trackEvent(BILLING_EVENTS.PROPERTY_LIMIT_REACHED, {
        current_plan: plan.toLowerCase(),
      });
    }
  }, [isAtLimit, subscriptionStatus, dismissed, plan]);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSAL_KEY, "true");
    setDismissed(true);
  };

  const handleUpgrade = () => {
    router.push("/dashboard/settings");
  };

  const isSubscriptionActive = subscriptionStatus === "ACTIVE";

  if (!isAtLimit || !isSubscriptionActive || dismissed) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                You&apos;ve reached your property limit of {propertyLimit}
              </span>
              <Badge variant="destructive">{plan} Plan</Badge>
            </div>
            <span className="text-sm">
              Upgrade your plan to add more properties and continue growing your
              portfolio.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default" onClick={handleUpgrade}>
            <CreditCard className="h-3 w-3 mr-1" />
            Upgrade Plan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
