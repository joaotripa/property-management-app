"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PRICING_PLANS } from "@/lib/stripe/plans";
import { trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";

interface BillingPricingCardsProps {
  currentPlan: SubscriptionPlan;
  currentStatus: SubscriptionStatus;
  trialDaysRemaining?: number | null;
  isYearly?: boolean;
  onPlanSelect: (plan: SubscriptionPlan, isYearly: boolean) => void;
}

export function BillingPricingCards({
  isYearly: initialIsYearly = false,
  onPlanSelect,
}: BillingPricingCardsProps) {
  const [isYearly, setIsYearly] = useState(initialIsYearly);

  const handlePlanClick = (planName: string) => {
    const plan = planName.toUpperCase() as SubscriptionPlan;

    trackEvent(BILLING_EVENTS.PLAN_SELECTED, {
      plan: plan.toLowerCase(),
      billing_period: isYearly ? "yearly" : "monthly",
    });

    onPlanSelect(plan, isYearly);
  };

  return (
    <div>
      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-card p-1 rounded-full border border-border">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !isYearly
                ? "bg-primary text-white shadow-sm"
                : "hover:text-primary"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isYearly
                ? "bg-primary text-white shadow-sm"
                : "hover:text-primary"
            }`}
          >
            Yearly
            <span className="ml-2 px-2 py-1 bg-success text-white text-xs rounded-full">
              2 months off
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
        {PRICING_PLANS.map((plan) => {
          return (
            <Card
              key={plan.name}
              className={`relative hover:shadow-xl transition-shadow flex flex-col ${
                plan.popular
                  ? "border-2 border-primary shadow-lg"
                  : "border border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center mt-2">
                <CardTitle className="text-2xl font-semibold">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground/80">{plan.description}</p>

                <div className="py-4">
                  <div className="text-4xl font-semibold">
                    €{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="text-lg font-normal">
                      {isYearly ? "/year" : "/month"}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex flex-col flex-grow">
                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanClick(plan.name)}
                  className="w-full py-3 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white"
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
