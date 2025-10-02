import { WebhookHandlerRegistry, StripeWebhookEvent } from '../core/types';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentSucceeded,
  handlePaymentFailed,
  handleCheckoutCompleted,
} from '../services/webhook.service';

/**
 * Webhook event handler registry
 *
 * Maps Stripe webhook event types to their handler functions.
 * Add new handlers here as you support more event types.
 */
export const WEBHOOK_HANDLERS: WebhookHandlerRegistry = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,
  'checkout.session.completed': handleCheckoutCompleted,
};

/**
 * Get webhook handler for an event type
 */
export function getWebhookHandler(
  eventType: string
): ((event: StripeWebhookEvent) => Promise<{ received: boolean; error?: string }>) | null {
  return (WEBHOOK_HANDLERS[eventType as keyof WebhookHandlerRegistry] as (event: StripeWebhookEvent) => Promise<{ received: boolean; error?: string }>) || null;
}

/**
 * Check if webhook event type is supported
 */
export function isWebhookEventSupported(eventType: string): boolean {
  return eventType in WEBHOOK_HANDLERS;
}

/**
 * Get list of all supported webhook event types
 */
export function getSupportedWebhookEvents(): string[] {
  return Object.keys(WEBHOOK_HANDLERS);
}

/**
 * Webhook processing configuration
 */
export const WEBHOOK_CONFIG = {
  /**
   * Maximum number of retry attempts for failed webhook processing
   */
  maxRetries: 3,

  /**
   * Delay between retries in milliseconds
   */
  retryDelay: 1000,

  /**
   * Whether to log webhook events
   */
  enableLogging: true,

  /**
   * Whether to verify webhook signatures
   */
  verifySignature: true,

  /**
   * Timeout for webhook processing in milliseconds
   */
  processingTimeout: 30000,
} as const;
