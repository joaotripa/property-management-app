"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Plan, PRICING_PLANS } from "./types";

interface PricingCardsProps {
  /** Array of plans to display. Defaults to PRICING_PLANS */
  plans?: Plan[];
  /** Custom className for the container */
  className?: string;
  /** Whether to show the yearly/monthly toggle */
  showToggle?: boolean;
  /** Custom button handler. If not provided, uses default href behavior */
  onPlanSelect?: (plan: Plan, isYearly: boolean) => void;
  /** Default href for plan buttons when onPlanSelect is not provided */
  defaultHref?: string;
  /** Whether to show the bottom disclaimer and features */
  showDisclaimer?: boolean;
}

export function PricingCards({
  plans = PRICING_PLANS,
  className = "",
  showToggle = true,
  onPlanSelect,
  defaultHref = "/dashboard",
  showDisclaimer = true,
}: PricingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan, isYearly);
    }
  };

  return (
    <div className={className}>
      {showToggle && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white p-1 rounded-full border border-border">
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative hover:shadow-xl ${
              plan.popular
                ? "border-2 border-primary shadow-lg"
                : "border border-border"
            }`}
          >
            {plan.popular && (
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
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  <span className="text-lg font-normal">/month</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <div className="text-sm mt-1">
                    ${plan.monthlyPrice}/month billed monthly
                  </div>
                )}
                <div className="text-sm text-accent font-medium mt-2">
                  {plan.maxProperties}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {onPlanSelect ? (
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 font-semibold hover-scale rounded-full ${
                    plan.buttonVariant === "default"
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "border !border-primary !text-primary hover:!bg-primary hover:!text-white"
                  }`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              ) : (
                <a href={defaultHref} className="block">
                  <Button
                    className={`w-full py-3 font-semibold hover-scale rounded-full ${
                      plan.buttonVariant === "default"
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "border !border-primary !text-primary hover:!bg-primary hover:!text-white"
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showDisclaimer && (
        <div className="mt-16 text-center">
          <p className="mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-row justify-center items-center gap-8 text-sm">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-success mr-2" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-success mr-2" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-success mr-2" />
              24/7 support
            </div>
          </div>
        </div>
      )}
    </div>
  );
}