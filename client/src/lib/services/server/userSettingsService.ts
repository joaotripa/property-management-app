import {
  getUserSettings,
  upsertUserSettings,
} from "@/lib/db/userSettings";
import {
  getDefaultCurrency,
  getCurrencyById,
  getTimezoneById,
} from "@/lib/db/preferences";
import { UserSettingsInput } from "@/lib/validations/userSettings";

export class UserSettingsService {
  /**
   * Get user's currency for server-side formatting
   * Returns the currency code (e.g., 'EUR', 'USD') or default currency if not found
   * Settings should always exist (created during signup)
   */
  static async getUserCurrency(userId: string): Promise<string> {
    try {
      const userSettings = await getUserSettings(userId);

      if (!userSettings) {
        console.error(`User settings not found for userId: ${userId}`);
        // Fallback to default currency
        const defaultCurrency = await getDefaultCurrency();
        return defaultCurrency?.code || 'EUR';
      }

      return userSettings.currency.code;
    } catch (error) {
      console.error("Error fetching user currency:", error);
      // Fallback to default currency
      const defaultCurrency = await getDefaultCurrency();
      return defaultCurrency?.code || 'EUR';
    }
  }

  /**
   * Get user settings
   * Settings should always exist (created during signup)
   * Returns null if not found (shouldn't happen in normal flow)
   */
  static async getUserSettings(userId: string) {
    try {
      const userSettings = await getUserSettings(userId);

      if (!userSettings) {
        console.error(`User settings not found for userId: ${userId} - this should not happen`);
      }

      return userSettings;
    } catch (error) {
      console.error("Error in getUserSettings:", error);
      throw error;
    }
  }

  /**
   * Update user settings from onboarding dialog
   * Marks onboarding as complete
   */
  static async updateUserSettings(userId: string, data: UserSettingsInput) {
    try {
      // Validate that the currency and timezone exist
      const [currency, timezone] = await Promise.all([
        getCurrencyById(data.currencyId),
        getTimezoneById(data.timezoneId),
      ]);

      if (!currency) {
        throw new Error("Invalid currency selected");
      }

      if (!timezone) {
        throw new Error("Invalid timezone selected");
      }

      const userSettings = await upsertUserSettings({
        userId,
        currencyId: data.currencyId,
        timezoneId: data.timezoneId,
        hasCompletedOnboarding: true, // Mark onboarding as complete
      });

      return userSettings;
    } catch (error) {
      console.error("Error in updateUserSettings:", error);
      throw error;
    }
  }
}