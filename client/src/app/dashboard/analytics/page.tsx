"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";

// Analytics components
import {
  KPICards,
  formatPercentage,
  getTrendData,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { CashFlowChart } from "@/components/dashboard/analytics/CashFlowChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/analytics/ExpenseBreakdownChart";
import { TopIncomeChart } from "@/components/dashboard/analytics/TopIncomeChart";
import { NetIncomeChart } from "@/components/dashboard/analytics/NetIncomeChart";
import { ROIChart } from "@/components/dashboard/analytics/ROIChart";
import { ROICapRateChart } from "@/components/dashboard/analytics/ROICapRateChart";
import { PropertyOption } from "@/components/dashboard/analytics/PropertySelector";

// Services and types
import {
  getAnalyticsKPIs,
  getAnalyticsCharts,
  getPropertyComparison,
  KPIResponse,
  ChartsResponse,
  PropertyComparisonResponse,
} from "@/lib/services/analyticsService";
import { getProperties } from "@/lib/services/propertiesService";

interface AnalyticsState {
  kpis: KPIResponse | null;
  previousKpis: KPIResponse | null; // For trend calculations
  charts: ChartsResponse | null;
  propertyComparison: PropertyComparisonResponse | null;
  properties: PropertyOption[];
}

// Fixed 6-month date range for all charts
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
    dateTo: new Date(now.getFullYear(), now.getMonth(), 0), // Last day of previous month
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState({
    kpis: true,
    charts: true,
    propertyComparison: true,
    properties: true,
  });

  const [errors, setErrors] = useState({
    kpis: "",
    charts: "",
    propertyComparison: "",
    properties: "",
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
      // Set loading states
      setLoading((prev) => ({
        ...prev,
        kpis: true,
        charts: true,
        propertyComparison: true,
      }));

      setErrors({
        kpis: "",
        charts: "",
        propertyComparison: "",
        properties: "",
      });

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
        setErrors((prev) => ({
          ...prev,
          kpis: kpisData.reason?.message || "Failed to load KPIs",
        }));
        toast.error("Failed to load KPI data");
      }

      if (previousKpisData.status === "fulfilled") {
        setData((prev) => ({ ...prev, previousKpis: previousKpisData.value }));
      } else {
        // Previous month data is optional, don't show error
        console.warn(
          "Failed to load previous month KPIs:",
          previousKpisData.reason
        );
      }

      if (chartsData.status === "fulfilled") {
        setData((prev) => ({ ...prev, charts: chartsData.value }));
      } else {
        setErrors((prev) => ({
          ...prev,
          charts: chartsData.reason?.message || "Failed to load charts",
        }));
        toast.error("Failed to load chart data");
      }

      if (comparisonData.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          propertyComparison: comparisonData.value,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          propertyComparison:
            comparisonData.reason?.message ||
            "Failed to load property comparison",
        }));
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

  // Fetch properties list
  const fetchProperties = async () => {
    try {
      setLoading((prev) => ({ ...prev, properties: true }));
      const properties = await getProperties();
      setData((prev) => ({ ...prev, properties }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      setErrors((prev) => ({
        ...prev,
        properties: "Failed to load properties",
      }));
      toast.error("Failed to load properties");
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProperties();
    fetchAnalyticsData();
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    toast.info("Refreshing analytics data...");
    fetchAnalyticsData();
  };

  // Generate KPI configs for analytics page
  const getAnalyticsKPIConfigs = (): KPICardConfig[] => {
    const current = data.kpis?.portfolio;
    const previous = data.previousKpis?.portfolio;

    return [
      {
        title: "Cash-on-Cash Return",
        value: formatPercentage(current?.cashOnCashReturn || 0),
        ...getTrendData(
          current?.cashOnCashReturn || 0,
          previous?.cashOnCashReturn
        ),
      },
      {
        title: "Average Cap Rate",
        value: formatPercentage(current?.averageCapRate || 0),
        ...getTrendData(current?.averageCapRate || 0, previous?.averageCapRate),
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
    <div className="container flex flex-col mx-auto px-6 gap-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
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
        <KPICards kpiConfigs={kpiConfigs} columns={kpiConfigs.length} />
      </section>

      {/* Charts Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Performance Charts
            </h2>
          </div>
          <Badge variant="secondary" className="text-xs shadow-sm">
            6 Months Data
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Cash Flow Trend */}
          <div className="animate-in slide-in-from-left duration-700">
            <CashFlowChart properties={data.properties} />
          </div>

          {/* Expense Breakdown - spans full width */}
          <div className="animate-in slide-in-from-right duration-700 delay-150">
            <ExpenseBreakdownChart properties={data.properties} />
          </div>
        </div>
      </section>

      {/* Property Comparison Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Property Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Property Ranking */}
          <div className="animate-in slide-in-from-left duration-700 delay-300">
            <TopIncomeChart
              data={data.propertyComparison?.propertyRanking}
              isLoading={loading.propertyComparison}
              error={errors.propertyComparison}
            />
          </div>
          <div className="animate-in slide-in-from-right duration-700 delay-450">
            <NetIncomeChart
              data={data.propertyComparison?.propertyRanking}
              isLoading={loading.propertyComparison}
              error={errors.propertyComparison}
            />
          </div>
          <div className="animate-in slide-in-from-left duration-700 delay-300">
            <ROIChart
              data={data.propertyComparison?.propertyRanking}
              isLoading={loading.propertyComparison}
              error={errors.propertyComparison}
            />
          </div>
          <div className="animate-in slide-in-from-right duration-700 delay-450">
            <ROICapRateChart
              data={data.propertyComparison?.propertyKPIs}
              isLoading={loading.propertyComparison}
              error={errors.propertyComparison}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
