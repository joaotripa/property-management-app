"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxProperties: "1-2 properties",
      features: [
        "Basic property tracking",
        "Simple expense logging",
        "Monthly reports",
        "Email support",
        "Mobile app access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Standard",
      description: "Most popular for growing portfolios",
      monthlyPrice: 29,
      yearlyPrice: 24,
      maxProperties: "2-5 properties",
      features: [
        "Everything in Free",
        "Advanced analytics",
        "Automated rent tracking",
        "Tenant management",
        "Custom reports",
        "Priority support",
        "API access",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Pro",
      description: "For serious property investors",
      monthlyPrice: 59,
      yearlyPrice: 49,
      maxProperties: "5+ properties",
      features: [
        "Everything in Standard",
        "White-label reports",
        "Advanced integrations",
        "Bulk operations",
        "Custom workflows",
        "Dedicated account manager",
        "24/7 phone support",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Pricing
          </h2>
          <p className="text-xl text-dark max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your property portfolio.
          </p>

          <div className="inline-flex items-center bg-white p-1 rounded-full border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? "bg-primary text-white shadow-sm"
                  : "text-dark hover:text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isYearly
                  ? "bg-primary text-white shadow-sm"
                  : "text-dark hover:text-primary"
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-success text-white text-xs rounded-full">
                2 months off
              </span>
            </button>
          </div>
        </div>

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

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <p className="text-dark">{plan.description}</p>

                <div className="py-4">
                  <div className="text-4xl font-bold text-foreground">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="text-lg font-normal text-dark">
                      /month
                    </span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-dark mt-1">
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
                      <span className="text-dark">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard" className="block">
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
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-dark mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-dark">
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
      </div>
    </section>
  );
};

export default Pricing;
