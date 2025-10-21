import {
  getPortfolioKPIs,
  getCashFlowTrend,
  getCashFlowTrendWeekly,
  getExpenseBreakdown,
  getPropertyRanking
} from "@/lib/db/analytics/queries";
import { getUserProperties } from "@/lib/db/properties/queries";
import {
  KPIMetrics,
  ExpenseBreakdownData,
  PropertyRankingData,
} from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";
import {
  calculateDateRange,
  calculatePreviousPeriod
} from "@/lib/utils/dateRange";
import { AnyTimeSeriesData } from "@/lib/types/granularity";

export interface AnalyticsPageData {
  kpis: KPIMetrics;
  previousKpis: KPIMetrics;
  cashFlowTrend: AnyTimeSeriesData[];
  expenseBreakdown: ExpenseBreakdownData[];
  propertyRanking: PropertyRankingData[];
  properties: PropertyOption[];
}

export async function getAnalyticsPageData(
  userId: string,
  timeRange: string = "semester",
  propertyId?: string
): Promise<AnalyticsPageData> {
  try {
    const { dateFrom, dateTo, monthsBack } = calculateDateRange(timeRange);
    const { dateFrom: prevDateFrom, dateTo: prevDateTo } = calculatePreviousPeriod(timeRange);

    const useWeeklyData = timeRange === 'current' || timeRange === 'quarter';

    const [
      kpis,
      previousKpis,
      cashFlowTrend,
      expenseBreakdown,
      propertyRanking,
      properties
    ] = await Promise.all([
      getPortfolioKPIs(userId, propertyId, dateFrom, dateTo),
      getPortfolioKPIs(userId, propertyId, prevDateFrom, prevDateTo),
      useWeeklyData
        ? getCashFlowTrendWeekly(userId, propertyId, monthsBack, dateFrom, dateTo)
        : getCashFlowTrend(userId, propertyId, monthsBack, dateFrom, dateTo),
      getExpenseBreakdown(userId, propertyId, dateFrom, dateTo),
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