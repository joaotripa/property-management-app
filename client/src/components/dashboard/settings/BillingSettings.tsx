"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingPricingCards } from "@/components/billing/BillingPricingCards";
import { SubscriptionInfoBanner } from "@/components/billing/SubscriptionInfoBanner";
import { toast } from "sonner";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionData, Usage } from "@/hooks/queries/useBillingQueries";
import { getLimit } from "@/lib/stripe/plans";
import { useSession } from "next-auth/react";
import {
  createPortalSession,
  getPaymentLink,
  BillingServiceError,
} from "@/lib/services/client/billingService";

interface BillingSettingsProps {
  subscription: SubscriptionData;
  usage: Usage;
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const { data: session } = useSession();

  const handlePlanSelect = async (
    plan: SubscriptionPlan,
    isYearly: boolean
  ) => {
    try {
      const hasActiveSubscription = subscription.status === "ACTIVE";

      if (hasActiveSubscription) {
        const newLimit = getLimit(plan);
        const currentLimit = getLimit(subscription.plan);

        if (newLimit < currentLimit && usage.propertyCount > newLimit) {
          toast.error(
            `Cannot downgrade: You have ${usage.propertyCount} properties but ${plan} plan allows only ${newLimit}. Please delete some properties first.`
          );
          return;
        }

        const { url } = await createPortalSession({ plan, isYearly });
        window.location.href = url;
        return;
      }

      // Trial/Expired users use payment links to create new subscription
      const customerEmail = session?.user?.email || undefined;
      const paymentLink = getPaymentLink({ plan, isYearly, customerEmail });
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Error handling plan selection:", error);

      if (error instanceof BillingServiceError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <SubscriptionInfoBanner
        status={subscription.status}
        plan={subscription.plan}
        trialDaysRemaining={subscription.trialDaysRemaining}
        currentPeriodEnd={
          subscription.currentPeriodEnd
            ? new Date(subscription.currentPeriodEnd)
            : null
        }
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
        scheduledPlan={subscription.scheduledPlan}
        scheduledPlanDate={
          subscription.scheduledPlanDate
            ? new Date(subscription.scheduledPlanDate)
            : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your property portfolio needs. You
            can upgrade or downgrade at any time.
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
    </div>
  );
}
