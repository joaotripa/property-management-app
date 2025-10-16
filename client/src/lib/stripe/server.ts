import Stripe from 'stripe';
import { stripeConfig } from './config';
import { getLimit } from './plans';
import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { trackServerEvent } from '@/lib/analytics/server-tracker';
import { BILLING_EVENTS } from '@/lib/analytics/events';

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

/**
 * Creates a new trial subscription for a user on signup.
 * No Stripe customer is created yet - that happens when they first pay.
 * 
 * @param userId - The user ID to create subscription for
 * @returns The created subscription record
 * 
 * @example
 * ```typescript
 * const subscription = await createSubscription(user.id);
 * console.log(`Trial ends: ${subscription.trialEndsAt}`);
 * ```
 */
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
// BILLING PORTAL
// ============================================================================

/**
 * Creates a Stripe Billing Portal session for customer self-service.
 * Allows users to manage payment methods, view invoices, and cancel subscriptions.
 * 
 * @param params.userId - User ID
 * @param params.returnUrl - URL to redirect after portal session
 * @returns Portal session URL to redirect user to
 * 
 * @example
 * ```typescript
 * const { url } = await createPortalSession({
 *   userId: user.id,
 *   returnUrl: 'https://app.com/dashboard/settings',
 * });
 * // Redirect user to url
 * ```
 */
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

// ============================================================================
// LIMIT ENFORCEMENT
// ============================================================================

/**
 * Checks if a user can create more properties based on their subscription.
 * 
 * @param userId - User ID to check limits for
 * @returns Limit check result with current usage and limit
 * 
 * @example
 * ```typescript
 * const check = await checkLimit(userId);
 * if (!check.allowed) {
 *   return res.json({ error: check.reason }, { status: 403 });
 * }
 * ```
 */
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

// ============================================================================
// SUBSCRIPTION SYNCHRONIZATION
// ============================================================================

/**
 * Syncs a Stripe subscription with the local database.
 * Called by webhooks to keep local state in sync with Stripe.
 * Handles user lookup by email if userId not in metadata.
 * 
 * @param stripeSubscriptionId - Stripe subscription ID
 * @param customerEmail - Optional customer email for user lookup
 * @param priceId - Optional price ID override
 */
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

    if (!email && typeof sub.customer === 'string') {
      const customer = await stripe.customers.retrieve(sub.customer);
      email = (customer as Stripe.Customer).email;
    } else if (!email && typeof sub.customer !== 'string') {
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

  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

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

  if (existingSubscription && existingSubscription.plan !== plan && status === 'ACTIVE') {
    await trackServerEvent(userId, BILLING_EVENTS.SUBSCRIPTION_UPGRADED, {
      old_plan: existingSubscription.plan.toLowerCase(),
      new_plan: plan.toLowerCase(),
    });
  }
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
    ? (() => {
        const millisDiff = subscription.trialEndsAt.getTime() - Date.now();
        const daysDiff = millisDiff / (1000 * 60 * 60 * 24);

        if (millisDiff < 0) {
          // Trial already expired - use floor to get negative days
          return Math.floor(daysDiff);
        } else if (millisDiff < 86400000) {
          // Less than 24 hours remaining = "expires today"
          return 0;
        } else {
          // 24+ hours remaining - round up so 13.999 days = 14 days
          return Math.ceil(daysDiff);
        }
      })()
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

// ============================================================================
// SUBSCRIPTION CANCELLATION
// ============================================================================

/**
 * Immediately cancels a user's subscription.
 * Handles both Stripe-managed and local-only subscriptions.
 * 
 * @param userId - User ID
 * @returns Success status and optional message
 */
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


// ============================================================================
// UTILITY FUNCTIONS (INTERNAL)
// ============================================================================

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
// WEBHOOK HANDLING
// ============================================================================

/**
 * Verifies and constructs a Stripe webhook event from raw request data.
 * 
 * @param body - Raw request body string
 * @param signature - Stripe-Signature header value
 * @returns Verified Stripe event
 * @throws Error if signature verification fails
 */
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

  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
  });

  await prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELED', cancelAtPeriodEnd: false },
  });

  if (existingSub) {
    await trackServerEvent(userId, BILLING_EVENTS.SUBSCRIPTION_CANCELLED, {
      previous_plan: existingSub.plan.toLowerCase(),
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
  
  if (!invoiceWithSubscription.subscription) {
    console.log('No subscription ID in invoice');
    return;
  }

  const subscriptionId = typeof invoiceWithSubscription.subscription === 'string'
    ? invoiceWithSubscription.subscription
    : invoiceWithSubscription.subscription.id;

  const customerEmail = invoice.customer_email || undefined;

  await syncSubscription(subscriptionId, customerEmail);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
  
  if (!invoiceWithSubscription.subscription) {
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
