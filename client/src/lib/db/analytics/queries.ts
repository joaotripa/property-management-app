import { prisma } from "@/lib/config/database";
import { Prisma } from "@prisma/client";
import { TransactionType } from "@prisma/client";
import { WeeklyData, MonthlyData } from "@/lib/types/granularity";
import { roundToTwoDecimals } from "@/lib/utils/formatting";

export interface KPIMetrics {
  totalProperties: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  cashOnCashReturn: number;
  expenseToIncomeRatio: number;
  averageROI: number;
  totalPortfolioValue: number;
  totalInvestment: number;
}

export interface PropertyKPIMetrics {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  cashOnCashReturn: number;
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
  netIncome: number;
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
 * Get comprehensive KPI metrics for a user's portfolio
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

    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(propertyId && { propertyId }),
      ...(dateFrom || dateTo) && {
        transactionDate: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    const [
      properties,
      incomeAgg,
      expenseAgg,
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
      prisma.transaction.aggregate({
        where: { ...transactionWhere, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...transactionWhere, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      prisma.property.aggregate({
        where: propertyWhere,
        _sum: {
          purchasePrice: true,
          marketValue: true,
        },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);
    const netIncome = totalIncome - totalExpenses;
    const totalInvestment = Number(propertyStats._sum.purchasePrice || 0);
    const totalPortfolioValue = Number(propertyStats._sum.marketValue || totalInvestment);

    // Calculate Cash-on-Cash Return (annual net income / total investment)
    const cashOnCashReturn = totalInvestment > 0 ? roundToTwoDecimals((netIncome / totalInvestment) * 100) : 0;

    // Calculate Expense-to-Income Ratio
    const expenseToIncomeRatio = totalIncome > 0 ? roundToTwoDecimals((totalExpenses / totalIncome) * 100) : 0;

    // Calculate average ROI
    const averageROI = totalInvestment > 0
      ? roundToTwoDecimals(((totalPortfolioValue - totalInvestment) / totalInvestment) * 100)
      : 0;

    return {
      totalProperties: properties.length,
      totalIncome,
      totalExpenses,
      netIncome,
      cashOnCashReturn,
      expenseToIncomeRatio,
      averageROI,
      totalPortfolioValue,
      totalInvestment,
    };
  } catch (error) {
    console.error('Error fetching portfolio KPIs:', error);
    throw new Error('Failed to fetch portfolio KPIs');
  }
}

/**
 * Get KPI metrics for individual properties
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

    const properties = await prisma.property.findMany({
      where: propertyWhere,
      select: {
        id: true,
        name: true,
        purchasePrice: true,
        marketValue: true,
        rent: true,
        transactions: {
          where: {
            deletedAt: null,
            ...(dateFrom || dateTo) && {
              transactionDate: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            },
          },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    return properties.map((property) => {
      const totalIncome = property.transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = property.transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netIncome = totalIncome - totalExpenses;
      const purchasePrice = Number(property.purchasePrice || 0);
      const marketValue = Number(property.marketValue || purchasePrice);
      const monthlyRent = Number(property.rent);

      const cashOnCashReturn = purchasePrice > 0 ? roundToTwoDecimals((netIncome / purchasePrice) * 100) : 0;
      const roi = purchasePrice > 0 ? roundToTwoDecimals(((marketValue - purchasePrice) / purchasePrice) * 100) : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalIncome,
        totalExpenses,
        netIncome,
        cashOnCashReturn,
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

  // ISO week calculation
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

  // Get Monday of the week (week start)
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
        netIncome: data.income - data.expenses,
        cumulativeNetIncome: 0, 
        week: key,
        weekStart: data.weekStart,
        year: data.year,
        weekNum: data.weekNum,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    // Calculate cumulative net income
    let cumulativeTotal = 0;
    const result: WeeklyCashFlowTrendData[] = sortedData.map(item => {
      cumulativeTotal += item.netIncome;
      return {
        ...item,
        cumulativeNetIncome: roundToTwoDecimals(cumulativeTotal),
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

    // Group by year-month
    const monthlyData = new Map<string, { income: number; expenses: number; year: number; month: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!monthlyData.has(key)) {
        monthlyData.set(key, { income: 0, expenses: 0, year, month });
      }

      const data = monthlyData.get(key)!;
      const amount = Number(transaction.amount);
      
      if (transaction.type === TransactionType.INCOME) {
        data.income += amount;
      } else {
        data.expenses += amount;
      }
    });

    // Convert to array and sort
    const sortedData = Array.from(monthlyData.entries())
      .map(([key, data]) => {
        const periodStart = new Date(data.year, data.month - 1, 1);
        return {
          // MonthlyData interface properties
          granularity: 'monthly' as const,
          periodStart,
          period: key,
          income: data.income,
          expenses: data.expenses,
          netIncome: data.income - data.expenses,
          cumulativeNetIncome: 0, // Will be calculated below
          // CashFlowTrendData specific properties
          month: key,
          year: data.year,
          monthNum: data.month,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });

    // Calculate cumulative net income
    let cumulativeTotal = 0;
    const result: CashFlowTrendData[] = sortedData.map(item => {
      cumulativeTotal += item.netIncome;
      return {
        ...item,
        cumulativeNetIncome: roundToTwoDecimals(cumulativeTotal),
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

    // Group by category
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

    // Convert to array with percentages
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
 * Get property profitability ranking
 */
export async function getPropertyRanking(
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<PropertyRankingData[]> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        purchasePrice: true,
        marketValue: true,
        transactions: {
          where: {
            deletedAt: null,
            ...(dateFrom || dateTo) && {
              transactionDate: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            },
          },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    const result: PropertyRankingData[] = properties.map((property) => {
      const totalIncome = property.transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = property.transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netIncome = totalIncome - totalExpenses;
      const purchasePrice = Number(property.purchasePrice || 0);
      const marketValue = Number(property.marketValue || purchasePrice);
      const roi = purchasePrice > 0 ? roundToTwoDecimals(((marketValue - purchasePrice) / purchasePrice) * 100) : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        netIncome,
        totalIncome,
        totalExpenses,
        roi,
      };
    }).sort((a, b) => b.netIncome - a.netIncome);

    return result;
  } catch (error) {
    console.error('Error fetching property ranking:', error);
    throw new Error('Failed to fetch property ranking');
  }
}