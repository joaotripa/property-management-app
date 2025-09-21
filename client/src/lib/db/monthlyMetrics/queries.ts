import { prisma } from "@/lib/config/database";
import { Prisma } from "@prisma/client";

export interface MonthlyMetricsData {
  propertyId: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
}

export interface AggregatedMonthlyMetrics {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
  period: string; // "YYYY-MM" format
}

/**
 * Get monthly metrics for a specific user within a date range
 */
export async function getMonthlyMetrics(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<MonthlyMetricsData[]> {
  try {
    const where: Prisma.MonthlyMetricsWhereInput = {
      userId,
      ...(propertyId && { propertyId }),
    };

    // Add date filtering
    if (dateFrom || dateTo) {
      const dateConditions: Prisma.MonthlyMetricsWhereInput[] = [];

      if (dateFrom) {
        const fromYear = dateFrom.getFullYear();
        const fromMonth = dateFrom.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { gt: fromYear } },
            { year: fromYear, month: { gte: fromMonth } }
          ]
        });
      }

      if (dateTo) {
        const toYear = dateTo.getFullYear();
        const toMonth = dateTo.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { lt: toYear } },
            { year: toYear, month: { lte: toMonth } }
          ]
        });
      }

      where.AND = dateConditions;
    }

    const metrics = await prisma.monthlyMetrics.findMany({
      where,
      select: {
        propertyId: true,
        year: true,
        month: true,
        totalIncome: true,
        totalExpenses: true,
        cashFlow: true,
        transactionCount: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
        { propertyId: 'asc' },
      ],
    });

    return metrics.map(metric => ({
      propertyId: metric.propertyId,
      year: metric.year,
      month: metric.month,
      totalIncome: Number(metric.totalIncome),
      totalExpenses: Number(metric.totalExpenses),
      cashFlow: Number(metric.cashFlow),
      transactionCount: metric.transactionCount,
    }));
  } catch (error) {
    console.error('Error fetching monthly metrics:', error);
    throw new Error('Failed to fetch monthly metrics');
  }
}

/**
 * Get aggregated monthly metrics (portfolio level) within a date range
 */
export async function getAggregatedMonthlyMetrics(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<AggregatedMonthlyMetrics[]> {
  try {
    const where: Prisma.MonthlyMetricsWhereInput = {
      userId,
      ...(propertyId && { propertyId }),
    };

    // Add date filtering
    if (dateFrom || dateTo) {
      const dateConditions: Prisma.MonthlyMetricsWhereInput[] = [];

      if (dateFrom) {
        const fromYear = dateFrom.getFullYear();
        const fromMonth = dateFrom.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { gt: fromYear } },
            { year: fromYear, month: { gte: fromMonth } }
          ]
        });
      }

      if (dateTo) {
        const toYear = dateTo.getFullYear();
        const toMonth = dateTo.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { lt: toYear } },
            { year: toYear, month: { lte: toMonth } }
          ]
        });
      }

      where.AND = dateConditions;
    }

    const aggregated = await prisma.monthlyMetrics.groupBy({
      by: ['year', 'month'],
      where,
      _sum: {
        totalIncome: true,
        totalExpenses: true,
        cashFlow: true,
        transactionCount: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    return aggregated.map(item => ({
      year: item.year,
      month: item.month,
      totalIncome: Number(item._sum.totalIncome || 0),
      totalExpenses: Number(item._sum.totalExpenses || 0),
      cashFlow: Number(item._sum.cashFlow || 0),
      transactionCount: item._sum.transactionCount || 0,
      period: `${item.year}-${item.month.toString().padStart(2, '0')}`,
    }));
  } catch (error) {
    console.error('Error fetching aggregated monthly metrics:', error);
    throw new Error('Failed to fetch aggregated monthly metrics');
  }
}

/**
 * Get total metrics across all months for portfolio KPIs
 */
export async function getTotalMetrics(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
}> {
  try {
    const where: Prisma.MonthlyMetricsWhereInput = {
      userId,
      ...(propertyId && { propertyId }),
    };

    // Add date filtering
    if (dateFrom || dateTo) {
      const dateConditions: Prisma.MonthlyMetricsWhereInput[] = [];

      if (dateFrom) {
        const fromYear = dateFrom.getFullYear();
        const fromMonth = dateFrom.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { gt: fromYear } },
            { year: fromYear, month: { gte: fromMonth } }
          ]
        });
      }

      if (dateTo) {
        const toYear = dateTo.getFullYear();
        const toMonth = dateTo.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { lt: toYear } },
            { year: toYear, month: { lte: toMonth } }
          ]
        });
      }

      where.AND = dateConditions;
    }

    const totals = await prisma.monthlyMetrics.aggregate({
      where,
      _sum: {
        totalIncome: true,
        totalExpenses: true,
        cashFlow: true,
        transactionCount: true,
      },
    });

    return {
      totalIncome: Number(totals._sum.totalIncome || 0),
      totalExpenses: Number(totals._sum.totalExpenses || 0),
      cashFlow: Number(totals._sum.cashFlow || 0),
      transactionCount: totals._sum.transactionCount || 0,
    };
  } catch (error) {
    console.error('Error fetching total metrics:', error);
    throw new Error('Failed to fetch total metrics');
  }
}

/**
 * Get monthly metrics grouped by property for property-level KPIs
 */
export async function getPropertyMetrics(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  propertyId: string;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  transactionCount: number;
}[]> {
  try {
    const where: Prisma.MonthlyMetricsWhereInput = {
      userId,
      ...(propertyId && { propertyId }),
    };

    // Add date filtering
    if (dateFrom || dateTo) {
      const dateConditions: Prisma.MonthlyMetricsWhereInput[] = [];

      if (dateFrom) {
        const fromYear = dateFrom.getFullYear();
        const fromMonth = dateFrom.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { gt: fromYear } },
            { year: fromYear, month: { gte: fromMonth } }
          ]
        });
      }

      if (dateTo) {
        const toYear = dateTo.getFullYear();
        const toMonth = dateTo.getMonth() + 1;
        dateConditions.push({
          OR: [
            { year: { lt: toYear } },
            { year: toYear, month: { lte: toMonth } }
          ]
        });
      }

      where.AND = dateConditions;
    }

    const propertyMetrics = await prisma.monthlyMetrics.groupBy({
      by: ['propertyId'],
      where,
      _sum: {
        totalIncome: true,
        totalExpenses: true,
        cashFlow: true,
        transactionCount: true,
      },
    });

    return propertyMetrics.map(item => ({
      propertyId: item.propertyId,
      totalIncome: Number(item._sum.totalIncome || 0),
      totalExpenses: Number(item._sum.totalExpenses || 0),
      cashFlow: Number(item._sum.cashFlow || 0),
      transactionCount: item._sum.transactionCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching property metrics:', error);
    throw new Error('Failed to fetch property metrics');
  }
}