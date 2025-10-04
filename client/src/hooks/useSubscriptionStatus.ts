"use client";

import { useState, useEffect } from 'react';
import { SubscriptionStatus } from '@prisma/client';

interface SubscriptionData {
  status: SubscriptionStatus;
  plan: string;
  propertyLimit: number;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
}

interface UsageData {
  propertyCount: number;
  propertyLimit: number;
  canCreateProperties: boolean;
  isAtLimit: boolean;
}

interface SubscriptionStatusHook {
  subscription: SubscriptionData | null;
  usage: UsageData | null;
  loading: boolean;
  error: Error | null;
  canMutate: boolean;
  isReadOnly: boolean;
  refetch: () => Promise<void>;
}

export function useSubscriptionStatus(): SubscriptionStatusHook {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/usage');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const canMutate = subscription
    ? (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') &&
      !(subscription.trialDaysRemaining !== undefined && subscription.trialDaysRemaining < 0)
    : false;

  const isReadOnly = !canMutate;

  return {
    subscription,
    usage,
    loading,
    error,
    canMutate,
    isReadOnly,
    refetch: fetchStatus,
  };
}
