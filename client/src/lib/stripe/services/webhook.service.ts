import { stripe, STRIPE_CONFIG } from '../core/client';
import { prisma } from '@/lib/config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import {
  StripeSubscriptionCreatedEvent,
  StripeSubscriptionUpdatedEvent,
  StripeSubscriptionDeletedEvent,
  StripeInvoicePaymentSucceededEvent,
  StripeInvoicePaymentFailedEvent,
  StripeCheckoutSessionCompletedEvent,
} from '../core/types';
import { WebhookSignatureError, WebhookProcessingError } from '../core/errors';
import { getPlanConfig } from '../config/plans.config';
import { logger } from '../core/logger';
import Stripe from 'stripe';

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed', error as Error, {
      signaturePresent: !!signature,
    });
    throw new WebhookSignatureError(
      error instanceof Error ? error.message : 'Invalid signature'
    );
  }
}

/**
 * Handle subscription created event
 */
export async function handleSubscriptionCreated(
  event: StripeSubscriptionCreatedEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const subscription = event.data.object;
    logger.webhookEvent('customer.subscription.created', event.data.object.id, {
      customerId: subscription.customer as string,
    });

    await updateSubscriptionFromStripe(subscription);

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling subscription created',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(
  event: StripeSubscriptionUpdatedEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const subscription = event.data.object;
    logger.webhookEvent('customer.subscription.updated', event.data.object.id, {
      customerId: subscription.customer as string,
      status: subscription.status,
    });

    await updateSubscriptionFromStripe(subscription);

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling subscription updated',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle subscription deleted event
 */
export async function handleSubscriptionDeleted(
  event: StripeSubscriptionDeletedEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const subscription = event.data.object;
    const userId = subscription.metadata.userId;

    logger.webhookEvent('customer.subscription.deleted', event.data.object.id, {
      customerId: subscription.customer as string,
      userId,
    });

    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'CANCELED',
          stripeSubscriptionId: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling subscription deleted',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle payment succeeded event
 */
export async function handlePaymentSucceeded(
  event: StripeInvoicePaymentSucceededEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const invoice = event.data.object;

    logger.webhookEvent('invoice.payment_succeeded', invoice.id, {
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string | null,
    });

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );
      await updateSubscriptionFromStripe(subscription);
    }

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling payment succeeded',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle payment failed event
 */
export async function handlePaymentFailed(
  event: StripeInvoicePaymentFailedEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const invoice = event.data.object;

    logger.webhookEvent('invoice.payment_failed', invoice.id, {
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string | null,
    });

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );
      const userId = subscription.metadata.userId;

      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'PAST_DUE',
          },
        });
      }
    }

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling payment failed',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutCompleted(
  event: StripeCheckoutSessionCompletedEvent
): Promise<{ received: boolean; error?: string }> {
  try {
    const session = event.data.object;

    logger.webhookEvent('checkout.session.completed', session.id, {
      customerId: session.customer as string,
      subscriptionId: session.subscription as string | null,
    });

    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      await updateSubscriptionFromStripe(subscription);
    }

    return { received: true };
  } catch (error) {
    logger.error(
      'Error handling checkout completed',
      error as Error,
      { eventId: event.data.object.id }
    );
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update subscription from Stripe subscription object
 */
async function updateSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  try {
    const userId = stripeSubscription.metadata.userId;
    const plan = stripeSubscription.metadata.plan as SubscriptionPlan;

    if (!userId || !plan) {
      throw new WebhookProcessingError(
        'subscription_update',
        new Error('Missing userId or plan in subscription metadata')
      );
    }

    const planConfig = getPlanConfig(plan);
    let status: SubscriptionStatus = 'ACTIVE';

    switch (stripeSubscription.status) {
      case 'active':
        status = 'ACTIVE';
        break;
      case 'past_due':
        status = 'PAST_DUE';
        break;
      case 'canceled':
      case 'unpaid':
        status = 'CANCELED';
        break;
      case 'incomplete':
      case 'incomplete_expired':
        status = 'UNPAID';
        break;
      default:
        status = 'ACTIVE';
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: stripeSubscription.id,
        status,
        plan,
        propertyLimit: planConfig.limits.properties || 999,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialEndsAt: null,
      },
    });

    logger.info('Subscription updated from Stripe', {
      userId,
      plan,
      status,
      stripeSubscriptionId: stripeSubscription.id,
    });
  } catch (error) {
    logger.error('Error updating subscription from Stripe', error as Error, {
      subscriptionId: stripeSubscription.id,
    });
    throw error;
  }
}
