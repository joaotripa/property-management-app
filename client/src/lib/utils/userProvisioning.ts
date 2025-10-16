import { prisma } from "@/lib/config/database";
import { getDefaultCurrency, getDefaultTimezone } from "@/lib/db/preferences";
import { createSubscription } from "@/lib/stripe/server";
import { AuthLogger } from "@/lib/utils/auth";

/**
 * Initializes a new user account with required data:
 * - UserSettings (currency, timezone, onboarding status)
 * - Subscription (14-day Business trial)
 *
 * Called automatically for:
 * - Google OAuth signups (via NextAuth createUser event)
 * - Email/password signups (via /api/auth/signup)
 *
 * Idempotent: Safe to call multiple times (checks for existing records)
 */
export async function initializeUserAccount(userId: string): Promise<{
  success: boolean;
  created: {
    userSettings: boolean;
    subscription: boolean;
  };
  errors?: string[];
}> {
  const errors: string[] = [];
  const created = {
    userSettings: false,
    subscription: false,
  };

  AuthLogger.info({
    action: 'initialize_user_account_started',
    metadata: { userId }
  });

  try {
    // Check if already initialized
    const [existingSettings, existingSubscription] = await Promise.all([
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.subscription.findUnique({ where: { userId } }),
    ]);

    // Create UserSettings if missing
    if (!existingSettings) {
      try {
        const [defaultCurrency, defaultTimezone] = await Promise.all([
          getDefaultCurrency(),
          getDefaultTimezone(),
        ]);

        if (!defaultCurrency || !defaultTimezone) {
          const msg = 'Default currency or timezone not found in database';
          errors.push(msg);
          AuthLogger.error({
            action: 'initialize_user_account_defaults_missing',
            error: msg,
            metadata: { userId }
          });
        } else {
          await prisma.userSettings.create({
            data: {
              userId,
              currencyId: defaultCurrency.id,
              timezoneId: defaultTimezone.id,
              hasCompletedOnboarding: false,
            },
          });
          created.userSettings = true;
          AuthLogger.info({
            action: 'user_settings_created',
            metadata: {
              userId,
              currency: defaultCurrency.code,
              timezone: defaultTimezone.iana
            }
          });
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error creating UserSettings';
        errors.push(msg);
        AuthLogger.error({
          action: 'user_settings_creation_failed',
          error: msg,
          metadata: { userId }
        });
      }
    } else {
      AuthLogger.info({
        action: 'user_settings_already_exists',
        metadata: { userId }
      });
    }

    // Create Subscription if missing
    if (!existingSubscription) {
      try {
        await createSubscription(userId);
        created.subscription = true;
        AuthLogger.info({
          action: 'subscription_created',
          metadata: {
            userId,
            plan: 'BUSINESS',
            status: 'TRIAL'
          }
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error creating Subscription';
        errors.push(msg);
        AuthLogger.error({
          action: 'subscription_creation_failed',
          error: msg,
          metadata: { userId }
        });
      }
    } else {
      AuthLogger.info({
        action: 'subscription_already_exists',
        metadata: { userId }
      });
    }

    const success = errors.length === 0 || Boolean(existingSettings && existingSubscription);

    AuthLogger.info({
      action: 'initialize_user_account_completed',
      metadata: {
        userId,
        success,
        created,
        errorCount: errors.length
      }
    });

    return {
      success,
      created,
      ...(errors.length > 0 && { errors }),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error during initialization';
    AuthLogger.error({
      action: 'initialize_user_account_failed',
      error: msg,
      metadata: { userId }
    });

    return {
      success: false,
      created,
      errors: [msg],
    };
  }
}
