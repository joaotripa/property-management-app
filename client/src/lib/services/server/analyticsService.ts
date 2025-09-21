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
import {
  calculateDateRange,
  calculatePreviousPeriod
} from "@/lib/utils/dateRange";

export interface AnalyticsPageData {
  kpis: KPIMetrics;
  previousKpis: KPIMetrics;
  cashFlowTrend: CashFlowTrendData[];
  expenseBreakdown: ExpenseBreakdownData[];
  propertyRanking: PropertyRankingData[];
  properties: PropertyOption[];
}

// These functions are now replaced by the TimeRangeSelector utilities

/**
 * Server-side service to fetch all analytics page data
 * Fetches all required data in parallel for optimal performance
 */
export async function getAnalyticsPageData(
  userId: string,
  timeRange: string = "semester"
): Promise<AnalyticsPageData> {
  try {
    const { dateFrom, dateTo, monthsBack } = calculateDateRange(timeRange);
    const { dateFrom: prevDateFrom, dateTo: prevDateTo } = calculatePreviousPeriod(timeRange);

    const [
      kpis,
      previousKpis,
      cashFlowTrend,
      expenseBreakdown,
      propertyRanking,
      properties
    ] = await Promise.all([
      getPortfolioKPIs(userId, undefined, dateFrom, dateTo),
      getPortfolioKPIs(userId, undefined, prevDateFrom, prevDateTo),
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