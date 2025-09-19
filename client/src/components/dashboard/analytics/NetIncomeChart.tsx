"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";
import { getPropertyComparison } from "@/lib/services/client/analyticsService";
import { calculateDateRange } from "@/lib/utils/dateRange";
import { useState, useEffect, useCallback } from "react";

interface NetIncomeChartProps {
  data?: PropertyRankingData[];
  timeRange?: string;
}

const chartConfig = {
  netIncome: {
    label: "Net Income",
    color: "var(--color-primary)",
  },
  negativeNetIncome: {
    label: "Net Loss",
    color: "var(--color-destructive)",
  },
} as const;

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function NetIncomeChart({ data = [], timeRange = "6m" }: NetIncomeChartProps) {
  const [chartData, setChartData] = useState<(PropertyRankingData & { shortName: string; fill: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { dateFrom, dateTo } = calculateDateRange(timeRange);
      const result = await getPropertyComparison({
        dateFrom,
        dateTo,
        sortBy: 'netIncome',
      });

      const sortedData = [...result.propertyRanking]
        .sort((a, b) => b.netIncome - a.netIncome)
        .slice(0, 8);

      const transformedData = sortedData.map((item) => ({
        ...item,
        shortName: truncatePropertyName(item.propertyName),
        fill:
          item.netIncome >= 0
            ? chartConfig.netIncome.color
            : chartConfig.negativeNetIncome.color,
      }));

      setChartData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use local data or initial data
  const displayData = chartData.length > 0 ? chartData : [...data]
    .sort((a, b) => b.netIncome - a.netIncome)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortName: truncatePropertyName(item.propertyName),
      fill:
        item.netIncome >= 0
          ? chartConfig.netIncome.color
          : chartConfig.negativeNetIncome.color,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            Net Income Analysis
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center text-red-600 py-8">
            Error loading net income data: {error}
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            No net income data available.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />

                  <YAxis
                    tickFormatter={formatCompactCurrency}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={createChartTooltipFormatter(
                          formatCurrency,
                          chartConfig
                        )}
                      />
                    }
                  />

                  <Bar dataKey="netIncome" radius={8} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
