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
    name: "Starter",
    description: "Perfect for getting started",
    monthlyPrice: 9,
    yearlyPrice: 7.5, // $90/year = $7.5/month
    maxProperties: "Up to 10 properties",
    features: [
      "Complete property portfolio management",
      "Track every income & expense automatically",
      "Real-time cash flow insights & profitability analytics",
      "Beautiful visual reports & performance dashboards",
      "Smart property comparison & ranking tools",
      "Bulk operations to save hours of manual work",
      "Professional image galleries for each property",
      "Multi-currency & timezone support",
      "Export financial data instantly",
      "Automated monthly metrics tracking",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Pro",
    description: "Most popular for growing portfolios",
    monthlyPrice: 29,
    yearlyPrice: 24.17, // $290/year = $24.17/month
    maxProperties: "Up to 50 properties",
    features: [
      "Complete property portfolio management",
      "Track every income & expense automatically",
      "Real-time cash flow insights & profitability analytics",
      "Beautiful visual reports & performance dashboards",
      "Smart property comparison & ranking tools",
      "Bulk operations to save hours of manual work",
      "Professional image galleries for each property",
      "Multi-currency & timezone support",
      "Export financial data instantly",
      "Automated monthly metrics tracking",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Business",
    description: "For serious property investors",
    monthlyPrice: 49,
    yearlyPrice: 40.83, // $490/year = $40.83/month
    maxProperties: "Unlimited properties",
    features: [
      "Complete property portfolio management",
      "Track every income & expense automatically",
      "Real-time cash flow insights & profitability analytics",
      "Beautiful visual reports & performance dashboards",
      "Smart property comparison & ranking tools",
      "Bulk operations to save hours of manual work",
      "Professional image galleries for each property",
      "Multi-currency & timezone support",
      "Export financial data instantly",
      "Automated monthly metrics tracking",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "outline",
    popular: false,
  },
];