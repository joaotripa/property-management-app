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

interface TopIncomeChartProps {
  data?: PropertyRankingData[];
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

export function TopIncomeChart({ data = [] }: TopIncomeChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.totalIncome - a.totalIncome)
    .slice(0, 8);

  const chartData = sortedData.map((item) => ({
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
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            No income data available.
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
