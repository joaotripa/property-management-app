"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, AlertTriangle, X } from "lucide-react";
import { toCamelCase } from "@/lib/utils";

interface SubscriptionStatus {
  status: string;
  plan: string;
  propertyLimit: number;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
}

const DISMISSAL_KEY = "subscription-banner-dismissed";

export function SubscriptionExpiredBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem(DISMISSAL_KEY);
    if (sessionDismissed === "true") {
      setDismissed(true);
    }

    fetchBillingStatus();
  }, []);

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch("/api/billing/usage");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching billing status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSAL_KEY, "true");
    setDismissed(true);
  };

  const handleUpgrade = () => {
    router.push("/dashboard/settings?tab=billing");
  };

  if (loading || !subscription) {
    return null;
  }

  const getBannerConfig = (): {
    variant: "default" | "destructive" | "warning";
    icon: React.ReactNode;
    title: string;
    description: string;
    badge: string;
    canDismiss: boolean;
    actionLabel: string;
  } | null => {
    const trialDays = subscription.trialDaysRemaining ?? 0;

    // Trial states
    if (subscription.status === "TRIAL") {
      if (trialDays <= 0) {
        return {
          variant: "destructive",
          icon: <AlertTriangle className="h-4 w-4" />,
          title:
            trialDays === 0
              ? "Your free trial expires today!"
              : "Your free trial has expired!",
          description: `Upgrade now to continue using all ${subscription.plan} plan features.`,
          badge: `${toCamelCase(subscription.plan)} Plan`,
          canDismiss: false,
          actionLabel: "Upgrade Now",
        };
      } else if (trialDays <= 3) {
        return {
          variant: "warning",
          icon: <Clock className="h-4 w-4" />,
          title: `${trialDays} ${trialDays === 1 ? "day" : "days"} left in your free trial`,
          description:
            "Upgrade to continue accessing all premium features after your trial ends.",
          badge: `${toCamelCase(subscription.plan)} Plan`,
          canDismiss: true,
          actionLabel: "Upgrade Now",
        };
      }
    }

    // Canceled subscription
    if (subscription.status === "CANCELED") {
      return {
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Your subscription has been canceled",
        description: "Reactivate to continue managing your properties.",
        badge: `${toCamelCase(subscription.plan)} Plan`,
        canDismiss: false,
        actionLabel: "Reactivate",
      };
    }

    // Unpaid subscription
    if (subscription.status === "UNPAID") {
      return {
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Payment required to continue",
        description: "Update your payment method to restore access.",
        badge: `${toCamelCase(subscription.plan)} Plan`,
        canDismiss: false,
        actionLabel: "Update Payment",
      };
    }

    return null;
  };

  const config = getBannerConfig();

  if (!config || (dismissed && config.canDismiss)) {
    return null;
  }

  return (
    <Alert variant={config.variant} className="shadow-sm">
      {config.icon}
      <AlertDescription className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{config.title}</span>
            <Badge
              variant={
                config.variant === "destructive"
                  ? "destructive"
                  : config.variant === "warning"
                    ? "warning"
                    : "secondary"
              }
            >
              {config.badge}
            </Badge>
          </div>
          <span className="text-xs">{config.description}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={config.variant}
            onClick={handleUpgrade}
            className="flex-1"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {config.actionLabel}
          </Button>
          {config.canDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className={`${
                config.variant === "destructive"
                  ? "hover:bg-destructive hover:text-destructive-foreground"
                  : config.variant === "warning"
                    ? "hover:bg-warning hover:text-warning-foreground"
                    : ""
              }`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
