import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

/**
 * Resource types that can have subscription limits
 */
export type ResourceType =
  | 'properties'
  | 'transactions'
  | 'storage'
  | 'api_calls'
  | 'team_members';

/**
 * Limit strategy for calculating resource usage
 */
export type LimitStrategy = 'count' | 'sum' | 'custom';

/**
 * Resource limit configuration
 */
export interface ResourceLimitConfig {
  resourceType: ResourceType;
  strategy: LimitStrategy;
  field?: string;
  customCheck?: (userId: string) => Promise<number>;
}

/**
 * Plan feature configuration
 */
export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

/**
 * Resource limits per plan
 */
export interface PlanResourceLimits {
  properties?: number;
  transactions?: number;
  storage?: number;
  api_calls?: number;
  team_members?: number;
  [key: string]: number | undefined;
}

/**
 * Complete plan configuration
 */
export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: PlanResourceLimits;
  features: PlanFeature[];
  popular: boolean;
}

/**
 * Trial configuration
 */
export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  defaultPlan: SubscriptionPlan;
  requirePaymentMethod: boolean;
}

/**
 * Subscription with user relation
 */
export interface SubscriptionWithUser {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  propertyLimit: number;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Resource limit check result
 */
export interface ResourceLimitCheck {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  isAtLimit: boolean;
  subscriptionStatus: SubscriptionStatus;
  isTrialExpired: boolean;
  reason?: string;
}

/**
 * Usage analytics for a resource
 */
export interface ResourceUsageAnalytics {
  resourceType: ResourceType;
  currentUsage: number;
  limit: number;
  usagePercentage: number;
  shouldUpgrade: boolean;
  recommendedPlan?: SubscriptionPlan;
  trend?: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Checkout session options
 */
export interface CheckoutSessionOptions {
  userId: string;
  plan: SubscriptionPlan;
  isYearly: boolean;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

/**
 * Customer portal options
 */
export interface CustomerPortalOptions {
  userId: string;
  returnUrl: string;
}

/**
 * Stripe webhook event types with proper typing
 */
export type StripeWebhookEvent =
  | StripeSubscriptionCreatedEvent
  | StripeSubscriptionUpdatedEvent
  | StripeSubscriptionDeletedEvent
  | StripeInvoicePaymentSucceededEvent
  | StripeInvoicePaymentFailedEvent
  | StripeCheckoutSessionCompletedEvent;

export interface StripeSubscriptionCreatedEvent {
  type: 'customer.subscription.created';
  data: {
    object: Stripe.Subscription;
  };
}

export interface StripeSubscriptionUpdatedEvent {
  type: 'customer.subscription.updated';
  data: {
    object: Stripe.Subscription;
  };
}

export interface StripeSubscriptionDeletedEvent {
  type: 'customer.subscription.deleted';
  data: {
    object: Stripe.Subscription;
  };
}

export interface StripeInvoicePaymentSucceededEvent {
  type: 'invoice.payment_succeeded';
  data: {
    object: Stripe.Invoice;
  };
}

export interface StripeInvoicePaymentFailedEvent {
  type: 'invoice.payment_failed';
  data: {
    object: Stripe.Invoice;
  };
}

export interface StripeCheckoutSessionCompletedEvent {
  type: 'checkout.session.completed';
  data: {
    object: Stripe.Checkout.Session;
  };
}

/**
 * Webhook handler function type
 */
export type WebhookHandler<T extends StripeWebhookEvent = StripeWebhookEvent> = (
  event: T
) => Promise<{ received: boolean; error?: string }>;

/**
 * Webhook handler registry
 */
export type WebhookHandlerRegistry = {
  [K in StripeWebhookEvent['type']]?: WebhookHandler;
};

/**
 * Subscription update payload from Stripe
 */
export interface StripeSubscriptionUpdatePayload {
  userId: string;
  plan: SubscriptionPlan;
  stripeSubscription: Stripe.Subscription;
}

/**
 * Limit enforcement options
 */
export interface LimitEnforcementOptions {
  resourceType: ResourceType;
  userId: string;
  customErrorMessage?: string;
  softLimit?: boolean;
}

/**
 * Upgrade recommendation
 */
export interface UpgradeRecommendation {
  shouldUpgrade: boolean;
  reason: string;
  recommendedPlan: SubscriptionPlan | null;
  currentUsage: number;
  currentLimit: number;
  usagePercentage: number;
}
