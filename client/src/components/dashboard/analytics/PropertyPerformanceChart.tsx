"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { PropertyRankingData } from "@/lib/db/analytics/queries";
import { formatCurrency, formatPercentage } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";
import { getPropertyComparison } from "@/lib/services/client/analyticsService";
import { calculateDateRange } from "@/lib/utils/dateRange";
import { useState, useEffect, useCallback } from "react";

interface PropertyPerformanceChartProps {
  data?: PropertyRankingData[];
  timeRange?: string;
  currencyCode: string;
}

type TabType = "income" | "cashflow" | "roi";

const chartConfigs = {
  income: {
    totalIncome: {
      label: "Total Income",
      color: "var(--color-primary)",
    },
  },
  cashflow: {
    cashFlow: {
      label: "Net Income",
      color: "var(--color-primary)",
    },
    negativeCashFlow: {
      label: "Net Loss",
      color: "var(--color-destructive)",
    },
  },
  roi: {
    roi: {
      label: "ROI",
      color: "var(--color-primary)",
    },
    negativeRoi: {
      label: "Negative ROI",
      color: "var(--color-destructive)",
    },
  },
} as const;

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function PropertyPerformanceChart({
  data = [],
  timeRange = "semester",
  currencyCode,
}: PropertyPerformanceChartProps) {

  const [activeTab, setActiveTab] = useState<TabType>("income");
  const [chartData, setChartData] = useState<
    Record<
      TabType,
      (PropertyRankingData & { shortName: string; fill: string })[]
    >
  >({
    income: [],
    cashflow: [],
    roi: [],
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (sortBy: "totalIncome" | "cashFlow" | "roi", tab: TabType) => {
      try {
        setError(null);
        const { dateFrom, dateTo } = calculateDateRange(timeRange);
        const result = await getPropertyComparison({
          dateFrom,
          dateTo,
          sortBy,
        });

        const sortedData = [...result.propertyRanking]
          .sort((a, b) => b[sortBy] - a[sortBy])
          .slice(0, 8);

        let transformedData;
        if (tab === "income") {
          transformedData = sortedData.map((item) => ({
            ...item,
            shortName: truncatePropertyName(item.propertyName),
            fill: chartConfigs.income.totalIncome.color,
          }));
        } else if (tab === "cashflow") {
          transformedData = sortedData.map((item) => ({
            ...item,
            shortName: truncatePropertyName(item.propertyName),
            fill:
              item.cashFlow >= 0
                ? chartConfigs.cashflow.cashFlow.color
                : chartConfigs.cashflow.negativeCashFlow.color,
          }));
        } else {
          transformedData = sortedData.map((item) => ({
            ...item,
            shortName: truncatePropertyName(item.propertyName),
            fill:
              item.roi >= 0
                ? chartConfigs.roi.roi.color
                : chartConfigs.roi.negativeRoi.color,
          }));
        }

        setChartData((prev) => ({ ...prev, [tab]: transformedData }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    },
    [timeRange]
  );

  useEffect(() => {
    fetchData("totalIncome", "income");
    fetchData("cashFlow", "cashflow");
    fetchData("roi", "roi");
  }, [fetchData]);

  const getDisplayData = (tab: TabType) => {
    if (chartData[tab].length > 0) return chartData[tab];

    const sortBy =
      tab === "income"
        ? "totalIncome"
        : tab === "cashflow"
          ? "cashFlow"
          : "roi";
    const sortedData = [...data]
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, 8);

    if (tab === "income") {
      return sortedData.map((item) => ({
        ...item,
        shortName: truncatePropertyName(item.propertyName),
        fill: chartConfigs.income.totalIncome.color,
      }));
    } else if (tab === "cashflow") {
      return sortedData.map((item) => ({
        ...item,
        shortName: truncatePropertyName(item.propertyName),
        fill:
          item.cashFlow >= 0
            ? chartConfigs.cashflow.cashFlow.color
            : chartConfigs.cashflow.negativeCashFlow.color,
      }));
    } else {
      return sortedData.map((item) => ({
        ...item,
        shortName: truncatePropertyName(item.propertyName),
        fill:
          item.roi >= 0
            ? chartConfigs.roi.roi.color
            : chartConfigs.roi.negativeRoi.color,
      }));
    }
  };

  // Create bound formatter functions with currency code
  const currencyFormatter = (value: number) => formatCurrency(value, currencyCode);

  const renderChart = (
    tab: TabType,
    dataKey: string,
    config:
      | typeof chartConfigs.income
      | typeof chartConfigs.cashflow
      | typeof chartConfigs.roi,
    formatter: (value: number) => string
  ) => {
    const displayData = getDisplayData(tab);

    if (error) {
      return (
        <div className="text-center text-red-600 py-8">
          Error loading data: {error}
        </div>
      );
    }

    if (displayData.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No data available.
        </div>
      );
    }

    return (
      <ChartContainer
        config={config}
        className="h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] xl:h-[400px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="shortName"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickFormatter={formatter}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={createChartTooltipFormatter(formatter, config)}
                />
              }
            />

            <Bar dataKey={dataKey} radius={8} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  return (
    <Card className="min-h-0">
      <Tabs
        defaultValue="income"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
      >
        <CardHeader className="flex flex-col md:flex-row justify-between pb-4">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            Property Performance
          </CardTitle>
          <TabsList>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="min-h-0">
          <TabsContent value="income" className="min-h-0">
            {renderChart(
              "income",
              "totalIncome",
              chartConfigs.income,
              currencyFormatter
            )}
          </TabsContent>

          <TabsContent value="cashflow" className="min-h-0">
            {renderChart(
              "cashflow",
              "cashFlow",
              chartConfigs.cashflow,
              currencyFormatter
            )}
          </TabsContent>

          <TabsContent value="roi" className="min-h-0">
            {renderChart("roi", "roi", chartConfigs.roi, formatPercentage)}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
