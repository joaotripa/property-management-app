import { prisma } from "@/lib/prisma";
import { Prisma, TransactionType } from "@prisma/client";

export interface KPIMetrics {
  totalProperties: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  cashOnCashReturn: number;
  averageCapRate: number;
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
  capRate: number;
  roi: number;
  purchasePrice: number;
  marketValue: number;
  monthlyRent: number;
}

export interface CashFlowTrendData {
  month: string;
  year: number;
  monthNum: number;
  income: number;
  expenses: number;
  netIncome: number;
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
    const cashOnCashReturn = totalInvestment > 0 ? (netIncome / totalInvestment) * 100 : 0;

    // Calculate average Cap Rate across properties
    let totalCapRate = 0;
    let propertiesWithCapRate = 0;

    for (const property of properties) {
      const marketValue = Number(property.marketValue || property.purchasePrice || 0);
      if (marketValue > 0) {
        const annualRent = Number(property.rent) * 12;
        const capRate = (annualRent / marketValue) * 100;
        totalCapRate += capRate;
        propertiesWithCapRate++;
      }
    }

    const averageCapRate = propertiesWithCapRate > 0 ? totalCapRate / propertiesWithCapRate : 0;

    // Calculate Expense-to-Income Ratio
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Calculate average ROI
    const averageROI = totalInvestment > 0 
      ? ((totalPortfolioValue - totalInvestment) / totalInvestment) * 100 
      : 0;

    return {
      totalProperties: properties.length,
      totalIncome,
      totalExpenses,
      netIncome,
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      averageCapRate: Math.round(averageCapRate * 100) / 100,
      expenseToIncomeRatio: Math.round(expenseToIncomeRatio * 100) / 100,
      averageROI: Math.round(averageROI * 100) / 100,
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

      const cashOnCashReturn = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
      const capRate = marketValue > 0 ? ((monthlyRent * 12) / marketValue) * 100 : 0;
      const roi = purchasePrice > 0 ? ((marketValue - purchasePrice) / purchasePrice) * 100 : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalIncome,
        totalExpenses,
        netIncome,
        cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
        capRate: Math.round(capRate * 100) / 100,
        roi: Math.round(roi * 100) / 100,
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
 * Get cash flow trend data for charts
 */
export async function getCashFlowTrend(
  userId: string,
  propertyId?: string,
  monthsBack: number = 12
): Promise<CashFlowTrendData[]> {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1); // Start from first day of month

    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      transactionDate: { gte: startDate },
      ...(propertyId && { propertyId }),
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
    const result: CashFlowTrendData[] = Array.from(monthlyData.entries())
      .map(([key, data]) => ({
        month: key,
        year: data.year,
        monthNum: data.month,
        income: data.income,
        expenses: data.expenses,
        netIncome: data.income - data.expenses,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
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
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
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
      const roi = purchasePrice > 0 ? ((marketValue - purchasePrice) / purchasePrice) * 100 : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        netIncome,
        totalIncome,
        totalExpenses,
        roi: Math.round(roi * 100) / 100,
      };
    }).sort((a, b) => b.netIncome - a.netIncome);

    return result;
  } catch (error) {
    console.error('Error fetching property ranking:', error);
    throw new Error('Failed to fetch property ranking');
  }
}