/**
 * Umami Analytics Tracker
 *
 * Client-side analytics tracking using Umami Cloud.
 * Pure client-side implementation - no server-side API calls.
 * Simple, honest, and effective.
 */

/**
 * Valid analytics property value types
 */
type AnalyticsValue = string | number | boolean | null;

/**
 * Track an event on the client-side using Umami
 *
 * @param event - Event name (use constants from events.ts)
 * @param properties - Event properties (typed)
 */
export function trackEvent(
  event: string,
  properties?: Record<string, AnalyticsValue>
): void {
  if (typeof window === "undefined") {
    return;
  }

  // Check if Umami is loaded
  if (!window.umami) {
    console.warn("[Analytics] Umami not loaded");
    return;
  }

  try {
    window.umami.track(event, properties);
  } catch (error) {
    console.error(`[Analytics] Failed to track event "${event}":`, error);
  }
}

/**
 * Identify a user with Umami
 *
 * @param userId - Unique user identifier
 * @param properties - User properties
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, AnalyticsValue>
): void {
  trackEvent("$identify", {
    userId,
    ...properties,
  });
}

/**
 * Reset user identification (on logout)
 */
export function resetUser(): void {
  trackEvent("$reset");
}

// Extend Window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, AnalyticsValue>) => void;
    };
  }
}