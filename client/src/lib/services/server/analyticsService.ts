import {
  getPortfolioKPIs,
  getCashFlowTrend,
  getExpenseBreakdown,
  getPropertyRanking
} from "@/lib/db/analytics/queries";
import { getUserProperties } from "@/lib/db/properties/queries";
import {
  KPIMetrics,
  CashFlowTrendData,
  ExpenseBreakdownData,
  PropertyRankingData
} from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";

export interface AnalyticsPageData {
  kpis: KPIMetrics;
  previousKpis: KPIMetrics;
  cashFlowTrend: CashFlowTrendData[];
  expenseBreakdown: ExpenseBreakdownData[];
  propertyRanking: PropertyRankingData[];
  properties: PropertyOption[];
}

function getFixedDateRange(): {
  dateFrom: Date;
  dateTo: Date;
  monthsBack: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  return {
    dateFrom: sixMonthsAgo,
    dateTo: today,
    monthsBack: 6,
  };
}

function getCurrentMonthRange(): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    dateFrom: new Date(now.getFullYear(), now.getMonth(), 1),
    dateTo: today,
  };
}

function getPreviousMonthRange(): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  return {
    dateFrom: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    dateTo: new Date(now.getFullYear(), now.getMonth(), 0),
  };
}

/**
 * Server-side service to fetch all analytics page data
 * Fetches all required data in parallel for optimal performance
 */
export async function getAnalyticsPageData(userId: string): Promise<AnalyticsPageData> {
  try {
    const { dateFrom, dateTo, monthsBack } = getFixedDateRange();
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();

    // Fetch all data in parallel for optimal performance
    const [
      kpis,
      previousKpis,
      cashFlowTrend,
      expenseBreakdown,
      propertyRanking,
      properties
    ] = await Promise.all([
      getPortfolioKPIs(userId, undefined, currentMonth.dateFrom, currentMonth.dateTo),
      getPortfolioKPIs(userId, undefined, previousMonth.dateFrom, previousMonth.dateTo),
      getCashFlowTrend(userId, undefined, monthsBack),
      getExpenseBreakdown(userId, undefined, dateFrom, dateTo),
      getPropertyRanking(userId, dateFrom, dateTo),
      getUserProperties(userId)
    ]);

    return {
      kpis,
      previousKpis,
      cashFlowTrend,
      expenseBreakdown,
      propertyRanking,
      properties
    };
  } catch (error) {
    console.error('Error fetching analytics page data:', error);
    throw new Error('Failed to fetch analytics page data');
  }
}