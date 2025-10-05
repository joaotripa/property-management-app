"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingPricingCards } from "@/components/billing/BillingPricingCards";
import { SubscriptionInfoBanner } from "@/components/billing/SubscriptionInfoBanner";
import { toast } from "sonner";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionData, Usage } from "@/hooks/queries/useBillingQueries";
import { getPaymentLink } from "@/lib/stripe/config";

interface BillingSettingsProps {
  subscription: SubscriptionData;
  usage: Usage;
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const handlePlanSelect = (plan: SubscriptionPlan, isYearly: boolean) => {
    try {
      const paymentLink = getPaymentLink(plan, isYearly);
      window.location.href = paymentLink;
    } catch (error) {
      console.error('Error getting payment link:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <SubscriptionInfoBanner
        status={subscription.status}
        plan={subscription.plan}
        propertyCount={usage.propertyCount}
        propertyLimit={subscription.propertyLimit}
        trialDaysRemaining={subscription.trialDaysRemaining}
        currentPeriodEnd={subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your property portfolio needs. You can upgrade or downgrade at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingPricingCards
            currentPlan={subscription.plan}
            currentStatus={subscription.status}
            onPlanSelect={handlePlanSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}