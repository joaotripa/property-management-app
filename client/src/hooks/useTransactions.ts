"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { TransactionFilters, Transaction } from "@/types/transactions";
import { getTransactions, TransactionsServiceError } from "@/lib/services/client/transactionsService";
import { TransactionQueryInput } from "@/lib/validations/transaction";

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  refetch: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function useTransactions(
  filters: TransactionFilters = {},
  initialPage: number = 1,
  initialPageSize: number = 25
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Use ref to track the last request to avoid race conditions
  const lastRequestRef = useRef(0);
  // Use ref to track if component is mounted for cleanup
  const mountedRef = useRef(true);
  
  // Stable filter key to trigger effects only when filters actually change
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  
  // Track previous filters to detect changes
  const prevFiltersKey = useRef<string>("");

  // Initialize mountedRef and cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Core fetch function that doesn't depend on state variables in useCallback
  const fetchTransactions = useCallback(async (page: number, size: number, filterObj: TransactionFilters) => {
    if (!mountedRef.current) {
      return;
    }
    
    const requestId = ++lastRequestRef.current;
    
    setLoading(true);
    setError(null);

    try {
      // Convert TransactionFilters to TransactionQueryInput format
      const queryInput: Partial<TransactionQueryInput> = {
        page: page.toString(),
        limit: size.toString(),
        dateFrom: filterObj.dateFrom?.toISOString(),
        dateTo: filterObj.dateTo?.toISOString(),
        type: filterObj.type === 'all' ? undefined : filterObj.type,
        amountMin: filterObj.amountMin?.toString(),
        amountMax: filterObj.amountMax?.toString(),
        categoryIds: filterObj.categoryIds?.join(','),
        isRecurring: filterObj.isRecurring?.toString(),
        propertyId: filterObj.propertyId,
        search: filterObj.search,
        sortBy: filterObj.sortBy || 'transactionDate',
        sortOrder: filterObj.sortOrder || 'desc',
      };

      const data = await getTransactions(queryInput);
      
      // Only update state if this is still the latest request and component is mounted
      if (requestId === lastRequestRef.current && mountedRef.current) {
        // Transform dates from strings to Date objects
        const transformedTransactions: Transaction[] = data.transactions.map((transaction) => ({
          ...transaction,
          transactionDate: typeof transaction.transactionDate === 'string' 
            ? new Date(transaction.transactionDate) 
            : transaction.transactionDate,
          createdAt: typeof transaction.createdAt === 'string' 
            ? new Date(transaction.createdAt) 
            : transaction.createdAt,
          updatedAt: typeof transaction.updatedAt === 'string' 
            ? new Date(transaction.updatedAt) 
            : transaction.updatedAt,
        }) as Transaction);

        setTransactions(transformedTransactions);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      // Only update error if this is still the latest request and component is mounted
      if (requestId === lastRequestRef.current && mountedRef.current) {
        const errorMessage = err instanceof TransactionsServiceError ? err.message : 
                            err instanceof Error ? err.message : 
                            'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching transactions:', err);
      }
    } finally {
      // Only update loading if this is still the latest request and component is mounted
      if (requestId === lastRequestRef.current && mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Effect for filter changes - always reset to page 1
  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      setCurrentPage(1);
    }
  }, [filtersKey]);

  // Effect for actual data fetching - triggers when filters or pagination changes
  useEffect(() => {
    // Parse filters from filtersKey to avoid dependency issues
    const currentFilters = JSON.parse(filtersKey) as TransactionFilters;
    fetchTransactions(currentPage, pageSize, currentFilters);
  }, [filtersKey, currentPage, pageSize, fetchTransactions]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    return await fetchTransactions(currentPage, pageSize, filters);
  }, [fetchTransactions, currentPage, pageSize, filters]);

  // Page change handler
  const setPage = useCallback((page: number) => {
    if (page !== currentPage && page >= 1) {
      setCurrentPage(page);
    }
  }, [currentPage]);

  // Page size change handler
  const setPageSizeAndResetPage = useCallback((newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  }, [pageSize]);

  return {
    transactions,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    refetch,
    setPage,
    setPageSize: setPageSizeAndResetPage,
  };
}