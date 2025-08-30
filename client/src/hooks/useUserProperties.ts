"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Property } from "@/types/properties";
import { PropertyFilters } from "@/lib/validations/property";

interface UseUserPropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProperties(filters: PropertyFilters = {}): UseUserPropertiesReturn {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Properly memoize filters by their actual content, not object reference
  const filtersKey = JSON.stringify(filters);
  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchProperties = useCallback(async () => {
    // Early return if session is still loading
    if (status === "loading") {
      return;
    }
    
    // Handle unauthenticated state
    if (!session?.user?.id) {
      setProperties([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (memoizedFilters.type) queryParams.append('type', memoizedFilters.type);
      if (memoizedFilters.occupancy) queryParams.append('occupancy', memoizedFilters.occupancy);
      if (memoizedFilters.minRent) queryParams.append('minRent', memoizedFilters.minRent.toString());
      if (memoizedFilters.maxRent) queryParams.append('maxRent', memoizedFilters.maxRent.toString());
      if (memoizedFilters.search) queryParams.append('search', memoizedFilters.search);

      const response = await fetch(`/api/properties?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, status, memoizedFilters]);

  // Only fetch when fetchProperties function changes
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}