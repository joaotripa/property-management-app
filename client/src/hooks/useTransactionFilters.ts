"use client";

import { useState, useCallback } from "react";
import { TransactionFilters, UseTransactionFiltersReturn } from "@/types/transactions";

const defaultFilters: TransactionFilters = {
  type: 'all',
  sortBy: 'transactionDate',
  sortOrder: 'desc',
};

export function useTransactionFilters(
  initialFilters: Partial<TransactionFilters> = {}
): UseTransactionFiltersReturn {
  const [filters, setFilters] = useState<TransactionFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const updateFilter = useCallback(<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      // Preserve property filter if it was initially set
      ...(initialFilters.propertyId && { propertyId: initialFilters.propertyId }),
    });
  }, [initialFilters.propertyId]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
  };
}