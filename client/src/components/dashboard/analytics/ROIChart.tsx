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
import { formatPercentage } from "@/lib/utils/index";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";

interface ROIChartProps {
  data?: PropertyRankingData[];
}

const chartConfig = {
  roi: {
    label: "ROI",
    color: "var(--color-primary)",
  },
  negativeRoi: {
    label: "Negative ROI",
    color: "var(--color-destructive)",
  },
} as const;

function truncatePropertyName(name: string, maxLength: number = 12): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function ROIChart({ data = [] }: ROIChartProps) {
  const sortedData = [...data].sort((a, b) => b.roi - a.roi).slice(0, 8);

  const chartData = sortedData.map((item) => ({
    ...item,
    shortName: truncatePropertyName(item.propertyName),
    fill: item.roi >= 0 ? chartConfig.roi.color : chartConfig.negativeRoi.color,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">ROI Performance</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
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
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        formatter={createChartTooltipFormatter(
                          formatPercentage,
                          chartConfig
                        )}
                      />
                    }
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
