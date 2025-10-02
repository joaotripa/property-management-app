/**
 * Base error class for all subscription-related errors
 */
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly metadata?: Record<string, string | number | boolean>
  ) {
    super(message);
    this.name = 'SubscriptionError';
    Object.setPrototypeOf(this, SubscriptionError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
    };
  }
}

/**
 * Thrown when a user's trial has expired
 */
export class TrialExpiredError extends SubscriptionError {
  constructor(trialEndDate: Date) {
    super(
      'Your free trial has expired. Please upgrade to continue.',
      'TRIAL_EXPIRED',
      403,
      { trialEndDate: trialEndDate.toISOString() }
    );
    this.name = 'TrialExpiredError';
    Object.setPrototypeOf(this, TrialExpiredError.prototype);
  }
}

/**
 * Thrown when a resource limit has been reached
 */
export class ResourceLimitError extends SubscriptionError {
  constructor(
    resourceType: string,
    currentCount: number,
    limit: number,
    plan: string
  ) {
    super(
      `You've reached your ${resourceType} limit of ${limit}. Please upgrade your plan to add more ${resourceType}.`,
      'RESOURCE_LIMIT_EXCEEDED',
      403,
      {
        resourceType,
        currentCount,
        limit,
        plan,
      }
    );
    this.name = 'ResourceLimitError';
    Object.setPrototypeOf(this, ResourceLimitError.prototype);
  }
}

/**
 * Thrown when subscription is inactive or canceled
 */
export class InactiveSubscriptionError extends SubscriptionError {
  constructor(status: string) {
    super(
      'Your subscription is inactive. Please update your payment method to continue.',
      'SUBSCRIPTION_INACTIVE',
      403,
      { status }
    );
    this.name = 'InactiveSubscriptionError';
    Object.setPrototypeOf(this, InactiveSubscriptionError.prototype);
  }
}

/**
 * Thrown when subscription is not found
 */
export class SubscriptionNotFoundError extends SubscriptionError {
  constructor(userId: string) {
    super(
      'No subscription found for this user.',
      'SUBSCRIPTION_NOT_FOUND',
      404,
      { userId }
    );
    this.name = 'SubscriptionNotFoundError';
    Object.setPrototypeOf(this, SubscriptionNotFoundError.prototype);
  }
}

/**
 * Thrown when Stripe customer is not found
 */
export class StripeCustomerNotFoundError extends SubscriptionError {
  constructor(userId: string) {
    super(
      'No Stripe customer found for this user.',
      'STRIPE_CUSTOMER_NOT_FOUND',
      404,
      { userId }
    );
    this.name = 'StripeCustomerNotFoundError';
    Object.setPrototypeOf(this, StripeCustomerNotFoundError.prototype);
  }
}

/**
 * Thrown when webhook signature verification fails
 */
export class WebhookSignatureError extends SubscriptionError {
  constructor(message: string = 'Invalid webhook signature') {
    super(message, 'WEBHOOK_SIGNATURE_INVALID', 400);
    this.name = 'WebhookSignatureError';
    Object.setPrototypeOf(this, WebhookSignatureError.prototype);
  }
}

/**
 * Thrown when webhook processing fails
 */
export class WebhookProcessingError extends SubscriptionError {
  constructor(eventType: string, originalError?: Error) {
    super(
      `Failed to process webhook event: ${eventType}`,
      'WEBHOOK_PROCESSING_FAILED',
      500,
      {
        eventType,
        originalError: originalError?.message || 'Unknown error',
      }
    );
    this.name = 'WebhookProcessingError';
    Object.setPrototypeOf(this, WebhookProcessingError.prototype);
  }
}

/**
 * Thrown when checkout session creation fails
 */
export class CheckoutSessionError extends SubscriptionError {
  constructor(reason: string) {
    super(
      `Failed to create checkout session: ${reason}`,
      'CHECKOUT_SESSION_FAILED',
      500,
      { reason }
    );
    this.name = 'CheckoutSessionError';
    Object.setPrototypeOf(this, CheckoutSessionError.prototype);
  }
}

/**
 * Thrown when portal session creation fails
 */
export class PortalSessionError extends SubscriptionError {
  constructor(reason: string) {
    super(
      `Failed to create portal session: ${reason}`,
      'PORTAL_SESSION_FAILED',
      500,
      { reason }
    );
    this.name = 'PortalSessionError';
    Object.setPrototypeOf(this, PortalSessionError.prototype);
  }
}

/**
 * Thrown when plan configuration is invalid
 */
export class InvalidPlanError extends SubscriptionError {
  constructor(plan: string) {
    super(
      `Invalid subscription plan: ${plan}`,
      'INVALID_PLAN',
      400,
      { plan }
    );
    this.name = 'InvalidPlanError';
    Object.setPrototypeOf(this, InvalidPlanError.prototype);
  }
}

/**
 * Type guard to check if error is a SubscriptionError
 */
export function isSubscriptionError(error: Error): error is SubscriptionError {
  return error instanceof SubscriptionError;
}

/**
 * Helper to handle subscription errors consistently
 */
export function handleSubscriptionError(error: Error): {
  message: string;
  code: string;
  statusCode: number;
  metadata?: Record<string, string | number | boolean>;
} {
  if (isSubscriptionError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      metadata: error.metadata,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}
