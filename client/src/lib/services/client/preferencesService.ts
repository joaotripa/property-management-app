import { CurrenciesResponse, TimezonesResponse } from "@/lib/validations/userSettings";

export class PreferencesService {
  private static readonly CURRENCIES_URL = "/api/preferences/currencies";
  private static readonly TIMEZONES_URL = "/api/preferences/timezones";

  static async getCurrencies(): Promise<CurrenciesResponse> {
    try {
      const response = await fetch(this.CURRENCIES_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch currencies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  }

  static async getTimezones(): Promise<TimezonesResponse> {
    try {
      const response = await fetch(this.TIMEZONES_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch timezones: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching timezones:", error);
      throw error;
    }
  }
}