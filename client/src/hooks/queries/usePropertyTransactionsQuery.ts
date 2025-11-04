import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Transaction } from "@/types/transactions";
import { PROPERTY_QUERY_KEYS } from "./usePropertyQueries";

interface PropertyTransactionsResponse {
  transactions: Array<
    Omit<Transaction, "transactionDate" | "createdAt" | "updatedAt"> & {
      transactionDate: string;
      createdAt: string;
      updatedAt: string;
    }
  >;
}

async function fetchPropertyTransactions(
  propertyId: string
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  params.append("limit", "25");
  params.append("sortBy", "transactionDate");
  params.append("sortOrder", "desc");

  const response = await fetch(
    `/api/properties/${propertyId}/transactions?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const data: PropertyTransactionsResponse = await response.json();

  const transformedTransactions: Transaction[] = data.transactions.map(
    (transaction) => ({
      ...transaction,
      transactionDate: new Date(transaction.transactionDate),
      createdAt: new Date(transaction.createdAt),
      updatedAt: new Date(transaction.updatedAt),
    })
  );

  return transformedTransactions;
}

export function usePropertyTransactionsQuery(
  propertyId: string,
  options?: Omit<
    UseQueryOptions<Transaction[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.transactions(propertyId),
    queryFn: () => fetchPropertyTransactions(propertyId),
    enabled: !!propertyId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}