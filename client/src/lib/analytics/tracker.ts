/**
 * PostHog Analytics Tracker
 *
 * Lightweight utility for type-safe event tracking with error handling.
 * Uses PostHog SDK directly - no over-engineering, just safety + consistency.
 */

import type { PostHog } from "posthog-js";

/**
 * Valid analytics property value types
 */
type AnalyticsValue = string | number | boolean | null;

/**
 * Track an event with PostHog
 *
 * @param posthog - PostHog instance from usePostHog() hook
 * @param event - Event name (use constants from events.ts)
 * @param properties - Event properties (typed)
 */
export function trackEvent(
  posthog: PostHog | null,
  event: string,
  properties?: Record<string, AnalyticsValue>
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!posthog) {
    console.warn("[Analytics] PostHog not initialized");
    return;
  }

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error(`[Analytics] Failed to track event "${event}":`, error);
  }
}

/**
 * Identify a user with PostHog
 *
 * @param posthog - PostHog instance from usePostHog() hook
 * @param userId - Unique user identifier
 * @param properties - User properties
 */
export function identifyUser(
  posthog: PostHog | null,
  userId: string,
  properties?: Record<string, AnalyticsValue>
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!posthog) {
    console.warn("[Analytics] PostHog not initialized");
    return;
  }

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.error("[Analytics] Failed to identify user:", error);
  }
}

/**
 * Reset PostHog identification (on logout)
 *
 * @param posthog - PostHog instance from usePostHog() hook
 */
export function resetUser(posthog: PostHog | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!posthog) {
    return;
  }

  try {
    posthog.reset();
  } catch (error) {
    console.error("[Analytics] Failed to reset user:", error);
  }
}
