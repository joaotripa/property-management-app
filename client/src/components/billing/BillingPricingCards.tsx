"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PRICING_PLANS } from "@/components/pricing/types";

interface BillingPricingCardsProps {
  currentPlan: SubscriptionPlan;
  currentStatus: SubscriptionStatus;
  isYearly?: boolean;
  onPlanSelect: (plan: SubscriptionPlan, isYearly: boolean) => void;
}

const PLAN_ORDER: SubscriptionPlan[] = ["STARTER", "PRO", "BUSINESS"];

export function BillingPricingCards({
  currentPlan,
  currentStatus,
  isYearly: initialIsYearly = false,
  onPlanSelect,
}: BillingPricingCardsProps) {
  const [isYearly, setIsYearly] = useState(initialIsYearly);

  const hasActiveSubscription =
    currentStatus === "ACTIVE" || currentStatus === "TRIAL";

  const getCurrentPlanIndex = () => {
    return PLAN_ORDER.indexOf(currentPlan);
  };

  const getButtonConfig = (planName: string) => {
    const plan = planName.toUpperCase() as SubscriptionPlan;
    const planIndex = PLAN_ORDER.indexOf(plan);
    const currentIndex = getCurrentPlanIndex();

    if (!hasActiveSubscription) {
      return {
        text: "Upgrade",
        variant: "default" as const,
        disabled: false,
        action: "subscribe" as const,
      };
    }

    // Current plan
    if (planIndex === currentIndex) {
      return {
        text: "Current Plan",
        variant: "outline" as const,
        disabled: true,
        action: "current" as const,
      };
    }

    // Higher tier - Upgrade
    if (planIndex > currentIndex) {
      return {
        text: "Upgrade",
        variant: "default" as const,
        disabled: false,
        action: "upgrade" as const,
      };
    }

    // Lower tier - Downgrade
    return {
      text: "Downgrade",
      variant: "outline" as const,
      disabled: false,
      action: "downgrade" as const,
    };
  };

  const handlePlanClick = (planName: string) => {
    const plan = planName.toUpperCase() as SubscriptionPlan;
    const buttonConfig = getButtonConfig(planName);

    if (buttonConfig.disabled) return;

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
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
        {PRICING_PLANS.map((plan) => {
          const buttonConfig = getButtonConfig(plan.name);
          const isCurrentPlan = plan.name.toUpperCase() === currentPlan;
          const isPlanIndex = PLAN_ORDER.indexOf(
            plan.name.toUpperCase() as SubscriptionPlan
          );
          const currentIndex = getCurrentPlanIndex();

          return (
            <Card
              key={plan.name}
              className={`relative hover:shadow-xl transition-shadow flex flex-col ${
                isCurrentPlan
                  ? "border-2 border-primary shadow-lg"
                  : plan.popular && !isCurrentPlan
                    ? "border-2 border-primary shadow-lg"
                    : "border border-border"
              }`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-2">
                    Your Plan
                  </Badge>
                </div>
              )}

              {/* Popular Badge (only for Pro if not current plan) */}
              {plan.popular && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4 mt-2">
                <CardTitle className="text-2xl font-semibold">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground/80">{plan.description}</p>

                <div className="py-4">
                  <div className="text-4xl font-semibold">
                    $
                    {isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice}
                    <span className="text-lg font-normal">/month</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Billed ${(plan.yearlyPrice * 12).toFixed(0)}/year
                    </div>
                  )}
                  <div className="text-sm text-accent font-medium mt-2">
                    {plan.maxProperties}
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

                <div className="space-y-2">
                <Button
                  onClick={() => handlePlanClick(plan.name)}
                  disabled={buttonConfig.disabled}
                  className={`w-full py-3 font-semibold rounded-full ${
                    buttonConfig.variant === "default"
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "border border-primary text-primary hover:bg-primary hover:text-white"
                  } ${buttonConfig.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  variant={buttonConfig.variant}
                >
                  {buttonConfig.text}
                </Button>

                {/* Helper text for downgrades */}
                {buttonConfig.action === "downgrade" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Changes apply at end of billing period
                  </p>
                )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
