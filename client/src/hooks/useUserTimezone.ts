"use client";

import { useQuery } from "@tanstack/react-query";
import { UserSettingsService } from "@/lib/services/client/userSettingsService";
import { getSystemTimezone } from "@/lib/utils/timezone";

/**
 * Hook to get and cache the user's timezone setting
 * Uses React Query for efficient caching and background refresh
 *
 * @returns User's IANA timezone identifier or system timezone as fallback
 */
export function useUserTimezone() {
  return useQuery({
    queryKey: ['user', 'timezone'],
    queryFn: async () => {
      try {
        const settings = await UserSettingsService.getUserSettings();
        return settings.timezone.iana;
      } catch (error) {
        console.warn('Failed to fetch user timezone, using system timezone:', error);
        return getSystemTimezone();
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache - timezone rarely changes
    gcTime: 1000 * 60 * 60, // 1 hour (was cacheTime in older versions)
    retry: 1, // Minimal retry for settings
    refetchOnWindowFocus: false, // Timezone doesn't change on focus
  });
}