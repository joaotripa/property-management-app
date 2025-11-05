import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Transaction } from "@/types/transactions";
import { PROPERTY_QUERY_KEYS } from "./usePropertyQueries";
import { QUERY_OPTIONS } from "./queryConfig";

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

/**
 * Query hook for property transactions
 *
 * Fetches the last 25 transactions for a property, sorted by date descending.
 *
 * @param propertyId - The property ID
 * @param options - Optional query options (initialData, enabled, etc.)
 * @returns Query result with property transactions
 */
export function usePropertyTransactionsQuery(
  propertyId: string,
  options?: Omit<
    UseQueryOptions<Transaction[], Error>,
    "queryKey" | "queryFn"
  > & { initialData?: Transaction[] }
) {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.transactions(propertyId),
    queryFn: () => fetchPropertyTransactions(propertyId),
    enabled: !!propertyId,
    ...QUERY_OPTIONS.transactions,
    ...options,
  });
}