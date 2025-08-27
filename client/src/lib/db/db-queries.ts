import { prisma } from "@/lib/prisma";
import { TransactionFilters, Transaction, CategoryOption, PropertyOption } from "@/types/transactions";
import { TransactionType } from "@prisma/client";

/**
 * Get transactions with optional filtering for a specific user
 * Can be used for both global transactions page and property-specific queries
 */
export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<{
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
}> {
  // Build where clause based on filters
  const where: any = {
    userId,
  };

  // Property filter
  if (filters.propertyId) {
    where.propertyId = filters.propertyId;
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    where.transactionDate = {};
    if (filters.dateFrom) {
      where.transactionDate.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.transactionDate.lte = filters.dateTo;
    }
  }

  // Transaction type filter
  if (filters.type && filters.type !== 'all') {
    where.type = filters.type;
  }

  // Amount range filter
  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.amount = {};
    if (filters.amountMin !== undefined) {
      where.amount.gte = filters.amountMin;
    }
    if (filters.amountMax !== undefined) {
      where.amount.lte = filters.amountMax;
    }
  }

  // Category filter
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = {
      in: filters.categoryIds,
    };
  }

  // Recurring filter
  if (filters.isRecurring !== undefined) {
    where.isRecurring = filters.isRecurring;
  }

  // Search in description
  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  // Build order by clause
  const orderBy: any = {};
  if (filters.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || 'desc';
  } else {
    // Default sort by transaction date descending
    orderBy.transactionDate = 'desc';
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get transactions with relations
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform Decimal amounts to numbers for frontend
    const formattedTransactions: Transaction[] = transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      // Normalize nullable fields to match frontend types
      description: transaction.description ?? undefined,
      category: transaction.category
        ? { ...transaction.category, description: transaction.category.description ?? undefined }
        : undefined,
    }));

    return {
      transactions: formattedTransactions,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
}

/**
 * Get transactions for a specific property
 * Convenience wrapper around getTransactions
 */
export async function getPropertyTransactions(
  propertyId: string,
  userId: string,
  filters: Omit<TransactionFilters, 'propertyId'> = {},
  page: number = 1,
  pageSize: number = 50
): Promise<{
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
}> {
  return getTransactions(
    userId,
    { ...filters, propertyId },
    page,
    pageSize
  );
}

/**
 * Get all categories for a user to populate filter dropdown
 */
export async function getUserCategories(userId: string): Promise<CategoryOption[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        // Categories are global or user-specific based on your schema
        // Adjust this query based on your category ownership model
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get all properties for a user to populate filter dropdown
 */
export async function getUserProperties(userId: string): Promise<PropertyOption[]> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw new Error('Failed to fetch properties');
  }
}

/**
 * Get transaction statistics for a property
 * Useful for summary cards or dashboards
 */
export async function getPropertyTransactionStats(
  propertyId: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  recurringCount: number;
}> {
  const where: any = {
    userId,
    propertyId,
  };

  // Add date range if provided
  if (dateFrom || dateTo) {
    where.transactionDate = {};
    if (dateFrom) where.transactionDate.gte = dateFrom;
    if (dateTo) where.transactionDate.lte = dateTo;
  }

  try {
    // Get aggregated data
    const [incomeAgg, expenseAgg, totalCount, recurringCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, isRecurring: true } }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: totalCount,
      recurringCount,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
}

/**
 * Validate that a property belongs to a user
 * Security helper for API routes
 */
export async function validatePropertyAccess(
  propertyId: string,
  userId: string
): Promise<boolean> {
  try {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    });

    return !!property;
  } catch (error) {
    console.error('Error validating property access:', error);
    return false;
  }
}