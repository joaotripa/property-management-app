import { getTransactions, getTransactionStats, getUserCategories, getUserProperties } from "@/lib/db/transactions/queries";
import { Transaction, CategoryOption, PropertyOption } from "@/types/transactions";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  recurringCount: number;
}

interface TransactionsPageData {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  stats: TransactionStats;
  categories: CategoryOption[];
  properties: PropertyOption[];
}

/**
 * Server-side service to fetch all transactions page data
 * Handles pagination, filtering, and fetches all required data in parallel
 */
export async function getTransactionsPageData(
  userId: string,
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<TransactionsPageData> {
  try {
    // Parse pagination parameters
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const pageSize = typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize) : 25;
    const offset = (page - 1) * pageSize;

    // Helper function to safely parse dates
    const parseDate = (dateString: string | string[] | undefined): Date | undefined => {
      if (typeof dateString !== 'string' || !dateString.trim()) {
        return undefined;
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    };

    // Helper function to safely parse numbers
    const parseNumber = (numberString: string | string[] | undefined): number | undefined => {
      if (typeof numberString !== 'string' || !numberString.trim()) {
        return undefined;
      }
      const number = parseFloat(numberString);
      return isNaN(number) ? undefined : number;
    };

    // Parse and prepare filters for database queries
    const transactionFilters = {
      type: typeof searchParams.type === 'string' ? (searchParams.type as 'INCOME' | 'EXPENSE' | 'all') : undefined,
      dateFrom: parseDate(searchParams.dateFrom),
      dateTo: parseDate(searchParams.dateTo),
      amountMin: parseNumber(searchParams.amountMin),
      amountMax: parseNumber(searchParams.amountMax),
      categoryIds: typeof searchParams.categoryIds === 'string' ? searchParams.categoryIds.split(',') : undefined,
      isRecurring: typeof searchParams.isRecurring === 'string' ? searchParams.isRecurring === 'true' : undefined,
      propertyId: typeof searchParams.propertyId === 'string' ? searchParams.propertyId : undefined,
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
      sortBy: typeof searchParams.sortBy === 'string' ? (searchParams.sortBy as 'transactionDate' | 'amount' | 'type') : 'transactionDate',
      sortOrder: typeof searchParams.sortOrder === 'string' ? (searchParams.sortOrder as 'asc' | 'desc') : 'desc',
      limit: pageSize,
      offset,
    };

    // Prepare stats filters (current month only, ignoring URL filter parameters)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const statsFilters = {
      dateFrom: currentMonthStart,
      dateTo: currentMonthEnd,
      // Stats should only be for current month, ignoring all other filters
    };

    // Fetch all data in parallel for optimal performance
    const [
      transactionsResult,
      stats,
      categories,
      properties
    ] = await Promise.all([
      getTransactions(userId, transactionFilters),
      getTransactionStats(userId, statsFilters),
      getUserCategories(),
      getUserProperties(userId)
    ]);

    const totalPages = Math.ceil(transactionsResult.totalCount / pageSize);

    return {
      transactions: transactionsResult.transactions,
      totalCount: transactionsResult.totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      stats,
      categories,
      properties
    };
  } catch (error) {
    console.error('Error fetching transactions page data:', error);
    throw new Error('Failed to fetch transactions page data');
  }
}