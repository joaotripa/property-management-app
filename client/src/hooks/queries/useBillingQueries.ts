import { useQuery } from "@tanstack/react-query";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export interface SubscriptionData {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  propertyLimit: number;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  scheduledPlan?: SubscriptionPlan | null;
  scheduledPlanDate?: string | null;
}

export interface Usage {
  propertyCount: number;
  propertyLimit: number;
  canCreateProperties: boolean;
  isAtLimit: boolean;
}

export interface BillingData {
  subscription: SubscriptionData;
  usage: Usage;
}

export const BILLING_QUERY_KEYS = {
  billing: ['billing'] as const,
} as const;

async function fetchBillingData(): Promise<BillingData> {
  const response = await fetch('/api/billing/usage');
  if (!response.ok) {
    throw new Error('Failed to fetch billing data');
  }
  return response.json();
}

export function useBillingData() {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.billing,
    queryFn: fetchBillingData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
