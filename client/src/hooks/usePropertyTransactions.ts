"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionFilters, Transaction, UsePropertyTransactionsReturn } from "@/types/transactions";

export function usePropertyTransactions(
  propertyId: string | undefined,
  filters: TransactionFilters = {}
): UsePropertyTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    if (!propertyId) {
      setTransactions([]);
      setTotalCount(0);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        params.append('categoryIds', filters.categoryIds.join(','));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`/api/properties/${propertyId}/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform dates from strings to Date objects
      const transformedTransactions: Transaction[] = data.transactions.map((transaction: {
        transactionDate: string;
        createdAt: string;
        updatedAt: string;
        [key: string]: unknown;
      }) => ({
        ...transaction,
        transactionDate: new Date(transaction.transactionDate),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt),
      }));

      setTransactions(transformedTransactions);
      setTotalCount(data.totalCount || transformedTransactions.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching property transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId, filters]);

  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    totalCount,
    refetch,
  };
}