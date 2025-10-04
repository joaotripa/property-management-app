import { stripe, stripeConfig } from './client';
import { getLimit } from './plans';
import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  plan: SubscriptionPlan;
  isYearly: boolean;
  successUrl: string;
  cancelUrl: string;
}) {
  const { userId, userEmail, plan, isYearly, successUrl, cancelUrl } = params;

  const priceId = isYearly
    ? stripeConfig.prices[plan.toLowerCase() as 'starter' | 'pro' | 'business'].yearly
    : stripeConfig.prices[plan.toLowerCase() as 'starter' | 'pro' | 'business'].monthly;

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
    subscription_data: {
      trial_period_days: stripeConfig.trial.enabled ? stripeConfig.trial.days : undefined,
      metadata: { userId, plan },
    },
  });

  return { sessionId: session.id, url: session.url };
}

export async function createPortalSession(params: {
  userId: string;
  returnUrl: string;
}) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: params.userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: params.returnUrl,
  });

  return { url: session.url };
}

export async function checkLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return { allowed: false, current: 0, limit: 0, reason: 'No subscription found' };
  }

  const isActive =
    subscription.status === 'ACTIVE' ||
    (subscription.status === 'TRIAL' &&
     subscription.trialEndsAt &&
     subscription.trialEndsAt > new Date());

  if (!isActive) {
    return { allowed: false, current: 0, limit: 0, reason: 'Subscription inactive' };
  }

  const current = await prisma.property.count({
    where: { userId, deletedAt: null },
  });

  const limit = getLimit(subscription.plan);

  return {
    allowed: current < limit,
    current,
    limit,
    reason: current >= limit ? 'Property limit reached' : undefined,
  };
}

export async function canMutate(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return false;

  return Boolean(
    subscription.status === 'ACTIVE' ||
    (subscription.status === 'TRIAL' &&
     subscription.trialEndsAt &&
     subscription.trialEndsAt > new Date())
  );
}

export async function syncSubscription(stripeSubscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const userId = sub.metadata.userId;
  const plan = sub.metadata.plan as SubscriptionPlan;

  if (!userId || !plan) {
    throw new Error('Missing userId or plan in subscription metadata');
  }

  const status = mapStatus(sub.status);
  const limit = getLimit(plan);

  const currentPeriodStart = (sub as { current_period_start?: number }).current_period_start;
  const currentPeriodEnd = (sub as { current_period_end?: number }).current_period_end;
  const cancelAtPeriodEnd = (sub as { cancel_at_period_end?: boolean }).cancel_at_period_end;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      status,
      plan,
      propertyLimit: limit,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      trialEndsAt: null,
    },
    update: {
      status,
      plan,
      propertyLimit: limit,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
    },
  });
}

export async function getSubscriptionInfo(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  const propertyCount = await prisma.property.count({
    where: { userId, deletedAt: null },
  });

  const trialDaysRemaining = subscription.trialEndsAt
    ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    status: subscription.status,
    plan: subscription.plan,
    propertyLimit: subscription.propertyLimit,
    propertyCount,
    trialEndsAt: subscription.trialEndsAt,
    trialDaysRemaining,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

function mapStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active': return 'ACTIVE';
    case 'past_due': return 'PAST_DUE';
    case 'canceled': return 'CANCELED';
    case 'unpaid': return 'UNPAID';
    case 'incomplete': return 'UNPAID';
    case 'incomplete_expired': return 'UNPAID';
    default: return 'ACTIVE';
  }
}
