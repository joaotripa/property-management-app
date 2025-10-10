"use client";

import { useQuery } from "@tanstack/react-query";
import { UserSettingsService } from "@/lib/services/client/userSettingsService";
import type { Currency } from "@/lib/validations/userSettings";

/**
 * Hook to get and cache the user's currency setting
 * Uses infinite caching - only invalidated when user explicitly changes settings
 *
 * @returns User's currency object or undefined while loading
 */
export function useUserCurrency() {
  return useQuery({
    queryKey: ['user', 'currency'],
    queryFn: async (): Promise<Currency> => {
      const settings = await UserSettingsService.getUserSettings();
      return settings.currency;
    },
    staleTime: Infinity, // Cache forever - user preferences rarely change
    gcTime: Infinity,    // Never garbage collect - keep in memory
    retry: 1, // Minimal retry for settings
    refetchOnWindowFocus: false, // Currency doesn't change on focus
  });
}

/**
 * Get default currency for fallback scenarios
 * Based on current app usage, EUR is the default
 */
export function getDefaultCurrency(): Pick<Currency, 'code' | 'symbol'> {
  return {
    code: 'EUR',
    symbol: '€'
  };
}