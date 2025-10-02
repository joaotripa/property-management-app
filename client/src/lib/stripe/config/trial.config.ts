import { SubscriptionPlan } from '@prisma/client';
import { TrialConfig } from '../core/types';

/**
 * Trial configuration for new users
 *
 * Customize this to change trial behavior:
 * - enabled: Whether trials are enabled
 * - durationDays: How long the trial lasts
 * - defaultPlan: Which plan trial users get access to
 * - requirePaymentMethod: Whether to require payment info upfront
 */
export const TRIAL_CONFIG: TrialConfig = {
  enabled: true,
  durationDays: 14,
  defaultPlan: 'BUSINESS' as SubscriptionPlan,
  requirePaymentMethod: false,
};

/**
 * Check if trials are currently enabled
 */
export function isTrialEnabled(): boolean {
  return TRIAL_CONFIG.enabled;
}

/**
 * Get trial duration in days
 */
export function getTrialDuration(): number {
  return TRIAL_CONFIG.durationDays;
}

/**
 * Get default trial plan
 */
export function getDefaultTrialPlan(): SubscriptionPlan {
  return TRIAL_CONFIG.defaultPlan;
}

/**
 * Calculate trial end date from start date
 */
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_CONFIG.durationDays);
  return endDate;
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() > new Date(trialEndsAt);
}

/**
 * Calculate days remaining in trial
 */
export function getDaysRemainingInTrial(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const timeDiff = trialEnd.getTime() - now.getTime();

  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
}
