"use client";

import { useState, useEffect } from "react";
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

  const fetchStats = async () => {
    if (status === "loading") return;
    
    if (!session?.user?.id) {
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
      return;
    }

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
  };

  useEffect(() => {
    fetchStats();
  }, [session?.user?.id, status]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}