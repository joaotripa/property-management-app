import {
  getAllCurrencies,
  getAllTimezones,
  getCurrencyById,
  getTimezoneById,
  getCurrencyByCode,
  getTimezoneByIana,
  getDefaultCurrency,
  getDefaultTimezone,
} from "@/lib/db/preferences";

export class PreferencesService {
  static async getAllCurrencies() {
    try {
      return await getAllCurrencies();
    } catch (error) {
      console.error("Error in getAllCurrencies:", error);
      throw error;
    }
  }

  static async getAllTimezones() {
    try {
      return await getAllTimezones();
    } catch (error) {
      console.error("Error in getAllTimezones:", error);
      throw error;
    }
  }

  static async getCurrencyById(id: string) {
    try {
      return await getCurrencyById(id);
    } catch (error) {
      console.error("Error in getCurrencyById:", error);
      throw error;
    }
  }

  static async getTimezoneById(id: string) {
    try {
      return await getTimezoneById(id);
    } catch (error) {
      console.error("Error in getTimezoneById:", error);
      throw error;
    }
  }

  static async getCurrencyByCode(code: string) {
    try {
      return await getCurrencyByCode(code);
    } catch (error) {
      console.error("Error in getCurrencyByCode:", error);
      throw error;
    }
  }

  static async getTimezoneByIana(iana: string) {
    try {
      return await getTimezoneByIana(iana);
    } catch (error) {
      console.error("Error in getTimezoneByIana:", error);
      throw error;
    }
  }

  static async getDefaults() {
    try {
      const [defaultCurrency, defaultTimezone] = await Promise.all([
        getDefaultCurrency(),
        getDefaultTimezone(),
      ]);

      return {
        currency: defaultCurrency,
        timezone: defaultTimezone,
      };
    } catch (error) {
      console.error("Error in getDefaults:", error);
      throw error;
    }
  }
}