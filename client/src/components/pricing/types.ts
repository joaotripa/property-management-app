export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProperties: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
}

export const PRICING_PLANS: Plan[] = [
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
    buttonVariant: "outline",
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
    buttonVariant: "default",
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
    buttonVariant: "outline",
    popular: false,
  },
];