import { prisma } from "@/lib/config/database";
import { Prisma } from "@prisma/client";
import { TransactionType } from "@prisma/client";
import { WeeklyData, MonthlyData } from "@/lib/types/granularity";
import { roundToTwoDecimals } from "@/lib/utils/formatting";
import { getAggregatedMonthlyMetrics, getTotalMetrics, getPropertyMetrics } from "@/lib/db/monthlyMetrics/queries";

export interface KPIMetrics {
  totalProperties: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  expenseToIncomeRatio: number;
  protfolioROI: number;
  totalPortfolioValue: number;
  totalInvestment: number;
}

export interface PropertyKPIMetrics {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  roi: number;
  purchasePrice: number;
  marketValue: number;
  monthlyRent: number;
}

export interface CashFlowTrendData extends MonthlyData {
  month: string;
  year: number;
  monthNum: number;
}

export interface WeeklyCashFlowTrendData extends WeeklyData {
  week: string; // Format: "YYYY-WW"
  weekStart: Date;
  year: number;
  weekNum: number;
}

export interface ExpenseBreakdownData {
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}


export interface PropertyRankingData {
  propertyId: string;
  propertyName: string;
  cashFlow: number;
  totalIncome: number;
  totalExpenses: number;
  roi: number;
}

export interface ChartsResponse {
  cashFlowTrend?: CashFlowTrendData[];
  weeklyCashFlowTrend?: WeeklyCashFlowTrendData[];
  expenseBreakdown?: ExpenseBreakdownData[];
}

/**
 * Get comprehensive KPI metrics for a user's portfolio using monthly metrics for better performance
 */
export async function getPortfolioKPIs(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<KPIMetrics> {
  try {
    const propertyWhere: Prisma.PropertyWhereInput = {
      userId,
      deletedAt: null,
      ...(propertyId && { id: propertyId }),
    };

    const [
      properties,
      metricsData,
      propertyStats,
    ] = await Promise.all([
      prisma.property.findMany({
        where: propertyWhere,
        select: {
          id: true,
          name: true,
          purchasePrice: true,
          marketValue: true,
          rent: true,
        },
      }),
      getTotalMetrics(userId, propertyId, dateFrom, dateTo),
      prisma.property.aggregate({
        where: propertyWhere,
        _sum: {
          purchasePrice: true,
          marketValue: true,
        },
      }),
    ]);

    const { totalIncome, totalExpenses, cashFlow } = metricsData;
    const totalInvestment = Number(propertyStats._sum.purchasePrice || 0);
    const totalPortfolioValue = Number(propertyStats._sum.marketValue || totalInvestment);
    const expenseToIncomeRatio = totalIncome > 0 ? roundToTwoDecimals((totalExpenses / totalIncome) * 100) : 0;

    const protfolioROI = totalInvestment > 0
      ? roundToTwoDecimals((cashFlow / totalInvestment) * 100)
      : 0;

    return {
      totalProperties: properties.length,
      totalIncome,
      totalExpenses,
      cashFlow,
      expenseToIncomeRatio,
      protfolioROI,
      totalPortfolioValue,
      totalInvestment,
    };
  } catch (error) {
    console.error('Error fetching portfolio KPIs:', error);
    throw new Error('Failed to fetch portfolio KPIs');
  }
}

/**
 * Get KPI metrics for individual properties using monthly metrics for better performance
 */
export async function getPropertyKPIs(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<PropertyKPIMetrics[]> {
  try {
    const propertyWhere: Prisma.PropertyWhereInput = {
      userId,
      deletedAt: null,
      ...(propertyId && { id: propertyId }),
    };

    const [properties, propertyMetrics] = await Promise.all([
      prisma.property.findMany({
        where: propertyWhere,
        select: {
          id: true,
          name: true,
          purchasePrice: true,
          marketValue: true,
          rent: true,
        },
      }),
      getPropertyMetrics(userId, propertyId, dateFrom, dateTo),
    ]);

    const metricsMap = new Map(
      propertyMetrics.map(metric => [metric.propertyId, metric])
    );

    return properties.map((property) => {
      const metrics = metricsMap.get(property.id) || {
        totalIncome: 0,
        totalExpenses: 0,
        cashFlow: 0,
        transactionCount: 0,
      };

      const purchasePrice = Number(property.purchasePrice || 0);
      const marketValue = Number(property.marketValue || purchasePrice);
      const monthlyRent = Number(property.rent);

      const roi = purchasePrice > 0 ? roundToTwoDecimals((metrics.cashFlow / purchasePrice) * 100) : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalIncome: metrics.totalIncome,
        totalExpenses: metrics.totalExpenses,
        cashFlow: metrics.cashFlow,
        roi,
        purchasePrice,
        marketValue,
        monthlyRent,
      };
    });
  } catch (error) {
    console.error('Error fetching property KPIs:', error);
    throw new Error('Failed to fetch property KPIs');
  }
}

/**
 * Calculate ISO week number and week start date
 */
function calculateISOWeek(date: Date): { weekNum: number; year: number; weekStart: Date } {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);

  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

  const weekStart = new Date(date);
  const dayOfWeek = (weekStart.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  weekStart.setDate(weekStart.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  return {
    weekNum: weekNum,
    year: tempDate.getFullYear(),
    weekStart
  };
}

/**
 * Get weekly cash flow trend data for short-term analysis
 */
export async function getCashFlowTrendWeekly(
  userId: string,
  propertyId?: string,
  monthsBack: number | null = 2
): Promise<WeeklyCashFlowTrendData[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }

    if (monthsBack !== null && (monthsBack < 1 || monthsBack > 6)) {
      throw new Error('monthsBack must be between 1 and 6 for weekly data, or null for full history');
    }

    if (propertyId && typeof propertyId !== 'string') {
      throw new Error('Invalid propertyId provided');
    }

    let transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(propertyId && { propertyId }),
    };

    // Add date filter only if monthsBack is specified (not null for full history)
    if (monthsBack !== null) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);
      startDate.setDate(1);

      transactionWhere = {
        ...transactionWhere,
        transactionDate: { gte: startDate },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      select: {
        amount: true,
        type: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    // Group by ISO week
    const weeklyData = new Map<string, { income: number; expenses: number; weekStart: Date; year: number; weekNum: number }>();

    transactions.forEach((transaction) => {
      try {
        const date = new Date(transaction.transactionDate);

        if (isNaN(date.getTime())) {
          console.warn('Invalid transaction date:', transaction.transactionDate);
          return;
        }

        const { weekNum, year, weekStart } = calculateISOWeek(date);
        const key = `${year}-W${weekNum.toString().padStart(2, '0')}`;

        if (!weeklyData.has(key)) {
          weeklyData.set(key, { income: 0, expenses: 0, weekStart, year, weekNum });
        }

        const data = weeklyData.get(key)!;
        const amount = Number(transaction.amount);

        if (isNaN(amount) || amount < 0) {
          console.warn('Invalid transaction amount:', transaction.amount);
          return;
        }

        if (transaction.type === TransactionType.INCOME) {
          data.income += amount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          data.expenses += amount;
        }
      } catch (error) {
        console.warn('Error processing transaction:', error);
      }
    });

    const sortedData = Array.from(weeklyData.entries())
      .map(([key, data]) => ({
        granularity: 'weekly' as const,
        periodStart: data.weekStart,
        period: key,
        income: data.income,
        expenses: data.expenses,
        cashFlow: data.income - data.expenses,
        cumulativeCashFlow: 0, 
        week: key,
        weekStart: data.weekStart,
        year: data.year,
        weekNum: data.weekNum,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    let cumulativeTotal = 0;
    const result: WeeklyCashFlowTrendData[] = sortedData.map(item => {
      cumulativeTotal += item.cashFlow;
      return {
        ...item,
        cumulativeCashFlow: roundToTwoDecimals(cumulativeTotal),
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching weekly cash flow trend:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch weekly cash flow trend');
  }
}

/**
 * Get cash flow trend data for charts
 */
export async function getCashFlowTrend(
  userId: string,
  propertyId?: string,
  monthsBack: number | null = 12
): Promise<CashFlowTrendData[]> {
  try {
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    if (monthsBack !== null) {
      const now = new Date();
      dateFrom = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const monthlyMetrics = await getAggregatedMonthlyMetrics(
      userId,
      propertyId,
      dateFrom,
      dateTo
    );

    const sortedData = monthlyMetrics.map(metric => {
      const periodStart = new Date(metric.year, metric.month - 1, 1);
      return {
        granularity: 'monthly' as const,
        periodStart,
        period: metric.period,
        income: metric.totalIncome,
        expenses: metric.totalExpenses,
        cashFlow: metric.cashFlow,
        cumulativeCashFlow: 0, 
        month: metric.period,
        year: metric.year,
        monthNum: metric.month,
      };
    });

    // Calculate cumulative net income
    let cumulativeTotal = 0;
    const result: CashFlowTrendData[] = sortedData.map(item => {
      cumulativeTotal += item.cashFlow;
      return {
        ...item,
        cumulativeCashFlow: roundToTwoDecimals(cumulativeTotal),
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching cash flow trend:', error);
    throw new Error('Failed to fetch cash flow trend');
  }
}

/**
 * Get expense breakdown by category
 */
export async function getExpenseBreakdown(
  userId: string,
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<ExpenseBreakdownData[]> {
  try {
    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      type: TransactionType.EXPENSE,
      ...(propertyId && { propertyId }),
      ...(dateFrom || dateTo) && {
        transactionDate: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    const expenses = await prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const categoryData = new Map<string, { amount: number; count: number }>();
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      const amount = Number(expense.amount);
      totalExpenses += amount;

      if (!categoryData.has(categoryName)) {
        categoryData.set(categoryName, { amount: 0, count: 0 });
      }

      const data = categoryData.get(categoryName)!;
      data.amount += amount;
      data.count += 1;
    });

    const result: ExpenseBreakdownData[] = Array.from(categoryData.entries())
      .map(([categoryName, data]) => ({
        categoryName,
        amount: data.amount,
        percentage: totalExpenses > 0 ? roundToTwoDecimals((data.amount / totalExpenses) * 100) : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return result;
  } catch (error) {
    console.error('Error fetching expense breakdown:', error);
    throw new Error('Failed to fetch expense breakdown');
  }
}


/**
 * Get property profitability ranking using monthly metrics for better performance
 */
export async function getPropertyRanking(
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<PropertyRankingData[]> {
  try {
    const [properties, propertyMetrics] = await Promise.all([
      prisma.property.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          purchasePrice: true,
          marketValue: true,
        },
      }),
      getPropertyMetrics(userId, undefined, dateFrom, dateTo),
    ]);

    // Create a map for quick lookup of metrics by propertyId
    const metricsMap = new Map(
      propertyMetrics.map(metric => [metric.propertyId, metric])
    );

    const result: PropertyRankingData[] = properties.map((property) => {
      const metrics = metricsMap.get(property.id) || {
        totalIncome: 0,
        totalExpenses: 0,
        cashFlow: 0,
        transactionCount: 0,
      };

      const purchasePrice = Number(property.purchasePrice || 0);
      const roi = purchasePrice > 0 ? roundToTwoDecimals((metrics.cashFlow / purchasePrice) * 100) : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        cashFlow: metrics.cashFlow,
        totalIncome: metrics.totalIncome,
        totalExpenses: metrics.totalExpenses,
        roi,
      };
    }).sort((a, b) => b.cashFlow - a.cashFlow);

    return result;
  } catch (error) {
    console.error('Error fetching property ranking:', error);
    throw new Error('Failed to fetch property ranking');
  }
}