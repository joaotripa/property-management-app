/**
 * Stripe Integration - Main Barrel Export
 *
 * This is a reusable, configuration-driven Stripe subscription system.
 * Easily adaptable to any SaaS business model.
 */

export * from './core/types';
export * from './core/errors';
export * from './core/logger';
export * from './core/client';

export * from './config/plans.config';
export * from './config/features.config';
export * from './config/trial.config';
export * from './config/webhooks.config';

export * from './services/subscription.service';
export * from './services/checkout.service';
export * from './services/portal.service';
export * from './services/webhook.service';
export * from './services/limits.service';

export * from './middleware/resourceLimit';
