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
import { Percent } from "lucide-react";
import { formatPercentage } from "@/lib/utils";

interface ROIChartProps {
  data?: PropertyRankingData[];
  isLoading?: boolean;
  error?: string;
}

const chartConfig = {
  roi: {
    label: "ROI",
    color: "var(--color-violet-500)",
  },
} as const;

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function ROIChart({ data = [], isLoading, error }: ROIChartProps) {
  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-violet-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Percent className="h-5 w-5" />
            ROI Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            Error loading ROI data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.roi - a.roi).slice(0, 8);

  const chartData = sortedData.map((item) => ({
    ...item,
    shortName: truncatePropertyName(item.propertyName),
    fill: item.roi >= 0 ? "hsl(271, 81%, 56%)" : "hsl(0, 84%, 60%)",
  }));


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">ROI Performance</CardTitle>
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
            No ROI data available.
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
                    tickFormatter={formatPercentage}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />

                  <Bar dataKey="roi" radius={8} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
