import { stripe } from '../core/client';
import { prisma } from '@/lib/config/database';
import { CheckoutSessionOptions } from '../core/types';
import {
  SubscriptionNotFoundError,
  CheckoutSessionError,
} from '../core/errors';
import { getPlanConfig } from '../config/plans.config';
import { logger } from '../core/logger';
import Stripe from 'stripe';

/**
 * Create a Stripe checkout session for subscription purchase
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: options.userId },
      include: { user: true },
    });

    if (!subscription) {
      throw new SubscriptionNotFoundError(options.userId);
    }

    if (!subscription.stripeCustomerId) {
      throw new CheckoutSessionError('No Stripe customer found for user');
    }

    const planConfig = getPlanConfig(options.plan);
    const priceId = options.isYearly
      ? planConfig.yearlyPriceId
      : planConfig.monthlyPriceId;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: subscription.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        userId: options.userId,
        plan: options.plan,
        isYearly: options.isYearly.toString(),
        ...options.metadata,
      },
      subscription_data: {
        metadata: {
          userId: options.userId,
          plan: options.plan,
        },
      },
    };

    if (options.trialPeriodDays !== undefined && options.trialPeriodDays > 0) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: options.trialPeriodDays,
      };
    } else if (subscription.status === 'TRIAL') {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: undefined,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.checkoutSession(
      options.userId,
      options.plan,
      options.isYearly,
      session.id
    );

    return session;
  } catch (error) {
    logger.error('Error creating checkout session', error as Error, {
      userId: options.userId,
      plan: options.plan,
    });

    if (error instanceof SubscriptionNotFoundError || error instanceof CheckoutSessionError) {
      throw error;
    }

    throw new CheckoutSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    logger.error('Error retrieving checkout session', error as Error, {
      sessionId,
    });
    throw new CheckoutSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * List checkout sessions for a customer
 */
export async function listCheckoutSessions(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Checkout.Session[]> {
  try {
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit,
    });
    return sessions.data;
  } catch (error) {
    logger.error('Error listing checkout sessions', error as Error, {
      customerId,
    });
    throw new CheckoutSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
