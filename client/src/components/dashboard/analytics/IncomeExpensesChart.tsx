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
import {
  AnyTimeSeriesData,
  formatDataLabel,
  selectFinanceGranularity,
} from "@/lib/types/granularity";
import {
  PropertySelector,
  PropertyOption,
} from "@/components/dashboard/analytics/PropertySelector";
import { useState, useEffect, useCallback } from "react";
import { getCashFlowTrend } from "@/lib/services/client/analyticsService";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";
import { calculateDateRange } from "@/lib/utils/dateRange";

interface IncomeExpensesChartProps {
  properties: PropertyOption[];
  initialData?: AnyTimeSeriesData[];
  timeRange?: string; // Finance time range (current, quarter, semester, year, full)
}

type ChartDataItem = AnyTimeSeriesData & {
  label: string;
};

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-emerald-500)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-coral-500)",
  },
} as const;

export function IncomeExpensesChart({
  properties,
  initialData = [],
  timeRange = "semester", // Default to semester
}: IncomeExpensesChartProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >(undefined);
  const [data, setData] = useState<AnyTimeSeriesData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedGranularity = selectFinanceGranularity(timeRange);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { monthsBack } = calculateDateRange(timeRange);

      const result = await getCashFlowTrend({
        monthsBack,
        propertyId: selectedPropertyId,
        granularity: requestedGranularity,
        timeRange,
      });

      setData(result);
    } catch (err) {
      console.error("Error fetching cash flow data:", err);

      if (
        requestedGranularity === "weekly" ||
        requestedGranularity === "daily"
      ) {
        try {
          const { monthsBack: fallbackMonthsBack } =
            calculateDateRange(timeRange);
          console.info(
            `${requestedGranularity} data fetch failed, falling back to monthly granularity`
          );
          const fallbackResult = await getCashFlowTrend({
            monthsBack: fallbackMonthsBack,
            propertyId: selectedPropertyId,
            granularity: "monthly",
            timeRange,
          });
          setData(fallbackResult);
        } catch (fallbackErr) {
          console.error("Fallback to monthly also failed:", fallbackErr);
          setError(
            fallbackErr instanceof Error
              ? fallbackErr.message
              : "Failed to fetch data"
          );
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId, timeRange, requestedGranularity]);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchData();
    } else {
      fetchData();
    }
  }, [fetchData, selectedPropertyId]);

  const handlePropertyChange = (propertyId: string | undefined) => {
    setSelectedPropertyId(propertyId);
  };

  const chartData: ChartDataItem[] = data.map((item) => ({
    ...item,
    label: formatDataLabel(item),
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
            Error loading income and expenses data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-0">
      <CardHeader className="pb-3 sm:pb-4 md:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            Income vs Expenses Trend
          </CardTitle>
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={handlePropertyChange}
            isLoading={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-0">
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No income or expenses data available for the selected period.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] xl:h-[400px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 10,
                right: 10,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                className="text-xs fill-muted-foreground"
                tickFormatter={formatCompactCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, dx: -5 }}
                width={60}
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
                type="monotone"
                dataKey="income"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-destructive)"
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
