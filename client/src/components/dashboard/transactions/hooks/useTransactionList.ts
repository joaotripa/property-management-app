"use client";

import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types/transactions";
import { TRANSACTION_QUERY_KEYS } from "@/hooks/queries/transaction-query-keys";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface TransactionListResponse {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface UseTransactionListProps {
  initialTransactions: Transaction[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialCurrentPage: number;
  initialPageSize: number;
}

async function fetchTransactionList(
  searchParams: URLSearchParams
): Promise<TransactionListResponse> {
  const response = await fetch(`/api/transactions?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export function useTransactionList({
  initialTransactions,
  initialTotalCount,
  initialTotalPages,
  initialCurrentPage,
  initialPageSize,
}: UseTransactionListProps) {
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const filterObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      filterObj[key] = value;
    });
    return filterObj;
  }, [searchParams]);

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list(filters),
    queryFn: () => fetchTransactionList(searchParams),
    initialData: {
      transactions: initialTransactions,
      totalCount: initialTotalCount,
      totalPages: initialTotalPages,
      currentPage: initialCurrentPage,
      pageSize: initialPageSize,
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
