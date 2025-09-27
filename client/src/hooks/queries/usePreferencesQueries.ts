import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSettingsService } from "@/lib/services/client/userSettingsService";
import { PreferencesService } from "@/lib/services/client/preferencesService";
import {
  UserSettingsInput,
  UserSettingsResponse,
  Currency,
  Timezone,
  UpdateUserSettingsResponse,
} from "@/lib/validations/userSettings";
import { toast } from "sonner";

// Query Keys
export const QUERY_KEYS = {
  userSettings: ['userSettings'] as const,
  currencies: ['currencies'] as const,
  timezones: ['timezones'] as const,
} as const;

// Fetch functions
async function fetchUserSettings(): Promise<UserSettingsResponse> {
  return UserSettingsService.getUserSettings();
}

async function fetchCurrencies(): Promise<Currency[]> {
  return PreferencesService.getCurrencies();
}

async function fetchTimezones(): Promise<Timezone[]> {
  return PreferencesService.getTimezones();
}

async function updateUserSettings(data: UserSettingsInput): Promise<UpdateUserSettingsResponse> {
  return UserSettingsService.updateUserSettings(data);
}

// Query Hooks
export function useUserSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.userSettings,
    queryFn: fetchUserSettings,
    staleTime: 2 * 60 * 1000, // 2 minutes (user settings change more frequently)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: QUERY_KEYS.currencies,
    queryFn: fetchCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes (currencies rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime in older versions)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useTimezones() {
  return useQuery({
    queryKey: QUERY_KEYS.timezones,
    queryFn: fetchTimezones,
    staleTime: 10 * 60 * 1000, // 10 minutes (timezones rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Mutation Hook with Optimistic Updates
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,

    onMutate: async (newSettings: UserSettingsInput) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.userSettings });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<UserSettingsResponse>(QUERY_KEYS.userSettings);

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData<UserSettingsResponse>(QUERY_KEYS.userSettings, {
          ...previousSettings,
          currencyId: newSettings.currencyId,
          timezoneId: newSettings.timezoneId,
        });
      }

      // Return a context object with the snapshotted value
      return { previousSettings };
    },

    onError: (error, newSettings, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        queryClient.setQueryData(QUERY_KEYS.userSettings, context.previousSettings);
      }

      console.error("Error updating user settings:", error);
      toast.error("Failed to update preferences. Please try again.");
    },

    onSuccess: (data) => {
      // Update the cache with the server response
      if (data.userSettings) {
        queryClient.setQueryData(QUERY_KEYS.userSettings, data.userSettings);
      }

      toast.success("Preferences updated successfully!");
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userSettings });
    },
  });
}

// Prefetch functions for performance optimization
export function usePrefetchPreferences() {
  const queryClient = useQueryClient();

  const prefetchUserSettings = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.userSettings,
      queryFn: fetchUserSettings,
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchCurrencies = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.currencies,
      queryFn: fetchCurrencies,
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchTimezones = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.timezones,
      queryFn: fetchTimezones,
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    prefetchUserSettings,
    prefetchCurrencies,
    prefetchTimezones,
  };
}