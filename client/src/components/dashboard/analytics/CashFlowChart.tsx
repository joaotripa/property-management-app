"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { CashFlowTrendData } from "@/lib/db/analytics/queries";
import {
  PropertySelector,
  PropertyOption,
} from "@/components/dashboard/analytics/PropertySelector";
import { useState, useEffect, useCallback } from "react";
import { getCashFlowTrend } from "@/lib/services/client/analyticsService";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface CashFlowChartProps {
  properties: PropertyOption[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-emerald-500)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-coral-500)",
  },
  netIncome: {
    label: "Net Income",
    color: "var(--color-indigo-500)",
  },
} as const;

function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function CashFlowChart({ properties }: CashFlowChartProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >(undefined);
  const [data, setData] = useState<CashFlowTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCashFlowTrend({
        monthsBack: 6,
        propertyId: selectedPropertyId,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePropertyChange = (propertyId: string | undefined) => {
    setSelectedPropertyId(propertyId);
  };

  // Use local data
  const filteredData = data;

  const chartData = filteredData.map((item) => ({
    ...item,
    monthLabel: formatMonthYear(item.month),
  }));

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cash Flow Trend</CardTitle>
            <PropertySelector
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={handlePropertyChange}
              isLoading={isLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading cash flow data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cash Flow Trend</CardTitle>
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={handlePropertyChange}
            isLoading={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No cash flow data available for the selected period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 20,
                right: 20,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                className="text-xs fill-muted-foreground"
                tickFormatter={formatCompactCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, dx: -10 }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={createChartTooltipFormatter(
                      formatCurrency,
                      chartConfig
                    )}
                  />
                }
              />

              <ChartLegend content={<ChartLegendContent />} />

              <Line
                type="linear"
                dataKey="income"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="linear"
                dataKey="expenses"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="linear"
                dataKey="netIncome"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
