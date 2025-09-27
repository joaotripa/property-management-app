import {
  getUserSettings,
  upsertUserSettings,
  createUserSettings,
} from "@/lib/db/userSettings";
import {
  getDefaultCurrency,
  getDefaultTimezone,
  getCurrencyById,
  getTimezoneById,
} from "@/lib/db/preferences";
import { UserSettingsInput } from "@/lib/validations/userSettings";

export class UserSettingsService {
  static async getUserSettings(userId: string) {
    try {
      let userSettings = await getUserSettings(userId);

      // If user doesn't have settings, create default ones
      if (!userSettings) {
        const [defaultCurrency, defaultTimezone] = await Promise.all([
          getDefaultCurrency(),
          getDefaultTimezone(),
        ]);

        if (!defaultCurrency || !defaultTimezone) {
          throw new Error("Default preferences not found");
        }

        userSettings = await createUserSettings({
          userId,
          currencyId: defaultCurrency.id,
          timezoneId: defaultTimezone.id,
        });
      }

      return userSettings;
    } catch (error) {
      console.error("Error in getUserSettings:", error);
      throw error;
    }
  }

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
      });

      return userSettings;
    } catch (error) {
      console.error("Error in updateUserSettings:", error);
      throw error;
    }
  }

  static async ensureUserHasSettings(userId: string) {
    try {
      let userSettings = await getUserSettings(userId);

      if (!userSettings) {
        const [defaultCurrency, defaultTimezone] = await Promise.all([
          getDefaultCurrency(),
          getDefaultTimezone(),
        ]);

        if (!defaultCurrency || !defaultTimezone) {
          throw new Error("Default preferences not found");
        }

        userSettings = await createUserSettings({
          userId,
          currencyId: defaultCurrency.id,
          timezoneId: defaultTimezone.id,
        });
      }

      return userSettings;
    } catch (error) {
      console.error("Error in ensureUserHasSettings:", error);
      throw error;
    }
  }
}