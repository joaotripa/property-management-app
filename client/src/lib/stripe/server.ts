import Stripe from 'stripe';
import { stripeConfig } from './config';
import { getLimit } from './plans';
import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey && typeof window === 'undefined') {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(apiKey!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// ============================================================================
// SUBSCRIPTION INITIALIZATION
// ============================================================================

export async function createSubscription(userId: string) {
  const trialEnabled = stripeConfig.trial.enabled;
  const defaultPlan: SubscriptionPlan = 'BUSINESS';
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

// ============================================================================
// BILLING PORTAL & SUBSCRIPTION MANAGEMENT
// ============================================================================

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

  const createParams: Stripe.BillingPortal.SessionCreateParams = {
    customer: subscription.stripeCustomerId,
    return_url: params.returnUrl,
  };

  if (stripeConfig.billingPortalConfigId) {
    createParams.configuration = stripeConfig.billingPortalConfigId;
  }

  const session = await stripe.billingPortal.sessions.create(createParams);

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

export async function syncSubscription(
  stripeSubscriptionId: string,
  customerEmail?: string,
  priceId?: string
) {
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
    expand: ['customer'],
  });

  // Try to get userId from metadata first (for programmatic subscriptions)
  let userId = sub.metadata.userId;

  // If no userId in metadata, find user by customer email
  if (!userId) {
    const email = customerEmail || (sub.customer as Stripe.Customer)?.email;
    if (!email) {
      throw new Error('No customer email found');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }

    userId = user.id;
  }

  // Try to get plan from metadata first, then from priceId
  let plan = sub.metadata.plan as SubscriptionPlan | undefined;

  if (!plan) {
    const subscriptionPriceId = priceId || sub.items.data[0]?.price?.id;
    if (!subscriptionPriceId) {
      throw new Error('No price ID found');
    }

    plan = getPlanFromPriceId(subscriptionPriceId);
  }

  const status = mapStatus(sub.status);
  const limit = getLimit(plan);

  const currentPeriodStart = (sub as { current_period_start?: number }).current_period_start;
  const currentPeriodEnd = (sub as { current_period_end?: number }).current_period_end;
  const cancelAtPeriodEnd = (sub as { cancel_at_period_end?: boolean }).cancel_at_period_end;

  // Get customer ID (could be string or expanded object)
  const customerId = typeof sub.customer === 'string'
    ? sub.customer
    : sub.customer.id;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
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
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
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

function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  const priceMappings: Record<string, SubscriptionPlan> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '']: 'STARTER',
    [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '']: 'STARTER',
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'PRO',
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID || '']: 'PRO',
    [process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '']: 'BUSINESS',
    [process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '']: 'BUSINESS',
  };

  const plan = priceMappings[priceId];
  if (!plan) {
    throw new Error(`Unknown price ID: ${priceId}`);
  }

  return plan;
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export function verifyWebhook(body: string, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid signature');
  }
}

export async function handleWebhook(event: Stripe.Event) {
  console.log(`📬 Webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription' && session.subscription) {
    await syncSubscription(session.subscription as string);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await syncSubscription(subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Try to get userId from metadata first
  let userId = subscription.metadata.userId;

  // If no metadata, get customer email and find user
  if (!userId) {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = (customer as Stripe.Customer).email;

    if (!customerEmail) {
      console.log('No customer email found for deleted subscription');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      console.log(`No user found with email: ${customerEmail}`);
      return;
    }

    userId = user.id;
  }

  await prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELED', cancelAtPeriodEnd: false },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string;

  if (!subscriptionId) {
    console.log('No subscription ID in invoice');
    return;
  }

  const customerEmail = invoice.customer_email || undefined;
  const priceId = invoice.lines?.data?.[0]?.pricing?.price_details?.price || undefined;

  await syncSubscription(subscriptionId, customerEmail, priceId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string;

  if (!subscriptionId) {
    console.log('No subscription ID in invoice');
    return;
  }

  const customerEmail = invoice.customer_email;

  if (!customerEmail) {
    console.log('No customer email in invoice');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (user) {
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { status: 'PAST_DUE' },
    });
  }
}
