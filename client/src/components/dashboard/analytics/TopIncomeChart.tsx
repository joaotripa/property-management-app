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

interface TopIncomeChartProps {
  data?: PropertyRankingData[];
  timeRange?: string;
}

const chartConfig = {
  totalIncome: {
    label: "Total Income",
    color: "var(--color-primary)",
  },
} as const;

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function TopIncomeChart({ data = [], timeRange = "6m" }: TopIncomeChartProps) {
  const [chartData, setChartData] = useState<(PropertyRankingData & { shortName: string; fill: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { dateFrom, dateTo } = calculateDateRange(timeRange);
      const result = await getPropertyComparison({
        dateFrom,
        dateTo,
        sortBy: 'totalIncome',
      });

      const sortedData = [...result.propertyRanking]
        .sort((a, b) => b.totalIncome - a.totalIncome)
        .slice(0, 8);

      const transformedData = sortedData.map((item) => ({
        ...item,
        shortName: truncatePropertyName(item.propertyName),
        fill: chartConfig.totalIncome.color,
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
    .sort((a, b) => b.totalIncome - a.totalIncome)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortName: truncatePropertyName(item.propertyName),
      fill: chartConfig.totalIncome.color,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            Top Income Properties
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center text-red-600 py-8">
            Error loading income data: {error}
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            No income data available.
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

                  <Bar dataKey="totalIncome" barSize={50} radius={8}></Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
