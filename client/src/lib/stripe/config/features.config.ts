import { SubscriptionPlan } from '@prisma/client';
import { ResourceType, ResourceLimitConfig } from '../core/types';

/**
 * Resource limit configurations
 *
 * Define how each resource type should be calculated:
 * - count: Simple count of records
 * - sum: Sum a specific field
 * - custom: Custom function to calculate usage
 */
export const RESOURCE_LIMIT_CONFIGS: Record<ResourceType, ResourceLimitConfig> = {
  properties: {
    resourceType: 'properties',
    strategy: 'count',
  },
  transactions: {
    resourceType: 'transactions',
    strategy: 'count',
  },
  storage: {
    resourceType: 'storage',
    strategy: 'sum',
    field: 'size',
  },
  api_calls: {
    resourceType: 'api_calls',
    strategy: 'count',
  },
  team_members: {
    resourceType: 'team_members',
    strategy: 'count',
  },
};

/**
 * Feature flags per plan
 *
 * Use this to enable/disable specific features for different plans
 */
export const PLAN_FEATURE_FLAGS: Record<
  SubscriptionPlan,
  Record<string, boolean>
> = {
  STARTER: {
    advanced_analytics: false,
    api_access: false,
    priority_support: false,
    custom_branding: false,
    data_export: true,
    bulk_operations: true,
  },
  PRO: {
    advanced_analytics: true,
    api_access: true,
    priority_support: true,
    custom_branding: false,
    data_export: true,
    bulk_operations: true,
  },
  BUSINESS: {
    advanced_analytics: true,
    api_access: true,
    priority_support: true,
    custom_branding: true,
    data_export: true,
    bulk_operations: true,
  },
};

/**
 * Check if a feature is enabled for a plan
 */
export function isFeatureEnabled(
  plan: SubscriptionPlan,
  featureKey: string
): boolean {
  return PLAN_FEATURE_FLAGS[plan]?.[featureKey] ?? false;
}

/**
 * Get all enabled features for a plan
 */
export function getEnabledFeatures(plan: SubscriptionPlan): string[] {
  const features = PLAN_FEATURE_FLAGS[plan];
  if (!features) return [];

  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
}

/**
 * Get resource limit configuration
 */
export function getResourceLimitConfig(
  resourceType: ResourceType
): ResourceLimitConfig {
  const config = RESOURCE_LIMIT_CONFIGS[resourceType];
  if (!config) {
    throw new Error(`Resource limit config not found for: ${resourceType}`);
  }
  return config;
}

/**
 * Soft limit thresholds (percentage of limit to trigger warnings)
 */
export const SOFT_LIMIT_THRESHOLDS = {
  warning: 0.8, // Warn at 80% usage
  critical: 0.95, // Critical warning at 95% usage
} as const;

/**
 * Check if usage has reached soft limit threshold
 */
export function hasSoftLimitWarning(
  currentUsage: number,
  limit: number
): { warning: boolean; critical: boolean; percentage: number } {
  const percentage = limit > 0 ? currentUsage / limit : 0;

  return {
    warning: percentage >= SOFT_LIMIT_THRESHOLDS.warning,
    critical: percentage >= SOFT_LIMIT_THRESHOLDS.critical,
    percentage,
  };
}
