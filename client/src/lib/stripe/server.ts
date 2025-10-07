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
  priceId?: string;
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

  if (params.priceId && subscription.stripeSubscriptionId) {
    let subscriptionItemId = subscription.stripeSubscriptionItemId;

    if (!subscriptionItemId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      subscriptionItemId = stripeSubscription.items.data[0]?.id;

      if (!subscriptionItemId) {
        throw new Error('No subscription item found');
      }

      await prisma.subscription.update({
        where: { userId: params.userId },
        data: { stripeSubscriptionItemId: subscriptionItemId },
      });
    }

    createParams.flow_data = {
      type: 'subscription_update_confirm',
      subscription_update_confirm: {
        subscription: subscription.stripeSubscriptionId,
        items: [{ id: subscriptionItemId, price: params.priceId, quantity: 1 }],
      },
    };
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
    expand: ['customer', 'schedule'],
  });

  let userId = sub.metadata.userId;

  if (!userId) {
    let email: string | null = customerEmail || null;

    if (!email && typeof sub.customer !== 'string') {
      if ('email' in sub.customer && !('deleted' in sub.customer)) {
        email = sub.customer.email;
      }
    }

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

  const firstItem = sub.items.data[0];
  if (!firstItem) {
    throw new Error('Subscription has no items');
  }

  if (!firstItem.current_period_start || !firstItem.current_period_end) {
    throw new Error('Missing billing period in subscription item');
  }

  const currentPeriodStart = firstItem.current_period_start;
  const currentPeriodEnd = firstItem.current_period_end;
  const subscriptionItemId = firstItem.id;
  const cancelAtPeriodEnd = sub.cancel_at_period_end || Boolean(sub.cancel_at);

  const customerId = typeof sub.customer === 'string'
    ? sub.customer
    : sub.customer.id;

  let scheduledPlan: SubscriptionPlan | null = null;
  let scheduledPlanDate: Date | null = null;

  if (sub.schedule && typeof sub.schedule !== 'string') {
    const schedule = await stripe.subscriptionSchedules.retrieve(sub.schedule.id);
    const currentPhaseIndex = schedule.phases.findIndex(
      (phase) => phase.start_date <= Date.now() / 1000 && phase.end_date > Date.now() / 1000
    );

    if (currentPhaseIndex !== -1 && currentPhaseIndex < schedule.phases.length - 1) {
      const nextPhase = schedule.phases[currentPhaseIndex + 1];
      const nextPriceId = nextPhase?.items?.[0]?.price;

      if (nextPriceId && typeof nextPriceId === 'string') {
        try {
          scheduledPlan = getPlanFromPriceId(nextPriceId);
          scheduledPlanDate = nextPhase.start_date ? new Date(nextPhase.start_date * 1000) : null;
        } catch {
        }
      }
    }
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripeSubscriptionItemId: subscriptionItemId,
      status,
      plan,
      propertyLimit: limit,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      scheduledPlan,
      scheduledPlanDate,
      trialEndsAt: null,
    },
    update: {
      status,
      plan,
      propertyLimit: limit,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripeSubscriptionItemId: subscriptionItemId,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      scheduledPlan,
      scheduledPlanDate,
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
    scheduledPlan: subscription.scheduledPlan,
    scheduledPlanDate: subscription.scheduledPlanDate,
  };
}

export function getPriceId(
  plan: SubscriptionPlan,
  isYearly: boolean
): string | null {
  const priceMappings: Record<string, string | undefined> = {
    STARTER_MONTHLY: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    STARTER_YEARLY: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    BUSINESS_YEARLY: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  };

  const key = `${plan}_${isYearly ? 'YEARLY' : 'MONTHLY'}`;
  return priceMappings[key] || null;
}

export async function cancelSubscriptionNow(userId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        status: true,
      },
    });

    if (!subscription) {
      return {
        success: true,
        message: "No subscription found to cancel",
      };
    }

    if (!subscription.stripeSubscriptionId) {
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'CANCELED', cancelAtPeriodEnd: false },
      });
      return {
        success: true,
        message: "Subscription canceled locally",
      };
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { userId },
      data: { status: 'CANCELED', cancelAtPeriodEnd: false },
    });

    return {
      success: true,
      message: "Subscription canceled successfully",
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
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
  let userId = subscription.metadata.userId;

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
  if (!invoice.parent?.subscription_details?.subscription) {
    console.log('No subscription ID in invoice');
    return;
  }

  const subscriptionId = typeof invoice.parent.subscription_details.subscription === 'string'
    ? invoice.parent.subscription_details.subscription
    : invoice.parent.subscription_details.subscription.id;

  const customerEmail = invoice.customer_email || undefined;

  let priceId: string | undefined;
  const firstLine = invoice.lines?.data?.[0];
  if (firstLine?.pricing?.price_details?.price) {
    priceId = firstLine.pricing.price_details.price;
  }

  await syncSubscription(subscriptionId, customerEmail, priceId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.parent?.subscription_details?.subscription) {
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