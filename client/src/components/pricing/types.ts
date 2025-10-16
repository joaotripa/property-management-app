export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
}

export const PRICING_PLANS: Plan[] = [
  {
    name: "Starter",
    description: "Perfect for getting started",
    monthlyPrice: 8.99,
    yearlyPrice: 89.90,
    features: [
      "Up to 10 properties",
      "Complete property portfolio management",
      "Track every income & expense automatically",
      "Real-time cash flow insights & profitability analytics",
      "Beautiful visual reports & performance dashboards",
      "Smart property comparison & ranking tools",
      "Export financial data instantly",
      "Automated monthly metrics tracking",
    ],
    buttonText: "Start 14-day free trial",
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Pro",
    description: "Most popular for growing portfolios",
    monthlyPrice: 24.99,
    yearlyPrice: 249.90, 
    features: [
      "Up to 50 properties",
      "Everything in Starter plan",
      "Priority support",
    ],
    buttonText: "Start 14-day free trial",
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Business",
    description: "For serious property investors",
    monthlyPrice: 44.99,
    yearlyPrice: 449.90, 
    features: [
      "Unlimited properties",
      "Everything in Pro plan",
      "Early access to new features",
    ],
    buttonText: "Start 14-day free trial",
    buttonVariant: "outline",
    popular: false,
  },
];