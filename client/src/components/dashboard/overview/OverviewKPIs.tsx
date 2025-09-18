"use client";

import { useState, useEffect } from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatPercentage, formatCompactCurrency } from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { getAnalyticsKPIs } from "@/lib/services/client/analyticsService";
import { getProperties } from "@/lib/services/client/propertiesService";
import { getTransactionStats } from "@/lib/services/client/transactionsService";
import { KPIMetrics } from "@/lib/db/analytics/queries";
import { PropertyOption } from "@/types/transactions";

interface DashboardKPIData {
  kpis: KPIMetrics | null;
  previousKpis: KPIMetrics | null;
  properties: PropertyOption[];
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
  } | null;
}

export function OverviewKPIs() {
  const [data, setData] = useState<DashboardKPIData>({
    kpis: null,
    previousKpis: null,
    properties: [],
    monthlyStats: null,
  });

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const now = new Date();
        const currentMonth = {
          dateFrom: new Date(now.getFullYear(), now.getMonth(), 1),
          dateTo: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        };

        const previousMonth = {
          dateFrom: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          dateTo: new Date(now.getFullYear(), now.getMonth(), 0),
        };

        const [
          kpisResult,
          previousKpisResult,
          propertiesResult,
          monthlyStatsResult,
        ] = await Promise.allSettled([
          getAnalyticsKPIs({
            dateFrom: currentMonth.dateFrom,
            dateTo: currentMonth.dateTo,
          }),
          getAnalyticsKPIs({
            dateFrom: previousMonth.dateFrom,
            dateTo: previousMonth.dateTo,
          }),
          getProperties(),
          getTransactionStats({
            dateFrom: currentMonth.dateFrom.toISOString().split("T")[0],
            dateTo: currentMonth.dateTo.toISOString().split("T")[0],
          }),
        ]);

        setData({
          kpis:
            kpisResult.status === "fulfilled"
              ? kpisResult.value.portfolio
              : null,
          previousKpis:
            previousKpisResult.status === "fulfilled"
              ? previousKpisResult.value.portfolio
              : null,
          properties:
            propertiesResult.status === "fulfilled"
              ? propertiesResult.value
              : [],
          monthlyStats:
            monthlyStatsResult.status === "fulfilled"
              ? monthlyStatsResult.value
              : null,
        });

        if (kpisResult.status === "rejected") {
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
      }
    };

    fetchOverviewData();
  }, []);

  const getOverviewPIConfigs = (): KPICardConfig[] => {
    const properties = data.properties;
    const occupiedCount = properties.filter(
      (p) => p.occupancy === "OCCUPIED"
    ).length;
    const vacantCount = properties.filter(
      (p) => p.occupancy === "AVAILABLE"
    ).length;
    const totalProperties = properties.length;
    const occupancyRate =
      totalProperties > 0 ? (occupiedCount / totalProperties) * 100 : 0;

    const currentIncome = data.monthlyStats?.totalIncome || 0;
    const previousIncome = data.previousKpis?.totalIncome || 0;

    const incomeTrend = getTrendData(currentIncome, previousIncome);

    return [
      {
        title: "Monthly Revenue",
        value: formatCompactCurrency(currentIncome),
        trend: incomeTrend.trend,
        trendValue: incomeTrend.trendValue
          ? `${incomeTrend.trendValue}`
          : undefined,
      },
      {
        title: "Total Properties",
        value: totalProperties.toString(),
      },
      {
        title: "Occupied",
        value: occupiedCount.toString(),
      },
      {
        title: "Vacant",
        value: vacantCount.toString(),
      },
      {
        title: "Occupancy Rate",
        value: formatPercentage(occupancyRate),
      },
    ];
  };

  const overviewKPIConfigs = getOverviewPIConfigs();

  return <KPICards kpiConfigs={overviewKPIConfigs} />;
}
