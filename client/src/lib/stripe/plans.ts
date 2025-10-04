import { SubscriptionPlan } from '@prisma/client';

export const PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for getting started',
    price: { monthly: 9, yearly: 90 },
    limits: { properties: 10 },
    features: [
      'Up to 10 properties',
      'Complete property portfolio management',
      'Track every income & expense automatically',
      'Real-time cash flow insights & profitability analytics',
      'Beautiful visual reports & performance dashboards',
      'Smart property comparison & ranking tools',
      'Automated monthly metrics tracking',
    ],
    popular: false,
  },
  PRO: {
    name: 'Pro',
    description: 'Most popular for growing portfolios',
    price: { monthly: 29, yearly: 290 },
    limits: { properties: 50 },
    features: [
      'Up to 50 properties',
      'Complete property portfolio management',
      'Track every income & expense automatically',
      'Real-time cash flow insights & profitability analytics',
      'Beautiful visual reports & performance dashboards',
      'Smart property comparison & ranking tools',
      'Automated monthly metrics tracking',
    ],
    popular: true,
  },
  BUSINESS: {
    name: 'Business',
    description: 'For serious property investors',
    price: { monthly: 49, yearly: 490 },
    limits: { properties: 999 },
    features: [
      'Unlimited properties',
      'Complete property portfolio management',
      'Track every income & expense automatically',
      'Real-time cash flow insights & profitability analytics',
      'Beautiful visual reports & performance dashboards',
      'Smart property comparison & ranking tools',
      'Automated monthly metrics tracking',
    ],
    popular: false,
  },
} as const;

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
