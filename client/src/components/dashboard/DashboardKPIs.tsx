"use client";

import { useState, useEffect } from "react";
import {
  KPICards,
  formatCurrency,
  formatPercentage,
  getTrendData,
  KPICardConfig,
} from "@/components/analytics/KPICards";
import { getAnalyticsKPIs } from "@/lib/services/analyticsService";
import { getProperties } from "@/lib/services/propertiesService";
import { getTransactionStats } from "@/lib/services/transactionsService";
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

export function DashboardKPIs() {
  const [data, setData] = useState<DashboardKPIData>({
    kpis: null,
    previousKpis: null,
    properties: [],
    monthlyStats: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get current month and previous month date ranges
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

        // Show error only if critical data failed
        if (kpisResult.status === "rejected") {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getDashboardKPIConfigs = (): KPICardConfig[] => {
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
        value: isLoading ? "..." : formatCurrency(currentIncome),
        trend: incomeTrend.trend,
        trendValue: incomeTrend.trendValue
          ? `${incomeTrend.trendValue} vs last month`
          : undefined,
      },
      {
        title: "Total Properties",
        value: isLoading ? "..." : totalProperties.toString(),
      },
      {
        title: "Occupied",
        value: isLoading ? "..." : occupiedCount.toString(),
      },
      {
        title: "Vacant",
        value: isLoading ? "..." : vacantCount.toString(),
      },
      {
        title: "Occupancy Rate",
        value: isLoading ? "..." : formatPercentage(occupancyRate),
      },
    ];
  };

  return (
    <KPICards
      kpiConfigs={getDashboardKPIConfigs()}
      isLoading={isLoading}
      error={error}
      columns={5}
    />
  );
}
