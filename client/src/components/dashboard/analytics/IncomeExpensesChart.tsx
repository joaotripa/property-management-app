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
import { AnyTimeSeriesData, formatDataLabel } from "@/lib/types/granularity";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface IncomeExpensesChartProps {
  initialData?: AnyTimeSeriesData[];
}

type ChartDataItem = AnyTimeSeriesData & {
  label: string;
};

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-success)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-destructive)",
  },
} as const;

export function IncomeExpensesChart({
  initialData = [],
}: IncomeExpensesChartProps) {
  const chartData: ChartDataItem[] = initialData.map((item) => ({
    ...item,
    label: formatDataLabel(item),
  }));

  return (
    <Card className="min-h-0">
      <CardHeader className="pb-3 sm:pb-4 md:pb-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          Income vs Expenses Trend
        </CardTitle>
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
                stroke={chartConfig.income.color}
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="expenses"
                stroke={chartConfig.expenses.color}
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
