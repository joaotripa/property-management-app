import { useMemo } from "react";
import { useUserSettings } from "@/hooks/queries/usePreferencesQueries";

export interface OnboardingStatus {
  needsOnboarding: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  isReady: boolean; // Data is loaded and we can show UI
}

/**
 * Hook to determine if the user needs to complete onboarding
 *
 * Onboarding is considered complete when:
 * - User has both currencyId and timezoneId set in their settings
 *
 * This serves as the foundation for future onboarding steps
 */
export function useOnboardingStatus(): OnboardingStatus {
  const {
    data: userSettings,
    isLoading,
    error
  } = useUserSettings();

  const status = useMemo(() => {
    if (isLoading) {
      return {
        needsOnboarding: false,
        isLoading: true,
        hasCompletedOnboarding: false,
        isReady: false,
      };
    }

    if (error) {
      return {
        needsOnboarding: false,
        isLoading: false,
        hasCompletedOnboarding: false,
        isReady: false,
      };
    }

    // Check if onboarding is complete
    // User needs onboarding if they haven't completed the onboarding dialog
    // Settings are created with hasCompletedOnboarding = false during signup
    const hasCompletedOnboarding = userSettings?.hasCompletedOnboarding ?? false;
    const needsOnboarding = !hasCompletedOnboarding;

    return {
      needsOnboarding,
      isLoading: false,
      hasCompletedOnboarding,
      isReady: true,
    };
  }, [userSettings, isLoading, error]);

  return status;
}

/**
 * Alternative hook for checking specific onboarding steps
 * Future extensibility for multi-step onboarding
 */
export function useOnboardingStepStatus() {
  const { data: userSettings, isLoading } = useUserSettings();

  const steps = useMemo(() => {
    if (isLoading) {
      return {
        preferences: false,
        // Future steps can be added here:
        // firstProperty: false,
        // tour: false,
      };
    }

    return {
      preferences: userSettings?.hasCompletedOnboarding ?? false,
      // Future steps:
      // firstProperty: userSettings?.hasCreatedProperty,
      // tour: userSettings?.hasCompletedTour,
    };
  }, [userSettings, isLoading]);

  const allStepsComplete = Object.values(steps).every(Boolean);

  return {
    steps,
    allStepsComplete,
    isLoading,
  };
}