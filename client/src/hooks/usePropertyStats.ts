"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface PropertyStats {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  occupancyRate: number;
  totalRent: number;
  averageRent: number;
}

interface UsePropertyStatsReturn {
  stats: PropertyStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePropertyStats(): UsePropertyStatsReturn {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/properties/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchStats();
    } else if (status === "unauthenticated") {
      setStats({
        totalProperties: 0,
        occupiedProperties: 0,
        availableProperties: 0,
        occupancyRate: 0,
        totalRent: 0,
        averageRent: 0,
      });
      setIsLoading(false);
      setError(null);
    }
  }, [status, session?.user?.id, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}