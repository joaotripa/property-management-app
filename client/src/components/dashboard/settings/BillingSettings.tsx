"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BillingPricingCards } from "@/components/billing/BillingPricingCards";
import { toast } from "sonner";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionData } from "@/hooks/queries/useBillingQueries";
import { useSession } from "next-auth/react";
import {
  getPaymentLink,
  createPortalSession,
  BillingServiceError,
} from "@/lib/services/client/billingService";
import { CreditCard, ExternalLink, Loader2, CalendarDays } from "lucide-react";
import { toCamelCase } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BillingSettingsProps {
  subscription: SubscriptionData;
}

export function BillingSettings({ subscription }: BillingSettingsProps) {
  const { data: session } = useSession();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const hasActivePaidSubscription = subscription.status === "ACTIVE";

  const getSubscriptionDateInfo = () => {
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      return {
        label: "Cancels on",
        date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
        variant: "destructive" as const,
      };
    }

    if (subscription.scheduledPlan && subscription.scheduledPlanDate) {
      return {
        label: `Switching to ${toCamelCase(subscription.scheduledPlan)} on`,
        date: new Date(subscription.scheduledPlanDate).toLocaleDateString(),
        variant: "secondary" as const,
      };
    }

    if (subscription.currentPeriodEnd) {
      return {
        label: "Next billing",
        date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
        variant: "secondary" as const,
      };
    }

    return null;
  };

  const subscriptionDateInfo = getSubscriptionDateInfo();

  const handlePlanSelect = async (
    plan: SubscriptionPlan,
    isYearly: boolean
  ) => {
    try {
      const customerEmail = session?.user?.email || undefined;
      const paymentLink = getPaymentLink({ plan, isYearly, customerEmail });
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Error getting payment link:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      if (error instanceof BillingServiceError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to open billing portal. Please try again.");
      }
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasActivePaidSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your subscription, update payment methods, change plans,
              and view invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Current Plan:
                  </span>
                  <Badge variant="default" className="text-sm font-medium">
                    {toCamelCase(subscription.plan)}
                  </Badge>
                </div>
                {subscriptionDateInfo && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {subscriptionDateInfo.label}:
                    </span>
                    <span className="text-muted-foreground">
                      {subscriptionDateInfo.date}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                variant="outline"
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    Manage Subscription
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your property portfolio needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingPricingCards
              currentPlan={subscription.plan}
              currentStatus={subscription.status}
              trialDaysRemaining={subscription.trialDaysRemaining}
              onPlanSelect={handlePlanSelect}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
