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
} from "@/lib/types/granularity";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface CashFlowChartProps {
  initialData?: AnyTimeSeriesData[];
}

type ChartDataItem = AnyTimeSeriesData & {
  label: string;
};

const chartConfig = {
  cashFlow: {
    label: "Net Income",
    color: "var(--color-indigo-500)",
  },
  cumulativeCashFlow: {
    label: "Cumulative Total",
    color: "var(--color-blue-500)",
  },
} as const;

export function CashFlowChart({
  initialData = [],
}: CashFlowChartProps) {
  const chartData: ChartDataItem[] = initialData.map((item) => ({
    ...item,
    label: formatDataLabel(item),
  }));

  return (
    <Card className="min-h-0">
      <CardHeader className="pb-3 sm:pb-4 md:pb-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          Cash Flow Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0">
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No cash flow data available for the selected period.
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
                dataKey="cashFlow"
                stroke="var(--color-purple-500)"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="cumulativeCashFlow"
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
