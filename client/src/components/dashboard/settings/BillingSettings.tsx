"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingPricingCards } from "@/components/billing/BillingPricingCards";
import { SubscriptionInfoBanner } from "@/components/billing/SubscriptionInfoBanner";
import { SubscriptionChangeDialog } from "@/components/billing/SubscriptionChangeDialog";
import { toast } from "sonner";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionData, Usage } from "@/hooks/queries/useBillingQueries";
import { getLimit } from "@/lib/stripe/plans";
import { useSession } from "next-auth/react";
import {
  getSubscriptionPreview,
  updateSubscription,
  getPaymentLink,
  BillingServiceError,
} from "@/lib/services/client/billingService";
import { useRouter } from "next/navigation";

interface BillingSettingsProps {
  subscription: SubscriptionData;
  usage: Usage;
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [selectedIsYearly, setSelectedIsYearly] = useState(false);
  const [preview, setPreview] = useState<{
    isUpgrade: boolean;
    currentPlan: string;
    newPlan: string;
    immediateChargeAmount: number;
    nextBillingDate: string;
    message: string;
  } | null>(null);

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

        // Show confirmation dialog with preview
        try {
          const previewData = await getSubscriptionPreview({ plan, isYearly });
          setPreview(previewData);
          setSelectedPlan(plan);
          setSelectedIsYearly(isYearly);
          setDialogOpen(true);
        } catch (error) {
          console.error("Error getting preview:", error);
          toast.error("Failed to get subscription preview. Please try again.");
        }
        return;
      }

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

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    try {
      const result = await updateSubscription({
        plan: selectedPlan,
        isYearly: selectedIsYearly,
      });
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error("Error updating subscription:", error);
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

      {preview && (
        <SubscriptionChangeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          isYearly={selectedIsYearly}
          preview={preview}
          onConfirm={handleConfirmChange}
        />
      )}
    </div>
  );
}
