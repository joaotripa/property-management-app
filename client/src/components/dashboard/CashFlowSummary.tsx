"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import { getCashFlowTrend } from "@/lib/services/analyticsService";
import { CashFlowTrendData } from "@/lib/db/analytics/queries";

const chartConfig = {
  income: {
    label: "Revenue",
    color: "orange",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-primary)",
  },
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function CashFlowSummary() {
  const [data, setData] = useState<CashFlowTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCashFlowData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await getCashFlowTrend({
          monthsBack: 6,
        });

        setData(result);
      } catch (err) {
        console.error("Error fetching cash flow data:", err);
        setError("Failed to load cash flow data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashFlowData();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cash Flow Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonthYear(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
          <div className="text-sm text-muted-foreground">Last 6 months</div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No cash flow data available for the last 6 months.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="expensesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="1 3"
                className="stroke-muted/20"
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="monthLabel"
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                className="text-xs fill-muted-foreground"
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name,
                    ]}
                    className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg"
                  />
                }
              />

              <ChartLegend content={<ChartLegendContent />} />

              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={3}
                fill="url(#incomeGradient)"
                dot={{ fill: "var(--color-income)", strokeWidth: 2, r: 4 }}
              />

              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                strokeWidth={3}
                fill="url(#expensesGradient)"
                dot={{ fill: "var(--color-expenses)", strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
