import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { stripeConfig } from './client';
import { getLimit } from './plans';

export async function createSubscription(userId: string) {
  const trialEnabled = stripeConfig.trial.enabled;
  const defaultPlan: SubscriptionPlan = 'STARTER';
  const limit = getLimit(defaultPlan);

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: null,
      status: (trialEnabled ? 'TRIAL' : 'UNPAID') as SubscriptionStatus,
      plan: defaultPlan,
      propertyLimit: limit,
      trialEndsAt: trialEnabled
        ? new Date(Date.now() + stripeConfig.trial.days * 24 * 60 * 60 * 1000)
        : null,
    },
  });

  return subscription;
}
