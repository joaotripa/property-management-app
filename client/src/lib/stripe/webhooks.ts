import { stripe, stripeConfig } from './client';
import { syncSubscription } from './subscription';
import { prisma } from '@/lib/config/database';
import Stripe from 'stripe';

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
  const userId = subscription.metadata.userId;
  if (userId) {
    await prisma.subscription.update({
      where: { userId },
      data: { status: 'CANCELED', cancelAtPeriodEnd: false },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as { subscription?: string | { id: string } };
  const subscriptionId =
    typeof inv.subscription === 'string'
      ? inv.subscription
      : inv.subscription?.id;

  if (subscriptionId) {
    await syncSubscription(subscriptionId);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as { subscription?: string | { id: string } };
  const subscriptionId =
    typeof inv.subscription === 'string'
      ? inv.subscription
      : inv.subscription?.id;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.userId;

    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'PAST_DUE' },
      });
    }
  }
}
