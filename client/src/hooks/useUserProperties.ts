"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Property } from "@/types/properties";

interface UseUserPropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProperties(): UseUserPropertiesReturn {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/properties`, {
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
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProperties();
    } else if (status === "unauthenticated") {
      setProperties([]);
      setIsLoading(false);
      setError(null);
    }
  }, [status, session?.user?.id, fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}