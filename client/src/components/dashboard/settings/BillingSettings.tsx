"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Plan } from "@/components/pricing/types";
import { toast } from "sonner";

export function BillingSettings() {
  const handlePlanSelect = (plan: Plan, isYearly: boolean) => {
    // In a real implementation, this would handle plan selection/upgrade
    toast.info(`Selected ${plan.name} plan (${isYearly ? 'Yearly' : 'Monthly'}). Redirecting to checkout...`);
    
    // Here you would typically:
    // 1. Create a checkout session
    // 2. Redirect to payment provider
    // 3. Handle subscription creation/update
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your property portfolio needs. You can upgrade or downgrade at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingCards
            showToggle={true}
            showDisclaimer={false}
            onPlanSelect={handlePlanSelect}
            className="max-w-6xl mx-auto"
          />
        </CardContent>
      </Card>
    </div>
  );
}