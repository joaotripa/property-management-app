/**
 * Umami Analytics Tracker
 *
 * Ultra-simple analytics tracking using Umami Cloud.
 * Replaces PostHog with direct script tag + API calls.
 * No npm packages, no providers, no over-engineering.
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
 * Track an event on the server-side using Umami API
 *
 * @param userId - Unique user identifier
 * @param event - Event name (use constants from events.ts)
 * @param properties - Event properties (typed)
 */
export async function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, AnalyticsValue>
): Promise<void> {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const host = process.env.NEXT_PUBLIC_UMAMI_HOST;

  if (!websiteId || !host) {
    console.warn("[Analytics] Umami not configured for server-side tracking");
    return;
  }

  try {
    await fetch(`${host}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        website: websiteId,
        name: event,
        data: {
          ...properties,
          userId,
        },
      }),
    });
  } catch (error) {
    console.error(
      `[Analytics] Failed to track server event "${event}":`,
      error
    );
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