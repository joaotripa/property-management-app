import { prisma } from "@/lib/config/database";
import { Transaction, CategoryOption, PropertyOption, DatabaseTransactionFilters } from "@/types/transactions";
import { TransactionType, Prisma } from "@prisma/client";

/**
 * Get transactions with optional filtering for a specific user
 * Can be used for both global transactions page and property-specific queries
 */
export async function getTransactions(
  userId: string,
  filters: DatabaseTransactionFilters & {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  transactions: Transaction[];
  totalCount: number;
}> {
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  // Build where clause based on filters
  const where: Prisma.TransactionWhereInput = {
    userId,
    deletedAt: null, // Only get active transactions
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


  // Search in description
  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  // Build order by clause
  const orderBy: Prisma.TransactionOrderByWithRelationInput = {};
  if (filters.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || 'desc';
  } else {
    // Default sort by transaction date descending
    orderBy.transactionDate = 'desc';
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });

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
      skip: offset,
      take: limit,
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
  filters: Omit<DatabaseTransactionFilters, 'propertyId'> & {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  transactions: Transaction[];
  totalCount: number;
}> {
  return getTransactions(
    userId,
    { ...filters, propertyId }
  );
}

/**
 * Get all categories for a user to populate filter dropdown
 */
export async function getUserCategories(): Promise<CategoryOption[]> {
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
        deletedAt: null, // Only get active properties
      },
      select: {
        id: true,
        name: true,
        address: true,
        occupancy: true,
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
  cashFlow: number;
  transactionCount: number;
  recurringCount: number;
}> {
  const where: Prisma.TransactionWhereInput = {
    userId,
    propertyId,
    deletedAt: null, // Only get active transactions
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
      Promise.resolve(0), // Removed recurring count
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);

    return {
      totalIncome,
      totalExpenses,
      cashFlow: totalIncome - totalExpenses,
      transactionCount: totalCount,
      recurringCount,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
}

/**
 * Get transaction statistics for all transactions with optional filtering
 * Useful for summary cards on transactions page
 */
export async function getTransactionStats(
  userId: string,
  filters: Omit<DatabaseTransactionFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'> = {}
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
  recurringCount: number;
}> {
  // Build where clause using same logic as getTransactions
  const where: Prisma.TransactionWhereInput = {
    userId,
    deletedAt: null, // Only get active transactions
  };

  // Apply all the same filters as getTransactions
  if (filters.propertyId) {
    where.propertyId = filters.propertyId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.transactionDate = {};
    if (filters.dateFrom) {
      where.transactionDate.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.transactionDate.lte = filters.dateTo;
    }
  }

  if (filters.type && filters.type !== 'all') {
    where.type = filters.type;
  }

  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.amount = {};
    if (filters.amountMin !== undefined) {
      where.amount.gte = filters.amountMin;
    }
    if (filters.amountMax !== undefined) {
      where.amount.lte = filters.amountMax;
    }
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = {
      in: filters.categoryIds,
    };
  }


  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  try {
    // Get aggregated data using same where clause as transactions
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
      Promise.resolve(0), // Removed recurring count
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);

    return {
      totalIncome,
      totalExpenses,
      cashFlow: totalIncome - totalExpenses,
      transactionCount: totalCount,
      recurringCount,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
}

/**
 * Get all transactions for export (no pagination)
 * Returns full property and category details for CSV export
 */
export async function getTransactionsForExport(
  userId: string,
  filters: Omit<DatabaseTransactionFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'> = {}
): Promise<Array<{
  transactionDate: Date;
  amount: number;
  type: string;
  description?: string;
  category: {
    name: string;
    type: string;
  };
  property: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}>> {
  const where: Prisma.TransactionWhereInput = {
    userId,
    deletedAt: null,
  };

  if (filters.propertyId) {
    where.propertyId = filters.propertyId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.transactionDate = {};
    if (filters.dateFrom) {
      where.transactionDate.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.transactionDate.lte = filters.dateTo;
    }
  }

  if (filters.type && filters.type !== 'all') {
    where.type = filters.type;
  }

  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.amount = {};
    if (filters.amountMin !== undefined) {
      where.amount.gte = filters.amountMin;
    }
    if (filters.amountMax !== undefined) {
      where.amount.lte = filters.amountMax;
    }
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = {
      in: filters.categoryIds,
    };
  }

  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            type: true,
          },
        },
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return transactions.map((transaction) => ({
      transactionDate: transaction.transactionDate,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description ?? undefined,
      category: {
        name: transaction.category.name,
        type: transaction.category.type,
      },
      property: {
        name: transaction.property.name,
        address: transaction.property.address,
        city: transaction.property.city ?? undefined,
        state: transaction.property.state ?? undefined,
        zipCode: transaction.property.zipCode ?? undefined,
        country: transaction.property.country ?? undefined,
      },
    }));
  } catch (error) {
    console.error('Error fetching transactions for export:', error);
    throw new Error('Failed to fetch transactions for export');
  }
}

/**
 * Validate property access for transactions
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
        deletedAt: null, // Only check active properties
      },
    });

    return !!property;
  } catch (error) {
    console.error('Error validating property access:', error);
    return false;
  }
}