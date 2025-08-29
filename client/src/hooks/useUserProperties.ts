"use client";

import { useState, useEffect } from "react";
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

  const fetchProperties = async () => {
    if (status === "loading") return;
    
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
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.occupancy) queryParams.append('occupancy', filters.occupancy);
      if (filters.minRent) queryParams.append('minRent', filters.minRent.toString());
      if (filters.maxRent) queryParams.append('maxRent', filters.maxRent.toString());
      if (filters.search) queryParams.append('search', filters.search);

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
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [session?.user?.id, status, JSON.stringify(filters)]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}