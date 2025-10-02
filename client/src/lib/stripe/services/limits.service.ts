import { prisma } from '@/lib/config/database';
import { SubscriptionStatus } from '@prisma/client';
import {
  ResourceType,
  ResourceLimitCheck,
  ResourceUsageAnalytics,
  UpgradeRecommendation,
} from '../core/types';
import {
  ResourceLimitError,
  TrialExpiredError,
  InactiveSubscriptionError,
  SubscriptionNotFoundError,
} from '../core/errors';
import { getResourceLimit, getNextPlan } from '../config/plans.config';
import {
  getResourceLimitConfig,
  hasSoftLimitWarning,
} from '../config/features.config';
import { isTrialExpired } from '../config/trial.config';
import { logger } from '../core/logger';

/**
 * Check if user can use a specific resource based on their subscription
 */
export async function checkResourceLimit(
  userId: string,
  resourceType: ResourceType
): Promise<ResourceLimitCheck> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!subscription) {
      logger.warn('Subscription not found for resource limit check', {
        userId,
        resourceType,
      });

      return {
        allowed: false,
        currentUsage: 0,
        limit: 0,
        remaining: 0,
        isAtLimit: true,
        subscriptionStatus: 'CANCELED',
        isTrialExpired: false,
        reason: 'No subscription found',
      };
    }

    const currentUsage = await calculateResourceUsage(userId, resourceType);
    const limit = getResourceLimit(subscription.plan, resourceType);
    const remaining = Math.max(0, limit - currentUsage);
    const isAtLimit = currentUsage >= limit;
    const trialExpired = isTrialExpired(subscription.trialEndsAt);

    const allowed =
      !trialExpired &&
      !isAtLimit &&
      (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL');

    logger.resourceLimitCheck(
      userId,
      resourceType,
      currentUsage,
      limit,
      allowed
    );

    return {
      allowed,
      currentUsage,
      limit,
      remaining,
      isAtLimit,
      subscriptionStatus: subscription.status,
      isTrialExpired: trialExpired,
      reason: !allowed
        ? getReasonForDenial(subscription.status, isAtLimit, trialExpired)
        : undefined,
    };
  } catch (error) {
    logger.error('Error checking resource limit', error as Error, {
      userId,
      resourceType,
    });

    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      remaining: 0,
      isAtLimit: true,
      subscriptionStatus: 'CANCELED',
      isTrialExpired: false,
      reason: 'Error checking limits',
    };
  }
}

/**
 * Enforce resource limit before allowing an operation
 * Throws an error if the limit is exceeded
 */
export async function enforceResourceLimit(
  userId: string,
  resourceType: ResourceType,
  customErrorMessage?: string
): Promise<void> {
  const limitCheck = await checkResourceLimit(userId, resourceType);

  if (!limitCheck.allowed) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new SubscriptionNotFoundError(userId);
    }

    if (limitCheck.isTrialExpired && subscription.trialEndsAt) {
      throw new TrialExpiredError(subscription.trialEndsAt);
    }

    if (
      limitCheck.subscriptionStatus === 'CANCELED' ||
      limitCheck.subscriptionStatus === 'UNPAID'
    ) {
      throw new InactiveSubscriptionError(limitCheck.subscriptionStatus);
    }

    if (limitCheck.isAtLimit) {
      throw new ResourceLimitError(
        resourceType,
        limitCheck.currentUsage,
        limitCheck.limit,
        subscription.plan
      );
    }

    throw new Error(
      customErrorMessage || limitCheck.reason || 'Unable to perform operation'
    );
  }
}

/**
 * Calculate current usage for a resource type
 */
async function calculateResourceUsage(
  userId: string,
  resourceType: ResourceType
): Promise<number> {
  const config = getResourceLimitConfig(resourceType);

  switch (resourceType) {
    case 'properties':
      return await prisma.property.count({
        where: { userId, deletedAt: null },
      });

    case 'transactions':
      return await prisma.transaction.count({
        where: { userId, deletedAt: null },
      });

    case 'storage':
      // Placeholder - implement based on your storage tracking
      return 0;

    case 'api_calls':
      // Placeholder - implement based on your API call tracking
      return 0;

    case 'team_members':
      // Placeholder - implement based on your team member tracking
      return 1; // Owner counts as 1

    default:
      if (config.customCheck) {
        return await config.customCheck(userId);
      }
      return 0;
  }
}

/**
 * Get reason for denial
 */
function getReasonForDenial(
  status: SubscriptionStatus,
  isAtLimit: boolean,
  isTrialExpired: boolean
): string {
  if (isTrialExpired) {
    return 'Trial has expired';
  }

  if (status === 'CANCELED' || status === 'UNPAID') {
    return 'Subscription is inactive';
  }

  if (isAtLimit) {
    return 'Resource limit reached';
  }

  return 'Unable to perform operation';
}

/**
 * Get usage analytics for a resource
 */
export async function getResourceUsageAnalytics(
  userId: string,
  resourceType: ResourceType
): Promise<ResourceUsageAnalytics> {
  const limitCheck = await checkResourceLimit(userId, resourceType);
  const usagePercentage =
    limitCheck.limit > 0
      ? (limitCheck.currentUsage / limitCheck.limit) * 100
      : 0;

  const softLimit = hasSoftLimitWarning(
    limitCheck.currentUsage,
    limitCheck.limit
  );

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const recommendedPlan = softLimit.critical
    ? getNextPlan(subscription?.plan || 'STARTER')
    : undefined;

  return {
    resourceType,
    currentUsage: limitCheck.currentUsage,
    limit: limitCheck.limit,
    usagePercentage,
    shouldUpgrade: softLimit.warning,
    recommendedPlan: recommendedPlan || undefined,
  };
}

/**
 * Get upgrade recommendation based on current usage
 */
export async function getUpgradeRecommendation(
  userId: string,
  resourceType?: ResourceType
): Promise<UpgradeRecommendation> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      shouldUpgrade: false,
      reason: 'No subscription found',
      recommendedPlan: null,
      currentUsage: 0,
      currentLimit: 0,
      usagePercentage: 0,
    };
  }

  const checkType = resourceType || 'properties';
  const limitCheck = await checkResourceLimit(userId, checkType);
  const usagePercentage =
    limitCheck.limit > 0
      ? (limitCheck.currentUsage / limitCheck.limit) * 100
      : 0;

  const softLimit = hasSoftLimitWarning(
    limitCheck.currentUsage,
    limitCheck.limit
  );

  if (softLimit.warning) {
    const recommendedPlan = getNextPlan(subscription.plan);

    return {
      shouldUpgrade: true,
      reason: `You're using ${limitCheck.currentUsage} of ${limitCheck.limit} ${checkType} (${Math.round(usagePercentage)}%)`,
      recommendedPlan,
      currentUsage: limitCheck.currentUsage,
      currentLimit: limitCheck.limit,
      usagePercentage,
    };
  }

  return {
    shouldUpgrade: false,
    reason: `You're using ${limitCheck.currentUsage} of ${limitCheck.limit} ${checkType}`,
    recommendedPlan: null,
    currentUsage: limitCheck.currentUsage,
    currentLimit: limitCheck.limit,
    usagePercentage,
  };
}

/**
 * Get all resource usage for a user
 */
export async function getAllResourceUsage(userId: string): Promise<
  Record<ResourceType, ResourceUsageAnalytics>
> {
  const resourceTypes: ResourceType[] = [
    'properties',
    'transactions',
    'storage',
    'api_calls',
    'team_members',
  ];

  const analytics = await Promise.all(
    resourceTypes.map((type) => getResourceUsageAnalytics(userId, type))
  );

  return resourceTypes.reduce(
    (acc, type, index) => {
      acc[type] = analytics[index];
      return acc;
    },
    {} as Record<ResourceType, ResourceUsageAnalytics>
  );
}
