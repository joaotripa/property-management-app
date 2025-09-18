"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionFilters } from "@/types/transactions";
import { getTransactionStats, TransactionsServiceError } from "@/lib/services/client/transactionsService";
import { TransactionQueryInput } from "@/lib/validations/transaction";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
}

export interface UseTransactionStatsReturn {
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactionStats(
  filters: TransactionFilters = {}
): UseTransactionStatsReturn {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create stable filters key to trigger effects only when filters actually change
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert TransactionFilters to TransactionQueryInput format
      const queryInput: Partial<TransactionQueryInput> = {
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        type: filters.type === 'all' ? undefined : filters.type,
        amountMin: filters.amountMin?.toString(),
        amountMax: filters.amountMax?.toString(),
        categoryIds: filters.categoryIds?.join(','),
        isRecurring: filters.isRecurring?.toString(),
        propertyId: filters.propertyId,
        search: filters.search,
      };

      const data = await getTransactionStats(queryInput);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof TransactionsServiceError ? err.message : 
                          err instanceof Error ? err.message : 
                          'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching transaction stats:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    return await fetchStats();
  }, [fetchStats]);

  // Use filtersKey to trigger effect only when filters actually change
  useEffect(() => {
    fetchStats();
  }, [filtersKey, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}