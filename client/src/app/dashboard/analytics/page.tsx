"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatPercentage } from "@/lib/utils/index";
import { getTrendData } from "@/lib/utils/analytics";
import { CashFlowChart } from "@/components/dashboard/analytics/CashFlowChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/analytics/ExpenseBreakdownChart";
import { TopIncomeChart } from "@/components/dashboard/analytics/TopIncomeChart";
import { NetIncomeChart } from "@/components/dashboard/analytics/NetIncomeChart";
import { ROIChart } from "@/components/dashboard/analytics/ROIChart";
import { PropertyOption } from "@/components/dashboard/analytics/PropertySelector";

import {
  getAnalyticsKPIs,
  getAnalyticsCharts,
  getPropertyComparison,
  KPIResponse,
  ChartsResponse,
  PropertyComparisonResponse,
} from "@/lib/services/client/analyticsService";
import { getProperties } from "@/lib/services/client/propertiesService";

interface AnalyticsState {
  kpis: KPIResponse | null;
  previousKpis: KPIResponse | null;
  charts: ChartsResponse | null;
  propertyComparison: PropertyComparisonResponse | null;
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

export default function AnalyticsPage() {
  const [loading, setLoading] = useState({
    kpis: true,
    charts: true,
    propertyComparison: true,
    properties: true,
  });

  const [data, setData] = useState<AnalyticsState>({
    kpis: null,
    previousKpis: null,
    charts: null,
    propertyComparison: null,
    properties: [],
  });

  const fetchAnalyticsData = async () => {
    const { dateFrom, dateTo, monthsBack } = getFixedDateRange();
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();

    try {
      setLoading((prev) => ({
        ...prev,
        kpis: true,
        charts: true,
        propertyComparison: true,
      }));

      const [kpisData, previousKpisData, chartsData, comparisonData] =
        await Promise.allSettled([
          getAnalyticsKPIs({
            dateFrom: currentMonth.dateFrom,
            dateTo: currentMonth.dateTo,
            includePropertyDetails: true,
          }),
          getAnalyticsKPIs({
            dateFrom: previousMonth.dateFrom,
            dateTo: previousMonth.dateTo,
            includePropertyDetails: true,
          }),
          getAnalyticsCharts({
            dateFrom,
            dateTo,
            monthsBack,
          }),
          getPropertyComparison({
            dateFrom,
            dateTo,
            includeKPIs: true,
          }),
        ]);

      if (kpisData.status === "fulfilled") {
        setData((prev) => ({ ...prev, kpis: kpisData.value }));
      } else {
        toast.error("Failed to load KPI data");
      }

      if (previousKpisData.status === "fulfilled") {
        setData((prev) => ({ ...prev, previousKpis: previousKpisData.value }));
      } else {
        console.warn(
          "Failed to load previous month KPIs:",
          previousKpisData.reason
        );
      }

      if (chartsData.status === "fulfilled") {
        setData((prev) => ({ ...prev, charts: chartsData.value }));
      } else {
        toast.error("Failed to load chart data");
      }

      if (comparisonData.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          propertyComparison: comparisonData.value,
        }));
      } else {
        toast.error("Failed to load property comparison data");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading({
        kpis: false,
        charts: false,
        propertyComparison: false,
        properties: false,
      });
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading((prev) => ({ ...prev, properties: true }));
      const properties = await getProperties();
      setData((prev) => ({ ...prev, properties }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    toast.info("Refreshing analytics data...");
    fetchAnalyticsData();
  };

  const getAnalyticsKPIConfigs = (): KPICardConfig[] => {
    const current = data.kpis?.portfolio;
    const previous = data.previousKpis?.portfolio;

    return [
      {
        title: "Total Invested",
        value: formatPercentage(current?.cashOnCashReturn || 0),
        ...getTrendData(
          current?.cashOnCashReturn || 0,
          previous?.cashOnCashReturn
        ),
      },
      {
        title: "Cash Flow",
        value: formatPercentage(current?.netIncome || 0),
        ...getTrendData(current?.netIncome || 0, previous?.netIncome),
      },
      {
        title: "Expense/Income Ratio",
        value: formatPercentage(current?.expenseToIncomeRatio || 0),
        ...getTrendData(
          current?.expenseToIncomeRatio || 0,
          previous?.expenseToIncomeRatio
        ),
      },
      {
        title: "Average ROI",
        value: formatPercentage(current?.averageROI || 0),
        ...getTrendData(current?.averageROI || 0, previous?.averageROI),
      },
    ];
  };

  const isAnyLoading = Object.values(loading).some(Boolean);
  const kpiConfigs = getAnalyticsKPIConfigs();
  console.log(kpiConfigs.length);

  return (
    <div className="flex flex-col px-6 pb-6 gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your property portfolio performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isAnyLoading ? "animate-spin" : ""}`}
            />
            {isAnyLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <KPICards kpiConfigs={kpiConfigs} />
      </section>

      {/* Charts Section */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Performance Charts
            </h2>
          </div>
          <Badge variant="default" className="text-xs shadow-sm">
            6 Months Data
          </Badge>
        </div>

        <div className="flex flex-col gap-8">
          <CashFlowChart properties={data.properties} />
          <ExpenseBreakdownChart properties={data.properties} />
        </div>
      </section>

      {/* Property Comparison Section */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Property Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <TopIncomeChart data={data.propertyComparison?.propertyRanking} />
          <NetIncomeChart data={data.propertyComparison?.propertyRanking} />
          <ROIChart data={data.propertyComparison?.propertyRanking} />
        </div>
      </section>
    </div>
  );
}
