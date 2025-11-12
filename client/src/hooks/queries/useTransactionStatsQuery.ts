import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TRANSACTION_QUERY_KEYS } from "./transaction-query-keys";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
  recurringCount: number;
}

interface StatsFilters {
  dateFrom?: Date;
  dateTo?: Date;
}

async function fetchTransactionStats(filters: StatsFilters): Promise<TransactionStats> {
  const searchParams = new URLSearchParams();

  if (filters.dateFrom) {
    searchParams.append('dateFrom', filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    searchParams.append('dateTo', filters.dateTo.toISOString());
  }

  const response = await fetch(`/api/transactions/stats?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch transaction stats');
  }

  return response.json();
}

export function useTransactionStatsQuery(period: 'current-month' | 'ytd') {
  // Calculate date ranges based on period - memoized to prevent infinite loops
  const dateRanges = useMemo(() => {
    const now = new Date();
    return {
      'current-month': {
        dateFrom: new Date(now.getFullYear(), now.getMonth(), 1),
        dateTo: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      },
      'ytd': {
        dateFrom: new Date(now.getFullYear(), 0, 1),
        dateTo: now,
      },
    };
  }, []);

  const filters = dateRanges[period];

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.stats.period(
      period,
      filters.dateFrom?.toISOString(),
      filters.dateTo?.toISOString()
    ),
    queryFn: () => fetchTransactionStats(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}