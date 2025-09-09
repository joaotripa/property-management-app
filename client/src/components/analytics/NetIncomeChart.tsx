"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { DollarSign } from "lucide-react";

interface NetIncomeChartProps {
  data?: PropertyRankingData[];
  isLoading?: boolean;
  error?: string;
}

const chartConfig = {
  netIncome: {
    label: "Net Income",
    color: "var(--color-teal-500)",
  },
  negativeNetIncome: {
    label: "Net Loss",
    color: "var(--color-rose-500)",
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

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function NetIncomeChart({
  data = [],
  isLoading,
  error,
}: NetIncomeChartProps) {
  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <DollarSign className="h-5 w-5" />
            Net Income Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading net income data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data]
    .sort((a, b) => b.netIncome - a.netIncome)
    .slice(0, 8);

  const chartData = sortedData.map((item) => ({
    ...item,
    shortName: truncatePropertyName(item.propertyName),
    fill: item.netIncome >= 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
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
                    content={<ChartTooltipContent indicator="line" />}
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
