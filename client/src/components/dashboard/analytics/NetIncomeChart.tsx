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
import { formatCurrency } from "@/lib/utils/index";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface NetIncomeChartProps {
  data?: PropertyRankingData[];
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

export function NetIncomeChart({ data = [] }: NetIncomeChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.netIncome - a.netIncome)
    .slice(0, 8);

  const chartData = sortedData.map((item) => ({
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
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            No net income data available.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />

                  <YAxis
                    tickFormatter={formatCurrency}
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
