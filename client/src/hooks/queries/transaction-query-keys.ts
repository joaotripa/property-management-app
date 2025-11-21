/**
 * Hierarchical query keys for transaction-related queries
 *
 * This follows the pattern:
 * - all: ["transactions"] - Invalidates ALL transaction queries
 * - lists: ["transactions", "list"] - All transaction lists
 * - stats: ["transactions", "stats", period] - Transaction statistics
 * - details: ["transactions", "detail", id] - Individual transaction
 *
 * Benefits:
 * - Organized cache management
 * - Selective invalidation
 * - Type-safe query keys
 */

export const TRANSACTION_QUERY_KEYS = {
  all: ["transactions"] as const,

  lists: () => [...TRANSACTION_QUERY_KEYS.all, "list"] as const,

  list: (filters?: Record<string, unknown>) =>
    [...TRANSACTION_QUERY_KEYS.lists(), filters] as const,

  stats: {
    all: () => [...TRANSACTION_QUERY_KEYS.all, "stats"] as const,

    period: (period: string, dateFrom?: string, dateTo?: string) =>
      [...TRANSACTION_QUERY_KEYS.stats.all(), period, dateFrom, dateTo] as const,
  },

  detail: (id: string) =>
    [...TRANSACTION_QUERY_KEYS.all, "detail", id] as const,
} as const;
