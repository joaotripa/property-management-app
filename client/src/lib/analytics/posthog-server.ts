/**
 * PostHog Server-Side SDK Instance
 *
 * Singleton instance for server-side event tracking using PostHog Node SDK.
 * Used for tracking events from API routes, webhooks, and server components.
 */

import { PostHog } from "posthog-node";

let posthogServerInstance: PostHog | null = null;

/**
 * Get or create the PostHog server instance (singleton pattern)
 * This ensures we only create one instance for the entire server lifecycle
 */
export function getPostHogServer(): PostHog | null {
  if (typeof window !== "undefined") {
    console.warn(
      "[Analytics] PostHog server instance should not be used on client-side"
    );
    return null;
  }

  if (!posthogServerInstance) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    if (!apiKey) {
      console.warn("[Analytics] PostHog API key not configured for server");
      return null;
    }

    posthogServerInstance = new PostHog(apiKey, {
      host,
      flushAt: 1, // Flush immediately in serverless (important for Next.js)
      flushInterval: 0, // Don't wait for batch
    });
  }

  return posthogServerInstance;
}

/**
 * Flush all pending events and close the PostHog connection
 * Call this before server shutdown or at the end of serverless function
 */
export async function shutdownPostHogServer(): Promise<void> {
  if (posthogServerInstance) {
    await posthogServerInstance.shutdown();
    posthogServerInstance = null;
  }
}
