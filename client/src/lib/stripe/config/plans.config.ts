import { SubscriptionPlan } from '@prisma/client';
import { PlanConfig, PlanFeature } from '../core/types';

/**
 * Validate required Stripe price environment variables
 */
const requiredEnvVars = [
  'STRIPE_STARTER_MONTHLY_PRICE_ID',
  'STRIPE_STARTER_YEARLY_PRICE_ID',
  'STRIPE_PRO_MONTHLY_PRICE_ID',
  'STRIPE_PRO_YEARLY_PRICE_ID',
  'STRIPE_BUSINESS_MONTHLY_PRICE_ID',
  'STRIPE_BUSINESS_YEARLY_PRICE_ID',
] as const;

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Stripe environment variables: ${missingEnvVars.join(', ')}`
  );
}

/**
 * Common features shared across all plans
 */
const COMMON_FEATURES: PlanFeature[] = [
  {
    id: 'portfolio_management',
    name: 'Complete property portfolio management',
    enabled: true,
  },
  {
    id: 'transaction_tracking',
    name: 'Track every income & expense automatically',
    enabled: true,
  },
  {
    id: 'cash_flow_insights',
    name: 'Real-time cash flow insights & profitability analytics',
    enabled: true,
  },
  {
    id: 'visual_reports',
    name: 'Beautiful visual reports & performance dashboards',
    enabled: true,
  },
  {
    id: 'property_comparison',
    name: 'Smart property comparison & ranking tools',
    enabled: true,
  },
  {
    id: 'bulk_operations',
    name: 'Bulk operations to save hours of manual work',
    enabled: true,
  },
  {
    id: 'image_galleries',
    name: 'Professional image galleries for each property',
    enabled: true,
  },
  {
    id: 'multi_currency',
    name: 'Multi-currency & timezone support',
    enabled: true,
  },
  {
    id: 'data_export',
    name: 'Export financial data instantly',
    enabled: true,
  },
  {
    id: 'monthly_metrics',
    name: 'Automated monthly metrics tracking',
    enabled: true,
  },
];

/**
 * Plan configurations with resource limits
 *
 * Customize these to match your business model:
 * - Add/remove plans
 * - Adjust pricing
 * - Modify resource limits
 * - Add new limit types (storage, API calls, team members, etc.)
 */
export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    description: 'Perfect for getting started',
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
    monthlyPrice: 9,
    yearlyPrice: 90,
    limits: {
      properties: 10,
      transactions: 1000,
      storage: 1024, // 1GB in MB
      api_calls: 10000,
      team_members: 1,
    },
    features: COMMON_FEATURES,
    popular: false,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Most popular for growing portfolios',
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    monthlyPrice: 29,
    yearlyPrice: 290,
    limits: {
      properties: 50,
      transactions: 5000,
      storage: 5120, // 5GB in MB
      api_calls: 50000,
      team_members: 3,
    },
    features: COMMON_FEATURES,
    popular: true,
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    description: 'For serious property investors',
    monthlyPriceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!,
    monthlyPrice: 49,
    yearlyPrice: 490,
    limits: {
      properties: 999, // Effectively unlimited
      transactions: 50000,
      storage: 20480, // 20GB in MB
      api_calls: 200000,
      team_members: 10,
    },
    features: COMMON_FEATURES,
    popular: false,
  },
};

/**
 * Get plan configuration by ID
 */
export function getPlanConfig(planId: SubscriptionPlan): PlanConfig {
  const config = PLAN_CONFIGS[planId];
  if (!config) {
    throw new Error(`Plan configuration not found for: ${planId}`);
  }
  return config;
}

/**
 * Get all plan configurations
 */
export function getAllPlanConfigs(): PlanConfig[] {
  return Object.values(PLAN_CONFIGS);
}

/**
 * Get resource limit for a specific plan and resource type
 */
export function getResourceLimit(
  planId: SubscriptionPlan,
  resourceType: string
): number {
  const config = getPlanConfig(planId);
  const limit = config.limits[resourceType];

  if (limit === undefined) {
    throw new Error(
      `Resource limit not defined for resource type: ${resourceType} on plan: ${planId}`
    );
  }

  return limit;
}

/**
 * Get recommended plan based on resource requirements
 */
export function getRecommendedPlan(
  resourceType: string,
  requiredAmount: number
): SubscriptionPlan | null {
  const plans = getAllPlanConfigs();

  for (const plan of plans) {
    const limit = plan.limits[resourceType];
    if (limit !== undefined && limit >= requiredAmount) {
      return plan.id;
    }
  }

  return null;
}

/**
 * Compare two plans
 */
export function comparePlans(
  planA: SubscriptionPlan,
  planB: SubscriptionPlan
): number {
  const planOrder: Record<SubscriptionPlan, number> = {
    STARTER: 1,
    PRO: 2,
    BUSINESS: 3,
  };

  return planOrder[planA] - planOrder[planB];
}

/**
 * Check if plan upgrade is needed
 */
export function isUpgradeNeeded(
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan
): boolean {
  return comparePlans(targetPlan, currentPlan) > 0;
}

/**
 * Get next higher plan
 */
export function getNextPlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
  const planHierarchy: SubscriptionPlan[] = ['STARTER', 'PRO', 'BUSINESS'];
  const currentIndex = planHierarchy.indexOf(currentPlan);

  if (currentIndex === -1 || currentIndex === planHierarchy.length - 1) {
    return null;
  }

  return planHierarchy[currentIndex + 1];
}
