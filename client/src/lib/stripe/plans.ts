import { SubscriptionPlan } from '@prisma/client';

export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  popular: boolean;
}

export const PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for getting started',
    price: { monthly: 8.99, yearly: 89.90 },
    limits: { properties: 10 },
    features: [
      'Up to 10 properties',
      'Complete property portfolio management',
      'Track every income & expense in one place',
      'Real-time cash flow insights & profitability analytics',
      'Beautiful visual reports & performance dashboards',
      'Smart property comparison & ranking tools',
      'Export financial data instantly',
      'Monthly metrics calculated instantly',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'outline' as const,
    popular: false,
  },
  PRO: {
    name: 'Pro',
    description: 'Most popular for growing portfolios',
    price: { monthly: 24.99, yearly: 249.90 },
    limits: { properties: 50 },
    features: [
      'Up to 50 properties',
      'Everything in Starter plan',
      'Priority support',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'default' as const,
    popular: true,
  },
  BUSINESS: {
    name: 'Business',
    description: 'For serious property investors',
    price: { monthly: 44.99, yearly: 449.90 },
    limits: { properties: 9999 },
    features: [
      'Unlimited properties',
      'Everything in Pro plan',
      'Early access to new features',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'outline' as const,
    popular: false,
  },
} as const;

export const PRICING_PLANS: Plan[] = [
  {
    name: 'Starter',
    description: 'Perfect for getting started',
    monthlyPrice: 8.99,
    yearlyPrice: 89.90,
    features: [
      'Up to 10 properties',
      'Complete property portfolio management',
      'Track every income & expense in one place',
      'Real-time cash flow insights & profitability analytics',
      'Beautiful visual reports & performance dashboards',
      'Smart property comparison & ranking tools',
      'Export financial data instantly',
      'Monthly metrics calculated instantly',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Most popular for growing portfolios',
    monthlyPrice: 24.99,
    yearlyPrice: 249.90,
    features: [
      'Up to 50 properties',
      'Everything in Starter plan',
      'Priority support',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'default',
    popular: true,
  },
  {
    name: 'Business',
    description: 'For serious property investors',
    monthlyPrice: 44.99,
    yearlyPrice: 449.90,
    features: [
      'Unlimited properties',
      'Everything in Pro plan',
      'Early access to new features',
    ],
    buttonText: 'Start 14-day free trial',
    buttonVariant: 'outline',
    popular: false,
  },
];

export function getPlan(planId: SubscriptionPlan) {
  return PLANS[planId];
}

export function getLimit(planId: SubscriptionPlan) {
  return PLANS[planId].limits.properties;
}

export function getAllPlans() {
  return Object.values(PLANS);
}

export function canUpgrade(currentPlan: SubscriptionPlan): boolean {
  const order: SubscriptionPlan[] = ['STARTER', 'PRO', 'BUSINESS'];
  return order.indexOf(currentPlan) < order.length - 1;
}

export function getNextPlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
  const order: SubscriptionPlan[] = ['STARTER', 'PRO', 'BUSINESS'];
  const currentIndex = order.indexOf(currentPlan);
  return order[currentIndex + 1] || null;
}
