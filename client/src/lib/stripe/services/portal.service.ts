import { stripe } from '../core/client';
import { prisma } from '@/lib/config/database';
import { CustomerPortalOptions } from '../core/types';
import {
  StripeCustomerNotFoundError,
  PortalSessionError,
} from '../core/errors';
import { logger } from '../core/logger';
import Stripe from 'stripe';

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession(
  options: CustomerPortalOptions
): Promise<Stripe.BillingPortal.Session> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: options.userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new StripeCustomerNotFoundError(options.userId);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: options.returnUrl,
    });

    logger.portalSession(options.userId, session.id);

    return session;
  } catch (error) {
    logger.error('Error creating portal session', error as Error, {
      userId: options.userId,
    });

    if (error instanceof StripeCustomerNotFoundError) {
      throw error;
    }

    throw new PortalSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Create or update a Stripe customer for a user
 */
export async function createOrUpdateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription?.stripeCustomerId) {
      const customer = await stripe.customers.update(
        subscription.stripeCustomerId,
        {
          email,
          name: name || undefined,
          metadata: {
            userId,
          },
        }
      );

      logger.info('Stripe customer updated', {
        userId,
        customerId: customer.id,
      });

      return customer;
    }

    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });

    await prisma.subscription.update({
      where: { userId },
      data: { stripeCustomerId: customer.id },
    });

    logger.info('Stripe customer created', {
      userId,
      customerId: customer.id,
    });

    return customer;
  } catch (error) {
    logger.error('Error creating/updating Stripe customer', error as Error, {
      userId,
      email,
    });

    throw new PortalSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Get Stripe customer by ID
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return customer as Stripe.Customer;
  } catch (error) {
    logger.error('Error retrieving Stripe customer', error as Error, {
      customerId,
    });

    throw new PortalSessionError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
