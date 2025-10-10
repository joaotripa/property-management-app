import { UserSettingsInput, UserSettingsResponse, UpdateUserSettingsResponse } from "@/lib/validations/userSettings";

export class UserSettingsService {
  private static readonly BASE_URL = "/api/user/settings";

  static async getUserSettings(): Promise<UserSettingsResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user settings:", error);
      throw error;
    }
  }

  static async updateUserSettings(data: UserSettingsInput): Promise<UpdateUserSettingsResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to update user settings: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }
}