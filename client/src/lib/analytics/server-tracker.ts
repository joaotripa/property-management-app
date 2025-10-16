/**
 * Server-side PostHog event tracking
 * Uses PostHog Node SDK for reliable server-side events (webhooks, API routes)
 */

import { getPostHogServer, shutdownPostHogServer } from "./posthog-server";

interface ServerEventProperties {
  [key: string]: string | number | boolean | null;
}

/**
 * Track an event on the server-side using PostHog Node SDK
 *
 * @param userId - Unique user identifier (distinct_id)
 * @param event - Event name (use constants from events.ts)
 * @param properties - Event properties (typed)
 *
 * @example
 * ```typescript
 * await trackServerEvent(userId, BILLING_EVENTS.SUBSCRIPTION_UPGRADED, {
 *   from_plan: 'starter',
 *   to_plan: 'pro',
 * });
 * ```
 */
export async function trackServerEvent(
  userId: string,
  event: string,
  properties?: ServerEventProperties
): Promise<void> {
  const posthog = getPostHogServer();

  if (!posthog) {
    console.warn("[Analytics] PostHog not configured for server-side tracking");
    return;
  }

  try {
    posthog.capture({
      distinctId: userId,
      event,
      properties,
    });

    await shutdownPostHogServer();
  } catch (error) {
    console.error(
      `[Analytics] Failed to track server event "${event}":`,
      error
    );
  }
}
