"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import { toCamelCase } from "@/lib/utils";

interface SubscriptionInfoBannerProps {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  propertyCount: number;
  propertyLimit: number;
  trialDaysRemaining?: number | null;
  currentPeriodEnd?: Date | null;
}

export function SubscriptionInfoBanner({
  status,
  plan,
  propertyCount,
  propertyLimit,
  trialDaysRemaining,
  currentPeriodEnd,
}: SubscriptionInfoBannerProps) {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "TRIAL":
        return {
          variant: "default" as const,
          icon: <Clock className="h-4 w-4" />,
          badge: { label: "Free Trial", variant: "secondary" as const },
          title: toCamelCase(plan),
          description:
            trialDaysRemaining !== null && trialDaysRemaining !== undefined
              ? `${trialDaysRemaining} ${trialDaysRemaining === 1 ? "day" : "days"} remaining • ${propertyCount}/${propertyLimit} properties used`
              : `${propertyCount}/${propertyLimit} properties used`,
          showAction: false,
        };

      case "ACTIVE":
        return {
          variant: "default" as const,
          icon: <CheckCircle className="h-4 w-4" />,
          badge: { label: "Active", variant: "default" as const },
          title: toCamelCase(plan),
          description: currentPeriodEnd
            ? `${propertyCount}/${propertyLimit} properties used • Next billing: ${new Date(currentPeriodEnd).toLocaleDateString()}`
            : `${propertyCount}/${propertyLimit} properties used`,
          showAction: true,
          actionLabel: "Manage Billing",
        };

      case "PAST_DUE":
        return {
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          badge: { label: "Payment Required", variant: "destructive" as const },
          title: toCamelCase(plan),
          description: "Update payment method to continue service",
          showAction: true,
          actionLabel: "Update Payment",
        };

      case "CANCELED":
        return {
          variant: "default" as const,
          icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
          badge: { label: "Canceled", variant: "outline" as const },
          title: toCamelCase(plan),
          description: `Subscription canceled • ${propertyCount}/${propertyLimit} properties used`,
          showAction: false,
        };

      default:
        return {
          variant: "default" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          badge: { label: status, variant: "outline" as const },
          title: toCamelCase(plan),
          description: `${propertyCount}/${propertyLimit} properties used`,
          showAction: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert variant={config.variant} className="mb-6">
      {config.icon}
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            You're currently on plan:{" "}
            <span className="font-medium">{config.title}</span>
            {status === "TRIAL" && (
              <Badge variant={config.badge.variant}>{config.badge.label}</Badge>
            )}
            <span className="text-muted-foreground text-sm hidden sm:inline">
              •
            </span>
            <span className="text-muted-foreground text-sm">
              {config.description}
            </span>
          </div>
        </div>
        {config.showAction && (
          <Button
            size="sm"
            variant={config.variant === "destructive" ? "default" : "outline"}
            onClick={handleManageBilling}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
            {config.actionLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
