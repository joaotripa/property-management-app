import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PROPERTY_QUERY_KEYS } from "./usePropertyQueries";

interface PropertyMetrics {
  income: number;
  expenses: number;
  cashFlow: number;
  roi: number;
}

async function fetchPropertyMetrics(
  propertyId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<PropertyMetrics> {
  const params = new URLSearchParams({
    propertyId,
    includePropertyDetails: "true",
  });

  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  const response = await fetch(`/api/analytics/kpis?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch property metrics");
  }

  const data = await response.json();
  const propertyData = data.properties?.[0];

  return {
    income: propertyData?.totalIncome || 0,
    expenses: propertyData?.totalExpenses || 0,
    cashFlow: propertyData?.cashFlow || 0,
    roi: propertyData?.roi || 0,
  };
}

export function usePropertyCurrentMonthMetrics(propertyId: string, options?: { enabled?: boolean }) {
  // Stable UTC date calculation with day-level precision
  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();

    // Use explicit UTC methods for consistency across timezones
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    const firstDayOfMonth = new Date(Date.UTC(utcYear, utcMonth, 1));
    const today = new Date(Date.UTC(utcYear, utcMonth, utcDate));

    return {
      // Day-level precision for stable cache keys
      dateFrom: firstDayOfMonth.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
    };
  }, []);

  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.analytics.metrics(propertyId, dateFrom, dateTo),
    queryFn: () => fetchPropertyMetrics(propertyId, dateFrom, dateTo),
    enabled: options?.enabled ?? !!propertyId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePropertyLifetimeMetrics(propertyId: string) {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.analytics.metrics(propertyId),
    queryFn: () => fetchPropertyMetrics(propertyId),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
