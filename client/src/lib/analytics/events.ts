/**
 * Umami Analytics Events
 *
 * Centralized event definitions for type-safe analytics tracking.
 * Follow Umami naming convention: snake_case for event names.
 */

// ==========================================
// 1. USER ACQUISITION & ONBOARDING
// ==========================================

export const AUTH_EVENTS = {
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  EMAIL_VERIFIED: "email_verified",
  LOGIN_COMPLETED: "login_completed",
  OAUTH_INITIATED: "oauth_initiated",
} as const;

export const ONBOARDING_EVENTS = {
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;

// ==========================================
// 2. CORE FEATURE ADOPTION
// ==========================================

export const PROPERTY_EVENTS = {
  PROPERTY_CREATED: "property_created",
  PROPERTY_DELETED: "property_deleted",
} as const;

export const TRANSACTION_EVENTS = {
  TRANSACTION_CREATED: "transaction_created",
  TRANSACTION_DELETED: "transaction_deleted",
  TRANSACTION_EXPORTED: "transaction_exported",
} as const;

// ==========================================
// 3. DASHBOARD & ANALYTICS USAGE
// ==========================================

export const DASHBOARD_EVENTS = {
  DASHBOARD_VIEWED: "dashboard_viewed",
  ANALYTICS_VIEWED: "analytics_viewed",
  TIME_RANGE_CHANGED: "time_range_changed",
} as const;

// ==========================================
// 4. SUBSCRIPTION & MONETIZATION
// ==========================================

export const BILLING_EVENTS = {
  PRICING_VIEWED: "pricing_viewed",
  PLAN_SELECTED: "plan_selected",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  TRIAL_STARTED: "trial_started",
  TRIAL_ENDING_SOON: "trial_ending_soon",
  PROPERTY_LIMIT_REACHED: "property_limit_reached",
} as const;

// ==========================================
// 5. SETTINGS & PREFERENCES
// ==========================================

export const SETTINGS_EVENTS = {
  PREFERENCES_UPDATED: "preferences_updated",
  PASSWORD_CHANGED: "password_changed",
  ACCOUNT_DELETED: "account_deleted",
} as const;

// ==========================================
// EVENT PROPERTY TYPES
// ==========================================

export interface SignupEventProps {
  method: "email" | "google";
}

export interface LoginEventProps {
  method: "email" | "google";
}

export interface OnboardingCompletedProps {
  currency: string;
  timezone: string;
}

export interface PropertyCreatedProps {
  property_count?: number;
  is_first?: boolean;
}

export interface PropertyDeletedProps {
  property_count?: number;
}

export interface TransactionCreatedProps {
  type: "income" | "expense";
  has_receipt: boolean;
  is_first: boolean;
}

export interface TransactionDeletedProps {
  is_bulk: boolean;
  count: number;
}

export interface TransactionExportedProps {
  filter_applied: boolean;
  row_count?: number;
}

export interface AnalyticsViewedProps {
  time_range: string;
  property_filter: boolean;
}

export interface TimeRangeChangedProps {
  from: string;
  to: string;
}

export interface PricingViewedProps {
  source: "landing" | "settings";
  billing_period: "monthly" | "yearly";
}

export interface PlanSelectedProps {
  plan: string;
  billing_period: "monthly" | "yearly";
}

export interface TrialEndingSoonProps {
  days_remaining: number;
}

export interface SubscriptionUpgradedProps {
  from_plan: string;
  to_plan: string;
}

export interface SubscriptionCancelledProps {
  plan: string;
  days_active: number;
}

export interface PropertyLimitReachedProps {
  current_plan: string;
  property_count: number;
}

export interface PreferencesUpdatedProps {
  currency?: string;
  timezone?: string;
}

export interface AccountDeletedProps {
  days_since_signup: number;
  plan: string;
}

// ==========================================
// USER IDENTIFICATION PROPERTIES
// ==========================================

export interface UserIdentifyProps {
  email: string;
  plan: string;
  subscription_status: string;
  trial_end_date?: string | null;
  created_at: string;
}
