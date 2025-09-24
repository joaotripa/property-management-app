import { useQuery } from "@tanstack/react-query";
import { Transaction, TransactionFilters } from "@/types/transactions";

interface PropertyTransactionsResponse {
  transactions: Array<{
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

async function fetchPropertyTransactions(
  propertyId: string,
  filters: TransactionFilters,
  page: number,
  pageSize: number
): Promise<{
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);
  if (filters.type && filters.type !== "all") params.append("type", filters.type);
  if (filters.amountMin !== undefined) params.append("amountMin", filters.amountMin.toString());
  if (filters.amountMax !== undefined) params.append("amountMax", filters.amountMax.toString());
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    params.append("categoryIds", filters.categoryIds.join(","));
  }
  if (filters.search) params.append("search", filters.search);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  const response = await fetch(`/api/properties/${propertyId}/transactions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const data: PropertyTransactionsResponse = await response.json();

  const transformedTransactions: Transaction[] = data.transactions.map((transaction) => ({
    ...transaction,
    transactionDate: new Date(transaction.transactionDate),
    createdAt: new Date(transaction.createdAt),
    updatedAt: new Date(transaction.updatedAt),
  }));

  return {
    transactions: transformedTransactions,
    totalCount: data.totalCount || transformedTransactions.length,
    totalPages: data.totalPages || 1,
    currentPage: data.currentPage || 1,
  };
}

export function usePropertyTransactionsQuery(
  propertyId: string | undefined,
  filters: TransactionFilters,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: ["property-transactions", propertyId, filters, page, pageSize],
    queryFn: () => fetchPropertyTransactions(propertyId!, filters, page, pageSize),
    enabled: !!propertyId,
  });
}