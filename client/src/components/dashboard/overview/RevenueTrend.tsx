"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { CashFlowTrendData } from "@/lib/db/analytics/queries";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils/formatting";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

const chartConfig = {
  income: {
    label: "Revenue",
    color: "var(--color-success)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-destructive)",
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

function generateEmptyChartData(): Array<{
  month: string;
  income: number;
  monthLabel: string;
}> {
  const data = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    data.push({
      month: monthString,
      income: 0,
      monthLabel: formatMonthYear(monthString),
    });
  }

  return data;
}

interface RevenueTrendProps {
  initialData: CashFlowTrendData[];
}

export function RevenueTrend({ initialData }: RevenueTrendProps) {

  const chartData =
    initialData.length > 0
      ? initialData.map((item) => ({
          ...item,
          monthLabel: formatMonthYear(item.month),
        }))
      : generateEmptyChartData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
          <div className="text-sm text-muted-foreground">Last 6 months</div>
        </div>
        <CardDescription>
          Showing total revenue income for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCompactCurrency}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={createChartTooltipFormatter(
                    formatCurrency,
                    chartConfig
                  )}
                />
              }
            />

            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <Area
              type="natural"
              dataKey="income"
              stroke="var(--color-primary)"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
