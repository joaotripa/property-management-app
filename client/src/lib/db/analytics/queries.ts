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


function generateMonthlyPeriods(dateFrom: Date, dateTo: Date): Map<string, CashFlowTrendData> {
  const periods = new Map<string, CashFlowTrendData>();
  const current = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
  const end = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);

  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const period = `${year}-${month.toString().padStart(2, '0')}`;

    periods.set(period, {
      granularity: 'monthly',
      periodStart: new Date(current),
      period,
      income: 0,
      expenses: 0,
      cashFlow: 0,
      cumulativeCashFlow: 0,
      month: period,
      year,
      monthNum: month,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return periods;
}

function generateWeeklyPeriods(dateFrom: Date, dateTo: Date): Map<string, WeeklyCashFlowTrendData> {
  const periods = new Map<string, WeeklyCashFlowTrendData>();
  const current = new Date(dateFrom);
  current.setHours(0, 0, 0, 0);

  const dayOfWeek = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - dayOfWeek);

  const end = new Date(dateTo);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const { weekNum, year, weekStart } = calculateISOWeek(current);
    const period = `${year}-W${weekNum.toString().padStart(2, '0')}`;

    if (!periods.has(period)) {
      periods.set(period, {
        granularity: 'weekly',
        periodStart: new Date(weekStart),
        period,
        income: 0,
        expenses: 0,
        cashFlow: 0,
        cumulativeCashFlow: 0,
        week: period,
        weekStart: new Date(weekStart),
        year,
        weekNum,
      });
    }

    current.setDate(current.getDate() + 7);
  }

  return periods;
}

export async function getCashFlowTrendWeekly(
  userId: string,
  propertyId?: string,
  monthsBack: number | null = 2,
  dateFrom?: Date,
  dateTo?: Date
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

    const now = new Date();
    const startDate = dateFrom || (monthsBack !== null
      ? new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
      : new Date(1900, 0, 1));
    const endDate = dateTo || new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const periods = generateWeeklyPeriods(startDate, endDate);

    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(propertyId && { propertyId }),
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      select: {
        amount: true,
        type: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    transactions.forEach((transaction) => {
      try {
        const date = new Date(transaction.transactionDate);

        if (isNaN(date.getTime())) {
          console.warn('Invalid transaction date:', transaction.transactionDate);
          return;
        }

        const { weekNum, year } = calculateISOWeek(date);
        const key = `${year}-W${weekNum.toString().padStart(2, '0')}`;

        const period = periods.get(key);
        if (!period) return;

        const amount = Number(transaction.amount);

        if (isNaN(amount) || amount < 0) {
          console.warn('Invalid transaction amount:', transaction.amount);
          return;
        }

        if (transaction.type === TransactionType.INCOME) {
          period.income += amount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          period.expenses += amount;
        }

        period.cashFlow = period.income - period.expenses;
      } catch (error) {
        console.warn('Error processing transaction:', error);
      }
    });

    const sortedData = Array.from(periods.values()).sort(
      (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
    );

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

export async function getCashFlowTrend(
  userId: string,
  propertyId?: string,
  monthsBack: number | null = 12,
  dateFrom?: Date,
  dateTo?: Date
): Promise<CashFlowTrendData[]> {
  try {
    const now = new Date();
    const startDate = dateFrom || (monthsBack !== null
      ? new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
      : new Date(1900, 0, 1));
    const endDate = dateTo || new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const periods = generateMonthlyPeriods(startDate, endDate);

    const monthlyMetrics = await getAggregatedMonthlyMetrics(
      userId,
      propertyId,
      startDate,
      endDate
    );

    monthlyMetrics.forEach(metric => {
      const existing = periods.get(metric.period);
      if (existing) {
        existing.income = metric.totalIncome;
        existing.expenses = metric.totalExpenses;
        existing.cashFlow = metric.cashFlow;
      }
    });

    const sortedData = Array.from(periods.values()).sort(
      (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
    );

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