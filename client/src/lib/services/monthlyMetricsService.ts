import { prisma } from "@/lib/config/database";
import { TransactionType } from "@prisma/client";

export interface MonthlyMetricsCalculation {
  propertyId: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
}

export interface AffectedMonth {
  year: number;
  month: number;
}

/**
 * Calculate monthly metrics for a specific property and month from raw transactions
 */
export async function calculateMonthlyMetrics(
  userId: string,
  propertyId: string,
  year: number,
  month: number
): Promise<MonthlyMetricsCalculation> {
  try {
    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate transactions for this property and month
    const aggregatedData = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        propertyId,
        deletedAt: null,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    aggregatedData.forEach((item) => {
      const amount = Number(item._sum.amount || 0);
      const count = item._count.id;

      if (item.type === TransactionType.INCOME) {
        totalIncome += amount;
      } else if (item.type === TransactionType.EXPENSE) {
        totalExpenses += amount;
      }

      transactionCount += count;
    });

    const cashFlow = totalIncome - totalExpenses;

    return {
      propertyId,
      year,
      month,
      totalIncome,
      totalExpenses,
      cashFlow,
      transactionCount,
    };
  } catch (error) {
    console.error('Error calculating monthly metrics:', error);
    throw new Error(`Failed to calculate monthly metrics for ${propertyId} ${year}-${month}`);
  }
}

/**
 * Upsert monthly metrics (insert if not exists, update if exists)
 */
export async function upsertMonthlyMetrics(
  userId: string,
  metrics: MonthlyMetricsCalculation
): Promise<void> {
  try {
    await prisma.monthlyMetrics.upsert({
      where: {
        propertyId_year_month: {
          propertyId: metrics.propertyId,
          year: metrics.year,
          month: metrics.month,
        },
      },
      update: {
        totalIncome: metrics.totalIncome,
        totalExpenses: metrics.totalExpenses,
        cashFlow: metrics.cashFlow,
        transactionCount: metrics.transactionCount,
        updatedAt: new Date(),
      },
      create: {
        propertyId: metrics.propertyId,
        userId,
        year: metrics.year,
        month: metrics.month,
        totalIncome: metrics.totalIncome,
        totalExpenses: metrics.totalExpenses,
        cashFlow: metrics.cashFlow,
        transactionCount: metrics.transactionCount,
      },
    });
  } catch (error) {
    console.error('Error upserting monthly metrics:', error);
    throw new Error(`Failed to upsert monthly metrics for ${metrics.propertyId} ${metrics.year}-${metrics.month}`);
  }
}

/**
 * Get affected months from a transaction date and optionally a previous date
 */
export function getAffectedMonths(
  transactionDate: Date,
  previousTransactionDate?: Date
): AffectedMonth[] {
  const affectedMonths: Set<string> = new Set();

  // Add current transaction month
  const currentYear = transactionDate.getFullYear();
  const currentMonth = transactionDate.getMonth() + 1;
  affectedMonths.add(`${currentYear}-${currentMonth}`);

  // Add previous transaction month if it exists and is different
  if (previousTransactionDate) {
    const prevYear = previousTransactionDate.getFullYear();
    const prevMonth = previousTransactionDate.getMonth() + 1;
    if (prevYear !== currentYear || prevMonth !== currentMonth) {
      affectedMonths.add(`${prevYear}-${prevMonth}`);
    }
  }

  // Convert set back to objects
  return Array.from(affectedMonths).map((key) => {
    const [year, month] = key.split('-');
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    };
  });
}

/**
 * Update monthly metrics for a specific month and property
 */
export async function updateMonthlyMetricsForMonth(
  userId: string,
  propertyId: string,
  year: number,
  month: number
): Promise<void> {
  try {
    const calculatedMetrics = await calculateMonthlyMetrics(userId, propertyId, year, month);
    await upsertMonthlyMetrics(userId, calculatedMetrics);
  } catch (error) {
    console.error(`Error updating monthly metrics for ${propertyId} ${year}-${month}:`, error);
    throw error;
  }
}

/**
 * Update monthly metrics for multiple months and properties
 */
export async function updateMonthlyMetricsForMonths(
  userId: string,
  updates: Array<{ propertyId: string; year: number; month: number }>
): Promise<void> {
  try {
    // Process updates sequentially to avoid overwhelming the database
    for (const update of updates) {
      await updateMonthlyMetricsForMonth(
        userId,
        update.propertyId,
        update.year,
        update.month
      );
    }
  } catch (error) {
    console.error('Error updating monthly metrics for multiple months:', error);
    throw error;
  }
}

/**
 * Recalculate all monthly metrics for a specific property
 */
export async function recalculatePropertyMetrics(
  userId: string,
  propertyId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<{ updated: number }> {
  try {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: null,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // Get date range of transactions for this property
    const transactionDateRange = await prisma.transaction.aggregate({
      where: {
        propertyId,
        userId,
        deletedAt: null,
        ...(fromDate && { transactionDate: { gte: fromDate } }),
        ...(toDate && { transactionDate: { lte: toDate } }),
      },
      _min: {
        transactionDate: true,
      },
      _max: {
        transactionDate: true,
      },
    });

    const minDate = fromDate || transactionDateRange._min.transactionDate;
    const maxDate = toDate || transactionDateRange._max.transactionDate;

    if (!minDate || !maxDate) {
      return { updated: 0 };
    }

    // Generate all months between min and max dates
    const monthsToUpdate: Array<{ year: number; month: number }> = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (current <= end) {
      monthsToUpdate.push({
        year: current.getFullYear(),
        month: current.getMonth() + 1,
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Update metrics for each month
    for (const { year, month } of monthsToUpdate) {
      await updateMonthlyMetricsForMonth(userId, propertyId, year, month);
    }

    return { updated: monthsToUpdate.length };
  } catch (error) {
    console.error(`Error recalculating property metrics for ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Recalculate all monthly metrics for a user
 */
export async function recalculateUserMetrics(
  userId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<{ updatedProperties: number; updatedMonths: number }> {
  try {
    // Get all properties for the user
    const properties = await prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    let totalMonthsUpdated = 0;

    // Recalculate metrics for each property
    for (const property of properties) {
      const result = await recalculatePropertyMetrics(
        userId,
        property.id,
        fromDate,
        toDate
      );
      totalMonthsUpdated += result.updated;
    }

    return {
      updatedProperties: properties.length,
      updatedMonths: totalMonthsUpdated,
    };
  } catch (error) {
    console.error(`Error recalculating user metrics for ${userId}:`, error);
    throw error;
  }
}

/**
 * Clean up monthly metrics with zero transactions and amounts
 */
export async function cleanupEmptyMetrics(userId: string): Promise<{ deleted: number }> {
  try {
    const result = await prisma.monthlyMetrics.deleteMany({
      where: {
        userId,
        totalIncome: 0,
        totalExpenses: 0,
        transactionCount: 0,
      },
    });

    return { deleted: result.count };
  } catch (error) {
    console.error(`Error cleaning up empty metrics for ${userId}:`, error);
    throw error;
  }
}

/**
 * Validate monthly metrics consistency for a property and month
 */
export async function validateMonthlyMetrics(
  userId: string,
  propertyId: string,
  year: number,
  month: number
): Promise<{
  isValid: boolean;
  stored?: MonthlyMetricsCalculation;
  calculated?: MonthlyMetricsCalculation;
  differences?: Partial<MonthlyMetricsCalculation>;
}> {
  try {
    // Get stored metrics
    const storedMetrics = await prisma.monthlyMetrics.findUnique({
      where: {
        propertyId_year_month: {
          propertyId,
          year,
          month,
        },
      },
    });

    // Calculate fresh metrics
    const calculatedMetrics = await calculateMonthlyMetrics(userId, propertyId, year, month);

    if (!storedMetrics) {
      return {
        isValid: false,
        calculated: calculatedMetrics,
      };
    }

    const stored = {
      propertyId: storedMetrics.propertyId,
      year: storedMetrics.year,
      month: storedMetrics.month,
      totalIncome: Number(storedMetrics.totalIncome),
      totalExpenses: Number(storedMetrics.totalExpenses),
      cashFlow: Number(storedMetrics.cashFlow),
      transactionCount: storedMetrics.transactionCount,
    };

    // Compare values
    const isValid =
      stored.totalIncome === calculatedMetrics.totalIncome &&
      stored.totalExpenses === calculatedMetrics.totalExpenses &&
      stored.cashFlow === calculatedMetrics.cashFlow &&
      stored.transactionCount === calculatedMetrics.transactionCount;

    const differences: Partial<MonthlyMetricsCalculation> = {};
    if (stored.totalIncome !== calculatedMetrics.totalIncome) {
      differences.totalIncome = calculatedMetrics.totalIncome;
    }
    if (stored.totalExpenses !== calculatedMetrics.totalExpenses) {
      differences.totalExpenses = calculatedMetrics.totalExpenses;
    }
    if (stored.cashFlow !== calculatedMetrics.cashFlow) {
      differences.cashFlow = calculatedMetrics.cashFlow;
    }
    if (stored.transactionCount !== calculatedMetrics.transactionCount) {
      differences.transactionCount = calculatedMetrics.transactionCount;
    }

    return {
      isValid,
      stored,
      calculated: calculatedMetrics,
      differences: Object.keys(differences).length > 0 ? differences : undefined,
    };
  } catch (error) {
    console.error(`Error validating monthly metrics for ${propertyId} ${year}-${month}:`, error);
    throw error;
  }
}