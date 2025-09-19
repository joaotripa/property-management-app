import {
  getPortfolioKPIs,
  getCashFlowTrend,
  getPropertyRanking
} from "@/lib/db/analytics/queries";
import { getUserProperties } from "@/lib/db/transactions/queries";
import { getTransactionStats } from "@/lib/db/transactions/queries";
import { getRecentActivitiesForUser } from "@/lib/db/activities/queries";
import { KPIMetrics, CashFlowTrendData, PropertyRankingData } from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";

interface OverviewStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
}

interface OverviewPageData {
  previousKpis: KPIMetrics | null;
  properties: PropertyOption[];
  monthlyStats: OverviewStats | null;

  cashFlowTrend: CashFlowTrendData[];

  topProperties: PropertyRankingData[];
  previousTopProperties: PropertyRankingData[];

  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    amount?: number;
    timestamp: Date;
  }>;
}

/**
 * Server-side service to fetch all overview page data
 * Combines all dashboard overview data fetching in parallel for optimal performance
 */
export async function getOverviewPageData(userId: string): Promise<OverviewPageData> {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all data in parallel for optimal performance
    const [
      previousKpisResult,
      propertiesResult,
      monthlyStatsResult,
      cashFlowTrendResult,
      topPropertiesResult,
      previousTopPropertiesResult,
      recentActivitiesResult
    ] = await Promise.allSettled([
      getPortfolioKPIs(userId, undefined, previousMonthStart, previousMonthEnd),
      getUserProperties(userId),
      getTransactionStats(userId, {
        dateFrom: currentMonthStart,
        dateTo: currentMonthEnd,
      }),

      getCashFlowTrend(userId, undefined, 6),

      getPropertyRanking(userId, currentMonthStart, currentMonthEnd),
      getPropertyRanking(userId, previousMonthStart, previousMonthEnd),

      getRecentActivitiesForUser(userId, 3)
    ]);

    return {
      previousKpis: previousKpisResult.status === "fulfilled" ? previousKpisResult.value : null,
      properties: propertiesResult.status === "fulfilled" ? propertiesResult.value : [],
      monthlyStats: monthlyStatsResult.status === "fulfilled" ? monthlyStatsResult.value : null,

      cashFlowTrend: cashFlowTrendResult.status === "fulfilled" ? cashFlowTrendResult.value : [],

      topProperties: topPropertiesResult.status === "fulfilled"
        ? topPropertiesResult.value.slice(0, 4)
        : [],
      previousTopProperties: previousTopPropertiesResult.status === "fulfilled"
        ? previousTopPropertiesResult.value
        : [],

      recentActivities: recentActivitiesResult.status === "fulfilled"
        ? recentActivitiesResult.value.map(activity => ({
            id: activity.id,
            type: activity.type.toString(),
            title: activity.title,
            description: activity.description,
            amount: activity.amount,
            timestamp: new Date(activity.timestamp),
          }))
        : [],
    };
  } catch (error) {
    console.error('Error fetching overview page data:', error);
    throw new Error('Failed to fetch overview page data');
  }
}