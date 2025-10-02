import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { SubscriptionWithUser } from '../core/types';
import {
  SubscriptionNotFoundError,
  InactiveSubscriptionError,
} from '../core/errors';
import { getPlanConfig } from '../config/plans.config';
import {
  calculateTrialEndDate,
  isTrialExpired,
  getDefaultTrialPlan,
  isTrialEnabled,
} from '../config/trial.config';
import { logger } from '../core/logger';

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionWithUser | null> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!subscription) {
      logger.warn('Subscription not found', { userId });
      return null;
    }

    if (
      subscription.status === 'TRIAL' &&
      isTrialExpired(subscription.trialEndsAt)
    ) {
      logger.info('Trial expired, updating subscription status', {
        userId,
        trialEndsAt: subscription.trialEndsAt?.toISOString(),
      });

      const updated = await prisma.subscription.update({
        where: { userId },
        data: { status: 'UNPAID' },
        include: { user: true },
      });

      return updated;
    }

    return subscription;
  } catch (error) {
    logger.error('Error getting subscription status', error as Error, {
      userId,
    });
    throw error;
  }
}

/**
 * Create subscription for a new user
 */
export async function createSubscription(
  userId: string,
  stripeCustomerId?: string
): Promise<SubscriptionWithUser> {
  try {
    const trialEnabled = isTrialEnabled();
    const defaultPlan = getDefaultTrialPlan();
    const planConfig = getPlanConfig(defaultPlan);

    const subscriptionData = {
      userId,
      stripeCustomerId: stripeCustomerId || null,
      status: (trialEnabled ? 'TRIAL' : 'UNPAID') as SubscriptionStatus,
      plan: defaultPlan,
      propertyLimit: planConfig.limits.properties || 999,
      trialEndsAt: trialEnabled ? calculateTrialEndDate() : null,
    };

    const subscription = await prisma.subscription.create({
      data: subscriptionData,
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_created', userId, {
      plan: defaultPlan,
      status: subscriptionData.status,
      trialEndsAt: subscriptionData.trialEndsAt?.toISOString(),
    });

    return subscription;
  } catch (error) {
    logger.error('Error creating subscription', error as Error, { userId });
    throw error;
  }
}

/**
 * Update subscription plan and limits
 */
export async function updateSubscriptionPlan(
  userId: string,
  plan: SubscriptionPlan
): Promise<SubscriptionWithUser> {
  try {
    const planConfig = getPlanConfig(plan);

    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        plan,
        propertyLimit: planConfig.limits.properties || 999,
      },
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_plan_updated', userId, { plan });

    return subscription;
  } catch (error) {
    logger.error('Error updating subscription plan', error as Error, {
      userId,
      plan,
    });
    throw error;
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus
): Promise<SubscriptionWithUser> {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: { status },
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_status_updated', userId, {
      status,
    });

    return subscription;
  } catch (error) {
    logger.error('Error updating subscription status', error as Error, {
      userId,
      status,
    });
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  userId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<SubscriptionWithUser> {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED',
      },
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_canceled', userId, {
      cancelAtPeriodEnd,
    });

    return subscription;
  } catch (error) {
    logger.error('Error canceling subscription', error as Error, { userId });
    throw error;
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  userId: string
): Promise<SubscriptionWithUser> {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
        status: 'ACTIVE',
      },
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_reactivated', userId);

    return subscription;
  } catch (error) {
    logger.error('Error reactivating subscription', error as Error, {
      userId,
    });
    throw error;
  }
}

/**
 * Update Stripe customer ID
 */
export async function updateStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<SubscriptionWithUser> {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: { stripeCustomerId },
      include: { user: true },
    });

    logger.subscriptionEvent('stripe_customer_linked', userId, {
      stripeCustomerId,
    });

    return subscription;
  } catch (error) {
    logger.error('Error updating Stripe customer ID', error as Error, {
      userId,
      stripeCustomerId,
    });
    throw error;
  }
}

/**
 * Update subscription from Stripe data
 */
export async function updateSubscriptionFromStripe(
  userId: string,
  data: {
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }
): Promise<SubscriptionWithUser> {
  try {
    const planConfig = getPlanConfig(data.plan);

    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: data.stripeSubscriptionId,
        status: data.status,
        plan: data.plan,
        propertyLimit: planConfig.limits.properties || 999,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        trialEndsAt: null,
      },
      include: { user: true },
    });

    logger.subscriptionEvent('subscription_synced_from_stripe', userId, {
      stripeSubscriptionId: data.stripeSubscriptionId,
      plan: data.plan,
      status: data.status,
    });

    return subscription;
  } catch (error) {
    logger.error('Error updating subscription from Stripe', error as Error, {
      userId,
      stripeSubscriptionId: data.stripeSubscriptionId,
    });
    throw error;
  }
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(
  subscription: SubscriptionWithUser
): boolean {
  if (subscription.status === 'TRIAL') {
    return !isTrialExpired(subscription.trialEndsAt);
  }

  return subscription.status === 'ACTIVE';
}

/**
 * Require active subscription or throw error
 */
export async function requireActiveSubscription(
  userId: string
): Promise<SubscriptionWithUser> {
  const subscription = await getSubscriptionStatus(userId);

  if (!subscription) {
    throw new SubscriptionNotFoundError(userId);
  }

  if (!isSubscriptionActive(subscription)) {
    throw new InactiveSubscriptionError(subscription.status);
  }

  return subscription;
}
